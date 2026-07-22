# CLAUDE.md — Diagnoseovergang

Norwegian resource explaining what changed from ICD-10 to ICD-11 (Chapter 06).
Astro app (repo root) + Hono Worker (`worker/`) + shared Zod schemas (`schema/`).
Full reasoning lives in `docs/build-brief.md` + `docs/amendment-01-chapter-06.md`
+ `docs/amendment-02-public-repo.md` — consult them for anything content- or
compliance-related. **Read `docs/session-handoff.md` at session start** for
current state and open threads.

## Compliance rules (product requirements, not guidelines)

- Official ICD-11 **code + title + URI + WHO-browser link always travel
  together**, fetched live from OUR worker (`/api/icd/entity/:code`). Official
  titles/definitions are NEVER stored in content, hard-coded, or paraphrased
  into editorial fields.
- All editorial prose renders inside `EditorialBlock` (the "Redaksjonelt
  innhold – ikke fra WHO" treatment), driven by `source: "editorial"`.
- **No translation of WHO text, ever** — no translation API calls (server- or
  client-side), no "Oversett" button, no caching/serving translated WHO text,
  and no `translate="no"` on the WHO panel (user-side browser translation must
  stay possible). Amendment 01 §B.2's prohibited list is absolute.
- No redistributable ICD-10↔ICD-11 mapping artifact; crosswalk stays editorial
  prose/decision-support. No bulk WHO text; CDDR never.
- The verbatim §11 strings (attribution, disclaimers, consent label, feedback
  microcopy) live in `src/config.ts` — never reword them.
- If a task appears to conflict with any of the above, **stop and flag it
  instead of implementing**.

## Editorial content

- One JSON file per entry in `src/content/pd/` (filename = `id`), validated by
  `schema/content.ts`. The collection id `pd` is historical — it holds ALL
  Chapter 06 entries.
- Before referencing any ICD-11 code, verify it resolves in the pinned release
  (`ICD_RELEASE` in `worker/wrangler.toml`) via the live API.
- Apply the Amendment 01 §A.5.1 test to every new/edited entry: delta-framed
  commentary (ICD-10 before → what changed → what to do now), never a WHO
  definition rendered in Norwegian.
- New entries ship `status: "draft"`. Only Jon flips entries to
  `clinician-reviewed`.
- Content changes regenerate `schema/derived-codes.json` (`npm run
  derive-codes`, auto-runs on build/dev). The worker's code allowlist and cron
  pre-warm read that file — **a newly referenced code is not served until the
  worker is redeployed**.

## Workflow

- **Feature branch + PR; Jon merges.** Merge to `main` deploys to production
  via GitHub Actions. Never push directly to `main`.
- Deploys, remote D1 migrations, and `wrangler secret put` against production
  need Jon's explicit ok in-session — the normal ship path is CI-on-merge.
- Before opening a PR: `npm run typecheck` and `npm run build` must pass; for
  worker changes, exercise the route via local `wrangler dev` + curl; for UI
  changes, verify in a browser (DOM assertions — see handoff for the
  screenshot quirk).
- Report style: lead with outcome + how it was verified; flag any deviation
  from the briefs explicitly rather than absorbing it silently.

## Environment

- This shell resolves Node 20.9 but wrangler needs Node 22 — prefix wrangler
  and npm-script commands with
  `PATH="/Users/jon/.nvm/versions/node/v22.22.0/bin:$PATH"`.
- Secrets live in `worker/.dev.vars` and `.env` (both gitignored). Never
  print, commit, or paste their values; production secrets go in via
  `wrangler secret put` (piped, not echoed into chat).
- `src/content-version.ts` is generated (gitignored) — don't edit or commit.
- `PUBLIC_API_BASE` in `.env` points at the **production** worker by default so
  the frontend works without a local worker; switch it to
  `http://localhost:8787` when working on worker code.
- UI and content are Norwegian Bokmål (`nb`); code, comments, and commit
  messages are English.
