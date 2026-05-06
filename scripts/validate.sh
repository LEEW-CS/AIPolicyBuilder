#!/usr/bin/env bash
# Pre-push validation for index.html
# ────────────────────────────────────────────────────────────────────
# Extracts the main inline <script> block from index.html and runs it
# through `node --check` to catch JS syntax errors (stray braces,
# unclosed strings, etc.) BEFORE pushing. Also does a div-nesting-depth
# sanity check against structural HTML bugs that the JS parser won't
# catch.
#
# Mirrors the validator used in the Cloudstaff Client Research Tool —
# same single-file <script>-block convention, same risks.
#
# Usage:  ./scripts/validate.sh
# Exit:   0 = ok, 1 = syntax error, 2 = div nesting unbalanced
#
# Run this before every `git push` to main. Can be wired into a git
# pre-push hook if you want it automated:
#   echo '#!/usr/bin/env bash' > .git/hooks/pre-push
#   echo 'scripts/validate.sh' >> .git/hooks/pre-push
#   chmod +x .git/hooks/pre-push
# ────────────────────────────────────────────────────────────────────

set -e

# Accept an optional path argument; default to scripts/../index.html
if [ -n "$1" ]; then
  INDEX="$1"
else
  REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
  INDEX="$REPO_ROOT/index.html"
fi

if [ ! -f "$INDEX" ]; then
  echo "✕ index.html not found at $INDEX"
  exit 1
fi

TMPDIR="${TMPDIR:-/tmp}"
SCRIPT_TMP="$TMPDIR/index-script-$$.js"
trap 'rm -f "$SCRIPT_TMP"' EXIT

# ── 1. Extract the main <script> block.
# We look for the bare `<script>` opener (no attributes) — CDN script
# tags use `<script src="...">` and are skipped. Body of the matched
# block is piped to `node --check`.
awk '
  /<script>/   { inblock = 1; next }
  /<\/script>/ { inblock = 0; next }
  inblock      { print }
' "$INDEX" > "$SCRIPT_TMP"

if ! command -v node >/dev/null 2>&1; then
  echo "⚠ node not found in PATH — skipping JS syntax check."
  echo "  (Install Node.js to enable this validation.)"
else
  if node --check "$SCRIPT_TMP" 2>&1; then
    LINES=$(wc -l < "$SCRIPT_TMP" | tr -d ' ')
    echo "✓ JS syntax check passed ($LINES lines)"
  else
    echo "✕ JS syntax error in index.html — fix before pushing."
    exit 1
  fi
fi

# ── 2. Div nesting balance ──
OPENS=$(grep -oE '<div[[:space:]>]' "$INDEX" | wc -l | tr -d ' ')
CLOSES=$(grep -oE '</div>' "$INDEX" | wc -l | tr -d ' ')

if [ "$OPENS" -ne "$CLOSES" ]; then
  DIFF=$((OPENS - CLOSES))
  echo "✕ Div nesting unbalanced: $OPENS opens vs $CLOSES closes (diff: $DIFF)"
  echo "  Look for a stray <div> or </div>."
  exit 2
fi
echo "✓ Div nesting balanced ($OPENS opens / $CLOSES closes)"

echo
echo "All checks passed. Safe to push."
