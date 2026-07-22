# Build Brief — ICD-10 → ICD-11 "Delta" Pilot Web App
### Personality Disorders (Chapter 06) proof-of-concept · Norwegian clinicians · Cloudflare stack

**Audience for this document:** Claude Code (Fable), executing the build. Written to be handed over as-is.
**Companion documents (already produced, same project):** the two feasibility assessments — (1) *Norwegian ICD-11 Translation: Legal & Market Feasibility* and (2) *ICD-10 → ICD-11 Delta Resource: Feasibility & Design*. This brief operationalises their conclusions. Where this brief and those disagree, this brief wins.

---

## 0. One-paragraph summary
Build a free, public, Norwegian-language web resource that explains **what changed between ICD-10 and ICD-11 for personality disorders**, anchored to official ICD-11 codes/titles/URIs pulled live from WHO's ICD-11 API, with **original Norwegian commentary** as the core asset. The pilot ships as (a) a working app scaffold and (b) a small set of drafted sample content entries that prove the content model. Personality disorders are the wedge because they are the single largest conceptual change in ICD-11's mental-health chapter (categorical F60.x types → a dimensional severity-plus-traits model), and Norwegian clinicians are actively asking how to make the switch during the migration to ICD-11 (official national introduction targeted ~2028–2029).

---

## 1. Locked decisions (from stakeholder)
1. **Deliverable:** BOTH — scaffold the full app AND draft sample Norwegian content to prove the model. (Seed content is provided in §10 of this brief; wire it in and make it clearly editable.)
2. **ICD-11 data:** Integrate the **live WHO ICD-11 API from day one** (free registration required — see §7).
3. **Hosting:** **Cloudflare.** Stack otherwise open — recommendation in §5.
4. **Language:** UI and content in **Norwegian Bokmål** for the pilot. Architect content and i18n so Nynorsk (and later English) can be added without refactor.
5. **Business model (context, not a pilot feature):** free / open-source-friendly. **No auth, no payments, no user accounts in the pilot.**
6. **No clinician pre-review of content.** Editorial entries ship as clearly-badged drafts; quality assurance runs through the visitor-feedback loop (decision 7 / §9).
7. **Visitor feedback:** highlight-to-comment on editorial content; **private submissions** (never public); **email required**, **professional role required**, **consent checkbox required**; anonymous submission is not offered. Full spec in §9.

---

## 2. Why this product exists (context Fable should keep in mind)
- ICD-11 is not yet officially translated into Norwegian; clinicians still code in ICD-10 in practice but are expected to move to ICD-11. The gap that bites *now* is conceptual, not linguistic: they already know ICD-10 and mainly need to understand **what changed and how to re-code**.
- The lawful, defensible asset is **our own commentary about the changes** — facts and ideas are not copyrightable; only WHO's specific expression is. We display WHO's official codes/titles/URIs (permitted via the API) and layer clearly-labelled Norwegian explanation on top.
- Personality disorders are the ideal first slice: highest-impact change, high clinical volume, and the exact area Helsedirektoratet chose for its own proof-of-concept.

---

## 3. Legal & compliance guardrails — **BUILD THESE IN, non-negotiable**
These are product requirements, not footnotes. The app must be architected so they hold by construction.

1. **Preserve WHO codes and URIs.** Any ICD-11 entity shown must display its official **code**, official **title** (as returned by the API), and its canonical **URI/foundation URI**, with a link back to the official WHO browser entry.
2. **Attribution on every page that shows WHO content.** Render the WHO citation + licence notice (exact text in §11). ICD-11 is licensed **CC BY-ND 3.0 IGO**.
3. **Clearly label all non-WHO additions.** Every piece of our Norwegian commentary must be visually and semantically marked as **"Redaksjonelt innhold – ikke fra WHO"** (editorial content, not from WHO). Use a distinct visual treatment + machine-readable marker (e.g. a `source: "editorial"` field and an ARIA/visible label). This is the single most important compliance UI pattern.
4. **Do NOT reproduce large blocks of WHO text.** Paraphrase into original Norwegian commentary. Short quoted criterion snippets are acceptable where necessary and must be quoted + attributed. **Never** bulk-import the CDDR (Clinical Descriptions & Diagnostic Requirements) — it carries a more restrictive CC BY-NC-ND licence.
5. **Do NOT publish a modified or enriched ICD-10↔ICD-11 mapping table.** We may *reference/link* WHO's official mapping and we may present our own **original editorial crosswalk commentary** ("in ICD-10 this was F60.31; in ICD-11 you now assess severity + select the Borderline pattern qualifier"), but we do not ship a corrected/derived machine mapping file as a product artifact. Keep our crosswalk as prose/decision-support, not as a redistributable table that purports to be *the* mapping.
6. **No WHO trademark / no implied endorsement.** Do not register or brand the product with a name containing "ICD-11"/"ICD-10" as a trademark; do not use the WHO name or emblem; include a visible disclaimer: **"Uavhengig ressurs. Ikke tilknyttet eller godkjent av WHO eller Helsedirektoratet."** Product/working name suggestion: a descriptive, non-infringing name (see §12).
7. **No full translation.** We are not translating the classification. We author commentary and display official (English) titles from the API alongside our Norwegian explanation.

If any feature request during the build appears to cross 4, 5, or 7, stop and flag it rather than implementing.

---

## 4. Pilot scope
### In scope (v1)
1. **Overview / "Slik endres personlighetsforstyrrelser i ICD-11"** — a narrative landing explainer of the model shift (categorical → dimensional).
2. **Crosswalk explorer (PD only)** — user enters or selects an ICD-10 PD code (F60.x) or a diagnosis name and sees: the conceptual ICD-11 equivalent(s), what changed, and the many-to-one/one-to-many caveats, in Norwegian, with official ICD-11 codes/URIs pulled live.
3. **Diagnosis detail view** — side-by-side ICD-10 (what it was) vs ICD-11 (what it is now) + our Norwegian "hva er nytt / hva gjør du nå" commentary + official code/title/URI + link to WHO browser.
4. **PD dimensional decision-support widget** — an interactive helper implementing the ICD-11 approach: pick **severity** (personality difficulty [QE50.7, sub-threshold] / mild 6D10.0 / moderate 6D10.1 / severe 6D10.2) and one or more **prominent trait domains** (6D11.0 Negative affectivity, 6D11.1 Detachment, 6D11.2 Dissociality, 6D11.3 Disinhibition, 6D11.4 Anankastia) plus optional **Borderline pattern (6D11.5)**; output the assembled ICD-11 coding pattern with plain-Norwegian guidance. Clearly framed as an **educational aid, not a diagnostic instrument**.
5. **Live WHO API integration** powering codes/titles/URIs (see §7), via a Cloudflare Worker that holds credentials server-side and caches responses.
6. **Editable content model** so Norwegian commentary can be added/corrected without touching app logic (see §8).
7. **Visitor feedback (highlight-to-comment)** — visitors can select a passage of editorial commentary and privately submit a suggested amendment, with required email + professional role + consent; owner reviews via a protected admin view (see §9). This is the pilot's quality-assurance mechanism, replacing clinician pre-review.

### Explicitly out of scope (v1 — do not build)
- Any chapter other than Chapter 06 personality disorders.
- User accounts, login, payments, subscriptions. (The feedback form collects an email per §9, but there are no accounts.)
- Public/visible comment threads or any public display of visitor feedback.
- Sending emails from the app (owner replies manually in the pilot).
- A downloadable/redistributable mapping table file.
- Full ICD-11 translation or bulk CDDR text.
- Nynorsk/English content (architect for it; don't populate it).
- Native mobile apps.

---

## 5. Recommended stack (Cloudflare-native)
Rationale first: the WHO API uses OAuth2 **client-credentials**; the `client_secret` must never reach the browser. That forces a small server component — on Cloudflare, a **Worker** is the natural home. The content is mostly editorial prose with a few interactive islands, which favours a content-first framework with good SEO.

**Recommended:**
- **Framework:** **Astro** (content-first, excellent SEO, ships zero JS by default) with **React islands** for the interactive pieces (crosswalk explorer, decision-support widget). *Alternative if the team prefers a single SPA:* React + Vite. *Alternative if SSR-heavy app-feel is wanted:* Next.js via `@opennextjs/cloudflare`. Astro is the best fit for a resource that is 80% content, 20% interaction.
- **Styling:** **Tailwind CSS**. Clean, clinical, high-contrast, accessible defaults.
- **Hosting (frontend):** **Cloudflare Pages** (or Workers Assets).
- **Backend/API proxy:** **Cloudflare Worker** using **Hono** (tiny, ergonomic router). Responsibilities: obtain/cache the WHO OAuth token, proxy/fetch specific ICD-11 entities, normalise responses, serve them to the frontend. Holds all secrets.
- **Caching:** **Cloudflare KV** for (a) the WHO access token (TTL just under its expiry) and (b) fetched ICD-11 PD entities (the PD set is small and stable). Add a **Cron Trigger** Worker to refresh the cached PD entities daily so the app is fast and resilient while still being genuinely "live" against WHO.
- **Content store:** For the pilot, **typed content-as-code** — Norwegian commentary as MDX/JSON in the repo, validated by a schema (see §8). Version-controlled, reviewable, edited via PRs. *Scale path (note in README, don't build now):* migrate editorial content into D1 with a small editorial admin if PR-editing becomes painful.
- **Feedback store:** **Cloudflare D1** (SQLite) — in scope for the pilot, holding visitor feedback submissions per §9.3, with Wrangler-managed migrations. (Editorial content stays content-as-code; D1 is for feedback data only in v1.)
- **Anti-abuse:** **Cloudflare Turnstile** on the feedback form (server-side verification in the Worker) + rate limiting (Rate Limiting binding or KV counter). **Cloudflare Access** protects the `/admin/feedback` view — no app-level auth to build.
- **Language/tooling:** **TypeScript** throughout. **Zod** for schema validation of both content and WHO API responses. **Wrangler** for local dev/deploy. **Vitest** + **Playwright** for unit/e2e.
- **i18n:** Astro i18n routing (or `paraglide`/`i18next` for React islands). Default locale `nb-NO`. Structure keys so `nn-NO`/`en` slot in later.

**Repo shape (suggested):**
```
/                     # Astro app (Pages)
  src/content/pd/     # editorial commentary entries (MDX/JSON) — the "asset"
  src/data/           # static PD reference data (ICD-10 F60.x list, trait-domain defs)
  src/components/     # UI incl. React islands: CrosswalkExplorer, PdSeverityTraitTool, FeedbackHighlighter
  src/lib/who.ts      # typed client for OUR worker (not WHO directly)
/worker/              # Cloudflare Worker (Hono): WHO OAuth + entity fetch + KV cache,
  wrangler.toml       #   POST /api/feedback (Turnstile + rate limit + D1), /admin/feedback (behind CF Access),
  migrations/         #   Cron: nightly PD pre-warm + feedback retention job. D1 migrations here.
/schema/              # Zod schemas for content + WHO responses + feedback payloads
```

---

## 6. Architecture & data flow
1. Browser loads Astro page (static/SSR). Editorial commentary is baked in from `src/content`.
2. For official ICD-11 codes/titles/URIs, the frontend calls **our Worker** (`/api/icd/entity/:code`), never WHO directly.
3. The Worker checks **KV** for a cached entity → if miss, checks/obtains a WHO **access token** (KV-cached), calls the **WHO API**, normalises, caches in KV, returns JSON.
4. A scheduled Worker (**Cron**) pre-warms KV nightly with the fixed PD entity set (§7.4), so user requests are near-instant and the app degrades gracefully if WHO is briefly unavailable (serve last-good from KV).
5. **Feedback path:** the FeedbackHighlighter island posts to the Worker's `POST /api/feedback` → Turnstile verification → rate limit → Zod validation → insert into **D1**. The owner reads submissions at `/admin/feedback` (Cloudflare Access) or via CSV export. A scheduled retention job anonymises/deletes per §9.6. Feedback data never flows to any public page.
6. Secrets (`WHO_CLIENT_ID`, `WHO_CLIENT_SECRET`, `TURNSTILE_SECRET`, `IP_HASH_SALT`) live as **Wrangler secrets / env bindings** — never in the repo, never shipped to the client.

Guardrail mapping to architecture: because the frontend only ever renders (official entity from Worker) + (clearly-tagged editorial content from `src/content`), the "label non-WHO additions" and "preserve codes/URIs" requirements hold structurally.

---

## 7. WHO ICD-11 API — integration spec
### 7.1 Registration (do first)
- Register for the **cloud-hosted ICD-11 API** at the WHO ICD API site (icd.who.int/icdapi). It's free. You receive a **Client Id** and **Client Secret**. Put them in Worker secrets.
- *Optional resilience note for README:* WHO also offers a **Dockerised local API** container; not used in the Cloudflare pilot, but worth documenting as an offline/self-host fallback.

### 7.2 OAuth2 token
- **Endpoint:** `POST https://icdaccessmanagement.who.int/connect/token`
- **Body (form-urlencoded):** `grant_type=client_credentials`, `scope=icdapi_access`, `client_id=…`, `client_secret=…`
- Response contains `access_token` and `expires_in` (~3600s). Cache the token in KV with a TTL a little under `expires_in`; refresh on miss.

### 7.3 Calling the classification
- **Base:** `https://id.who.int`
- **Required headers on every call:** `Authorization: Bearer <token>`, `Accept: application/json`, `API-Version: v2`, `Accept-Language: en`.
  - Note: Norwegian is **not** an available API language — that's precisely why we supply our own Norwegian commentary. Request `en` for official titles.
- **Useful endpoints:**
  - Release-specific MMS code lookup: `GET https://id.who.int/icd/release/11/{release}/mms/codeinfo/{code}` and `…/mms/{entityId}` for full entity (title, definition, parents/children, foundation URI).
  - Search within a release: `GET https://id.who.int/icd/release/11/{release}/mms/search?q=…`
  - Foundation entity: `GET https://id.who.int/icd/entity/{entityId}`
  - Pin the `{release}` (e.g. the current MMS release) in config so content is reproducible; expose it in the footer ("basert på ICD-11 MMS, versjon <release>").
- Always capture and store the returned **code**, **title**, and **@id / foundation URI** for display + linking.

### 7.4 PD entity set to cache/pre-warm (Chapter 06)
Fetch and cache these (verify exact codes against the pinned release at build time; treat this list as the working set, not gospel):
- **6D10** Personality disorder — plus severity children **6D10.0** Mild, **6D10.1** Moderate, **6D10.2** Severe, and severity-unspecified.
- **6D11** Prominent personality traits or patterns — **6D11.0** Negative affectivity, **6D11.1** Detachment, **6D11.2** Dissociality, **6D11.3** Disinhibition, **6D11.4** Anankastia, **6D11.5** Borderline pattern.
- **QE50.7** Personality difficulty (note: this is a *factor influencing health status*, sub-threshold — **not** a mental disorder; the UI must say so).

### 7.5 Error handling
- Token failure → retry once, then serve last-good KV entity + a non-blocking notice.
- Entity miss at WHO → show official code + our editorial content, with a "kunne ikke hente offisiell tittel akkurat nå" fallback; never hard-fail the page.
- Validate every WHO response with Zod before caching; log shape drift.

---

## 8. Content model (the actual asset)
Design so a clinician can edit prose without touching code. One entry per editorial unit. Suggested schema (Zod-validated MDX frontmatter or JSON):

```ts
PdCommentaryEntry {
  id: string;                      // stable slug, e.g. "borderline-f60-31"
  kind: "overview" | "diagnosis-change" | "severity" | "trait-domain";
  title_nb: string;               // Norwegian heading (editorial)
  icd10: { code: string; label_nb: string }[] | null;   // e.g. F60.31
  icd11: { code: string }[] | null;                     // e.g. 6D11.5 (title pulled live from API)
  whatChanged_nb: string;         // editorial: what changed
  whatToDoNow_nb: string;         // editorial: practical re-coding guidance
  caveats_nb?: string;            // many-to-many / pitfalls
  sources?: { label: string; url: string }[];  // links to WHO browser, literature
  source: "editorial";            // ALWAYS "editorial" — drives the non-WHO label
  status: "draft" | "clinician-reviewed";       // gates the "utkast" badge
  reviewedBy?: string; reviewedAt?: string;
}
```
Rules the app enforces: `source: "editorial"` content always renders with the "ikke fra WHO" treatment; `status: "draft"` renders an **"Utkast – ikke klinisk kvalitetssikret"** badge. Note for this pilot: there is **no clinician pre-review**; entries stay `"draft"` and the badge doubles as an invitation to use the feedback feature (§9). The `"clinician-reviewed"` status and `reviewedBy/reviewedAt` fields remain in the schema for future use. Official titles are **never** stored in editorial content — they're fetched live by code, so we never drift from WHO.

---

## 9. Visitor feedback — highlight-to-comment (pilot feature)
**Purpose:** this is the pilot's primary quality-assurance mechanism. There is no clinician pre-review of editorial content, so structured feedback from visiting Norwegian clinicians is the main signal for whether the commentary is accurate and useful. Treat it as a first-class feature, not a bolt-on.

### 9.1 Product decisions (locked)
- **Private, not public.** Submissions go to the owner only. No visible comment threads, no public display of feedback, ever. (Prevents an incorrect "correction" from misleading the next reader and avoids moderation burden.)
- **Anchored to a selected passage.** A visitor highlights a span of text *within an editorial commentary block* and gets a "Foreslå en endring" affordance that opens a small popover form. A per-entry "Gi tilbakemelding" button is the fallback (touch devices, general comments).
- **Contact required.** Email is **required** (reply channel + quality barrier + anti-abuse). Professional **role** is **required** (lets the owner weight feedback by expertise — a PD specialist's correction reads differently from a GP's). Consent checkbox **required**. Nothing else — no account, no password, no name field.
- **Scope:** feedback attaches only to editorial content (`source: "editorial"`). WHO-sourced elements (codes, official titles) are not commentable — if users dispute those, that's a WHO matter, not ours; the fallback button can capture it as a general comment.

### 9.2 Form fields
| Field | Required | Notes |
|---|---|---|
| Kommentar | ✔ | Free text, max 2000 chars. |
| E-post | ✔ | Validated format. Purpose microcopy directly beneath (see §11). |
| Din rolle | ✔ | Select: Psykolog · Psykiater · Lege i spesialisering (LIS) · Fastlege/allmennlege · Annet helsepersonell · Student · Annet |
| Samtykke | ✔ | Checkbox, unchecked by default; label text in §11. Submission blocked without it. |
| (hidden) | — | `entryId`, `field` (which schema field the selection came from), `selectedText` (≤500 chars), `contextPrefix`/`contextSuffix` (~50 chars each, for re-anchoring after content edits), `contentVersion` (git commit or content hash at render time). |

The no-patient-info warning (§11) renders above the fields on **every** submission path. If `selectedText` is absent (fallback button), the submission is stored as entry-level feedback.

### 9.3 Data model (Cloudflare D1)
```sql
CREATE TABLE feedback (
  id TEXT PRIMARY KEY,               -- uuid
  created_at TEXT NOT NULL,          -- ISO 8601 UTC
  entry_id TEXT NOT NULL,            -- PdCommentaryEntry.id
  field TEXT,                        -- e.g. "whatChanged_nb"; NULL for entry-level
  selected_text TEXT,                -- highlighted span, <=500 chars; NULL for entry-level
  context_prefix TEXT,               -- ~50 chars before selection (re-anchoring)
  context_suffix TEXT,               -- ~50 chars after selection
  content_version TEXT NOT NULL,     -- git commit / content hash when rendered
  comment TEXT NOT NULL,             -- <=2000 chars
  email TEXT NOT NULL,
  role TEXT NOT NULL,                -- enum per §9.2
  consent INTEGER NOT NULL CHECK (consent = 1),
  status TEXT NOT NULL DEFAULT 'new',  -- new | triaged | actioned | dismissed
  ip_hash TEXT                       -- salted hash, abuse forensics only; never the raw IP
);
CREATE INDEX idx_feedback_entry ON feedback(entry_id);
CREATE INDEX idx_feedback_status ON feedback(status);
```
Manage schema via **Wrangler D1 migrations** checked into the repo.

### 9.4 Endpoint & anti-abuse (Worker)
- `POST /api/feedback` on the existing Hono Worker. Pipeline: **Turnstile server-side verification** → **rate limit** (e.g. 5 submissions/hour per IP, via Cloudflare Rate Limiting binding or KV counter) → **Zod validation** (field lengths, role enum, email format, consent === true) → insert into D1 → `201` with a friendly Norwegian confirmation ("Takk! Forslaget er sendt og blir vurdert.").
- Reject oversized payloads early. Log only status codes and the `ip_hash` salt-derivation — never raw emails or comments in logs.
- No email-sending in the pilot (owner replies manually from their own client); note an optional future "acknowledgement email" in the README, don't build it.

### 9.5 Owner review & export
- **Admin view** at `/admin/feedback`, protected by **Cloudflare Access** (Zero Trust — owner's email only; no app-level auth to build). List with filters (entry, role, status), detail view showing the anchored selection in context, status transitions (new → triaged → actioned/dismissed), and **CSV export**.
- Keep it deliberately minimal — server-rendered table is fine. A `wrangler d1 execute` query snippet in the README is the belt-and-braces fallback.

### 9.6 Privacy requirements (GDPR — build-in, non-negotiable)
1. **Lawful basis = consent**, captured per-submission via the required checkbox; store the flag.
2. **Purpose limitation:** email used only to respond about the suggestion. State this in the form microcopy (§11) and privacy page. No marketing, no lists.
3. **Data minimisation:** only the fields in §9.3. No cookies for this feature; no tracking identifiers; hash the IP with a salt if stored at all.
4. **Retention:** delete or anonymise (null the email, keep the content signal) **no later than 12 months after submission or at pilot end, whichever is first**. Implement as a scheduled Worker (Cron) job — actually build this, don't just document it.
5. **Rights:** the privacy page (§11) names a contact address for access/deletion requests; deletion is a simple D1 delete by email.
6. **Patient-data guard:** the "Ikke inkluder pasientidentifiserbar informasjon…" warning is mandatory on every submission surface. If a submission nonetheless appears to contain patient data, the owner's procedure is delete-on-sight (note in README).
7. *(Flag, not legal advice: this setup is proportionate for a small pilot, but if the project grows — or an acknowledgement-email feature is added — have the privacy setup reviewed properly.)*

---

## 10. Seed content to ship (drafts — Norwegian Bokmål)
Wire these in as real entries so the model is proven end-to-end. **All are `status: "draft"` and must show the draft badge (see §8).** They state well-established facts about the ICD-11 model. There is **no clinician pre-review in this pilot**: quality assurance runs through the visitor-feedback loop (§9), and the owner refines entries based on submissions. (Fable: reproduce these verbatim as seed data; do not editorialise further.)

**Entry 1 — Overview (`kind: "overview"`)**
- **title_nb:** "Fra kategorier til dimensjoner: personlighetsforstyrrelser i ICD-11"
- **whatChanged_nb:** "ICD-10 delte personlighetsforstyrrelser inn i separate typer (blant annet paranoid, schizoid, dyssosial, emosjonelt ustabil, tvangspreget). ICD-11 fjerner disse typene og erstatter dem med én diagnose – personlighetsforstyrrelse (6D10) – der klinikeren først vurderer alvorlighetsgrad og deretter angir hvilke fremtredende personlighetstrekk som er til stede."
- **whatToDoNow_nb:** "Vurder først alvorlighetsgrad: lett (6D10.0), moderat (6D10.1) eller alvorlig (6D10.2). Angi deretter ett eller flere fremtredende trekkdomener (6D11). Ved behov kan borderline-mønster (6D11.5) legges til. Sub-terskel vansker kodes som personlighetsvansker (QE50.7), som ikke er en psykisk lidelse."
- **caveats_nb:** "Overgangen er ikke én-til-én. En ICD-10-type tilsvarer sjelden nøyaktig ett ICD-11-trekkdomene; flere trekk kan være aktuelle samtidig, og alvorlighetsgrad er nå det bærende prinsippet."

**Entry 2 — Borderline (`kind: "diagnosis-change"`)**
- **title_nb:** "Emosjonelt ustabil / borderline (F60.31) i ICD-11"
- **icd10:** `[{ code: "F60.31", label_nb: "Emosjonelt ustabil personlighetsforstyrrelse, borderline type" }]`
- **icd11:** `[{ code: "6D11.5" }]` (title pulled live)
- **whatChanged_nb:** "Borderline forsvinner som egen type. I ICD-11 settes diagnosen personlighetsforstyrrelse med alvorlighetsgrad, og borderline-mønster (6D11.5) kan angis som et eget kvalifiserende trekk. Negativ affektivitet (6D11.0) er ofte også fremtredende."
- **whatToDoNow_nb:** "Sett alvorlighetsgrad (6D10.0/.1/.2), legg til borderline-mønster (6D11.5), og vurder aktuelle trekkdomener som negativ affektivitet (6D11.0) og eventuelt hemningsløshet (6D11.3)."

**Entry 3 — Severity (`kind: "severity"`)**
- **title_nb:** "Alvorlighetsgrad – det nye organiserende prinsippet"
- **whatChanged_nb:** "ICD-11 gjør alvorlighetsgrad sentral. Graden bestemmes av omfanget av forstyrrelse i selvfungering og mellommenneskelig fungering, risiko for skade og påvirkning på funksjon over tid – ikke av hvilken 'type' pasienten passer inn i."
- **whatToDoNow_nb:** "Bruk lett (6D10.0), moderat (6D10.1) eller alvorlig (6D10.2). Under terskel for diagnose: personlighetsvansker (QE50.7)."

**Entry 4 — Trait domains (`kind: "trait-domain"`, one entry, enumerates the five + borderline)** — for each of 6D11.0–6D11.4 plus 6D11.5, a short Norwegian gloss and the ICD-10 types that most often map toward it (editorial guidance, framed as "peker ofte mot", not a fixed mapping). Fable: create one entry per domain following the schema; keep glosses to 1–2 sentences and mark as draft.

---

## 11. Attribution & disclaimer blocks (render verbatim)
**WHO attribution (footer + any page showing ICD-11 content):**
> Inneholder materiale fra ICD-11 (International Classification of Diseases, 11th Revision), © Verdens helseorganisasjon (WHO). Brukt under lisensen CC BY-ND 3.0 IGO. Offisielle koder og titler er hentet fra WHOs ICD-11 API. Kilde: https://icd.who.int

**Independence disclaimer (global, e.g. header/footer):**
> Uavhengig ressurs. Ikke tilknyttet eller godkjent av WHO eller Helsedirektoratet. Redaksjonelt innhold er ikke offisiell oversettelse.

**Editorial-content inline label (on every commentary block):**
> Redaksjonelt innhold – ikke fra WHO. *(+ "Utkast – ikke klinisk kvalitetssikret" while `status: draft`.)*

**Decision-support tool disclaimer:**
> Pedagogisk hjelpemiddel, ikke et diagnostisk verktøy. Klinisk vurdering og offisielle ICD-11-retningslinjer er alltid overordnet.

**Feedback form — mandatory microcopy (in the popover, above the fields):**
> Ikke inkluder pasientidentifiserbar informasjon eller opplysninger fra journal.
> E-postadressen din brukes kun til å svare deg om dette forslaget, og slettes senest 12 måneder etter innsending.

**Feedback form — consent checkbox label (required, unchecked by default):**
> Jeg samtykker til at e-postadressen min og tilbakemeldingen lagres slik at forslaget kan besvares og vurderes.

**Privacy page ("Personvern") — minimum content (plain Norwegian, one screen):** what is collected (tilbakemelding, markert tekst, e-post, rolle, tidspunkt), purpose (kvalitetssikring av redaksjonelt innhold og svar på forslag), legal basis (samtykke), storage (Cloudflare D1, EU-jurisdiksjonsnote), retention (slettes/anonymiseres senest 12 måneder etter innsending eller ved pilotens slutt, det som kommer først), rights (innsyn/sletting via kontakt-e-post), and that feedback is never published. Include the owner's contact address for deletion requests.

---

## 12. UX / design direction
- **Tone:** calm, clinical, trustworthy; Norwegian public-health register. Think reference tool, not marketing site.
- **Core interaction:** land → understand the shift → look up a familiar F60.x code → see "hva er nytt / hva gjør du nå" → (optionally) use the severity+traits tool.
- **Side-by-side pattern:** ICD-10 (venstre, "før") vs ICD-11 (høyre, "nå") wherever a change is shown.
- **Non-WHO tagging is a first-class visual element**, not an afterthought — a consistent, unmissable treatment.
- **Feedback affordance is discoverable but calm:** the highlight-to-comment interaction should be hinted (e.g. a short line under each editorial block: "Ser du noe som bør endres? Marker teksten og foreslå en endring.") without competing with the content. The popover form is small, single-purpose, and dismissible.
- **Accessibility:** target **WCAG 2.1 AA** (relevant for Norwegian public-sector-facing tools) — semantic HTML, keyboard-navigable islands, sufficient contrast, proper headings, `lang="nb"`.
- **Naming (working):** descriptive, non-infringing, e.g. **"Diagnoseovergang"**, **"ICD-overgang"**, or **"Fra ICD-10 til ICD-11"** used descriptively (not trademarked, no WHO emblem). Final name is the stakeholder's call — leave it configurable.

---

## 13. Build sequence (milestones)
1. **Scaffold + deploy skeleton to Cloudflare Pages** (Astro + Tailwind + TS), plus a hello-world Hono Worker, wired with Wrangler. Confirm CI/deploy works before feature work.
2. **Worker: WHO OAuth + entity fetch + KV cache + Zod validation**; expose `/api/icd/entity/:code`. Verify against the real API for the PD set (§7.4). Add the nightly Cron pre-warm.
3. **Content pipeline:** schema (§8) + seed entries (§10) rendering with the mandatory labels/badges (§3, §11).
4. **Diagnosis detail + crosswalk explorer** (React islands) consuming the Worker + editorial content.
5. **PD severity+traits decision-support widget** with its disclaimer.
6. **Visitor feedback feature (§9):** D1 schema + migrations; `POST /api/feedback` with Turnstile verification, rate limiting, and Zod validation; highlight-to-comment island with the required email/role/consent fields and privacy microcopy; per-entry fallback button; admin review view behind Cloudflare Access with CSV export.
7. **Compliance pass:** verify every ICD-11 display carries code+title+URI+attribution; every editorial block carries the non-WHO label; draft badge present; disclaimers in place; no bulk WHO text; no shipped mapping table; feedback form shows the no-patient-info warning, purpose statement, and consent checkbox, and submissions are private (never rendered publicly).
8. **A11y + tests** (Vitest unit, Playwright e2e for the three islands incl. the feedback flow), **README** (setup, secrets, release pinning, D1 migrations, feedback data-retention job, local-Docker fallback note, scale-path note for moving editorial content into D1 later).

**Definition of done for the pilot:** deployed on Cloudflare; a clinician can look up F60.31 and see live official ICD-11 codes/titles/URIs beside drafted Norwegian "what changed / what to do now" commentary; the severity+traits tool assembles a coding pattern; a visitor can highlight a passage of commentary and submit a suggestion (email + role + consent required) that lands privately in D1 and is readable/exportable by the owner; all §3 guardrails and §9 privacy requirements demonstrably hold; content is editable via the schema without touching app logic.

---

## 14. Open questions to resolve during/after the build (flag, don't block)
- **Release pinning:** which ICD-11 MMS release to pin for the pilot? (Default: latest stable; expose in footer.)
- **Editing workflow:** there is **no clinician pre-review** in this pilot (stakeholder decision). Quality assurance runs through the visitor-feedback loop (§9): the owner triages submissions and updates content via PR. If feedback volume makes PR editing painful, revisit a lightweight editorial admin on D1 later.
- **Helsedirektoratet:** the assessments recommend early contact (align, possibly contribute, avoid duplicating their forthcoming free materials). Not a build task, but the strongest strategic move — worth doing in parallel.

---

## 15. Suggested opening prompt for Claude Code
> "Read `Fable_Build_Brief_ICD11_Delta_Pilot.md` in full. Scaffold the Astro + Tailwind + TypeScript app and the Hono Cloudflare Worker per §5–§6, targeting Cloudflare Pages + Workers with Wrangler. Start with milestone 1 (deployable skeleton), then stop and show me the structure before proceeding. Treat every guardrail in §3 as a hard requirement, and the privacy requirements in §9 as equally non-negotiable."
