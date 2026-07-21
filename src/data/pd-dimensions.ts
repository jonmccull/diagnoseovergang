// Reference data for the severity+traits decision-support widget (§4.4).
// Codes match the pinned release working set (§7.4); official titles are still
// fetched live per code for display — these Norwegian labels are editorial.

export type SeverityOption = {
  code: string; // 6D10.0 / .1 / .2, or QE50.7
  label_nb: string;
  blurb_nb: string;
  isDisorder: boolean; // false for QE50.7 (sub-threshold, not a mental disorder)
};

// Ordered sub-threshold → severe so the control reads as a scale.
export const SEVERITIES: SeverityOption[] = [
  {
    code: "QE50.7",
    label_nb: "Personlighetsvansker",
    blurb_nb:
      "Under terskel for diagnose. Ikke en psykisk lidelse, men en faktor som påvirker helsetilstand.",
    isDisorder: false,
  },
  {
    code: "6D10.0",
    label_nb: "Lett personlighetsforstyrrelse",
    blurb_nb:
      "Diagnoseterskel er nådd. Forstyrrelse i selv- og mellommenneskelig fungering med begrenset påvirkning på funksjon.",
    isDisorder: true,
  },
  {
    code: "6D10.1",
    label_nb: "Moderat personlighetsforstyrrelse",
    blurb_nb:
      "Tydelig forstyrrelse i flere områder av fungering, med merkbar påvirkning på funksjon over tid.",
    isDisorder: true,
  },
  {
    code: "6D10.2",
    label_nb: "Alvorlig personlighetsforstyrrelse",
    blurb_nb:
      "Uttalt forstyrrelse i selv- og mellommenneskelig fungering, ofte med risiko for skade.",
    isDisorder: true,
  },
];

export type TraitOption = {
  code: string; // 6D11.0–6D11.4
  label_nb: string;
  blurb_nb: string;
};

export const TRAITS: TraitOption[] = [
  {
    code: "6D11.0",
    label_nb: "Negativ affektivitet",
    blurb_nb: "Bredt spekter av negative følelser, oftere og sterkere enn situasjonen tilsier.",
  },
  {
    code: "6D11.1",
    label_nb: "Tilbaketrekning",
    blurb_nb: "Sosial og emosjonell avstand; lite interesse for nære relasjoner.",
  },
  {
    code: "6D11.2",
    label_nb: "Dyssosialitet",
    blurb_nb: "Manglende hensyn til andres rettigheter og følelser; egosentrisitet.",
  },
  {
    code: "6D11.3",
    label_nb: "Hemningsløshet",
    blurb_nb: "Impulsivitet og handling på innskytelse uten hensyn til konsekvenser.",
  },
  {
    code: "6D11.4",
    label_nb: "Anankasti",
    blurb_nb: "Perfeksjonisme, rigid kontroll og opptatthet av regler og orden.",
  },
];

// The borderline pattern qualifier (6D11.5) is a separate, optional pattern —
// not one of the five trait domains (§4.4).
export const BORDERLINE = {
  code: "6D11.5",
  label_nb: "Borderline-mønster",
  blurb_nb:
    "Valgfritt kvalifiserende mønster: ustabilitet i relasjoner, selvbilde og affekt, med impulsivitet.",
};
