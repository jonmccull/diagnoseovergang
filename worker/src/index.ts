import { Hono } from "hono";
import { cors } from "hono/cors";
import { icd } from "./routes/icd";
import { prewarmPdEntities } from "./cron";
import type { Bindings } from "./bindings";

const app = new Hono<{ Bindings: Bindings }>();

// Unnecessary once /api/* routes on the same custom domain as the site.
app.use(
  "/api/*",
  cors({
    origin: (origin) => {
      if (/^https:\/\/([a-z0-9-]+\.)?diagnoseovergang\.pages\.dev$/.test(origin))
        return origin;
      if (/^http:\/\/localhost:\d+$/.test(origin)) return origin;
      return null;
    },
  })
);

app.get("/api/health", (c) =>
  c.json({
    ok: true as const,
    service: "diagnoseovergang-api",
    release: c.env.ICD_RELEASE,
  })
);

app.route("/api/icd", icd);

export default {
  fetch: app.fetch,
  scheduled: (_event, env, ctx) => {
    ctx.waitUntil(prewarmPdEntities(env));
  },
} satisfies ExportedHandler<Bindings>;
