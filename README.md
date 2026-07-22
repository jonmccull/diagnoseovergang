# Diagnoseovergang

Fri, norskspråklig ressurs som forklarer hva som endres fra ICD-10 til ICD-11
for personlighetsforstyrrelser (kapittel 06). Offisielle ICD-11-koder, titler og
URI-er hentes live fra WHOs ICD-11 API; norsk redaksjonell kommentar er
ressursens egentlige innhold.

> Uavhengig ressurs. Ikke tilknyttet eller godkjent av WHO eller
> Helsedirektoratet. Redaksjonelt innhold er ikke offisiell oversettelse.

Arbeidsnavnet «Diagnoseovergang» er beskrivende og konfigurerbart i
[src/config.ts](src/config.ts).

## Struktur

| Del | Sti | Hva |
|---|---|---|
| Frontend | `/` (rot) | Astro + Tailwind + TypeScript, deployes til Cloudflare Pages |
| API | `worker/` | Hono på Cloudflare Workers — WHO-proxy, cache, feedback (§5–§6 i briefen) |
| Delte skjema | `schema/` | Zod-skjema for innhold, WHO-svar og feedback |
| Redaksjonelt innhold | `src/content/pd/` | Kommentar-oppføringer (content-as-code, redigeres via PR) |

## Lokal utvikling

```sh
npm install

# Terminal 1 — API
npm run dev --workspace worker      # wrangler dev på http://localhost:8787

# Terminal 2 — frontend
cp .env.example .env                # PUBLIC_API_BASE=http://localhost:8787
npm run dev                         # Astro på http://localhost:4321
```

Forsiden viser API-status — «tilkoblet» betyr at Astro↔Worker-koblingen virker.

## Førstegangsoppsett (Cloudflare + WHO)

1. **WHO ICD-11 API** — registrer deg gratis på <https://icd.who.int/icdapi> →
   Client Id + Client Secret (brukes fra milepæl 2).
2. **Ressurser:**
   ```sh
   npx wrangler kv namespace create ICD_CACHE
   npx wrangler d1 create diagnoseovergang-feedback
   npx wrangler pages project create diagnoseovergang --production-branch=main
   ```
   Lim inn KV-id og D1-id i [worker/wrangler.toml](worker/wrangler.toml)
   (utkommenterte blokker).
3. **Hemmeligheter** (kjøres i `worker/`):
   ```sh
   npx wrangler secret put WHO_CLIENT_ID
   npx wrangler secret put WHO_CLIENT_SECRET
   npx wrangler secret put TURNSTILE_SECRET
   npx wrangler secret put IP_HASH_SALT     # openssl rand -hex 32
   ```
4. **Turnstile** (milepæl 6): Cloudflare dashboard → Turnstile → Add site.
   Site key (offentlig) legges i frontend-env; secret key som Worker-secret.
5. **Cloudflare Access** (milepæl 6): Zero Trust → Access → self-hosted app for
   `/admin/*` på Worker-hostnamet; policy = kun eierens e-post.
6. **CI** (valgfritt): GitHub-secrets `CLOUDFLARE_API_TOKEN` (Workers Scripts:
   Edit, Pages: Edit, KV: Edit, D1: Edit) og `CLOUDFLARE_ACCOUNT_ID`.
   Workflow: [.github/workflows/deploy.yml](.github/workflows/deploy.yml).

## Deploy

```sh
npm run deploy:worker   # wrangler deploy (worker/)
npm run deploy:pages    # astro build + wrangler pages deploy
```

Eller push til `main` med CI-secrets satt.

## Redigere innhold

Redaksjonelt innhold ligger som én JSON-fil per oppføring i
[src/content/pd/](src/content/pd/) (filnavn = `id`), validert mot
[schema/content.ts](schema/content.ts) ved bygg — en kliniker kan redigere
prosa uten å røre appkode; endringer går via PR.

Regler appen håndhever (§8):

- `source: "editorial"` → alltid merket **«Redaksjonelt innhold – ikke fra WHO»**
- `status: "draft"` → **«Utkast – ikke klinisk kvalitetssikret»**-merke
- Offisielle ICD-11-titler lagres **aldri** i innholdet — kun koder; titler
  hentes live fra workeren, så vi aldri driver fra WHO

## API

| Endpunkt | Hva |
|---|---|
| `GET /api/health` | Status + pinnet MMS-release |
| `GET /api/icd/entity/:code` | Normalisert offisiell entitet (kode, tittel, URI, WHO-browserlenke) for koder i pilotens PD-sett (§7.4). 404 utenfor settet; 503 med norsk feilmelding hvis WHO er nede og cache er tom. |

Flyt: KV-cache → WHO OAuth-token (KV-cachet, TTL under `expires_in`) →
codeinfo → entitet → Zod-validering → KV. Nattlig cron (03:00 UTC) forvarmer
det **avledede kodesettet**, så siste gode kopi overlever WHO-nedetid.

### Avledet kodesett (Amendment A.6)

`scripts/derive-codes.mjs` samler alle `icd11[].code` fra innholdet pluss
kapittel 06-grupperingsankre og skriver `schema/derived-codes.json`. Både
workerens scope-vakt (hvilke koder `/api/icd/entity/:code` betjener) og cron-
forvarmingen leser denne fila, så cachen skalerer automatisk med innhold uten
et manuelt synkroniseringspunkt. Kjøres av `prebuild` og `deploy:worker`; kjør
manuelt med `npm run derive-codes`.

Test cron lokalt: `npx wrangler dev --test-scheduled` og
`curl "http://localhost:8787/__scheduled?cron=0+3+*+*+*"`.

## ICD-11-release

MMS-releasen er pinnet i `worker/wrangler.toml` (`ICD_RELEASE`) slik at innhold
er reproduserbart (§7.3). Releasen vises i footeren fra milepæl 2. Oppgradering
av release er en bevisst, egen endring.

## Notater

- **Offline-/selvhost-fallback:** WHO tilbyr en Dockerisert lokal ICD-API
  (ikke i bruk i piloten) — dokumentert her som fallback (§7.1).
- **Skaleringssti:** hvis PR-redigering av innhold blir tungvint, kan
  redaksjonelt innhold flyttes til D1 med et lite admin-grensesnitt senere
  (§5). Ikke bygget i piloten.
- **Compliance:** §3-guardrails i build-briefen er produktkrav — WHO-koder/URI-er
  bevares, all redaksjonell tekst merkes «ikke fra WHO», ingen bulk-WHO-tekst,
  ingen redistribuerbar mappingtabell.
