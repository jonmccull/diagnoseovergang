import { Hono } from "hono";
import { cors } from "hono/cors";
import { icd } from "./routes/icd";
import { feedback } from "./routes/feedback";
import { prewarmEntities, purgeExpiredFeedback } from "./cron";
import type { Bindings } from "./bindings";
import { PAGES_HOST, SITE_HOST } from "../../schema/site";

const app = new Hono<{ Bindings: Bindings }>();

const escape = (host: string) => host.replace(/\./g, "\\.");
// Pages host plus preview hashes, and the site's apex plus www.
const PAGES_ORIGIN = new RegExp(`^https://([a-z0-9-]+\\.)?${escape(PAGES_HOST)}$`);
const SITE_ORIGIN = new RegExp(`^https://(www\\.)?${escape(SITE_HOST)}$`);

// Unnecessary once /api/* routes on the same custom domain as the site.
app.use(
  "/api/*",
  cors({
    origin: (origin) => {
      if (PAGES_ORIGIN.test(origin)) return origin;
      if (SITE_ORIGIN.test(origin)) return origin;
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
app.route("/api/feedback", feedback);

export default {
  fetch: app.fetch,
  scheduled: (_event, env, ctx) => {
    ctx.waitUntil(prewarmEntities(env));
    ctx.waitUntil(purgeExpiredFeedback(env));
  },
} satisfies ExportedHandler<Bindings>;
