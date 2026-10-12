# Day 5 — Agent Plugins and Capstone

**Duration:** 2 hours  
**Topic:** packaging and sharing the primitives with agent plugins, then using all of them on one task  
**Reference:** [Agent plugins in VS Code](https://code.visualstudio.com/docs/copilot/customization/agent-plugins)  
**The one example:** [`plugins/employee-copilot-kit/`](../../plugins/employee-copilot-kit/) — the skill, agent, MCP server and hook from Days 2–4 in one package

| Time | Block |
|------|-------|
| 0:00 – 0:15 | Agent plugins — the complete example |
| 0:15 – 0:50 | Build a plugin from this week's customizations |
| 0:50 – 1:10 | Install it and prove it works outside this repo |
| 1:10 – 1:25 | Share it — and the security checklist |
| 1:25 – 1:55 | Capstone — fix the PII issue with every primitive |
| 1:55 – 2:00 | Close |

---

## 0:00 — Agent Plugins: The Complete Example (15 min)

**Where it enters the loop:** nowhere new — a plugin **installs** primitives (skills, agents, MCP servers, hooks) so they enter the loop in **every** repository you open.  
**Job:** **share** a workflow across repositories and teams with one install, instead of copying files from `.github/` and keeping them in sync by hand.

> A plugin is **not** a new primitive. It is a package of primitives. VS Code follows the open **Agent Plugins 1.0** standard (also used by Copilot CLI).

### The example — `plugins/employee-copilot-kit/`

The skill (Day 2), the agent (Day 3), the MCP server and the hook (Day 4), in one folder:

```
plugins/employee-copilot-kit/
├── plugin.json                                  ← manifest
├── skills/run-and-fix-tests/SKILL.md            ← portable (Day 2)
├── mcp.json                                     ← portable (Day 4)
├── scripts/protect-migrations.ps1 / .sh         ← called by the hook
└── com.github.copilot/                          ← Copilot-specific, other clients ignore it
    ├── agents/refactoring-expert.agent.md       ← Day 3
    └── hooks/hooks.json                         ← Day 4
```

`plugin.json`:

```json
{
  "$schema": "https://agent-plugins.org/schemas/1.0.0/plugin.schema.json",
  "name": "employee-copilot-kit",
  "version": "1.0.0",
  "description": "Employee Service team kit: run-and-fix-tests skill, Refactoring Expert agent, Flyway migration guard hook and GitHub MCP server.",
  "author": {
    "name": "Accenture Copilot Training"
  },
  "license": "MIT",
  "keywords": ["spring-boot", "java", "flyway", "testing", "refactoring"]
}
```

`com.github.copilot/hooks/hooks.json` — same hook as Day 4, but the paths start at `${PLUGIN_ROOT}`:

```json
{
  "hooks": {
    "PreToolUse": [
      {
        "type": "command",
        "command": "bash ${PLUGIN_ROOT}/scripts/protect-migrations.sh",
        "windows": "powershell -NoProfile -ExecutionPolicy Bypass -File ${PLUGIN_ROOT}/scripts/protect-migrations.ps1",
        "timeout": 15
      }
    ]
  }
}
```

`mcp.json` — same server as Day 4, but the key is `mcpServers`:

```json
{
  "mcpServers": {
    "github": {
      "type": "http",
      "url": "https://api.githubcopilot.com/mcp/"
    }
  }
}
```

| Part | Role |
|------|------|
| `$schema` + `name` | Required. Names: lowercase letters, digits, hyphens, periods |
| `version` | Bump it on every release, or installed copies never update |
| `skills/`, `mcp.json` | Discovered automatically — not listed in the manifest |
| `${PLUGIN_ROOT}` | Expanded to the plugin's absolute path (quoted), so the hook works wherever the plugin is installed |

### When to use it — and when not

| Put it in a plugin | Keep it in `.github/` of the repo |
|--------------------|-----------------------------------|
| Workflows several repos or teams share (test procedure, migration guard, refactoring agent) | Rules specific to this codebase (`copilot-instructions.md`, `tests.instructions.md`) |
| Something each developer should carry to every repo | Something that should apply to everyone who clones *this* repo |

### Anti-patterns

- **Relative paths in plugin hooks** (`.github/hooks/scripts/...`) — they break in every other repository. Use `${PLUGIN_ROOT}`.
- **`servers` instead of `mcpServers`** in the plugin's `mcp.json` — the most common format mistake.
- **Installing without reading** — plugin hooks run commands and plugin MCP servers start **without a trust prompt**.

### Validate

Command Palette → **Chat: Open Customizations** → **Plugins**: the plugin is listed, and its skill, agent, MCP server and hook appear in their usual lists.

**Demo (trainer) — install from a marketplace.** Set `chat.plugins.enabled` to `true`. Extensions view → search `@agentPlugins` → open any plugin from the default `awesome-copilot` marketplace and show its contents before **Install**. This is what your teammates will do with your plugin.

---

## 0:15 — Build the Plugin (35 min)

Target layout:

```
plugins/my-copilot-kit/
├── plugin.json
├── skills/
│   └── run-and-fix-tests/SKILL.md
├── mcp.json
├── scripts/
│   ├── protect-migrations.ps1
│   └── protect-migrations.sh
└── com.github.copilot/
    ├── agents/
    │   └── refactoring-expert.agent.md
    └── hooks/
        └── hooks.json
```

### Step 1 — Manifest (5 min)

Create `plugins/my-copilot-kit/plugin.json`:

```json
{
  "$schema": "https://agent-plugins.org/schemas/1.0.0/plugin.schema.json",
  "name": "my-copilot-kit",
  "version": "1.0.0",
  "description": "Test skill, refactoring agent, Flyway migration guard and GitHub MCP for Spring Boot services.",
  "author": { "name": "Your Name" },
  "keywords": ["spring-boot", "flyway", "testing"]
}
```

`$schema` and `name` are required. Names allow lowercase letters, digits, hyphens and periods — no slashes or colons. Skills and `mcp.json` are discovered automatically, so you don't list them.

### Step 2 — Skill, agent and scripts (10 min)

Copy them in unchanged:

```powershell
$kit = "plugins/my-copilot-kit"
New-Item -ItemType Directory -Force "$kit/skills/run-and-fix-tests", "$kit/com.github.copilot/agents", "$kit/com.github.copilot/hooks", "$kit/scripts" | Out-Null
Copy-Item .github/skills/run-and-fix-tests/SKILL.md "$kit/skills/run-and-fix-tests/"
Copy-Item .github/agents/refactoring-expert.agent.md "$kit/com.github.copilot/agents/"
Copy-Item .github/hooks/scripts/protect-migrations.* "$kit/scripts/"
```

Remember Day 2: the skill folder name must match the skill's `name`, or it is **silently skipped**.

### Step 3 — Hook (15 min)

The workspace hook used a path relative to this repo: `.github/hooks/scripts/protect-migrations.ps1`. A plugin is installed somewhere else and used in **other** repositories, so it must point to its own folder with `${PLUGIN_ROOT}`.

Create `plugins/my-copilot-kit/com.github.copilot/hooks/hooks.json`:

```json
{
  "hooks": {
    "PreToolUse": [
      {
        "type": "command",
        "command": "bash ${PLUGIN_ROOT}/scripts/protect-migrations.sh",
        "windows": "powershell -NoProfile -ExecutionPolicy Bypass -File ${PLUGIN_ROOT}/scripts/protect-migrations.ps1",
        "timeout": 15
      }
    ]
  }
}
```

VS Code replaces `${PLUGIN_ROOT}` with the plugin's absolute path and quotes it, so spaces in the path are fine.

In both copied scripts, change the deny message from `Blocked by .github/hooks/security.json:` to `Blocked by the my-copilot-kit plugin:` — you will use it to tell the two hooks apart.

### Step 4 — MCP server (5 min)

Create `plugins/my-copilot-kit/mcp.json`:

```json
{
  "mcpServers": {
    "github": {
      "type": "http",
      "url": "https://api.githubcopilot.com/mcp/"
    }
  }
}
```

> ⚠️ Classic mistake: `.vscode/mcp.json` uses the key **`servers`**; a plugin's MCP file uses **`mcpServers`**.

Compare with the reference solution:

```bash
git diff --no-index plugins/employee-copilot-kit plugins/my-copilot-kit
```

Only the name, description, author and deny message should differ.

---

## 0:50 — Install and Verify (20 min)

### Step 1 — Register the local plugin

Open your **user** `settings.json` (Command Palette → **Preferences: Open User Settings (JSON)**) and add, with the absolute path of your clone:

```json
"chat.plugins.enabled": true,
"chat.pluginLocations": {
    "C:/path/to/copilot-training/plugins/my-copilot-kit": true
}
```

### Step 2 — See what it contributes

Command Palette → **Chat: Open Customizations** → **Plugins**: `my-copilot-kit` is listed. Check:

| Component | Where to look | What you see |
|-----------|---------------|--------------|
| Skill | **Chat: Configure Skills** | `run-and-fix-tests` (twice: workspace + plugin) |
| Agent | Agent picker | **Refactoring Expert** (twice) |
| MCP | **MCP: List Servers** | `github` from the plugin, next to the workspace one |
| Hook | **Chat: Configure Hooks** | the plugin's `hooks.json` |

The duplicates are expected: this repo still has its own copies. When a team adopts a plugin, it deletes the copies from `.github/`.

### Step 3 — Prove it works outside this repo

```powershell
New-Item -ItemType Directory -Force C:/temp/plugin-test/db/migration | Out-Null
Set-Content C:/temp/plugin-test/db/migration/V1__init.sql "CREATE TABLE demo (id INT);"
code C:/temp/plugin-test
```

In the new window (trust the folder), **Agent** mode:

```
Add a name column to the demo table in V1__init.sql.
```

**Expected:** denied with *"Blocked by the my-copilot-kit plugin: V1__init.sql is an applied Flyway migration…"*, and Copilot proposes `V2__…` instead. That folder has no `.github/hooks/` — the protection came with **you**, through the plugin.

### Step 4 — Disable it

Set the path to `false` in `chat.pluginLocations` (or toggle it off in **Chat: Open Customizations → Plugins**). Repeat the prompt: the edit is no longer blocked, and the plugin's skill, agent and MCP server disappear from the lists. Disabling a plugin turns off **all** of its parts.

Re-enable it and close the test window.

---

## 1:10 — Share It, Safely (15 min)

### A marketplace is a Git repository with an index

This repo is already a small marketplace — [`.github/plugin/marketplace.json`](../../.github/plugin/marketplace.json) lists `employee-copilot-kit` with `"source": "./plugins/employee-copilot-kit"`.

Teammates add it in user settings, then install from the Extensions view (`@agentPlugins`):

```json
"chat.plugins.marketplaces": ["<owner>/<repo>#<40-char-commit-sha>"]
```

Pin a full commit SHA for reproducible installs. Without a marketplace: **Chat: Install Plugin From Source** → paste a Git URL.

To recommend it to everyone who opens the repo, commit `.github/copilot/settings.json`:

```json
{
  "extraKnownMarketplaces": {
    "employee-training": {
      "source": { "source": "github", "repo": "<owner>/<repo>" }
    }
  },
  "enabledPlugins": {
    "employee-copilot-kit@employee-training": true
  }
}
```

**Releasing an update:** bump `version` in **both** `plugin.json` and the `marketplace.json` entry, then push. Forgetting the bump is the #1 reason "my plugin didn't update".

### Security checklist

A plugin can **run code on your machine**: hooks run a command on every matching agent event, MCP servers run a process or call a service with your credentials. And **plugin MCP servers start without a trust prompt** — installing the plugin is the trust decision.

Before installing any plugin:
- [ ] Who publishes it? Is the marketplace one your organization approves?
- [ ] Read `hooks.json` and every script it calls
- [ ] Read `mcp.json`: which commands, which URLs, which environment variables
- [ ] Pin a commit SHA for anything outside your organization

Admins can restrict marketplaces and plugins with managed settings; with `allowManagedHooksOnly` only centrally managed hooks run.

---

## 1:25 — Capstone: Fix the PII Issue with Every Primitive (30 min)

On Day 1, `/review-code` found that `EmployeeController` logs `request.getEmail()`. On Day 4 the GitHub MCP server filed it as an issue. Now close the loop.

Work on a branch: `git switch -c fix/pii-logging`.

| Step | Do this | Primitive at work |
|------|---------|-------------------|
| 1 | `Read GitHub issue #<n> in <owner>/<repo> and summarise what needs to change.` | **MCP** |
| 2 | **Agent** mode: `Fix issue #<n>: stop logging personal data in EmployeeController.` | **Always-on instructions** — the precise PII rule from Day 1 decides the new log line |
| 3 | `Add a controller test proving create no longer logs the email.` (test file open) | **File-based instructions** — AssertJ, `should_…_when_…`, AAA |
| 4 | `Run the tests and fix any failures.` | **Skill** `run-and-fix-tests` |
| 5 | Switch to **Refactoring Expert**: `Tidy up EmployeeController without changing behaviour.` | **Custom agent** — then use the **Run Tests After Refactor** handoff |
| 6 | Ask the agent to `also clean up V1__create_employee_table.sql while you're at it` | **Hook** — denied |
| 7 | `/review-code` on `EmployeeController.java` → **Pass** | **Prompt file** |
| 8 | `Comment on issue #<n> with a summary of the fix.` | **MCP** |

**Debrief (in the group):**
1. At which step did you type the fewest words and get the most done? Why?
2. Which rule was **applied** without you asking, and which one was **enforced**?
3. Following "start small": what is the **one** customization you would add to your own project next week, and which primitive is it?

---

## 1:55 — Close (5 min)

| Day | Primitive(s) | The one example |
|-----|--------------|-----------------|
| 1 | Always-on · File-based · Prompt | `copilot-instructions.md` · `tests.instructions.md` · `/review-code` |
| 2 | Skill | `run-and-fix-tests` |
| 3 | Custom agent | Refactoring Expert |
| 4 | MCP · Hook | GitHub server · `protect-migrations` |
| 5 | Plugin | `employee-copilot-kit` |

> Instructions shape the **context**, prompts, skills and agents shape the **task**, MCP gives **reach**, hooks **enforce** — and plugins **share** all of it.

**Previous:** [Day 4](./day-4-mcp-and-hooks.md) · **Back to:** [Training index](./README.md)
