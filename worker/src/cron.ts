import { PD_CODES } from "../../schema/icd";
import { refreshEntity } from "./lib/who";
import type { Bindings } from "./bindings";

// Nightly pre-warm of the fixed PD set (§6.4): keeps user requests near-instant
// and leaves a last-good copy in KV if WHO is briefly unavailable.
// M6 adds the feedback retention job (§9.6.4) alongside this.
export async function prewarmPdEntities(env: Bindings): Promise<void> {
  const failed: string[] = [];
  for (const code of PD_CODES) {
    try {
      await refreshEntity(env, code);
    } catch (err) {
      failed.push(code);
      console.error(`Pre-warm failed for ${code}:`, err);
    }
  }
  console.log(
    `PD pre-warm (${env.ICD_RELEASE}): ${PD_CODES.length - failed.length}/${PD_CODES.length} ok` +
      (failed.length ? `, failed: ${failed.join(", ")}` : "")
  );
}
