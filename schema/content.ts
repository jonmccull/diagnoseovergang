import { z } from "zod";

// Editorial content model (brief §8) — the actual asset. One entry per
// editorial unit, stored as JSON in src/content/pd/ (filename = id).
// Rules enforced by the app:
//   source: "editorial"  → always rendered with the "ikke fra WHO" treatment
//   status: "draft"      → renders the "Utkast – ikke klinisk kvalitetssikret" badge
// Official ICD-11 titles are NEVER stored here — only codes; titles are
// fetched live from the worker so we never drift from WHO (§8).

export const Icd10Ref = z.object({
  code: z.string().regex(/^F\d{2}(\.\d{1,2})?$/, "ICD-10-kode, f.eks. F60.31"),
  label_nb: z.string(),
});

export const Icd11Ref = z.object({
  code: z.string().regex(/^[0-9A-Z]{2,5}(\.[0-9A-Z]{1,2})?$/, "ICD-11-kode, f.eks. 6D11.5"),
});

export const CommentaryEntry = z.object({
  id: z.string(),
  kind: z.enum([
    "overview",
    "diagnosis-change",
    "severity",
    "trait-domain",
    // Amendment A.2 — Chapter 06 expansion
    "grouping-overview", // what changed across a whole grouping
    "new-diagnosis", // did not exist in ICD-10
    "relocation", // moved chapters/groupings (e.g. gender incongruence)
  ]),
  title_nb: z.string(),
  icd10: z.array(Icd10Ref).nullable(),
  icd11: z.array(Icd11Ref).nullable(),
  whatChanged_nb: z.string(),
  whatToDoNow_nb: z.string(),
  caveats_nb: z.string().optional(),
  sources: z.array(z.object({ label: z.string(), url: z.string() })).optional(),
  source: z.literal("editorial"),
  // No clinician pre-review in the pilot: entries stay "draft" and the badge
  // doubles as an invitation to use the feedback feature (§8/§9).
  status: z.enum(["draft", "clinician-reviewed"]),
  reviewedBy: z.string().optional(),
  reviewedAt: z.string().optional(),
});

export type CommentaryEntry = z.infer<typeof CommentaryEntry>;
