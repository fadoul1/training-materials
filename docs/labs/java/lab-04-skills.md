---
title: "Lab 04 — Skills"
sidebar_position: 5
---

# Lab 04 — Primitive 4: Skills

**Duration:** 75 minutes  
**Module:** Day 2 — Module 6  
**Level:** Intermediate / Advanced

---

## Learning Objectives

By the end of this lab, you will be able to:
- Explain how skills differ from prompts and instructions
- Understand description-matching (how Copilot decides to load a skill)
- Use the two built-in project skills: `run-and-fix-tests` and `call-employee-api`
- Write a new `SKILL.md` file following the agentskills.io spec
- Decide when to use a skill versus a prompt versus instructions

---

## Key Concept

> **Skills** are on-demand knowledge packages that Copilot loads automatically when your request **semantically matches** the skill's description. Unlike prompts, you never type `/`. Copilot decides to use a skill on its own — just by reading your intent.

### The discovery mechanism

Every Copilot session includes a catalogue of available skills (names + descriptions only).  
When you send a message, Copilot matches your intent against those descriptions and loads the full content of the matching skill into context.

```
User: "run the tests and fix the failures"
                    ↓
Copilot checks skill catalogue → matches "run-and-fix-tests"
                    ↓
Loads full SKILL.md into context
                    ↓
Executes: mvn test → parse output → suggest fixes
```

### File location & structure

```
.github/
└── skills/
    └── {skill-name}/           ← directory name = skill name
        ├── SKILL.md            ← required: instructions + frontmatter
        ├── scripts/            ← optional: helper scripts
        └── templates/          ← optional: templates
```

### SKILL.md frontmatter

```yaml
---
name: run-and-fix-tests          ← lowercase, hyphens only, matches folder name
description: "..."               ← THE most important field — triggers the match
metadata:
  author: accenture-training
  version: "1.0"
---
```

### Description is everything

The description is what Copilot reads to decide whether to load the skill.

| Poor description | Effective description |
|------------------|-----------------------|
| `"Test runner skill"` | `"Run Maven unit tests, analyse failures, and suggest targeted code corrections. Use when the user wants to run tests, check test results, investigate test failures, or fix failing unit tests."` |

Rules for a good description:
- State **what** the skill does
- State **when** to use it (trigger phrases)
- Include action keywords users would naturally say: "run", "fix", "analyse", "call", "create"

---

## Skills in This Project

### Skill 1 — `run-and-fix-tests`

Location: [`.github/skills/run-and-fix-tests/SKILL.md`](pathname:///resources/java/skills/run-and-fix-tests/SKILL.md)

**What it does:** Runs `mvn test`, captures output, parses failures, and suggests targeted fixes.

**Trigger words:** `run tests`, `fix failing tests`, `why is my test failing`, `mvn test`

### Skill 2 — `call-employee-api`

Location: [`.github/skills/call-employee-api/SKILL.md`](pathname:///resources/java/skills/call-employee-api/SKILL.md)

**What it does:** Provides ready-to-run `curl` and HTTPie commands for all Employee API endpoints.

**Trigger words:** `call the API`, `test the endpoint`, `send a request`, `curl`, `POST an employee`

---

## Exercise 1 — Trigger a Skill by Intent (15 min)

### Step 1 — Do NOT type `/`

This is important. Skills activate automatically — no slash command needed.

In Copilot Chat (Agent mode), type:
```
run the tests and tell me if anything is failing
```

**Observe:**
1. Copilot recognises the intent matches `run-and-fix-tests`
2. Runs `mvn test -pl employee-service --no-transfer-progress`
3. Parses the output — reports `BUILD SUCCESS` or lists failures
4. If failures found: explains root cause and suggests a fix

### Step 2 — Try different trigger phrases

```
why are my tests broken?
```
```
mvn test is failing, help me debug it
```

Both should activate the same skill.

---

## Exercise 2 — Use the API Skill (10 min)

Make sure the application is running:
```bash
mvn spring-boot:run -pl employee-launcher
```

Then in Copilot Chat:
```
create a new employee named Alice Martin with email alice.martin@accenture.com
```

**Observe:**
- Copilot loads the `call-employee-api` skill
- Runs the correct `curl -X POST` command
- Shows the `201 Created` response with the new employee's ID

Then:
```
now get the employee we just created
```

Copilot uses the ID from the previous response to call `GET /api/employees/{id}`.

---

## Exercise 3 — Read a SKILL.md and Understand Its Structure (10 min)

Open [`.github/skills/run-and-fix-tests/SKILL.md`](pathname:///resources/java/skills/run-and-fix-tests/SKILL.md).

Answer these questions:
1. What is the `name` field? Does it match the folder name?
2. What action keywords appear in the `description`?
3. What are the **5 steps** the skill defines?
4. What is the diagnostic table mapping symptoms to root causes?
5. What command does the skill run **after** fixes are applied?

---

## Exercise 4 — Write a New Skill from Scratch (40 min)

You will create a `generate-flyway-migration` skill.

### Step 1 — Create the folder and file

```
.github/skills/generate-flyway-migration/SKILL.md
```

### Step 2 — Write the frontmatter

```yaml
---
name: generate-flyway-migration
description: Generate a Flyway SQL migration script for schema changes. Use when the user wants to add a column, create a table, rename a field, add an index, or make any database schema change. Ensures migration naming conventions and PostgreSQL compatibility.
metadata:
  author: accenture-training
  version: "1.0"
---
```

### Step 3 — Write the skill body

Your skill should cover:

**When to use:** list of trigger conditions  

**Migration naming rules:**
- Format: `V{n}__{description}.sql` (double underscore)
- Find the next version number by checking existing files in `db/migration/`
- Use snake_case for everything
- Never modify existing migration files

**Step-by-step instructions:**
1. Read existing migrations to find the next version number
2. Generate SQL (PostgreSQL syntax)
3. Create file at `employee-launcher/src/main/resources/db/migration/`
4. Suggest the corresponding entity/DTO change if applicable

**Common patterns table:**

| Change | SQL pattern |
|--------|------------|
| Add nullable column | `ALTER TABLE employees ADD COLUMN phone VARCHAR(20)` |
| Add NOT NULL column | `ALTER TABLE employees ADD COLUMN department VARCHAR(50) NOT NULL DEFAULT 'UNASSIGNED'` |
| Add index | `CREATE INDEX idx_employees_email ON employees(email)` |
| Add unique constraint | `ALTER TABLE employees ADD CONSTRAINT uq_employees_email UNIQUE (email)` |

### Step 4 — Test it

In Copilot Chat:
```
add a phone_number column to the employees table
```

**Copilot should:**
1. Check existing migration files (V1, V2 exist → use V3)
2. Generate `V3__add_phone_number_to_employees.sql`
3. Write the correct `ALTER TABLE` SQL
4. Remind you to add the field to `EmployeeRequest`, `EmployeeResponse`, and the entity

---

## Key Takeaways

| Insight | Why It Matters |
|---------|---------------|
| Skills activate by intent, not by command | Lower friction than prompts for common workflows |
| Description quality = discoverability | A bad description = skill never loads |
| Skills are self-contained directories | Can include templates, scripts, reference data |
| Skills are portable (agentskills.io spec) | Work in VS Code, GitHub Copilot CLI, and Copilot coding agent |
| Skills vs. always-on instructions | Always-on = rules for everything; Skills = knowledge for specific tasks |

---

## Decision Guide: Skills vs. Prompts vs. Instructions

| Scenario | Use |
|----------|-----|
| "Always follow these coding conventions" | Always-On Instructions |
| "Run tests when file matches `**/test/**`" | File-Based Instructions |
| "User explicitly triggers a task with `/`" | Prompt File |
| "User describes a task naturally, Copilot decides what to load" | Skill |
| "Task needs supporting templates or scripts alongside instructions" | Skill (directory structure) |

---

**Previous:** [Lab 03 — Prompt Files](./lab-03-prompt-files.md)  
**Next:** [Lab 05 — Custom Agents](./lab-05-custom-agents.md)
