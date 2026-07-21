import { z } from "zod";

// Shared between app and worker — proves the schema/ wiring (brief §5).
export const HealthResponse = z.object({
  ok: z.literal(true),
  service: z.string(),
  release: z.string(),
});

export type Health = z.infer<typeof HealthResponse>;
