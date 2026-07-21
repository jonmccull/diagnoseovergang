// Typed client for OUR Worker — the frontend never calls WHO directly (brief §6).
import { HealthResponse, type Health } from "../../schema/health";
import { IcdEntity } from "../../schema/icd";

const API_BASE: string = import.meta.env.PUBLIC_API_BASE ?? "";

export async function fetchHealth(): Promise<Health> {
  const res = await fetch(`${API_BASE}/api/health`);
  if (!res.ok) {
    throw new Error(`API-helsesjekk feilet: ${res.status}`);
  }
  return HealthResponse.parse(await res.json());
}

// Official code/title/URI for a PD-set code (§7.4). Callers must degrade
// gracefully on failure: show the code + editorial content with a
// "kunne ikke hente offisiell tittel akkurat nå" notice (§7.5) — never hard-fail.
export async function fetchIcdEntity(code: string): Promise<IcdEntity> {
  const res = await fetch(`${API_BASE}/api/icd/entity/${encodeURIComponent(code)}`);
  if (!res.ok) {
    throw new Error(`Kunne ikke hente ICD-11-entitet ${code}: ${res.status}`);
  }
  return IcdEntity.parse(await res.json());
}
