#!/usr/bin/env bash
# PreToolUse hook - Primitive 7 (Hooks)
# Denies any edit to an EF Core migration file that already exists under a Migrations/ folder.
# Rule source: copilot-instructions.md -> "Never hand-edit generated migration files."
# Creating a NEW migration via `dotnet ef migrations add` is allowed (the file does not exist yet).
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
  if [[ "$path" =~ /Migrations/([^/]+\.cs)$ ]] && [ -f "$path" ]; then
    file="${BASH_REMATCH[1]}"
    jq -nc --arg reason "Blocked by .github/hooks/security.json: $file is a generated EF Core migration and must never be hand-edited. Run 'dotnet ef migrations add {Name}' to create a new migration instead." \
      '{hookSpecificOutput: {hookEventName: "PreToolUse", permissionDecision: "deny", permissionDecisionReason: $reason}}'
    exit 0
  fi
done <<< "$paths"

# No output = allow
exit 0
