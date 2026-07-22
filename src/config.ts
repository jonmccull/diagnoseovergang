// Working name only — descriptive, not a trademark (brief §3.6/§12).
// Final name is a stakeholder decision; change it here, nowhere else.
export const SITE_NAME = "Diagnoseovergang";
export const SITE_TAGLINE =
  "Fra ICD-10 til ICD-11 for psykiske lidelser";

// Independence disclaimer — render verbatim, globally (brief §11).
export const INDEPENDENCE_DISCLAIMER =
  "Uavhengig ressurs. Ikke tilknyttet eller godkjent av WHO eller Helsedirektoratet. Redaksjonelt innhold er ikke offisiell oversettelse.";

// WHO attribution — render verbatim in the footer and on every page showing
// ICD-11 content (brief §3.2/§11). The trailing source URL is rendered as a link.
export const WHO_ATTRIBUTION =
  "Inneholder materiale fra ICD-11 (International Classification of Diseases, 11th Revision), © Verdens helseorganisasjon (WHO). Brukt under lisensen CC BY-ND 3.0 IGO. Offisielle koder og titler er hentet fra WHOs ICD-11 API. Kilde:";
export const WHO_SOURCE_URL = "https://icd.who.int";

// Decision-support tool disclaimer — render verbatim (brief §11).
export const DECISION_SUPPORT_DISCLAIMER =
  "Pedagogisk hjelpemiddel, ikke et diagnostisk verktøy. Klinisk vurdering og offisielle ICD-11-retningslinjer er alltid overordnet.";

// Feedback form microcopy — render verbatim above the fields (brief §11/§9.6).
export const FEEDBACK_NO_PATIENT_INFO =
  "Ikke inkluder pasientidentifiserbar informasjon eller opplysninger fra journal.";
export const FEEDBACK_EMAIL_PURPOSE =
  "E-postadressen din brukes kun til å svare deg om dette forslaget, og slettes senest 12 måneder etter innsending.";
// Consent checkbox label — verbatim, unchecked by default (brief §11).
export const FEEDBACK_CONSENT_LABEL =
  "Jeg samtykker til at e-postadressen min og tilbakemeldingen lagres slik at forslaget kan besvares og vurderes.";
// Discoverability hint under each editorial block (brief §12).
export const FEEDBACK_HINT =
  "Ser du noe som bør endres? Marker teksten og foreslå en endring.";

// Turnstile site key (public). Test key by default — replace with the real
// key before the feedback feature goes public.
export const TURNSTILE_SITEKEY: string =
  import.meta.env.PUBLIC_TURNSTILE_SITEKEY ?? "1x00000000000000000000AA";
