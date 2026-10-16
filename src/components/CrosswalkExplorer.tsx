import { useMemo, useState } from "react";
import type { CrosswalkItem } from "../lib/crosswalk";
import { IcdEntityBadge } from "./IcdEntityBadge";

type Props = {
  items: CrosswalkItem[];
  /** Generic many-to-one caveat (overview entry's caveats_nb) shown when
   *  matched entries carry none of their own. */
  genericCaveat_nb: string;
};

const KIND_LABEL: Record<string, string> = {
  "diagnosis-change": "Diagnoseendring",
  "trait-domain": "Trekkdomene",
  severity: "Alvorlighetsgrad",
  overview: "Oversikt",
};

/**
 * Crosswalk explorer (§4.2): ICD-10 PD code or name → conceptual ICD-11
 * equivalents with live official codes, plus many-to-one caveats. All prose
 * here is editorial; the surrounding EditorialBlock provides the §3.3 label.
 */
export function CrosswalkExplorer({ items, genericCaveat_nb }: Props) {
  const [query, setQuery] = useState("");
  const [selectedCode, setSelectedCode] = useState<string | null>(null);

  const matches = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return [];
    return items.filter(
      (item) =>
        item.code.toLowerCase().includes(q) ||
        item.label_nb.toLowerCase().includes(q) ||
        item.aliases.some((a) => a.includes(q))
    );
  }, [items, query]);

  const selected = items.find((i) => i.code === selectedCode) ?? null;
  const caveats = selected
    ? [
        ...new Set(
          selected.entries.map((e) => e.caveats_nb).filter(Boolean) as string[]
        ),
      ]
    : [];

  return (
    <div>
      <label
        htmlFor="crosswalk-input"
        className="block font-medium text-ink"
      >
        Slå opp en ICD-10-kode eller diagnose
      </label>
      <input
        id="crosswalk-input"
        type="text"
        value={query}
        onChange={(e) => {
          setQuery(e.target.value);
          setSelectedCode(null);
        }}
        placeholder="F60.31, borderline, tvangspreget …"
        autoComplete="off"
        className="mt-2 w-full border border-hairline bg-transparent px-4 py-2.5 text-ink placeholder:text-ink-muted focus:outline-2 focus:outline-ink focus:outline-offset-2"
      />

      <div aria-live="polite">
        {query.trim() && !selected && (
          <ul className="mt-3 space-y-1">
            {matches.length === 0 && (
              <li className="text-sm text-ink-muted">
                Ingen treff blant ICD-10-kodene for personlighetsforstyrrelser
                (F60–F61).
              </li>
            )}
            {matches.map((item) => (
              <li key={item.code}>
                <button
                  type="button"
                  onClick={() => setSelectedCode(item.code)}
                  className="fdn-row-link w-full border-t border-hairline px-1 py-3 text-left"
                >
                  <span className="font-mono font-semibold">{item.code}</span>
                  <span aria-hidden="true"> · </span>
                  <span>{item.label_nb}</span>
                </button>
              </li>
            ))}
          </ul>
        )}

        {selected && (
          <div className="mt-4">
            <div className="border-t border-hairline pt-3">
              <p className="caption mb-1 uppercase text-ink-muted">
                Før – ICD-10
              </p>
              <p>
                <span className="font-mono font-semibold">{selected.code}</span>
                <span aria-hidden="true"> · </span>
                <span>{selected.label_nb}</span>
              </p>
            </div>

            <div className="mt-4">
              <p className="caption mb-2 uppercase text-ink-muted">
                Nå – ICD-11
              </p>

              <p className="text-sm text-ink-secondary">
                Sett alltid alvorlighetsgrad først: lett (6D10.0), moderat
                (6D10.1) eller alvorlig (6D10.2) — se{" "}
                <a
                  href="/endringer/alvorlighetsgrad"
                  className="fdn-link"
                >
                  alvorlighetsgrad
                </a>
                .
              </p>

              {selected.entries.length > 0 ? (
                <ul className="mt-3 space-y-3">
                  {selected.entries.map((entry) => (
                    <li
                      key={entry.id}
                      className="border-t border-hairline py-3"
                    >
                      <p className="caption uppercase text-ink-muted">
                        {KIND_LABEL[entry.kind]}
                      </p>
                      <p className="mt-1">
                        <a
                          href={`/endringer/${entry.id}`}
                          className="fdn-link font-medium"
                        >
                          {entry.title_nb}
                        </a>
                      </p>
                      <p className="mt-2 text-sm text-ink-secondary">
                        {entry.whatToDoNow_nb}
                      </p>
                      {entry.icd11.length > 0 && (
                        <p className="mt-3 flex flex-wrap gap-2">
                          {entry.icd11.map((code) => (
                            <IcdEntityBadge key={code} code={code} />
                          ))}
                        </p>
                      )}
                    </li>
                  ))}
                </ul>
              ) : (
                <div className="mt-3 border-t border-hairline pt-3 text-sm text-ink-secondary">
                  <p>
                    Denne ICD-10-typen har ingen egen motpart i ICD-11. Vurder
                    alvorlighetsgrad (6D10) og angi fremtredende trekkdomener
                    (6D11) ut fra det kliniske bildet — se{" "}
                    <a
                      href="/"
                      className="fdn-link"
                    >
                      oversikten over modellskiftet
                    </a>
                    .
                  </p>
                </div>
              )}
            </div>

            <div className="mt-4 border-t border-hairline pt-3 text-sm text-ink-secondary">
              <p className="caption uppercase text-ink-muted">Verdt å merke seg</p>
              {(caveats.length > 0 ? caveats : [genericCaveat_nb]).map(
                (text) => (
                  <p key={text} className="mt-1">
                    {text}
                  </p>
                )
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
