// Build-time assembly of crosswalk data for the explorer island (§4.2).
// Derives F60.x → editorial-entry links from the content collection, so
// editing an entry's icd10 list updates the explorer without code changes.
import type { CollectionEntry } from "astro:content";
import { ICD10_PD, type Icd10PdItem } from "../data/icd10-pd";

export type CrosswalkEntrySummary = {
  id: string;
  kind: "overview" | "diagnosis-change" | "severity" | "trait-domain";
  title_nb: string;
  whatToDoNow_nb: string;
  caveats_nb?: string;
  icd11: string[];
};

export type CrosswalkItem = Icd10PdItem & {
  entries: CrosswalkEntrySummary[];
};

// An entry's ICD-10 ref matches an item when equal, or when one is the
// parent of the other (F60.3 ↔ F60.30/F60.31).
const refMatches = (refCode: string, itemCode: string) =>
  refCode === itemCode ||
  itemCode.startsWith(refCode) ||
  refCode.startsWith(itemCode);

const KIND_ORDER: Record<CrosswalkEntrySummary["kind"], number> = {
  "diagnosis-change": 0,
  "trait-domain": 1,
  severity: 2,
  overview: 3,
};

export function buildCrosswalkItems(
  entries: CollectionEntry<"pd">[]
): CrosswalkItem[] {
  return ICD10_PD.map((item) => ({
    ...item,
    entries: entries
      .filter((e) =>
        e.data.icd10?.some((ref) => refMatches(ref.code, item.code))
      )
      .map((e) => ({
        id: e.id,
        kind: e.data.kind,
        title_nb: e.data.title_nb,
        whatToDoNow_nb: e.data.whatToDoNow_nb,
        caveats_nb: e.data.caveats_nb,
        icd11: e.data.icd11?.map((r) => r.code) ?? [],
      }))
      .sort((a, b) => KIND_ORDER[a.kind] - KIND_ORDER[b.kind]),
  }));
}
