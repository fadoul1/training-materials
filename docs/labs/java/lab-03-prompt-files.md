---
title: "Lab 03 — Prompt Files"
sidebar_position: 4
---

# Lab 03 — Primitive 3: Prompt Files (Slash Commands)

**Duration:** 60 minutes  
**Module:** Day 1 — Module 3  
**Level:** Intermediate

---

## Learning Objectives

By the end of this lab, you will be able to:
- Explain what a prompt file is and how it differs from instructions
- Invoke a prompt using the `/` slash command
- Use `${input:variable}` parameters to make prompts reusable
- Create a new prompt file from scratch for a recurring engineering task
- Choose the correct execution mode (`ask` vs `agent`)

---

## Key Concept

> **Prompt Files** are reusable task templates invoked on demand with a `/` slash command. They are macros for workflows you perform repeatedly — code review, test generation, architecture explanation — eliminating repetitive prompting and producing consistent outputs.

### The critical difference from instructions

| Instructions | Prompts |
|-------------|---------|
| Load automatically | Invoked explicitly with `/` |
| Define **behaviour** | Define a **task** |
| "Always be a Java 21 expert" | "Now, do THIS specific thing" |
| Passive | Active |

### File location & naming

```
.github/
└── prompts/
    └── {name}.prompt.md       ← must end in .prompt.md
```

### Frontmatter fields

```yaml
---
name: review-code               ← appears in the / menu
description: "..."              ← shown as placeholder text
agent: ask | agent | plan       ← execution mode
model: claude-sonnet-4-5        ← model to use
tools: ["editFiles", ...]       ← tools available (agent mode)
---
```

### Execution modes

| Mode | What it does | Use when |
|------|-------------|----------|
| `ask` | Read-only, conversational | Review, explain, brainstorm |
| `agent` | Creates/edits files, runs commands | Scaffolding, fixing, generating code |
| `plan` | Generates a structured plan first | Breaking down large features |

---

## Prompts in This Project

| Slash command | File | Mode | Purpose |
|--------------|------|------|---------|
| `/review-code` | `review-code.prompt.md` | `ask` | Code review against project standards |
| `/generate-tests` | `generate-tests.prompt.md` | `agent` | Scaffold a full JUnit 5 test class |
| `/explain-architecture` | `explain-architecture.prompt.md` | `ask` | Explain layers, data flow, design decisions |

---

## Exercise 1 — Invoke an Existing Prompt (10 min)

### Step 1

Open `EmployeeServiceImpl.java`.

### Step 2

In Copilot Chat, type `/` and wait for the menu to appear.

Select `/review-code`.

### Step 3

**Observe the structured output:**
- `[MUST FIX]` — architecture violations or security risks
- `[SHOULD FIX]` — quality degradations
- `[SUGGESTION]` — optional improvements
- **Summary** — Pass / Pass with comments / Needs rework

The review is consistent every time because the prompt defines exactly what to check.

---

## Exercise 2 — Generate Tests with a Variable Prompt (15 min)

### Step 1

In Copilot Chat (Agent mode), type `/generate-tests`.

### Step 2

Copilot asks for the input variable: `className`.

Enter: `EmployeeServiceImpl`

### Step 3

Watch Copilot:
1. Read the source file
2. Identify all public methods, dependencies, happy paths, and error paths
3. Generate a complete test class at the correct path

**Verify the output:**
- Class name: `EmployeeServiceImplTest`
- Annotations: `@ExtendWith(MockitoExtension.class)`, `@Mock`, `@InjectMocks`
- Method names: `should_return_employee_when_valid_id`, etc.
- Assertions: `assertThat(...)` — no `assertEquals`
- Structure: AAA pattern with blank lines

---

## Exercise 3 — Explain the Architecture (10 min)

Type `/explain-architecture`.

When prompted for `scope`, enter: `the exception handling flow`

**Observe:**
- Copilot reads the `exception/` package
- Draws a Mermaid diagram of the exception hierarchy
- Traces how a `NotFoundException` flows from the service to the HTTP 404 response
- Explains the rationale (no stack traces in API responses)

---

## Exercise 4 — Create a New Prompt from Scratch (25 min)

You will create a `/add-endpoint` prompt that scaffolds a new REST endpoint.

### Step 1 — Create the file

Create `.github/prompts/add-endpoint.prompt.md`:

```markdown
---
name: add-endpoint
description: Scaffold a new REST endpoint (controller method + service method + unit tests)
agent: agent
model: claude-sonnet-4-5
tools: ["editFiles", "createFile", "readFile"]
---

# Add REST Endpoint — Employee Service

Scaffold a complete new endpoint for: **${input:resourceAction}**

(e.g. `find employees by department`, `deactivate an employee`, `bulk create employees`)

## Step 1 — Plan the Changes

Identify which files need to change:
- Controller method (HTTP verb, path, request/response types)
- Service interface — add the method signature
- Service implementation — implement the business logic
- Repository — add Spring Data query if needed

## Step 2 — Implement

Follow the n-tier architecture strictly:
- Controller delegates to service only — no business logic
- Service uses the mapper for all Entity ↔ DTO conversions
- Throw domain exceptions (`EmployeeNotFoundException`, `DuplicateEmailException`)
- Validate all inputs with `@Valid` at the controller boundary

## Step 3 — Generate Tests

For the new service method, generate:
- Happy path test
- Error path test (exception scenario)
- Naming: `should_[expected]_when_[condition]`

## Constraints
- Follow the security rules: no PII in logs, parameterized queries
- Return `ResponseEntity<T>` — never raw objects
- Log the incoming request at `info` level in the controller
```

### Step 2 — Test it

In Copilot Chat (Agent mode), type `/add-endpoint`.

Enter: `find employees by department`

**Observe** how Copilot plans and executes all three layers (controller, service, test) in one go.

---

## Key Takeaways

| Insight | Why It Matters |
|---------|---------------|
| Use `ask` for read-only tasks | No file changes — safe for review and explanation |
| Use `agent` for code generation | Copilot can create/edit files autonomously |
| `${input:variable}` makes prompts reusable | One prompt, many use cases |
| Prompts encode team workflows | Onboarding is faster when workflows are codified |
| Prompt + Instructions = consistent output | The prompt defines the task; instructions define the style |

---

## Comparison: Instructions vs. Prompts vs. Skills

| | Instructions | Prompts | Skills |
|-|-------------|---------|--------|
| Invocation | Automatic | `/name` | Automatic (intent match) |
| Purpose | Rules & conventions | Specific task templates | Procedural workflows with steps |
| Parameterised | No | Yes (`${input:x}`) | No |
| File type | `.instructions.md` | `.prompt.md` | `SKILL.md` |

---

**Previous:** [Lab 02 — File-Based Instructions](./lab-02-file-based-instructions.md)  
**Next:** [Lab 04 — Skills](./lab-04-skills.md)
