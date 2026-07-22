import derived from "../../schema/derived-codes.json";
import { refreshEntity } from "./lib/who";
import type { Bindings } from "./bindings";

// Nightly pre-warm of the derived content set (§6.4 + Amendment A.6): keeps user
// requests near-instant and leaves a last-good copy in KV if WHO is briefly
// unavailable. M6 adds the feedback retention job (§9.6.4) alongside this.
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
