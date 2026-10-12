#!/usr/bin/env bash
# PreToolUse hook - Primitive 7 (Hooks)
# Denies any edit to a Flyway migration that already exists in db/migration/.
# Rule source: copilot-instructions.md -> "Never alter existing migration files - create a new migration instead."
# Creating a NEW migration file (e.g. V3__...) is allowed.
# Requires: jq (fails open if jq is missing)

command -v jq >/dev/null 2>&1 || exit 0
raw="$(cat)"
[ -z "$raw" ] && exit 0

# VS Code sends tool_input (object); Copilot CLI sends toolArgs (JSON string)
tool_input="$(echo "$raw" | jq -c '.tool_input // (.toolArgs | if type == "string" then fromjson? else . end) // empty' 2>/dev/null)"
[ -z "$tool_input" ] && exit 0

paths="$(echo "$tool_input" | jq -r '
  [ .. | objects | (.filePath?, .file_path?, .path?) | strings ] +
  [ .. | strings | scan("\\*\\*\\* (?:Update|Delete) File: (.+)") | .[0] ]
  | .[]' 2>/dev/null)"

while IFS= read -r path; do
  [ -z "$path" ] && continue
  if [[ "$path" =~ /db/migration/(V[0-9]+__[^/]+\.sql)$ ]] && [ -f "$path" ]; then
    file="${BASH_REMATCH[1]}"
    jq -nc --arg reason "Blocked by .github/hooks/security.json: $file is an applied Flyway migration and must never be modified. Create a new migration (next V{n}__description.sql) instead." \
      '{hookSpecificOutput: {hookEventName: "PreToolUse", permissionDecision: "deny", permissionDecisionReason: $reason}}'
    exit 0
  fi
done <<< "$paths"

# No output = allow
exit 0
