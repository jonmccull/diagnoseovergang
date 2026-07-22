import { z } from "zod";

// Professional-role enum (brief §9.2). Values are stored verbatim; labels are
// rendered in the form. Kept here so worker and frontend share one source.
export const FEEDBACK_ROLES = [
  "psykolog",
  "psykiater",
  "lis", // Lege i spesialisering
  "fastlege", // Fastlege/allmennlege
  "annet-helsepersonell",
  "student",
  "annet",
] as const;

export const ROLE_LABELS: Record<(typeof FEEDBACK_ROLES)[number], string> = {
  psykolog: "Psykolog",
  psykiater: "Psykiater",
  lis: "Lege i spesialisering (LIS)",
  fastlege: "Fastlege/allmennlege",
  "annet-helsepersonell": "Annet helsepersonell",
  student: "Student",
  annet: "Annet",
};

// POST /api/feedback body (brief §9.2/§9.4). Lengths enforced here so oversized
// payloads are rejected at validation. Consent must be literally true.
export const FeedbackPayload = z.object({
  entryId: z.string().min(1).max(200),
  field: z.string().max(100).nullable().optional(),
  selectedText: z.string().max(500).nullable().optional(),
  contextPrefix: z.string().max(200).nullable().optional(),
  contextSuffix: z.string().max(200).nullable().optional(),
  contentVersion: z.string().min(1).max(200),
  comment: z.string().min(1).max(2000),
  email: z.string().email().max(320),
  role: z.enum(FEEDBACK_ROLES),
  consent: z.literal(true),
  turnstileToken: z.string().min(1).max(2048),
});

export type FeedbackPayload = z.infer<typeof FeedbackPayload>;
