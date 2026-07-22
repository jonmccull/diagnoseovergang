// Frontend feedback submission client. Posts to OUR worker (§9.4). No PII is
// stored client-side; the payload is sent once and discarded.
const API_BASE: string = import.meta.env.PUBLIC_API_BASE ?? "";

export type FeedbackSubmission = {
  entryId: string;
  field: string | null;
  selectedText: string | null;
  contextPrefix: string | null;
  contextSuffix: string | null;
  contentVersion: string;
  comment: string;
  email: string;
  role: string;
  consent: true;
  turnstileToken: string;
};

export type SubmitResult =
  | { ok: true; message: string }
  | { ok: false; error: string };

export async function submitFeedback(
  body: FeedbackSubmission
): Promise<SubmitResult> {
  try {
    const res = await fetch(`${API_BASE}/api/feedback`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    const data = (await res.json().catch(() => ({}))) as {
      message_nb?: string;
      error?: string;
    };
    if (res.status === 201) {
      return { ok: true, message: data.message_nb ?? "Takk! Forslaget er sendt." };
    }
    const messages: Record<string, string> = {
      rate_limited: "Du har sendt mange forslag den siste timen. Prøv igjen senere.",
      turnstile_failed: "Kunne ikke bekrefte at du er et menneske. Last siden på nytt og prøv igjen.",
      validation_failed: "Skjemaet mangler noe eller har ugyldige felter.",
      payload_too_large: "Teksten er for lang.",
    };
    return {
      ok: false,
      error: messages[data.error ?? ""] ?? "Noe gikk galt. Prøv igjen senere.",
    };
  } catch {
    return { ok: false, error: "Nettverksfeil. Prøv igjen senere." };
  }
}
