# Brief Amendment 01 — Chapter 06 Expansion + WHO Content Panel
### Amends `Fable_Build_Brief_ICD11_Delta_Pilot.md` · Where they conflict, this amendment wins

**Context:** the PD-scoped pilot is built through milestone 5 and validated with the clinical stakeholder. This amendment (A) expands editorial scope from personality disorders to the full **Chapter 06 (Mental, Behavioural and Neurodevelopmental Disorders)**, and (B) adds a **WHO original-content panel** with a strict ruling on browser translation. All §3 guardrails and §9 privacy requirements of the main brief remain in force unchanged.

---

## A. Scope expansion: full Chapter 06

### A.1 Principle — entries per meaningful change, not per code
Chapter 06 contains ~160 diagnostic categories, but the resource does **not** need an entry per code. The unit of content remains the *meaningful delta*: a new diagnosis, a removed/restructured concept, a relocation, or a grouping whose logic changed. Target: **~25–40 editorial entries** total for the chapter (including the existing PD set). Codes with only trivial renumbering are covered by their grouping-overview entry, not individually.

### A.2 Schema extension
Extend the `kind` enum in `PdCommentaryEntry` (rename the type `CommentaryEntry`):
```ts
kind: "overview" | "diagnosis-change" | "severity" | "trait-domain"
    | "grouping-overview"   // what changed across a whole grouping
    | "new-diagnosis"       // did not exist in ICD-10
    | "relocation"          // moved chapters/groupings (e.g. gender incongruence)
```
No other schema changes. All new entries ship `status: "draft"` with the standard badge, except where flagged in A.5.

### A.3 Prioritised entry list
**Verify every code against the pinned MMS release at build time; treat codes below as working references, not gospel.**

**Tier 1 — highest clinical stakes / largest conceptual deltas (build first, ~10 entries):**
1. **Complex PTSD (6B41)** — `new-diagnosis`. New in ICD-11; the companion entry on **PTSD (6B40)** covers its narrowed core-symptom definition.
2. **Schizophrenia (6A20)** — `diagnosis-change`. Subtypes (paranoid, hebephrenic, catatonic…) removed; course + symptom-domain specifiers instead. Grouping renamed.
3. **Catatonia (6A40 grouping)** — `diagnosis-change`/`grouping-overview`. Promoted from schizophrenia subtype to its own cross-diagnostic grouping.
4. **Prolonged grief disorder (6B42)** — `new-diagnosis`.
5. **Gaming disorder (6C51)** — `new-diagnosis`.
6. **Binge-eating disorder (6B82)** — `new-diagnosis` (relative to ICD-10 core).
7. **Gender incongruence** — `relocation`. Moved out of mental disorders into Chapter 17 (Conditions related to sexual health); ICD-10 sexual-orientation categories deleted. This entry doubles as the pointer/teaser for any future Chapter 17 coverage.
8. **Disorders of intellectual development (6A00)** — `diagnosis-change`. Reconceptualised from ICD-10 F70–F79 "mental retardation".
9. **Bipolar and mood restructuring (6A60/6A61, mood grouping)** — `diagnosis-change` + mood `grouping-overview`.
10. **Compulsive sexual behaviour disorder (6C72)** — `new-diagnosis` (placed under impulse control).

**Tier 2 — grouping-overview entries (~15–19 entries, one per Chapter 06 grouping):**
Neurodevelopmental disorders · Schizophrenia or other primary psychotic disorders · Catatonia (if not covered in Tier 1) · Mood disorders · Anxiety or fear-related disorders · Obsessive-compulsive or related disorders · Disorders specifically associated with stress · Dissociative disorders · Feeding or eating disorders · Elimination disorders · Disorders of bodily distress or bodily experience · Disorders due to substance use or addictive behaviours · Impulse control disorders · Disruptive behaviour or dissocial disorders · Personality disorders and related traits (exists) · Paraphilic disorders · Factitious disorders · Neurocognitive disorders · Mental or behavioural disorders associated with pregnancy, childbirth or the puerperium.

Each grouping overview answers, in the established format: what is this grouping now, what moved in/out vs ICD-10, and what should a clinician re-learn. Notable content for these overviews (verify at build time): **OCD and related disorders** is a new grouping separated from anxiety (gaining hoarding disorder, body dysmorphic disorder, hypochondriasis); **anxiety** absorbs separation anxiety and selective mutism under the lifespan approach (ICD-10's childhood-specific block is dissolved across groupings); **neurodevelopmental** consolidates ASD and ADHD; **substance use** adds addictive-behaviour parallels and single-episode codes.

**Tier 3 — opportunistic `diagnosis-change` entries** added where visitor feedback (§9) shows demand. Do not pre-build.

### A.4 Rollout order (by grouping, mirrors clinical priority)
1. Disorders specifically associated with stress (CPTSD/PTSD/prolonged grief) → 2. Schizophrenia & primary psychotic + catatonia → 3. Remaining new-diagnosis cluster (gaming, binge-eating, CSBD) + relocations → 4. Mood → 5. Neurodevelopmental → 6. Remaining grouping overviews in any order.
Ship groupings as they're completed — don't hold for the full set.

### A.5 Quality controls at this volume (non-negotiable)
1. **§3.7 discipline check per entry:** before an entry ships, apply the test — *would this page still work as commentary about ICD-11 with all WHO text removed?* If an entry reads as the WHO definition rendered in Norwegian with a footnote, rewrite it. At 40 entries generated with AI assistance, paraphrase-drift toward de facto translation is the primary compliance risk of this amendment. Fable: self-apply this test in the compliance pass for every new entry.
2. **Tier 1 clinician pass:** the clinical stakeholder (Vegard) is asked to skim Tier 1 entries only (~10 entries, light pass, not full review). Entries he approves flip to `status: "clinician-reviewed"` — the first use of that status and a visible trust signal. If he declines, all entries remain draft; do not block the rollout on this.
3. **Feedback loop weighting:** grouping-overview pages get the same highlight-to-comment affordance; monitor which groupings draw corrections and prioritise Tier 3 there.

### A.6 Entity cache expansion (technical)
Replace the hard-coded PD pre-warm list (§7.4) with a **derived set**: at build/deploy time, collect every ICD-11 code referenced in content frontmatter (`icd11[].code`) plus the Chapter 06 grouping-level entities, and pre-warm those. The nightly Cron warms the same derived set. This scales automatically with content and removes a manual sync point. Keep QE50.7 and the existing PD set (they remain referenced by content).

### A.7 Still explicitly out of scope
- **Chapter 07 (Sleep-wake disorders)** and **Chapter 17 (Conditions related to sexual health)** — no entries beyond the gender-incongruence `relocation` pointer. Full Chapter 06 first.
- Everything in the main brief's out-of-scope list.

---

## B. WHO original-content panel + browser-translation ruling

### B.1 New feature: WHO panel (in scope)
On diagnosis detail pages, add a collapsible panel — **"Offisiell WHO-tekst (engelsk)"** — showing the official English content for the entity as returned by the API (title, definition where available), with code, URI, link to the WHO browser, and the standard attribution block. This uses content the API licence already permits and gives clinicians the authoritative text beside our commentary. Visually distinct from editorial content (it is the inverse of the "ikke fra WHO" treatment: this panel is *only* WHO content).

### B.2 Browser translation — the ruling (compliance-critical)
**Permitted:** translation performed **on the user's device, at the user's initiative, with the user's own tool** (browser built-in translation). To enable this:
- Do **not** set `translate="no"` on the WHO panel.
- An optional neutral hint under the panel: *"Tips: nettleserens innebygde oversettelsesfunksjon kan brukes på dette panelet. Maskinoversettelse kan inneholde feil og er ikke en offisiell oversettelse."*

**Prohibited — do not build, even if requested later without reference to this section:**
- Any server-side or client-side code that **calls a translation API/service and renders** Norwegian (or any-language) WHO text.
- Embedded translation widgets that make the *site* the party producing the translation.
- **Caching, storing, or serving** any machine-translated WHO text, including screenshots in marketing material.
- A site-provided "Oversett" button whose implementation fetches a translation (a button that merely invokes the browser's own native translate UI is a grey zone — omit it; the hint text is sufficient).

**Rationale (for the record):** disclaimers cure confusion (trademark/misrepresentation), not unauthorized derivation (copyright). A machine translation rendered by the site is a derivative work distributed by the site regardless of labelling. Keeping the act of translation entirely user-side means the site never produces or communicates a derivative. This ruling implements §3.7 of the main brief; treat it with the same force.

### B.3 Interaction with editorial content
Editorial Norwegian commentary is unaffected. The WHO panel must never be pre-populated into editorial fields, and editorial entries must never quote the panel wholesale (main brief §3.4 limits still apply).

---

## C. Milestone impact
- Insert **milestone 6b (content expansion)** after the current milestone 6: schema `kind` extension, derived entity cache (A.6), Tier 1 entries, WHO panel (B.1) with translation ruling applied, then Tier 2 in rollout order (A.4). The compliance pass (milestone 7) now includes the A.5.1 per-entry discipline check and verification that no translation pathway from B.2's prohibited list exists.
- Definition-of-done addition: a clinician can open a Tier 1 entry (e.g. CPTSD), read the Norwegian delta commentary, expand the WHO panel to see the official English text, and — using their own browser — translate that panel, with the site itself serving no translated WHO text.
