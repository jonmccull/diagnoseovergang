# Foundations kit, vendored

- Kit repo: jonmccull/foundations-kit
- Commit: 29afb74048ed211a53774fbc0702a0f1e886dff3
- Artifact version: 1792139330-31e9
- Tokens: v4
- Pulled: 2026-10-16
- Files: `tokens.css` (the kit's `tokens.css`) and `bundle.css` (the kit's `components/bundle.css`), byte for byte. Never edit them here; no formatter runs on this directory (the repo has none configured).

- Lock: `kit.lock.json` holds the same commit and a hash of each file. CI runs `check-kit.mjs` (the kit's own check, vendored too), which fails if a file here differs from the kit, if this file and the lock disagree, or if a `var(--x)` in the project has nothing declaring it.

Update on purpose: the kit repo opens a "Foundations kit update" PR (branch `kit/update`) whenever the kit changes. Merging it is the update. By hand: `node ../foundations-kit/scripts/vendor.mjs . <this folder> VERSION.md` from the project root, with the kit checked out at the commit you want.
