// Static ICD-10 PD reference list for the crosswalk explorer (§4.2).
// Editorial data: Norwegian short labels + search aliases. Which editorial
// entries each code points to is derived at build time from the content
// collection — content stays the single source of truth.

export type Icd10PdItem = {
  code: string;
  label_nb: string;
  aliases: string[];
};

export const ICD10_PD: Icd10PdItem[] = [
  { code: "F60.0", label_nb: "Paranoid personlighetsforstyrrelse", aliases: ["paranoid"] },
  { code: "F60.1", label_nb: "Schizoid personlighetsforstyrrelse", aliases: ["schizoid"] },
  { code: "F60.2", label_nb: "Dyssosial personlighetsforstyrrelse", aliases: ["dyssosial", "antisosial"] },
  { code: "F60.3", label_nb: "Emosjonelt ustabil personlighetsforstyrrelse", aliases: ["emosjonelt ustabil", "ustabil"] },
  { code: "F60.30", label_nb: "Emosjonelt ustabil personlighetsforstyrrelse, impulsiv type", aliases: ["impulsiv"] },
  { code: "F60.31", label_nb: "Emosjonelt ustabil personlighetsforstyrrelse, borderline type", aliases: ["borderline"] },
  { code: "F60.4", label_nb: "Dramatiserende (histrionisk) personlighetsforstyrrelse", aliases: ["histrionisk", "dramatiserende"] },
  { code: "F60.5", label_nb: "Tvangspreget (anankastisk) personlighetsforstyrrelse", aliases: ["tvangspreget", "anankastisk", "obsessiv"] },
  { code: "F60.6", label_nb: "Engstelig (unnvikende) personlighetsforstyrrelse", aliases: ["engstelig", "unnvikende"] },
  { code: "F60.7", label_nb: "Avhengig personlighetsforstyrrelse", aliases: ["avhengig"] },
  { code: "F60.8", label_nb: "Andre spesifikke personlighetsforstyrrelser", aliases: ["narsissistisk", "andre"] },
  { code: "F60.9", label_nb: "Personlighetsforstyrrelse, uspesifisert", aliases: ["uspesifisert"] },
  { code: "F61", label_nb: "Blandede og andre personlighetsforstyrrelser", aliases: ["blandet"] },
];
