import { useEffect, useRef, useState } from "react";
import {
  FEEDBACK_ROLES,
  ROLE_LABELS,
} from "../../schema/feedback";
import {
  FEEDBACK_NO_PATIENT_INFO,
  FEEDBACK_EMAIL_PURPOSE,
  FEEDBACK_CONSENT_LABEL,
  TURNSTILE_SITEKEY,
} from "../config";
import { CONTENT_VERSION } from "../content-version";
import { submitFeedback } from "../lib/feedback-client";

// Highlight-to-comment feedback (brief §9). A single global island: it watches
// for text selections inside editorial commentary blocks, offers a floating
// "Foreslå en endring" affordance, and also wires per-entry "Gi tilbakemelding"
// fallback buttons. Feedback attaches ONLY to editorial content (§9.1): the
// selection must sit inside [data-source="editorial"] within a [data-entry-id].

type Anchor = {
  entryId: string;
  field: string | null;
  selectedText: string | null;
  contextPrefix: string | null;
  contextSuffix: string | null;
};

type TurnstileApi = {
  render: (el: HTMLElement, opts: Record<string, unknown>) => string;
  remove: (id: string) => void;
  reset: (id: string) => void;
};
declare global {
  interface Window {
    turnstile?: TurnstileApi;
  }
}

const CONTEXT_LEN = 50;

function loadTurnstileScript(): Promise<void> {
  if (window.turnstile) return Promise.resolve();
  const existing = document.getElementById("cf-turnstile-script");
  if (existing) {
    return new Promise((resolve) =>
      existing.addEventListener("load", () => resolve(), { once: true })
    );
  }
  return new Promise((resolve, reject) => {
    const s = document.createElement("script");
    s.id = "cf-turnstile-script";
    s.src =
      "https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit";
    s.async = true;
    s.defer = true;
    s.onload = () => resolve();
    s.onerror = () => reject(new Error("turnstile script failed"));
    document.head.appendChild(s);
  });
}

export function FeedbackWidget() {
  const [anchor, setAnchor] = useState<Anchor | null>(null);
  const [floatPos, setFloatPos] = useState<{ x: number; y: number } | null>(null);
  const [open, setOpen] = useState(false);

  // ── Selection detection within editorial blocks ──────────────────────────
  useEffect(() => {
    const onMouseUp = () => {
      if (open) return;
      const sel = window.getSelection();
      if (!sel || sel.isCollapsed || sel.rangeCount === 0) {
        setFloatPos(null);
        return;
      }
      const text = sel.toString().trim();
      if (!text) {
        setFloatPos(null);
        return;
      }
      const node =
        sel.anchorNode?.nodeType === Node.TEXT_NODE
          ? sel.anchorNode.parentElement
          : (sel.anchorNode as HTMLElement | null);
      const editorial = node?.closest<HTMLElement>('[data-source="editorial"]');
      const entryEl = node?.closest<HTMLElement>("[data-entry-id]");
      if (!editorial || !entryEl) {
        setFloatPos(null);
        return;
      }
      // §9.1: WHO-sourced elements (codes, official titles, the WHO panel) are
      // not commentable — even when nested inside an editorial block. Disputes
      // about WHO content go via the entry-level fallback button instead.
      if (node?.closest('[data-source="who"]')) {
        setFloatPos(null);
        return;
      }
      const fieldEl = node?.closest<HTMLElement>("[data-field]");
      const container = fieldEl ?? entryEl;
      const full = container.textContent ?? "";
      const idx = full.indexOf(text);
      const prefix =
        idx > 0 ? full.slice(Math.max(0, idx - CONTEXT_LEN), idx) : "";
      const suffix =
        idx >= 0
          ? full.slice(idx + text.length, idx + text.length + CONTEXT_LEN)
          : "";

      setAnchor({
        entryId: entryEl.dataset.entryId ?? "",
        field: fieldEl?.dataset.field ?? null,
        selectedText: text.slice(0, 500),
        contextPrefix: prefix || null,
        contextSuffix: suffix || null,
      });
      const rect = sel.getRangeAt(0).getBoundingClientRect();
      setFloatPos({ x: rect.left + rect.width / 2, y: rect.top - 8 });
    };

    const onEntryTrigger = (e: MouseEvent) => {
      const btn = (e.target as HTMLElement).closest<HTMLElement>(
        "[data-feedback-trigger]"
      );
      if (!btn) return;
      e.preventDefault();
      setAnchor({
        entryId: btn.dataset.entryId ?? "",
        field: null,
        selectedText: null,
        contextPrefix: null,
        contextSuffix: null,
      });
      setFloatPos(null);
      setOpen(true);
    };

    document.addEventListener("mouseup", onMouseUp);
    document.addEventListener("click", onEntryTrigger);
    return () => {
      document.removeEventListener("mouseup", onMouseUp);
      document.removeEventListener("click", onEntryTrigger);
    };
  }, [open]);

  return (
    <>
      {floatPos && anchor && !open && (
        <button
          type="button"
          onClick={() => setOpen(true)}
          style={{
            position: "fixed",
            left: floatPos.x,
            top: floatPos.y,
            transform: "translate(-50%, -100%)",
          }}
          className="z-50 rounded-full bg-slate-900 px-3 py-1.5 text-sm font-medium text-white shadow-lg hover:bg-slate-700"
        >
          Foreslå en endring
        </button>
      )}
      {open && anchor && (
        <FeedbackDialog
          anchor={anchor}
          onClose={() => {
            setOpen(false);
            setFloatPos(null);
            window.getSelection()?.removeAllRanges();
          }}
        />
      )}
    </>
  );
}

function FeedbackDialog({
  anchor,
  onClose,
}: {
  anchor: Anchor;
  onClose: () => void;
}) {
  const [comment, setComment] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("");
  const [consent, setConsent] = useState(false);
  const [token, setToken] = useState<string | null>(null);
  const [status, setStatus] = useState<"idle" | "sending" | "done">("idle");
  const [error, setError] = useState<string | null>(null);
  const turnstileRef = useRef<HTMLDivElement>(null);
  const widgetId = useRef<string | null>(null);

  // Render Turnstile explicitly when the dialog mounts.
  useEffect(() => {
    let cancelled = false;
    loadTurnstileScript()
      .then(() => {
        if (cancelled || !turnstileRef.current || !window.turnstile) return;
        widgetId.current = window.turnstile.render(turnstileRef.current, {
          sitekey: TURNSTILE_SITEKEY,
          callback: (t: string) => setToken(t),
          "error-callback": () => setToken(null),
          "expired-callback": () => setToken(null),
        });
      })
      .catch(() => setError("Kunne ikke laste sikkerhetskontrollen."));
    return () => {
      cancelled = true;
      if (widgetId.current && window.turnstile) {
        try {
          window.turnstile.remove(widgetId.current);
        } catch {
          /* ignore */
        }
      }
    };
  }, []);

  const canSubmit =
    comment.trim().length > 0 &&
    /.+@.+\..+/.test(email) &&
    role !== "" &&
    consent &&
    !!token &&
    status === "idle";

  async function onSubmit(e: React.SyntheticEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!token) return;
    setStatus("sending");
    setError(null);
    const result = await submitFeedback({
      entryId: anchor.entryId,
      field: anchor.field,
      selectedText: anchor.selectedText,
      contextPrefix: anchor.contextPrefix,
      contextSuffix: anchor.contextSuffix,
      contentVersion: CONTENT_VERSION,
      comment: comment.trim(),
      email: email.trim(),
      role,
      consent: true,
      turnstileToken: token,
    });
    if (result.ok) {
      setStatus("done");
    } else {
      setError(result.error);
      setStatus("idle");
      if (widgetId.current && window.turnstile) window.turnstile.reset(widgetId.current);
      setToken(null);
    }
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="feedback-title"
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-xl bg-white p-6 shadow-xl">
        <div className="mb-3 flex items-start justify-between">
          <h2 id="feedback-title" className="text-lg font-semibold text-slate-900">
            Foreslå en endring
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Lukk"
            className="text-slate-400 hover:text-slate-700"
          >
            ✕
          </button>
        </div>

        {status === "done" ? (
          <div>
            <p className="text-slate-800">
              Takk! Forslaget er sendt og blir vurdert.
            </p>
            <button
              type="button"
              onClick={onClose}
              className="mt-4 rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-700"
            >
              Lukk
            </button>
          </div>
        ) : (
          <form onSubmit={onSubmit}>
            {anchor.selectedText && (
              <p className="mb-3 rounded-md bg-slate-100 p-3 text-sm text-slate-700">
                <span className="font-medium">Markert tekst: </span>
                <span className="italic">«{anchor.selectedText}»</span>
              </p>
            )}

            {/* §11 mandatory microcopy, above the fields */}
            <div className="mb-4 space-y-1 rounded-md border-l-4 border-l-amber-400 bg-amber-50 p-3 text-sm text-slate-700">
              <p className="font-medium">{FEEDBACK_NO_PATIENT_INFO}</p>
              <p>{FEEDBACK_EMAIL_PURPOSE}</p>
            </div>

            <label className="block text-sm font-medium text-slate-900" htmlFor="fb-comment">
              Kommentar
            </label>
            <textarea
              id="fb-comment"
              required
              maxLength={2000}
              rows={4}
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 focus:border-slate-500 focus:outline-none focus:ring-2 focus:ring-slate-300"
            />

            <label className="mt-4 block text-sm font-medium text-slate-900" htmlFor="fb-email">
              E-post
            </label>
            <input
              id="fb-email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 focus:border-slate-500 focus:outline-none focus:ring-2 focus:ring-slate-300"
            />

            <label className="mt-4 block text-sm font-medium text-slate-900" htmlFor="fb-role">
              Din rolle
            </label>
            <select
              id="fb-role"
              required
              value={role}
              onChange={(e) => setRole(e.target.value)}
              className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 focus:border-slate-500 focus:outline-none focus:ring-2 focus:ring-slate-300"
            >
              <option value="" disabled>
                Velg rolle …
              </option>
              {FEEDBACK_ROLES.map((r) => (
                <option key={r} value={r}>
                  {ROLE_LABELS[r]}
                </option>
              ))}
            </select>

            <label className="mt-4 flex items-start gap-2 text-sm text-slate-800">
              <input
                type="checkbox"
                required
                checked={consent}
                onChange={(e) => setConsent(e.target.checked)}
                className="mt-1"
              />
              <span>{FEEDBACK_CONSENT_LABEL}</span>
            </label>

            <div ref={turnstileRef} className="mt-4" />

            {error && <p className="mt-3 text-sm text-red-700">{error}</p>}

            <div className="mt-5 flex gap-3">
              <button
                type="submit"
                disabled={!canSubmit}
                className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {status === "sending" ? "Sender …" : "Send forslag"}
              </button>
              <button
                type="button"
                onClick={onClose}
                className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
              >
                Avbryt
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
