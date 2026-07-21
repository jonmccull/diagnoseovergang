import { useMemo, useState } from "react";
import {
  SEVERITIES,
  TRAITS,
  BORDERLINE,
  type SeverityOption,
} from "../data/pd-dimensions";
import { IcdEntityBadge } from "./IcdEntityBadge";
import { DECISION_SUPPORT_DISCLAIMER } from "../config";

/**
 * PD dimensional decision-support widget (§4.4). Pick severity, one or more
 * trait domains, optionally borderline pattern → assembled ICD-11 coding
 * pattern + plain-Norwegian guidance. Educational aid only (§11 disclaimer,
 * rendered verbatim below). All official codes shown carry code + live title
 * + WHO link via IcdEntityBadge (§3.1).
 */
export function PdSeverityTraitTool() {
  const [severityCode, setSeverityCode] = useState<string | null>(null);
  const [traitCodes, setTraitCodes] = useState<Set<string>>(new Set());
  const [borderline, setBorderline] = useState(false);

  const severity: SeverityOption | null =
    SEVERITIES.find((s) => s.code === severityCode) ?? null;

  const toggleTrait = (code: string) =>
    setTraitCodes((prev) => {
      const next = new Set(prev);
      next.has(code) ? next.delete(code) : next.add(code);
      return next;
    });

  const selectedTraits = TRAITS.filter((t) => traitCodes.has(t.code));

  // Assembled pattern: severity/factor code first, then trait qualifiers in
  // canonical numeric order, then borderline pattern last.
  const patternCodes = useMemo(() => {
    if (!severity) return [];
    const codes = [severity.code, ...selectedTraits.map((t) => t.code)];
    if (borderline) codes.push(BORDERLINE.code);
    return codes;
  }, [severity, selectedTraits, borderline]);

  const guidance = useMemo(() => {
    if (!severity) return null;
    const lines: string[] = [];
    if (!severity.isDisorder) {
      // QE50.7 — sub-threshold. §7.4: the UI must say this is not a disorder.
      lines.push(
        "Personlighetsvansker (QE50.7) er under terskel for personlighetsforstyrrelse og er ikke en psykisk lidelse. Den kodes som en faktor som påvirker helsetilstand."
      );
      if (selectedTraits.length || borderline) {
        lines.push(
          "Trekkdomenene beskriver de fremtredende trekkene, men gir ikke i seg selv en diagnose når terskelen ikke er nådd."
        );
      }
    } else {
      lines.push(
        `Sett først alvorlighetsgrad: ${severity.label_nb} (${severity.code}). Alvorlighetsgrad er det bærende prinsippet i ICD-11.`
      );
      if (selectedTraits.length) {
        lines.push(
          `Angi deretter fremtredende trekkdomener: ${selectedTraits
            .map((t) => `${t.label_nb} (${t.code})`)
            .join(", ")}.`
        );
      } else {
        lines.push(
          "Ingen trekkdomener er valgt ennå. Trekkdomener er valgfrie, men anbefales for å beskrive det kliniske bildet."
        );
      }
      if (borderline) {
        lines.push(
          "Borderline-mønster (6D11.5) er lagt til som et eget kvalifiserende mønster."
        );
      }
    }
    return lines;
  }, [severity, selectedTraits, borderline]);

  return (
    <div>
      {/* Step 1: severity — required */}
      <fieldset>
        <legend className="font-medium text-slate-900">
          1. Velg alvorlighetsgrad
        </legend>
        <p className="mt-1 text-sm text-slate-600">
          Alvorlighetsgrad settes alltid først i ICD-11.
        </p>
        <div className="mt-3 space-y-2">
          {SEVERITIES.map((s) => (
            <label
              key={s.code}
              className={`flex cursor-pointer gap-3 rounded-lg border p-3 ${
                severityCode === s.code
                  ? "border-slate-500 bg-slate-50 ring-1 ring-slate-300"
                  : "border-slate-200 bg-white hover:border-slate-300"
              }`}
            >
              <input
                type="radio"
                name="severity"
                value={s.code}
                checked={severityCode === s.code}
                onChange={() => setSeverityCode(s.code)}
                className="mt-1"
              />
              <span>
                <span className="font-medium text-slate-900">
                  {s.label_nb}{" "}
                  <span className="font-mono text-sm text-slate-500">
                    {s.code}
                  </span>
                </span>
                {!s.isDisorder && (
                  <span className="ml-2 inline-flex items-center rounded-full bg-slate-200 px-2 py-0.5 text-xs text-slate-700">
                    Ikke en psykisk lidelse
                  </span>
                )}
                <span className="mt-0.5 block text-sm text-slate-600">
                  {s.blurb_nb}
                </span>
              </span>
            </label>
          ))}
        </div>
      </fieldset>

      {/* Step 2: trait domains — optional, multi-select */}
      <fieldset className="mt-6">
        <legend className="font-medium text-slate-900">
          2. Velg fremtredende trekkdomener{" "}
          <span className="font-normal text-slate-500">(valgfritt, flere mulig)</span>
        </legend>
        <div className="mt-3 space-y-2">
          {TRAITS.map((t) => (
            <label
              key={t.code}
              className={`flex cursor-pointer gap-3 rounded-lg border p-3 ${
                traitCodes.has(t.code)
                  ? "border-slate-500 bg-slate-50 ring-1 ring-slate-300"
                  : "border-slate-200 bg-white hover:border-slate-300"
              }`}
            >
              <input
                type="checkbox"
                checked={traitCodes.has(t.code)}
                onChange={() => toggleTrait(t.code)}
                className="mt-1"
              />
              <span>
                <span className="font-medium text-slate-900">
                  {t.label_nb}{" "}
                  <span className="font-mono text-sm text-slate-500">
                    {t.code}
                  </span>
                </span>
                <span className="mt-0.5 block text-sm text-slate-600">
                  {t.blurb_nb}
                </span>
              </span>
            </label>
          ))}
        </div>
      </fieldset>

      {/* Step 3: borderline pattern — optional single qualifier */}
      <fieldset className="mt-6">
        <legend className="font-medium text-slate-900">
          3. Borderline-mønster{" "}
          <span className="font-normal text-slate-500">(valgfritt)</span>
        </legend>
        <label
          className={`mt-3 flex cursor-pointer gap-3 rounded-lg border p-3 ${
            borderline
              ? "border-slate-500 bg-slate-50 ring-1 ring-slate-300"
              : "border-slate-200 bg-white hover:border-slate-300"
          }`}
        >
          <input
            type="checkbox"
            checked={borderline}
            onChange={() => setBorderline((b) => !b)}
            className="mt-1"
          />
          <span>
            <span className="font-medium text-slate-900">
              {BORDERLINE.label_nb}{" "}
              <span className="font-mono text-sm text-slate-500">
                {BORDERLINE.code}
              </span>
            </span>
            <span className="mt-0.5 block text-sm text-slate-600">
              {BORDERLINE.blurb_nb}
            </span>
          </span>
        </label>
      </fieldset>

      {/* Assembled output */}
      <div className="mt-6 rounded-lg border border-slate-300 bg-white p-4" aria-live="polite">
        <h3 className="font-semibold text-slate-900">Sammensatt ICD-11-kodemønster</h3>
        {!severity ? (
          <p className="mt-2 text-sm text-slate-600">
            Velg alvorlighetsgrad for å se kodemønsteret.
          </p>
        ) : (
          <>
            <p className="mt-2 font-mono text-lg font-semibold text-slate-900">
              {patternCodes.join(" & ")}
            </p>
            <div className="mt-3 flex flex-wrap gap-2">
              {patternCodes.map((code) => (
                <IcdEntityBadge key={code} code={code} />
              ))}
            </div>
            {guidance && (
              <div className="mt-4 space-y-2 text-sm text-slate-800">
                {guidance.map((line) => (
                  <p key={line}>{line}</p>
                ))}
              </div>
            )}
          </>
        )}
      </div>

      {/* §11 disclaimer — verbatim, unmissable */}
      <p className="mt-4 rounded-lg border-l-4 border-l-slate-400 bg-slate-100 p-4 text-sm font-medium text-slate-800">
        {DECISION_SUPPORT_DISCLAIMER}
      </p>
    </div>
  );
}
