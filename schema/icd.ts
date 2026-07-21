import { z } from "zod";

// Normalized ICD-11 entity as served by OUR worker (/api/icd/entity/:code).
// Guardrail §3.1: code + official title + canonical URI + WHO browser link
// always travel together — the frontend never renders one without the others.
export const IcdEntity = z.object({
  code: z.string(),
  title: z.string(), // official English title from the WHO API — never editorial
  uri: z.string(), // canonical linearization URI (@id)
  foundationUri: z.string().nullable(),
  browserUrl: z.string(), // link to the official WHO browser entry
  release: z.string(),
  fetchedAt: z.string(), // ISO 8601 UTC
});

export type IcdEntity = z.infer<typeof IcdEntity>;

// The pilot's fixed PD entity working set (brief §7.4), verified against
// release 2025-01 on 2026-07-21. The worker serves only these codes;
// the cron pre-warms exactly this list.
export const PD_CODES = [
  "6D10", // Personality disorder
  "6D10.0", // Mild
  "6D10.1", // Moderate
  "6D10.2", // Severe
  "6D10.Z", // Severity unspecified
  "6D11", // Prominent personality traits or patterns
  "6D11.0", // Negative affectivity
  "6D11.1", // Detachment
  "6D11.2", // Dissociality
  "6D11.3", // Disinhibition
  "6D11.4", // Anankastia
  "6D11.5", // Borderline pattern
  "QE50.7", // Personality difficulty (factor influencing health status — NOT a mental disorder)
] as const;

export type PdCode = (typeof PD_CODES)[number];
