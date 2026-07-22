import { useEffect, useState } from "react";
import { fetchIcdEntity } from "../lib/who";
import type { IcdEntity } from "../../schema/icd";

type State =
  | { status: "loading" }
  | { status: "ok"; entity: IcdEntity }
  | { status: "error" };

/**
 * Compact official ICD-11 display for React islands — same guardrails as
 * IcdEntityCard.astro: code + live official title + WHO browser link (§3.1),
 * non-blocking fallback on failure (§7.5).
 */
export function IcdEntityBadge({ code }: { code: string }) {
  const [state, setState] = useState<State>({ status: "loading" });

  useEffect(() => {
    let alive = true;
    setState({ status: "loading" });
    fetchIcdEntity(code)
      .then((entity) => alive && setState({ status: "ok", entity }))
      .catch(() => alive && setState({ status: "error" }));
    return () => {
      alive = false;
    };
  }, [code]);

  return (
    <span
      data-source="who"
      className="inline-flex flex-wrap items-baseline gap-x-2 rounded-md border border-sky-200 bg-white px-2.5 py-1.5 text-sm"
    >
      <span className="text-[0.65rem] font-medium uppercase tracking-wide text-sky-800">
        ICD-11 (WHO)
      </span>
      <span className="font-mono font-semibold text-slate-900">{code}</span>
      {state.status === "loading" && (
        <span className="italic text-slate-500">henter tittel …</span>
      )}
      {state.status === "ok" && (
        <>
          <span lang="en">{state.entity.title}</span>
          <a
            href={state.entity.browserUrl}
            className="text-sky-800 underline hover:text-sky-950"
          >
            WHO-nettleser
          </a>
          <span className="w-full break-all font-mono text-[0.65rem] text-slate-500">
            {state.entity.uri}
          </span>
        </>
      )}
      {state.status === "error" && (
        <span className="italic text-slate-500">
          kunne ikke hente offisiell tittel akkurat nå
        </span>
      )}
    </span>
  );
}
