import { Hono } from "hono";
import { FeedbackPayload } from "../../../schema/feedback";
import { verifyTurnstile } from "../lib/turnstile";
import { hashIp, withinRateLimit } from "../lib/abuse";
import type { Bindings } from "../bindings";

const MAX_BODY_BYTES = 16_000; // reject oversized payloads early (§9.4)

export const feedback = new Hono<{ Bindings: Bindings }>();

// POST /api/feedback — pipeline per §9.4:
// Turnstile verify → rate limit → Zod validation → D1 insert → 201.
// Privacy (§9.6): only status codes are logged, never raw email/comment/IP.
feedback.post("/", async (c) => {
  const ip = c.req.header("CF-Connecting-IP") ?? "0.0.0.0";
  const ipHash = await hashIp(ip, c.env.IP_HASH_SALT);

  // Reject oversized payloads before parsing.
  const len = Number(c.req.header("Content-Length") ?? 0);
  if (len > MAX_BODY_BYTES) {
    return c.json({ error: "payload_too_large" }, 413);
  }

  let raw: unknown;
  try {
    raw = await c.req.json();
  } catch {
    return c.json({ error: "invalid_json" }, 400);
  }

  const parsed = FeedbackPayload.safeParse(raw);
  if (!parsed.success) {
    return c.json({ error: "validation_failed" }, 400);
  }
  const data = parsed.data;

  // 1. Turnstile server-side verification.
  const human = await verifyTurnstile(
    c.env.TURNSTILE_SECRET,
    data.turnstileToken,
    ip
  );
  if (!human) {
    console.log(`feedback rejected: turnstile (ip_hash=${ipHash.slice(0, 12)})`);
    return c.json({ error: "turnstile_failed" }, 403);
  }

  // 2. Rate limit (5/hour per IP-hash).
  if (!(await withinRateLimit(c.env.ICD_CACHE, ipHash))) {
    return c.json({ error: "rate_limited" }, 429);
  }

  // 3. Insert into D1. UUID + server timestamp; consent stored as 1.
  const id = crypto.randomUUID();
  const createdAt = new Date().toISOString();
  try {
    await c.env.FEEDBACK_DB.prepare(
      `INSERT INTO feedback (id, created_at, entry_id, field, selected_text,
        context_prefix, context_suffix, content_version, comment, email, role,
        consent, status, ip_hash)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1, 'new', ?)`
    )
      .bind(
        id,
        createdAt,
        data.entryId,
        data.field ?? null,
        data.selectedText ?? null,
        data.contextPrefix ?? null,
        data.contextSuffix ?? null,
        data.contentVersion,
        data.comment,
        data.email,
        data.role,
        ipHash
      )
      .run();
  } catch (err) {
    // Never log the payload; err messages here don't contain user content.
    console.error("feedback insert failed:", err instanceof Error ? err.message : err);
    return c.json({ error: "storage_failed" }, 500);
  }

  console.log(`feedback stored: entry=${data.entryId} status=201`);
  return c.json(
    { ok: true, message_nb: "Takk! Forslaget er sendt og blir vurdert." },
    201
  );
});
