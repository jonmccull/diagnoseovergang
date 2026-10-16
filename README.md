# Diagnoseovergang

**Diagnoseovergang** er en uavhengig, åpen kildekode-ressurs som forklarer hva
som er endret mellom ICD-10 og ICD-11, med personlighetsforstyrrelser og øvrige
lidelser i kapittel 06 (psykiske og atferdsmessige lidelser) som utgangspunkt.
Prosjektet er ikke en oversettelse av ICD-11. Det er redaksjonelt,
norskspråklig innhold *om* endringene, kombinert med offisielle ICD-11-koder,
titler og lenker hentet direkte fra WHOs ICD-11 API.

> Uavhengig ressurs. Ikke tilknyttet eller godkjent av WHO eller
> Helsedirektoratet. Redaksjonelt innhold er ikke offisiell oversettelse.

Arbeidsnavnet «Diagnoseovergang» er beskrivende og konfigurerbart i
[src/config.ts](src/config.ts).

## Hvorfor åpen kildekode

Ressursen hviler på noen få regler for hvordan WHO-materiale brukes:
WHO-kildehenvisning, tydelig merking av alt som ikke kommer fra WHO, og ingen
oversettelse av WHO-tekst fra nettstedets side. Slike regler bør kunne
etterprøves, ikke tas på tro. Koden er åpen slik at en kliniker, en jurist
eller Helsedirektoratet selv kan sjekke at reglene faktisk holder, og si fra
om de ikke gjør det. Se det som en invitasjon til gjennomgang.

## Compliance-modellen

Fire regler er produktkrav, og koden er bygget for å håndheve dem. Hver regel
har en peker til stedet i koden der den håndheves.

1. **Offisielle ICD-11-koder, titler og URI-er vises alltid sammen med
   kommentaren vår**, hentet live fra WHOs API, aldri hardkodet eller oversatt
   av oss. Innholdet lagrer bare koder.
   *Kode:* [worker/src/lib/who.ts](worker/src/lib/who.ts) (WHO-OAuth og
   oppslag) og [worker/src/routes/icd.ts](worker/src/routes/icd.ts) (tillatt
   kodesett) → [src/lib/who.ts](src/lib/who.ts) (frontendklient) →
   [IcdEntityCard.astro](src/components/IcdEntityCard.astro) og
   [IcdEntityBadge.tsx](src/components/IcdEntityBadge.tsx). `Icd11Ref` i
   [schema/content.ts](schema/content.ts) har bare et `code`-felt.
   WHO-kildehenvisningen (`WHO_ATTRIBUTION` i [src/config.ts](src/config.ts))
   står i footeren på alle sider ([src/layouts/Base.astro](src/layouts/Base.astro)).
2. **All redaksjonell kommentar er tydelig merket som ikke-WHO-innhold**
   («Redaksjonelt innhold – ikke fra WHO»), styrt av feltet
   `source: "editorial"`.
   *Kode:* `source: z.literal("editorial")` i
   [schema/content.ts](schema/content.ts); merket settes av
   [EditorialBlock.astro](src/components/EditorialBlock.astro), som all
   kommentar rendres inni ([EntryContent.astro](src/components/EntryContent.astro)).
3. **Vi oversetter ikke WHOs klassifikasjonstekst.** Den norske teksten
   forklarer begreper og endringer med egne ord; den gjengir ikke WHOs
   definisjoner på norsk. WHO-tekst som vises (panelet «Offisiell WHO-tekst»)
   står på engelsk. Vil en besøkende ha den oversatt, skjer det i deres egen
   nettleser, aldri generert eller levert av denne appen.
   *Kode:* [WhoOfficialPanel.astro](src/components/WhoOfficialPanel.astro).
   Det finnes ingen integrasjon mot oversettelsestjenester i kodebasen, verken
   på server eller klient, og ingen `translate="no"` som hindrer nettleserens
   egen oversettelse.
4. **Vi publiserer ingen endret eller beriket mappingtabell mellom ICD-10 og
   ICD-11.** Krysskoblingen presenteres som redaksjonell prosa og
   beslutningsstøtte, ikke som en mappingfil som kan videredistribueres.
   *Kode:* [src/lib/crosswalk.ts](src/lib/crosswalk.ts) setter sammen
   krysskoblingen ved bygg fra de redaksjonelle oppføringene;
   [schema/derived-codes.json](schema/derived-codes.json) inneholder bare
   ICD-11-koder (workerens tillatte kodesett), ingen ICD-10-paring.

Hele resonnementet ligger i [docs/](docs/): byggebriefen
([build-brief.md](docs/build-brief.md)) og tilleggene
([amendment-01-chapter-06.md](docs/amendment-01-chapter-06.md),
[amendment-02-public-repo.md](docs/amendment-02-public-repo.md)).

## Data og personvern

Den eneste personopplysningen ressursen behandler, er tilbakemeldinger fra
besøkende. Den fulle teksten står på personvernsiden
([src/pages/personvern.astro](src/pages/personvern.astro)). Kort fortalt:

- **Hva:** tilbakemeldingen, eventuell markert tekst, e-post, rolle og
  tidspunkt. IP-adressen lagres bare som en saltet hash, for å motvirke
  misbruk ([worker/src/lib/abuse.ts](worker/src/lib/abuse.ts)).
- **Hvorfor:** for å kvalitetssikre innholdet og svare på forslaget.
  Behandlingsgrunnlaget er samtykke, gitt i skjemaet.
- **Hvor lenge:** e-post og IP-hash nulles senest 12 måneder etter innsending,
  av en nattlig jobb ([worker/src/cron.ts](worker/src/cron.ts)).
- **Sletting:** send en forespørsel til <hey@jonm.cc>.

Tilbakemeldinger lagres i Cloudflare D1 og vises aldri offentlig.
**Databasen er aldri en del av repoet**, og det ligger ingen ekte
brukerdata i versjonskontrollen: lokale D1-filer, eksporter og hemmeligheter
er utelatt via [.gitignore](.gitignore).

## Bidra

**Rettelser i innholdet:** bruk tilbakemeldingsfunksjonen i appen, ikke
GitHub-issues. Marker teksten og velg «Foreslå en endring», eller bruk «Gi
tilbakemelding» under hver oppføring. Da havner forslaget i samme kø som
andre tilbakemeldinger fra besøkende.

**Innhold via PR:** redaksjonelt innhold ligger som én JSON-fil per oppføring
i [src/content/pd/](src/content/pd/) (filnavn = `id`), validert mot
[schema/content.ts](schema/content.ts) ved bygg. En kliniker kan redigere
prosa uten å røre appkode. Samlingsnavnet `pd` er historisk; den rommer alle
oppføringer i kapittel 06. Innholds-PR-er må:

- beholde `source: "editorial"`, som gir merket **«Redaksjonelt innhold –
  ikke fra WHO»**;
- komme inn som `status: "draft"`, som gir merket **«Utkast – ikke klinisk
  kvalitetssikret»** (bare eieren endrer til `clinician-reviewed`);
- aldri lagre offisielle ICD-11-titler eller ta inn ordrett WHO-tekst, bare
  koder; titlene hentes live fra workeren.

**Kode:** vanlig PR-flyt mot `main`. `npm run typecheck` og `npm run build`
skal passere. Alle PR-er krever gjennomgang fra eieren
([.github/CODEOWNERS](.github/CODEOWNERS)); det er det eneste menneskelige
kontrollpunktet før innhold publiseres. Sikkerhetsproblemer meldes privat, se
[SECURITY.md](SECURITY.md).

## Struktur

| Del | Sti | Hva |
|---|---|---|
| Frontend | `/` (rot) | Astro + Tailwind + TypeScript, deployes til Cloudflare Pages |
| API | `worker/` | Hono på Cloudflare Workers — WHO-proxy, cache, feedback (§5–§6 i briefen) |
| Delte skjema | `schema/` | Zod-skjema for innhold, WHO-svar og feedback |
| Redaksjonelt innhold | `src/content/pd/` | Kommentar-oppføringer (content-as-code, redigeres via PR) |

## Lokal utvikling

Krever Node 22 (se [.nvmrc](.nvmrc)) og en Cloudflare-konto for Wrangler.

```sh
npm install

# Terminal 1 — API
npm run dev --workspace worker      # wrangler dev på http://localhost:8787

# Terminal 2 — frontend
cp .env.example .env                # PUBLIC_API_BASE=http://localhost:8787
npm run dev                         # Astro på http://localhost:4321
```

Workeren trenger lokale hemmeligheter i `worker/.dev.vars` (kopier
[worker/.dev.vars.example](worker/.dev.vars.example)); fila er gitignored.

Forsiden viser API-status — «tilkoblet» betyr at Astro↔Worker-koblingen virker.

## Førstegangsoppsett (Cloudflare + WHO)

1. **WHO ICD-11 API** — registrer deg gratis på <https://icd.who.int/icdapi> →
   Client Id + Client Secret.
2. **Ressurser:**
   ```sh
   npx wrangler kv namespace create ICD_CACHE
   npx wrangler d1 create diagnoseovergang-feedback
   npx wrangler pages project create diagnoseovergang --production-branch=main
   ```
   Lim inn KV-id og D1-id i [worker/wrangler.toml](worker/wrangler.toml).
   Kjør migreringen i [worker/migrations/](worker/migrations/) mot D1
   (`npx wrangler d1 migrations apply diagnoseovergang-feedback`, med
   `--local` for lokal utvikling).
3. **Hemmeligheter** (kjøres i `worker/`; bare navnene står her, aldri
   verdiene):
   ```sh
   npx wrangler secret put WHO_CLIENT_ID
   npx wrangler secret put WHO_CLIENT_SECRET
   npx wrangler secret put TURNSTILE_SECRET
   npx wrangler secret put IP_HASH_SALT     # openssl rand -hex 32
   ```
4. **Turnstile:** Cloudflare dashboard → Turnstile → Add site.
   Site key (offentlig) legges i frontend-env; secret key som Worker-secret.
5. **Cloudflare Access** (når det kommer et web-admin): Zero Trust → Access →
   self-hosted app for `/admin/*` på Worker-hostnamet; policy = kun eierens
   e-post.
6. **CI** (valgfritt): GitHub-secrets `CLOUDFLARE_API_TOKEN` (Workers Scripts:
   Edit, Pages: Edit, KV: Edit, D1: Edit) og `CLOUDFLARE_ACCOUNT_ID`.
   Workflow: [.github/workflows/deploy.yml](.github/workflows/deploy.yml).

## Deploy

```sh
npm run deploy:worker   # wrangler deploy (worker/)
npm run deploy:pages    # astro build + wrangler pages deploy
```

Eller push til `main` med CI-secrets satt.

## API

| Endpunkt | Hva |
|---|---|
| `GET /api/health` | Status + pinnet MMS-release |
| `GET /api/icd/entity/:code` | Normalisert offisiell entitet (kode, tittel, URI, WHO-browserlenke) for koder i det avledede kodesettet. 404 utenfor settet; 503 med norsk feilmelding hvis WHO er nede og cache er tom. |
| `POST /api/feedback` | Tilbakemelding fra besøkende (se under). |

Flyt: KV-cache → WHO OAuth-token (KV-cachet, TTL under `expires_in`) →
codeinfo → entitet → Zod-validering → KV. Nattlig cron (03:00 UTC) forvarmer
det **avledede kodesettet**, så siste gode kopi overlever WHO-nedetid.

### Avledet kodesett (Amendment A.6)

`scripts/derive-codes.mjs` samler alle `icd11[].code` fra innholdet pluss
kapittel 06-grupperingsankre og skriver `schema/derived-codes.json`. Både
workerens scope-vakt (hvilke koder `/api/icd/entity/:code` betjener) og cron-
forvarmingen leser denne fila, så cachen skalerer automatisk med innhold uten
et manuelt synkroniseringspunkt. Kjøres av `prebuild` og `deploy:worker`; kjør
manuelt med `npm run derive-codes`. En ny kode betjenes først når workeren er
deployet på nytt.

Test cron lokalt: `npx wrangler dev --test-scheduled` og
`curl "http://localhost:8787/__scheduled?cron=0+3+*+*+*"`.

## Tilbakemeldinger (drift)

Pipeline i workeren: Turnstile-verifisering → rate limit (5/time per IP-hash) →
Zod-validering → D1. Innsendinger krever e-post, rolle og samtykke. Personvern
og oppbevaring: se [Data og personvern](#data-og-personvern).

**Eiergjennomgang (pilot):** ingen web-admin ennå (krever eget domene +
Cloudflare Access). Les innsendinger med:

```sh
cd worker
npx wrangler d1 execute diagnoseovergang-feedback --remote \
  --command "SELECT id, created_at, entry_id, field, selected_text, comment, email, role, status FROM feedback WHERE status='new' ORDER BY created_at DESC"
```

SQL-eksport (sikkerhetskopi) — skriv den **utenfor repoet**, den inneholder
ekte brukerdata:

```sh
npx wrangler d1 export diagnoseovergang-feedback --remote --output "$HOME/feedback-backup.sql"
```

Statusoverganger (`new → triaged → actioned/dismissed`) settes med en
tilsvarende `UPDATE feedback SET status='triaged' WHERE id='…'`.
Slette-forespørsler (GDPR): `DELETE FROM feedback WHERE email='…'`.
Hvis en innsending ser ut til å inneholde pasientdata: slett umiddelbart
(delete-on-sight, §9.6.6).

**Ikke bygget (bevisst):** e-postutsending fra appen (eieren svarer manuelt i
piloten; en valgfri kvitteringsmail kan vurderes senere, §9.4).

**Turnstile:** testnøkler er i bruk (alltid-pass). Bytt til ekte nøkler før
lansering: site key i `.env.production` (`PUBLIC_TURNSTILE_SITEKEY`) og
`npx wrangler secret put TURNSTILE_SECRET` i `worker/`.

## ICD-11-release

MMS-releasen er pinnet i `worker/wrangler.toml` (`ICD_RELEASE`) slik at innhold
er reproduserbart (§7.3). Releasen vises i footeren. Oppgradering av release er
en bevisst, egen endring.

## Notater

- **Offline-/selvhost-fallback:** WHO tilbyr en Dockerisert lokal ICD-API
  (ikke i bruk i piloten) — dokumentert her som fallback (§7.1).
- **Skaleringssti:** hvis PR-redigering av innhold blir tungvint, kan
  redaksjonelt innhold flyttes til D1 med et lite admin-grensesnitt senere
  (§5). Ikke bygget i piloten.

## Lisens

Repoet har tre kategorier innhold, med hver sin lisens:

| Hva | Lisens | Fil |
|---|---|---|
| Kode (alt utenom `src/content/`) | MIT | [LICENSE](LICENSE) |
| Redaksjonelt innhold i `src/content/` | CC BY-SA 4.0 | [LICENSE-CONTENT.md](LICENSE-CONTENT.md) |
| WHO-materiale som går gjennom appen | WHOs egen: CC BY-ND 3.0 IGO | — |

**WHO-materiale relisensieres ikke.** ICD-11-koder, titler, URI-er og
definisjoner som appen henter fra WHOs API og viser, er WHOs materiale under
[CC BY-ND 3.0 IGO](https://creativecommons.org/licenses/by-nd/3.0/igo/), med
WHOs kildehenvisning. Prosjektets lisenser (MIT og CC BY-SA) gjelder bare koden
og det originale redaksjonelle innholdet, aldri WHO-innhold. Det samme gjelder
ICD-10-koder og norske ICD-10-betegnelser som innholdet viser til. CDDR
(WHOs kliniske beskrivelser, CC BY-NC-ND 3.0 IGO) brukes ikke.
