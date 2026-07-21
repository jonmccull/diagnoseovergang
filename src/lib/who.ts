// Typed client for OUR Worker — the frontend never calls WHO directly (brief §6).
// Milestone 2 adds entity lookup (/api/icd/entity/:code) here.
import { HealthResponse, type Health } from "../../schema/health";

const API_BASE: string = import.meta.env.PUBLIC_API_BASE ?? "";

export async function fetchHealth(): Promise<Health> {
  const res = await fetch(`${API_BASE}/api/health`);
  if (!res.ok) {
    throw new Error(`API-helsesjekk feilet: ${res.status}`);
  }
  return HealthResponse.parse(await res.json());
}
