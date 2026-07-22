-- Visitor feedback (brief §9.3). Private submissions only — never rendered
-- publicly. Managed via Wrangler D1 migrations.
CREATE TABLE IF NOT EXISTS feedback (
  id TEXT PRIMARY KEY,               -- uuid
  created_at TEXT NOT NULL,          -- ISO 8601 UTC
  entry_id TEXT NOT NULL,            -- CommentaryEntry.id
  field TEXT,                        -- e.g. "whatChanged_nb"; NULL for entry-level
  selected_text TEXT,                -- highlighted span, <=500 chars; NULL for entry-level
  context_prefix TEXT,               -- ~50 chars before selection (re-anchoring)
  context_suffix TEXT,               -- ~50 chars after selection
  content_version TEXT NOT NULL,     -- git commit / content hash when rendered
  comment TEXT NOT NULL,             -- <=2000 chars
  email TEXT NOT NULL,
  role TEXT NOT NULL,                -- enum per §9.2
  consent INTEGER NOT NULL CHECK (consent = 1),
  status TEXT NOT NULL DEFAULT 'new',  -- new | triaged | actioned | dismissed
  ip_hash TEXT                       -- salted hash, abuse forensics only; never the raw IP
);
CREATE INDEX IF NOT EXISTS idx_feedback_entry ON feedback(entry_id);
CREATE INDEX IF NOT EXISTS idx_feedback_status ON feedback(status);
