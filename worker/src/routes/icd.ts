import { Hono } from "hono";
import derived from "../../../schema/derived-codes.json";
import { getEntity } from "../lib/who";
import type { Bindings } from "../bindings";

// The worker serves only the derived content set (Amendment A.6): every ICD-11
// code referenced in editorial content plus the Chapter 06 grouping anchors.
// This is deliberate scope control — the worker must not become an open proxy
// for the whole classification — and it scales automatically with content.
const ALLOWED = new Set<string>(derived.codes);

export const icd = new Hono<{ Bindings: Bindings }>();

icd.get("/entity/:code", async (c) => {
  const code = c.req.param("code").toUpperCase();

  if (!ALLOWED.has(code)) {
    return c.json(
      {
        error: "outside_scope",
        message_nb:
          "Koden er utenfor ressursens omfang (ICD-11 kapittel 06 og refererte relokasjoner).",
      },
      404
    );
  }

  try {
    const entity = await getEntity(c.env, code);
    return c.json(entity, 200, { "Cache-Control": "public, max-age=3600" });
  } catch (err) {
    // §7.5: never hard-fail — the frontend shows the code + editorial content
    // with a "kunne ikke hente offisiell tittel akkurat nå" notice.
    console.error(`ICD entity fetch failed for ${code}:`, err);
    return c.json(
      {
        error: "who_unavailable",
        message_nb: "Kunne ikke hente offisiell tittel akkurat nå.",
      },
      503
    );
  }
});
