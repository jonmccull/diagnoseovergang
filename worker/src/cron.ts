import derived from "../../schema/derived-codes.json";
import { refreshEntity } from "./lib/who";
import type { Bindings } from "./bindings";

// GDPR retention (brief §9.6.4): no later than 12 months after submission,
// anonymise feedback — null the email (the PII / reply channel) and the
// ip_hash, keeping the content signal (comment, role) for quality purposes.
// Runs nightly alongside the pre-warm. Idempotent.
export async function purgeExpiredFeedback(env: Bindings): Promise<void> {
  const cutoff = new Date(
    Date.now() - 365 * 24 * 60 * 60 * 1000
  ).toISOString();
  try {
    // Null the email + ip_hash (the PII); keep comment/role/status so the
    // quality signal and the owner's triage history survive. email = '' is the
    // anonymised marker and makes this idempotent.
    const res = await env.FEEDBACK_DB.prepare(
      `UPDATE feedback
         SET email = '', ip_hash = NULL
       WHERE created_at < ? AND email <> ''`
    )
      .bind(cutoff)
      .run();
    const changed = res.meta?.changes ?? 0;
    console.log(`Feedback retention: anonymised ${changed} row(s) older than ${cutoff}`);
  } catch (err) {
    console.error("Feedback retention job failed:", err instanceof Error ? err.message : err);
  }
}

// Nightly pre-warm of the derived content set (§6.4 + Amendment A.6): keeps user
// requests near-instant and leaves a last-good copy in KV if WHO is briefly
// unavailable.
export async function prewarmEntities(env: Bindings): Promise<void> {
  const codes = derived.codes;
  const failed: string[] = [];
  for (const code of codes) {
    try {
      await refreshEntity(env, code);
    } catch (err) {
      failed.push(code);
      console.error(`Pre-warm failed for ${code}:`, err);
    }
  }
  console.log(
    `Pre-warm (${env.ICD_RELEASE}): ${codes.length - failed.length}/${codes.length} ok` +
      (failed.length ? `, failed: ${failed.join(", ")}` : "")
  );
}
