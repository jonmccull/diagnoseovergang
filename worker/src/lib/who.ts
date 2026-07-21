import { z } from "zod";
import { IcdEntity } from "../../../schema/icd";
import type { Bindings } from "../bindings";

// ── Raw WHO response shapes (validated before caching, §7.5) ────────────────

const TokenResponse = z.object({
  access_token: z.string(),
  expires_in: z.number(),
});

const CodeInfoRaw = z.object({
  code: z.string(),
  stemId: z.string(),
});

const MmsEntityRaw = z.object({
  "@id": z.string(),
  code: z.string(),
  title: z.object({ "@value": z.string() }),
  source: z.string().optional(), // foundation URI
  browserUrl: z.string().optional(),
});

const TOKEN_KEY = "who:token";
const TOKEN_URL = "https://icdaccessmanagement.who.int/connect/token";

export const entityKey = (release: string, code: string) =>
  `who:entity:${release}:${code}`;

// WHO ids use http:// scheme; normalize for display/linking and refetching.
const https = (uri: string) => uri.replace(/^http:/, "https:");

// ── OAuth token, KV-cached with TTL just under expires_in (§7.2) ────────────

async function requestToken(env: Bindings): Promise<string> {
  const fetchOnce = async () => {
    const res = await fetch(TOKEN_URL, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        grant_type: "client_credentials",
        scope: "icdapi_access",
        client_id: env.WHO_CLIENT_ID,
        client_secret: env.WHO_CLIENT_SECRET,
      }),
    });
    if (!res.ok) throw new Error(`WHO token endpoint: ${res.status}`);
    return TokenResponse.parse(await res.json());
  };

  let token;
  try {
    token = await fetchOnce();
  } catch {
    token = await fetchOnce(); // retry once (§7.5)
  }
  await env.ICD_CACHE.put(TOKEN_KEY, token.access_token, {
    expirationTtl: Math.max(60, token.expires_in - 120),
  });
  return token.access_token;
}

async function getToken(env: Bindings): Promise<string> {
  return (await env.ICD_CACHE.get(TOKEN_KEY)) ?? (await requestToken(env));
}

// ── Authenticated GET with one forced token refresh on 401 ──────────────────

async function whoGet(env: Bindings, url: string): Promise<unknown> {
  const attempt = async (token: string) =>
    fetch(url, {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/json",
        "API-Version": "v2",
        "Accept-Language": "en",
      },
    });

  let res = await attempt(await getToken(env));
  if (res.status === 401) {
    await env.ICD_CACHE.delete(TOKEN_KEY);
    res = await attempt(await requestToken(env));
  }
  if (!res.ok) throw new Error(`WHO API ${res.status} for ${url}`);
  return res.json();
}

function parseOrLogDrift<T>(
  schema: z.ZodType<T>,
  data: unknown,
  context: string
): T {
  const result = schema.safeParse(data);
  if (!result.success) {
    console.error(`WHO response shape drift (${context}):`, result.error.issues);
    throw new Error(`WHO response failed validation: ${context}`);
  }
  return result.data;
}

// ── Entity fetch: code → codeinfo → stem entity → normalized (§7.3) ─────────

export async function fetchEntityFromWho(
  env: Bindings,
  code: string
): Promise<IcdEntity> {
  const release = env.ICD_RELEASE;
  const codeInfo = parseOrLogDrift(
    CodeInfoRaw,
    await whoGet(
      env,
      `${env.API_BASE}/icd/release/11/${release}/mms/codeinfo/${encodeURIComponent(code)}`
    ),
    `codeinfo/${code}`
  );

  const stemUrl = https(codeInfo.stemId);
  const raw = parseOrLogDrift(
    MmsEntityRaw,
    await whoGet(env, stemUrl),
    `entity/${code}`
  );

  const entityId = stemUrl.split("/").pop() ?? "";
  return IcdEntity.parse({
    code: raw.code,
    title: raw.title["@value"],
    uri: https(raw["@id"]),
    foundationUri: raw.source ? https(raw.source) : null,
    browserUrl:
      raw.browserUrl ?? `https://icd.who.int/browse/${release}/mms/en#${entityId}`,
    release,
    fetchedAt: new Date().toISOString(),
  });
}

// Cache-first read (§6): KV hit → serve; miss → WHO → cache (no TTL, so the
// last-good copy survives WHO outages; the nightly cron keeps it fresh).
export async function getEntity(env: Bindings, code: string): Promise<IcdEntity> {
  const key = entityKey(env.ICD_RELEASE, code);
  const cached = await env.ICD_CACHE.get<IcdEntity>(key, "json");
  if (cached) return cached;

  const fresh = await fetchEntityFromWho(env, code);
  await env.ICD_CACHE.put(key, JSON.stringify(fresh));
  return fresh;
}

export async function refreshEntity(env: Bindings, code: string): Promise<IcdEntity> {
  const fresh = await fetchEntityFromWho(env, code);
  await env.ICD_CACHE.put(entityKey(env.ICD_RELEASE, code), JSON.stringify(fresh));
  return fresh;
}
