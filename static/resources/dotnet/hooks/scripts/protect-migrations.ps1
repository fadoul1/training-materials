# PreToolUse hook - Primitive 7 (Hooks)
# Denies any edit to an EF Core migration file that already exists under a Migrations/ folder.
# Rule source: copilot-instructions.md -> "Never hand-edit generated migration files."
# Creating a NEW migration via `dotnet ef migrations add` is allowed (the file does not exist yet).

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
    if ($path -match '[\\/]Migrations[\\/]([^\\/]+\.cs)$' -and (Test-Path -LiteralPath $path)) {
        $file = $Matches[1]
        @{
            hookSpecificOutput = @{
                hookEventName            = 'PreToolUse'
                permissionDecision       = 'deny'
                permissionDecisionReason = "Blocked by .github/hooks/security.json: $file is a generated EF Core migration and must never be hand-edited. Run 'dotnet ef migrations add {Name}' to create a new migration instead."
            }
        } | ConvertTo-Json -Compress -Depth 5
        exit 0
    }
}

# No output = allow
exit 0
