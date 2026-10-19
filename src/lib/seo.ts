import type { CollectionEntry } from "astro:content";

// Search snippets cut off around 155–160 characters; shorter than the floor
// wastes the snippet, so fall back to a word-boundary cut.
const DESCRIPTION_MAX = 155;
const DESCRIPTION_MIN = 100;

/** Meta description from editorial prose: whole sentences, else a word-boundary cut. */
export function describe(text: string, max = DESCRIPTION_MAX): string {
  const clean = text.replace(/\s+/g, " ").trim();
  if (clean.length <= max) return clean;
  // A sentence ends at . ! ? before a space, so code decimals (F40.0) never split.
  const sentences = clean.split(/(?<=[.!?])\s+/);
  let out = "";
  for (const s of sentences) {
    const next = out ? `${out} ${s}` : s;
    if (next.length > max) break;
    out = next;
  }
  if (out.length >= DESCRIPTION_MIN) return out;
  const cut = clean.slice(0, max - 1);
  return cut.slice(0, cut.lastIndexOf(" ")).replace(/[,;:–-]$/, "") + "…";
}

/** Title tag for an entry page: keeps the editorial title and makes sure "ICD-11" is in it. */
export function entryTitle(entry: CollectionEntry<"pd">): string {
  const t = entry.data.title_nb;
  return t.includes("ICD-11") ? t : `${t} · ICD-11`;
}

// Static pages from the file tree, so a new page lands in the sitemap without
// an edit here. Dynamic routes ([id]) come from the collection below; 404 is noindex.
const staticPaths = Object.keys(import.meta.glob("../pages/**/*.astro"))
  .map((f) => f.replace(/^\.\.\/pages/, "").replace(/\.astro$/, ""))
  .filter((p) => !p.includes("[") && p !== "/404")
  .map((p) => (p === "/index" ? "/" : `${p.replace(/\/index$/, "")}/`))
  .sort();

/** Every indexable path, for the sitemap. */
export function sitePaths(entries: CollectionEntry<"pd">[]): string[] {
  return [
    ...staticPaths,
    ...entries
      .filter((e) => e.data.kind !== "overview")
      .map((e) => `/endringer/${e.id}/`),
  ];
}
