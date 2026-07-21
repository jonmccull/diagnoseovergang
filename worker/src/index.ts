import { Hono } from "hono";
import { cors } from "hono/cors";

type Bindings = {
  ICD_RELEASE: string;
  API_BASE: string;
  // M2: ICD_CACHE (KVNamespace), WHO_CLIENT_ID, WHO_CLIENT_SECRET
  // M6: FEEDBACK_DB (D1Database), TURNSTILE_SECRET, IP_HASH_SALT
};

const app = new Hono<{ Bindings: Bindings }>();

// M1: open CORS so the pages.dev origin can reach workers.dev. Tightened to the
// deployed origins in M2; unnecessary once /api/* routes on the same custom domain.
app.use("/api/*", cors());

app.get("/api/health", (c) =>
  c.json({
    ok: true as const,
    service: "diagnoseovergang-api",
    release: c.env.ICD_RELEASE,
  })
);

export default app;
