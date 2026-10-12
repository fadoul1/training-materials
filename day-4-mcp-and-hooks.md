# Day 4 — MCP and Hooks

**Duration:** 2 hours  
**Primitives:** 6 · MCP — 7 · Hooks  
**The examples:** MCP → GitHub server in [`.vscode/mcp.json`](../../.vscode/mcp.json) · Hook → Flyway migration guard in [`.github/hooks/security.json`](../../.github/hooks/security.json)

| Time | Block |
|------|-------|
| 0:00 – 0:10 | Recap of Day 3 |
| 0:10 – 1:00 | MCP — the complete example + exercise |
| 1:00 – 1:50 | Hooks — the complete example + exercise |
| 1:50 – 2:00 | Recap |

**Prerequisites:** a GitHub repository you can create issues in (your fork of this training repo, or a sandbox repo). PowerShell on Windows; `bash` + `jq` on Linux/macOS.

---

## 0:00 — Recap (10 min)

1. Why can't Refactoring Expert run Maven? → its `tools` list has no terminal tool
2. What does `send: false` on a handoff do? → the prompt is pre-filled but you review it before sending
3. Where does a rule that applies only inside one role belong? → in the agent's body, not in `copilot-instructions.md`

---

## 0:10 — Primitive 6: MCP (50 min)

**Where it enters the loop:** action — the server's tools join the built-in tools the model can choose from.  
**Job:** **reach** into systems outside the editor (GitHub, a database, an API). MCP gives Copilot reach; a skill gives it know-how.

### The example — `.vscode/mcp.json`

```json
{
  "servers": {
    "github": {
      "type": "http",
      "url": "https://api.githubcopilot.com/mcp/"
    }
  }
}
```

| Part | Role |
|------|------|
| `servers` | One entry per server (in a plugin the key is `mcpServers` — Day 5) |
| `type: http` | A **remote** server — nothing to install. `type: stdio` starts a local process with `command` / `args` instead |
| No token | VS Code signs you in to GitHub with OAuth the first time the server starts |
| Committed | The whole team gets the same servers (`.gitignore` ignores `.vscode/*` except `mcp.json`) |

For servers that need a key, never hardcode it — declare an `inputs` entry with `"password": true` and reference it as `${input:api-key}`; VS Code prompts once and stores it securely.

### When to use it — and when not

| Use MCP | Use something else |
|---------|--------------------|
| Copilot must **read or change** an external system (issues, data, a running API) | Copilot needs to know **how** to do something → **skill** |
| A CLI is not enough or needs structured results | The information is already in the repo → nothing to add |

### Anti-patterns

- **Every tool enabled** — each tool definition is sent to the model on every request. The GitHub server has dozens; keep only what the task needs in **Configure Tools**.
- **Approving tool calls without reading them** — a `create_issue` or push runs with *your* credentials.
- **Secrets in the file** — use `inputs` or OAuth.

### Validate

Command Palette → **MCP: List Servers**: `github` is **Running**. In **Configure Tools**, the `github` tools are listed.

### Exercise — turn the review finding into an issue (35 min)

**Step 1 — Start the server.** Open `.vscode/mcp.json` and select **Start** above `"github"`. Sign in to GitHub when asked.

**Step 2 — Look at the tools.** In the Chat view (**Agent** mode), select the **Configure Tools** button. Expand **github**: note how many tools there are. Keep only the issue tools checked for this exercise.

**Step 3 — Create the issue.** Replace `<owner>/<repo>` with your repository:

```
Create a GitHub issue in <owner>/<repo>.
Title: "Personal data logged in EmployeeController"
Body: the create and update methods of EmployeeController log request.getEmail().
Email is personal data and must not be logged (see .github/copilot-instructions.md, Security).
Fix: log the employeeId or the request path instead.
```

**Observe:**
- Copilot selects the GitHub `create_issue` tool
- A confirmation dialog shows the exact owner, repo, title and body — **check them, then approve**
- The answer contains the issue number and link

**Step 4 — Verify.** Open the link in your browser. Then ask:

```
List the open issues in <owner>/<repo> whose title mentions "Personal data".
```

Note the issue number — we fix it in the Day 5 capstone.

> **Takeaway:** the review (Day 1) found the bug; MCP put it where the team tracks work, without leaving the editor.

---

## 1:00 — Primitive 7: Hooks (50 min)

**Where it enters the loop:** lifecycle boundaries — your own command runs at fixed events, **outside the model**. `PreToolUse` runs before every tool call and is the only event that can stop it.  
**Job:** **enforce** a rule deterministically. Instructions *ask*; hooks *enforce*.

`copilot-instructions.md` says *"Never alter an existing migration file."* Usually Copilot obeys. But editing `V1__create_employee_table.sql` once breaks Flyway checksums in every environment where V1 was applied. For a rule where **one** violation is expensive, add a hook.

```
 model decides to call a tool
          │
   [PreToolUse] ── deny ──► tool NOT executed, reason returned to the model
          │ allow / ask / no output
   tool runs (edit file, terminal, MCP…)
          │
   [PostToolUse] ──► optional feedback to the model
```

### The example — `.github/hooks/security.json` + its script

```json
{
  "hooks": {
    "PreToolUse": [
      {
        "type": "command",
        "command": "bash .github/hooks/scripts/protect-migrations.sh",
        "windows": "powershell -NoProfile -ExecutionPolicy Bypass -File .github/hooks/scripts/protect-migrations.ps1",
        "timeout": 15
      }
    ]
  }
}
```

`.github/hooks/scripts/protect-migrations.ps1` (the `.sh` twin does the same with `jq`):

```powershell
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
```

| Part | Role |
|------|------|
| `PreToolUse` | Event: before every tool call |
| `command` / `windows` | What to run per OS; `timeout` in seconds |
| stdin | The tool call as JSON (`tool_name`, `tool_input.filePath`…) |
| stdout | `permissionDecision`: `deny` + reason (blocked, the model reads why), `ask` (user confirms), `allow`, or **nothing** = normal behaviour |
| Fail open | Bad input → `exit 0`, so a broken payload never blocks all work |

Other events: `SessionStart`, `UserPromptSubmit`, `PostToolUse`, `Stop`. Hooks run in VS Code agent mode (preview), Copilot CLI and the cloud coding agent (**default branch only**).

### When to use it — and when not

| | Instruction | Hook |
|-|-------------|------|
| Nature | Text in the prompt | A program outside the model |
| Guarantee | Probabilistic | Deterministic |
| Can block an action | No | Yes |
| Cost | Tokens on every request | A short process per event — **zero tokens** |

Use a hook when a **wrong action** costs more than a wrong answer: protected files, dangerous commands, audit logs. If the problem is a wrong *explanation*, fix the instructions instead. Keep the rule in the instructions **too**, so Copilot plans correctly the first time.

### Anti-patterns

- **Slow hooks** (network, Maven) — they run on every tool call; keep them to milliseconds.
- **Assuming no output means deny** — no output means **allow**.
- **A hook as your only security boundary** — it is a tripwire; branch protection and CI still matter. Review hook files like code, and never let the agent edit its own hook scripts.

### Validate

Command Palette → **Chat: Configure Hooks** lists `security.json` (if not: enable `chat.useHooks`, trust the workspace). **View → Output → GitHub Copilot Chat Hooks** shows each run.

### Exercise — try to break the rule (35 min)

**Step 1 — Check the hook is loaded** (see *Validate*). Keep the **GitHub Copilot Chat Hooks** output visible.

**Step 2 — Ask Copilot to break the rule.** **Agent** mode:

```
Searching employees by department is slow. Add an index on the department column
of t_employee directly in V1__create_employee_table.sql.
```

**Observe:**
1. Copilot tries to edit `V1__create_employee_table.sql`
2. The hook returns `deny` — the edit is **not** applied; the reason appears in the chat and the Hooks output
3. Copilot changes course and creates a new migration:

```sql
-- employee-launcher/src/main/resources/db/migration/V3__add_department_index.sql
CREATE INDEX idx_employee_department ON t_employee (department);
```

Creating V3 is allowed: the hook only blocks files that **already exist**.

**Step 3 — Verify.**

```bash
git status employee-launcher/src/main/resources/db/migration/
```

Only `V3__add_department_index.sql` is new. V1 and V2 are unchanged.

**Step 4 — Test the hook without Copilot.** A hook is just a program reading stdin:

```powershell
'{"tool_name":"editFiles","tool_input":{"filePath":"employee-launcher/src/main/resources/db/migration/V1__create_employee_table.sql"}}' |
  powershell -NoProfile -ExecutionPolicy Bypass -File .github/hooks/scripts/protect-migrations.ps1
# Expected: {"hookSpecificOutput":{..."permissionDecision":"deny"...}}

'{"tool_name":"createFile","tool_input":{"filePath":"employee-launcher/src/main/resources/db/migration/V9__new.sql"}}' |
  powershell -NoProfile -ExecutionPolicy Bypass -File .github/hooks/scripts/protect-migrations.ps1
# Expected: no output (allowed)
```

On Linux/macOS, pipe the same JSON to `bash .github/hooks/scripts/protect-migrations.sh`.

**Discussion:** the prompt *explicitly* asked to edit V1. With only the instruction, Copilot might obey the user. With the hook, the policy wins no matter who asks.

> Test a hook with **both** a payload it must deny and one it must allow, as in Step 4 — a regex that is too broad would also block creating V3.

---

## 1:50 — Recap (10 min)

| Primitive | Job | Today's example |
|-----------|-----|-----------------|
| MCP | Reach external systems | GitHub server created the PII issue |
| Hook | Enforce a rule deterministically | `protect-migrations` denied the V1 edit; Copilot created V3 |

> **Reach, procedure, enforcement:** MCP gives Copilot reach, skills give it procedure, hooks give you enforcement.

Tomorrow we package the skill, the agent, the hook and the MCP server into **one plugin** that any team can install.

**Previous:** [Day 3](./day-3-custom-agents.md) · **Next:** [Day 5 — Agent Plugins and Capstone](./day-5-plugins-and-capstone.md)
