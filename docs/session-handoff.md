# Session handoff — current state & one-time context

Last updated: 2026-07-22. This file carries decisions and state that are NOT in
the briefs. Update it when a session materially changes project state; keep it
current-state-only (no history log).

## Where the project stands

- **Live:** https://diagnoseovergang.pages.dev (Pages) +
  https://diagnoseovergang-api.hey-697.workers.dev (Worker, cron 03:00 UTC).
- Milestones 1–6 of the main brief are built, deployed, and verified. From
  Amendment 01: schema extension, derived entity cache, all 11 Tier 1 entries,
  and the WHO panel (B.1) are live.
- **Not built yet:** Tier 2 grouping overviews (~15–19 entries, A.4 order) →
  then milestone 7 compliance pass (now includes A.5.1 per-entry checks and
  the B.2 no-translation audit) → milestone 8 (Vitest/Playwright, a11y pass).
- CI: push to `main` → GitHub Actions builds and deploys both targets
  (secrets `CLOUDFLARE_API_TOKEN` + `CLOUDFLARE_ACCOUNT_ID` are set; pipeline
  verified green).

## Open threads (owner = Jon unless noted)

1. **Turnstile is on always-pass TEST keys in production.** Functional but no
   real bot protection. Before any public announcement: create a real
   Turnstile site (hostname `diagnoseovergang.pages.dev`), put the site key in
   `.env.production` (`PUBLIC_TURNSTILE_SITEKEY`), run
   `npx wrangler secret put TURNSTILE_SECRET` in `worker/`, redeploy.
2. **No web admin for feedback** (deliberate decision): requires a custom
   domain + Cloudflare Access, which don't exist yet. Owner review runs via
   the `wrangler d1 execute` queries + export documented in README
   ("Tilbakemeldinger"). When a domain lands: route `/api/*` + `/admin/*` on
   it (kills CORS + enables Access) and build the §9.5 admin view.
3. **Amendment 02 (public-repo gate) is queued, NOT started.** Do not begin it
   until Jon explicitly says the pause point is reached. When he does: §A–§D in
   order; if the §D history scrub finds any secret or real feedback data, STOP
   and report to Jon before rewriting history or rotating anything; Jon flips
   repo visibility manually himself. (One §C item — briefs moved into
   `docs/` — was pulled forward with Jon's ok.)
4. **Tier 1 clinician pass (A.5.2):** Vegard has not yet been asked to skim
   the Tier 1 entries. Entries stay `draft` until Jon actions this.
5. **Release pin:** `2025-01` confirmed working across all served codes.
   Upgrading the release is a deliberate, standalone change (footer shows it).

## In-chat decisions not recorded in the briefs

- **JSON over MDX** for content entries (§5 allowed either) — fields map 1:1
  and prose fields stay separable for feedback anchoring.
- **Collection id stays `pd`** for all Chapter 06 content; rename considered
  and deferred to avoid route/type churn.
- **KV entity cache keys are versioned** (`who:entity:v2:{release}:{code}`).
  Cached entities are served WITHOUT re-validation and the frontend parses
  strictly — so bump `CACHE_VERSION` in `worker/src/lib/who.ts` whenever the
  `IcdEntity` shape changes, or stale-shaped cache entries will throw every
  display element into the §7.5 fallback until the nightly cron.
- **Rate limiting** is a KV fixed-hourly-window counter (5/hr per salted
  IP-hash), not the Cloudflare Rate Limiting binding.
- **Retention job** anonymises by `email='', ip_hash=NULL` (empty email = the
  idempotency marker) and deliberately preserves the owner's triage `status`.
- **§9.1 guard:** selections inside `[data-source="who"]` elements never get
  the feedback affordance, even nested in editorial blocks.
- `PD_CODES` in `schema/icd.ts` is legacy §7.4 documentation only — runtime
  scope/pre-warm both read the generated `schema/derived-codes.json`.
- Production `IP_HASH_SALT` differs from dev (regenerated at deploy,
  2026-07-22).
- `.env.production` is committed deliberately: it contains only the public
  worker URL and the public Turnstile sitekey.
- The WHO panel's B.2 translation hint sits INSIDE the collapsed `<details>`
  (visible when expanded) — a judgment call; move below the panel if Jon
  prefers.
- Feedback test data was written to remote D1 during deploy verification and
  deleted; production `feedback` table started clean 2026-07-22.

## Gotchas that cost time

- The in-app browser pane doesn't paint screenshots for localhost tabs —
  verify UI via `javascript_tool` DOM assertions instead; don't burn time on
  blank screenshots.
- The Browser pane's managed preview server can't run npm in this repo
  (sandbox EPERM) — start `wrangler dev` / `npm run dev` via Bash in the
  background, then `preview_start` with `{url}`.
- `wrangler d1 execute --json` wraps JSON in banner text — extract with a
  regex before parsing.
- `*.pages.dev` edges can serve stale copies right after deploy; retry or
  cache-bust before concluding a deploy is broken. Preview-hash URLs
  (`https://<hash>.diagnoseovergang.pages.dev`) sometimes return empty to
  curl — verify against the main alias.
- In local dev every request shares one IP, so the feedback rate limit trips
  fast — clear `rl:feedback:*` keys in local KV
  (`wrangler kv key list/delete --binding ICD_CACHE --local`).
- WHO API responses use `http://` ids — normalize to `https://` (existing
  helpers do this).
- Wrangler needs Node 22; plain shells here resolve 20.9 (see CLAUDE.md).
