# PreToolUse hook - Primitive 7 (Hooks)
# Denies any edit to a Flyway migration that already exists in db/migration/.
# Rule source: copilot-instructions.md -> "Never alter existing migration files - create a new migration instead."
# Creating a NEW migration file (e.g. V3__...) is allowed.

$raw = [Console]::In.ReadToEnd()
if (-not $raw) { exit 0 }
try { $payload = $raw | ConvertFrom-Json } catch { exit 0 }

# VS Code sends tool_input (object); Copilot CLI sends toolArgs (JSON string)
$toolInput = $payload.tool_input
if (-not $toolInput -and $payload.toolArgs) {
    try { $toolInput = $payload.toolArgs | ConvertFrom-Json } catch { $toolInput = $null }
}
if (-not $toolInput) { exit 0 }

# Collect every file path the tool is about to touch
$paths = New-Object System.Collections.Generic.List[string]
function Find-Paths($node) {
    if ($null -eq $node) { return }
    if ($node -is [System.Array]) { foreach ($item in $node) { Find-Paths $item }; return }
    if ($node -is [System.Management.Automation.PSCustomObject]) {
        foreach ($prop in $node.PSObject.Properties) {
            if ($prop.Name -in @('filePath', 'file_path', 'path') -and $prop.Value -is [string]) {
                $paths.Add($prop.Value)
            } elseif ($prop.Value -is [string] -and $prop.Value -match '\*\*\* (Update|Delete) File:') {
                # apply_patch style input
                foreach ($m in [regex]::Matches($prop.Value, '\*\*\* (?:Update|Delete) File: (.+)')) {
                    $paths.Add($m.Groups[1].Value.Trim())
                }
            } else {
                Find-Paths $prop.Value
            }
        }
    }
}
Find-Paths $toolInput

foreach ($path in $paths) {
    if ($path -match '[\\/]db[\\/]migration[\\/](V\d+__[^\\/]+\.sql)$' -and (Test-Path -LiteralPath $path)) {
        $file = $Matches[1]
        @{
            hookSpecificOutput = @{
                hookEventName            = 'PreToolUse'
                permissionDecision       = 'deny'
                permissionDecisionReason = "Blocked by .github/hooks/security.json: $file is an applied Flyway migration and must never be modified. Create a new migration (next V{n}__description.sql) instead."
            }
        } | ConvertTo-Json -Compress -Depth 5
        exit 0
    }
}

# No output = allow
exit 0