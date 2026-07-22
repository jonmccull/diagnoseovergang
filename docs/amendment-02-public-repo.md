# Brief Amendment 02 — Public Repository Readiness
### Amends `Fable_Build_Brief_ICD11_Delta_Pilot.md` and `Brief_Amendment_01_Chapter06_Expansion.md` · Where they conflict, this amendment wins

**Context:** the repo is currently private. This amendment prepares it to go public — as transparency support for the compliance posture already built into the project (§3 guardrails, §9 privacy), and as a stronger basis for approaching Helsedirektoratet. This is **not a build-now instruction**: execute it at a natural pause point (e.g. after milestone 6b / Chapter 06 rollout settles), not mid-feature. Treat §D as a gate — do not flip the repo to public until every item in §D is confirmed.

---

## A. Licensing split
Add a `LICENSE` file (code) plus a `LICENSE-CONTENT.md` (editorial content), and state the split clearly in the README (§B).

- **Code:** MIT License (permissive, standard, minimal friction for reuse — e.g. by Helsedirektoratet or another Nordic team facing the same problem).
- **Editorial content (Norwegian commentary in `src/content/`):** **CC BY-SA 4.0**. Share-alike matters here: if someone forks the commentary, corrections and improvements should flow back into the open ecosystem rather than being closed off downstream.
- **WHO-sourced material (anything returned by the ICD-11 API and rendered in the WHO panel or elsewhere):** **not relicensed by this project.** Remains WHO's own **CC BY-ND 3.0 IGO** (classification) / **CC BY-NC-ND 3.0 IGO** (CDDR, not used here). State explicitly that this project's licenses (MIT, CC BY-SA) apply only to code and original editorial content, never to WHO content passing through the app.

Fable: create both license files with standard text (MIT boilerplate; CC BY-SA 4.0 boilerplate/link), and add a short `LICENSING.md` or a "Licensing" section in the README cross-referencing all three categories so a reader isn't left guessing which license covers what they're looking at.

---

## B. README — required sections (draft content below; adapt wording, keep substance)

### B.1 What this project is
> **Diagnoseovergang** er en uavhengig, åpen kildekode-ressurs som forklarer hva som er endret mellom ICD-10 og ICD-11, med personlighetsforstyrrelser og øvrige lidelser i kapittel 06 (psykiske og atferdsmessige lidelser) som utgangspunkt. Prosjektet er ikke en oversettelse av ICD-11 — det er redaksjonelt, norskspråklig innhold *om* endringene, kombinert med offisielle ICD-11-koder, titler og lenker hentet direkte fra WHOs ICD-11 API.
>
> Prosjektet er ikke tilknyttet eller godkjent av WHO eller Helsedirektoratet.

### B.2 Why it's open source
One paragraph, in the register already established with the user: the point of making this public is that the compliance approach (WHO attribution, non-WHO content labelling, the no-site-side-translation rule) should be verifiable by anyone — a clinician, a lawyer, or Helsedirektoratet — rather than taken on trust. Frame it as an invitation to review, not a marketing claim.

### B.3 Compliance model (the most important section — make it prominent, near the top)
Summarize, in the README itself (don't just link the brief), the four rules the codebase is built to enforce, each with a one-line pointer to where in the code it's enforced:
1. **Official ICD-11 codes, titles, and URIs are always shown alongside our commentary**, sourced live from the WHO API — never hard-coded or translated by us. *(Pointer: `worker/` entity-fetch logic + `src/lib/who.ts`.)*
2. **All editorial commentary is explicitly labelled as non-WHO content** ("Redaksjonelt innhold – ikke fra WHO"), driven by the `source: "editorial"` field. *(Pointer: content schema in `/schema`, rendering component.)*
3. **We do not translate WHO's classification text.** Norwegian content explains concepts and changes in original language; it does not render WHO's own definitions in Norwegian. Any WHO text shown (the "Offisiell WHO-tekst" panel) stays in English; translation, if a visitor wants it, happens in their own browser — never generated or served by this app. *(Pointer: WHO panel component; explicitly no server-side or client-side translation-API integration exists in this codebase.)*
4. **We do not publish a modified or enriched ICD-10↔ICD-11 mapping table** — crosswalk information is presented as original editorial prose/decision-support, not as a redistributable derived mapping file.

Link to the full brief + amendments (kept in `/docs` in the repo, see §C) for anyone who wants the full reasoning.

### B.4 Data & privacy summary
Short section pointing to the privacy page content already built (main brief §11): what visitor feedback collects, why, retention period, and how to request deletion. State plainly that the feedback database is never included in the public repo (see §D.3) and that no real user data lives in version control.

### B.5 Contributing
Brief section: how to suggest a content correction (point to the in-app highlight-to-comment feature as the primary channel — not GitHub issues, to keep the same triage path as regular visitor feedback), and how to contribute code (standard PR flow). Note that editorial content PRs should preserve the `source: "editorial"` / `status: "draft"` conventions and should not introduce verbatim WHO text.

### B.6 Setup / local development
Standard developer-facing section: prerequisites, Wrangler setup, required secrets (**names only, never values** — `WHO_CLIENT_ID`, `WHO_CLIENT_SECRET`, `TURNSTILE_SECRET`, `IP_HASH_SALT`), how to register for WHO API credentials, local D1/KV setup. This section already exists in outline from the main brief's milestone 7 README task — consolidate it here rather than duplicating.

### B.7 Licensing
Cross-reference to §A above.

---

## C. Repo hygiene (do alongside the README pass)
- Move the brief and its amendments into a `/docs` folder in the repo (e.g. `docs/build-brief.md`, `docs/amendment-01-chapter-06.md`, `docs/amendment-02-public-repo.md`) so the reasoning trail is part of what's public, not just the code.
- Add a `SECURITY.md` with: how to report a security issue or a suspected data-exposure (private email, not a public GitHub issue), and a short note that this project handles limited personal data (feedback submissions) per the privacy summary in §B.4 — security reports involving user data should be treated as urgent.
- Add a `CODEOWNERS` or a simple note in `CONTRIBUTING.md` if any review gate on content PRs is wanted (recommended, given no clinician pre-review exists elsewhere in the pipeline — a PR review is the one remaining human checkpoint before content ships).

---

## D. Pre-publication gate — execute in full before flipping repo visibility to public
This is the load-bearing section. Do not toggle the repo to public until every item below is confirmed, in order.

### D.1 Secret history scrub
1. Search the **full git history**, not just current files, for secret material: `WHO_CLIENT_ID`, `WHO_CLIENT_SECRET`, `TURNSTILE_SECRET`, `IP_HASH_SALT`, any Cloudflare API tokens or account IDs, any D1/KV connection strings.
2. Use both a manual pass (`git log -p -- '*.env' '*.toml' '*.json'` style greps for key-shaped strings) **and** an automated scanner (e.g. `gitleaks detect` or `trufflehog filesystem`) run against the full history, not just HEAD.
3. **If anything is found:** do not rely on removing it in a new commit — history rewriting (`git filter-repo` or BFG Repo-Cleaner) is required to actually purge it, followed by a force-push and, critically, **rotate every secret that was ever exposed**, regardless of how old the commit is. Treat "was it ever committed" as "assume compromised."
4. Confirm `.gitignore` correctly excludes `.dev.vars`, `.env*`, `*.sqlite`, `.wrangler/`, and any local Wrangler state directories — and confirm via `git log --all --full-history -- <path>` that none of these were ever tracked historically even if ignored now.

### D.2 Data audit (highest-stakes check)
1. Confirm **no D1 database file, dump, export, or backup ever entered version control** — this is the check with real stakes, since the feedback table contains clinician emails and free-text comments. Search history for `*.sqlite`, `*.db`, any file named `feedback*`, `export*`, `dump*`.
2. Confirm no screenshots, seed-data fixtures, or test files in the repo (current or historical) contain real submitted feedback rather than synthetic test data.
3. Confirm any `.wrangler/state` local D1 emulation directory was never committed.
4. If any real feedback data is found in history: purge per D.1.3, and separately assess (outside this repo work) whether affected individuals need to be notified per the privacy commitments in the main brief §9.6 — flag this to the project owner rather than deciding unilaterally.

### D.3 Config & environment check
1. Confirm `wrangler.toml` (or equivalent) contains no inline secrets — only resource *names/IDs* that are safe to expose (KV namespace names, D1 database name are generally fine; account-level tokens are not).
2. Confirm no hard-coded internal URLs, staging credentials, or Cloudflare Access policy details that would help someone bypass `/admin/feedback` protection.

### D.4 Code review pass (self-review by Fable before requesting owner sign-off)
1. Re-verify the four compliance rules in §B.3 hold in the current codebase exactly as described — this is a good moment to catch any drift accumulated across milestones (e.g. confirm no code path exists anywhere that calls a translation API server-side, per Amendment 01 §B.2's prohibited list).
2. Confirm every ICD-11 display element still carries code + title + URI + attribution (main brief §3 self-check, re-run at this stage).
3. Confirm the admin feedback view has no client-side-only protection (Cloudflare Access must be the actual gate, not just a UI convention).
4. Produce a short written summary of this review (a few lines) for the project owner — what was checked, what if anything was found and fixed — rather than a silent pass.

### D.5 Final sign-off
Present the D.1–D.4 findings to the project owner explicitly before flipping the repo visibility. This is a decision point, not a formality — if D.1 or D.2 turned up anything, resolved secrets should be rotated and confirmed working before going public, not after.

---

## E. Sequencing note
This amendment is designed to be picked up **once, deliberately**, not folded into ongoing feature milestones. Suggested trigger: after Chapter 06 content rollout (Amendment 01) reaches a stable point, pause feature work, execute §A–§D in full, get owner sign-off (§D.5), then flip the repo to public.
