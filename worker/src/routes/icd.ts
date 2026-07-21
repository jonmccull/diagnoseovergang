import { Hono } from "hono";
import { PD_CODES } from "../../../schema/icd";
import { getEntity } from "../lib/who";
import type { Bindings } from "../bindings";

// The pilot serves only the fixed PD working set (§7.4) — this is deliberate
// scope control, not a cache limitation: the worker must not become an open
// proxy for the whole classification.
const PD_SET = new Set<string>(PD_CODES);

export const icd = new Hono<{ Bindings: Bindings }>();

icd.get("/entity/:code", async (c) => {
  const code = c.req.param("code").toUpperCase();

  if (!PD_SET.has(code)) {
    return c.json(
      {
        error: "outside_pilot_scope",
        message_nb:
          "Koden er utenfor pilotens omfang (personlighetsforstyrrelser, ICD-11 kapittel 06).",
      },
      404
    );
  }

  try {
    const entity = await getEntity(c.env, code);
    return c.json(entity, 200, { "Cache-Control": "public, max-age=3600" });
  } catch (err) {
    // §7.5: never hard-fail — the frontend shows the code + editorial content
    // with a "kunne ikke hente offisiell tittel akkurat nå" notice.
    console.error(`ICD entity fetch failed for ${code}:`, err);
    return c.json(
      {
        error: "who_unavailable",
        message_nb: "Kunne ikke hente offisiell tittel akkurat nå.",
      },
      503
    );
  }
});
