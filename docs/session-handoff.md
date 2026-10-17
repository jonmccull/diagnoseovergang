# Session handoff — current state & one-time context

Last updated: 2026-10-17 (canonical site moved to diagnoseovergang.no, verified in production). This file carries
decisions and state that are NOT in the briefs. Update it when a session
materially changes project state; keep it current-state-only (no history log).

## Where the project stands

- **Live:** https://diagnoseovergang.no (Pages custom domain, registered
  2026-10-16 to Jon via GoDaddy, DNS on Cloudflare) +
  https://diagnoseovergang-api.hey-697.workers.dev (Worker, cron 03:00 UTC).
  `functions/_middleware.ts` 301s `diagnoseovergang.pages.dev` and `www` to
  the apex; preview hashes are not redirected. The apex has been canonical
  since PR #21 (merged and deployed 2026-10-17, checks in its last comment):
  Astro `site`, canonical tags, sitemap (39 URLs) and robots.txt all point at
  `https://diagnoseovergang.no/`, and the www certificate is issued. Zone-scoped DNS-edit token at
  `~/.config/cloudflare/diagnoseovergang.token` (Jon's Mac); wrangler's own
  OAuth login has zone read only.
- Milestones 1–6 of the main brief are built, deployed, and verified. From
  Amendment 01: schema extension, derived entity cache, all 11 Tier 1 entries,
  and the WHO panel (B.1) are live.
- **Tier 2 grouping overviews: DONE, merged, deployed** (all 17 — the full
  A.3/A.4 set, one per Chapter 06 grouping not already covered by Tier 1 or the
  existing PD overview). Shipped via **PR #2**; the worker redeploy that the
  new codes needed (`derived-codes.json` grew 25 → 76) ran on merge, so they
  resolve live rather than falling to §7.5. All still `status: "draft"`.
- **Milestone 7 compliance pass: DONE, merged (PR #4), deployed.** Full audit
  against build-brief §13 + Amendment 01 §A.5.1 (per-entry discipline check)
  and §B.2 (no-translation audit). Structural guardrails all pass with no code
  changes (editorial labels, draft badges, disclaimers, feedback microcopy +
  privacy, no translation pathway anywhere, no redistributable mapping
  artifact, no bulk WHO text). The §A.5.1 test was applied to all 37 entries:
  30 passed, 0 hard fails; 6 that leaned toward a WHO-style definition were
  reframed to delta commentary (5 trait-domain `whatChanged_nb` + gaming
  `whatToDoNow_nb`). Left as deliberate judgment-keeps: `kompleks-ptsd-6b41`
  (6B40-vs-6B41 discriminator), `ptsd-6b40`, `csbd-6c72`,
  `overspisingslidelse-6b82`. Content-only, no schema/code/codes changed.
- **Foundations restyle: DONE, merged (PR #12), deployed 2026-10-16.** Flat
  ground, hairlines, lime as the one light, both themes, with a dark/light
  toggle in the bar. No functional change. PR #12 lists the judgment calls
  and the kit gaps it found.
- **Not built yet:** milestone 8 (Vitest unit + Playwright e2e for the three
  islands incl. feedback, a11y pass, README).
- CI: push to `main` → GitHub Actions builds and deploys both targets
  (secrets `CLOUDFLARE_API_TOKEN` + `CLOUDFLARE_ACCOUNT_ID` are set; pipeline
  verified green).

## Open threads (owner = Jon unless noted)

1. **Turnstile is on always-pass TEST keys in production.** Functional but no
   real bot protection. Before any public announcement: create a real
   Turnstile site (hostname `diagnoseovergang.no`), put the site key in
   `.env.production` (`PUBLIC_TURNSTILE_SITEKEY`), run
   `npx wrangler secret put TURNSTILE_SECRET` in `worker/`, redeploy.
2. **No web admin for feedback** (deliberate decision): requires Cloudflare
   Access on the custom domain, which now exists but is not set up. Owner
   review runs via the `wrangler d1 execute` queries + export documented in
   README ("Tilbakemeldinger"). Next: route `/api/*` + `/admin/*` on
   `diagnoseovergang.no` (kills CORS + enables Access) and build the §9.5
   admin view. The worker's CORS allowlist accepts the domain (PR #20).
   **SEO:** `site` in `astro.config.mjs` is the one place canonical, Open
   Graph, sitemap and robots.txt read the origin from. Still open: verify the
   domain in Google Search Console + Bing and submit `/sitemap.xml`.
3. **Amendment 02 (public-repo gate) is queued, NOT started.** Do not begin it
   until Jon explicitly says the pause point is reached. When he does: §A–§D in
   order; if the §D history scrub finds any secret or real feedback data, STOP
   and report to Jon before rewriting history or rotating anything; Jon flips
   repo visibility manually himself. (Two §C items were pulled forward with
   Jon's ok: briefs moved into `docs/`, and CODEOWNERS added.)
   **Post-flip step:** enable branch protection on `main` (require PR +
   code-owner review, `enforce_admins: true`) — attempted 2026-07-22 but
   GitHub requires Pro for protection on private repos, so it must wait until
   the repo is public. Until then the no-direct-push rule in CLAUDE.md is
   convention, not enforced.
4. **Tier 1 clinician pass (A.5.2):** Vegard has not yet been asked to skim
   the Tier 1 entries. Entries stay `draft` until Jon actions this.
5. **Release pin:** `2025-01` confirmed working across all served codes.
   Upgrading the release is a deliberate, standalone change (footer shows it).
6. **Front-page copy still PD-scoped.** `SITE_TAGLINE` + the index intro say
   "for personlighetsforstyrrelser", but scope is now all of Chapter 06.
   Surfaced during the milestone-7 pass — accuracy, not a compliance guardrail.
   Reword `SITE_TAGLINE` in `src/config.ts` (+ the index.astro intro) when you
   settle final naming.

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

- **Foundations design kit vendored (PR #12):** pinned, byte-identical copies
  in `src/styles/foundations/`. `VERSION.md` and `kit.lock.json` hold the pin
  (PR #13); the `kit` CI workflow fails if they drift from the kit or each
  other, but being behind does not fail it. Updates arrive as a "Foundations
  kit update" PR from the kit repo (branch `kit/update`) once its
  `KIT_BOT_TOKEN` is set — merge those rather than hand-copying files.
  Tailwind maps the tokens via `@theme inline` in `global.css`. The link and
  row hover (a 0.1em lime stroke growing from the centre) comes from the
  kit's `bundle.css`; there is no project hover CSS.
- **Theme:** `data-theme="dark"` on `<html>`. A pre-paint script in
  `Base.astro` reads a stored `theme` from localStorage, else the OS; the bar's
  toggle stores the choice; with nothing stored it follows the OS live. Same
  semantics as jonm.cc. Kit issue jonmccull/foundations-kit#12 proposes moving
  the toggle into the kit; retire the local copy when that lands.
- **Project status colours** (`--editorial`, `--who`, `--danger` in
  `global.css`) carry the editorial/WHO compliance distinction as label text
  only, contrast-verified in both themes. `--danger` should retire when kit
  issue jonmccull/foundations-kit#13 adds a kit danger colour.
- **Dither header texture: parked.** Jon judged the first round (four variants)
  "not quite there yet"; its worktree was discarded. The kit's dither-derived
  Field component belongs to Foundations' own hero; don't drop it in here
  without Jon's call on the kit's "never the hero" rule.

## Gotchas that cost time

- ~~The in-app browser pane doesn't paint screenshots for localhost tabs~~
  Fixed upstream by 2026-10-16: pane screenshots of localhost work again. DOM
  assertions remain the precise check; for PR-quality captures use Playwright
  (borrow `node_modules/playwright` from the blog repo — browsers are cached).
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
