---
title: "Lab 06 — End-to-End Workflow"
sidebar_position: 7
---

# Lab 06 — End-to-End Workflow (Capstone)

**Duration:** 90 minutes  
**Module:** Day 2 — Module 9  
**Level:** Advanced

---

## Learning Objectives

Apply all 6 primitives together in a realistic feature delivery cycle.  
By the end of this lab you will have used:
- Always-On Instructions (passive — always active)
- File-Based Instructions (passive — activates on test files)
- `/generate-tests` Prompt (explicit invocation)
- `run-and-fix-tests` Skill (automatic intent match)
- `Refactoring Expert` Custom Agent (persona-driven)
- `/review-code` Prompt (quality gate)
- `employee-api` MCP (live API call)

---

## Feature to Implement

> **"As an HR manager, I want to search employees by their job title so I can quickly find all engineers in the system."**

This is a realistic greenfield feature that touches every layer: controller, service, repository, DTO, and tests.

---

## Phase 1 — Understand the Codebase (10 min)

### Step 1 — Architecture overview

In Copilot Chat (default agent), type `/explain-architecture`.

When prompted for `scope`, enter: `the service layer`

Study the output. Understand:
- Where to add the new method in `EmployeeService` interface
- Where to implement it in `EmployeeServiceImpl`
- What the Repository query should look like

### Step 2 — Explore existing patterns

Ask in default Copilot Chat:
```
Show me how findById is implemented — from controller to repository.
Explain the pattern I should follow for the new findByJobTitle feature.
```

---

## Phase 2 — Implement the Feature (20 min)

In **Agent mode** (default), ask Copilot to implement the feature:

```
Implement a findByJobTitle(String jobTitle) feature on the Employee API.

Requirements:
- New GET endpoint: GET /api/employees/search?jobTitle=ENGINEER
- Returns a paginated list of EmployeeResponse
- Follows the same n-tier pattern as findById
- Validates that jobTitle is not blank
- Throws a descriptive exception / returns empty page if no results
- Logs the incoming request at info level
```

**Observe that Copilot automatically:**
- Uses `EmployeeService` as an interface (adds the method signature)
- Implements in `EmployeeServiceImpl` (uses mapper)
- Adds a `findByJobTitle` Spring Data query on the repository
- Returns `EmployeeResponse` — not `Employee` entity
- Follows naming conventions from `copilot-instructions.md`

If Copilot breaks any rule (e.g. returns entity, uses field injection), **point it out** and ask it to fix the violation.

---

## Phase 3 — Generate Tests (10 min)

In Copilot Chat (**Agent mode**), type:
```
/generate-tests
```

When prompted for `className`, enter: `EmployeeServiceImpl`

**Verify the generated tests include:**
- `should_return_employees_when_valid_job_title`
- `should_return_empty_page_when_no_employees_match_job_title`
- Any additional scenario you added in Phase 2

Open the generated test file and confirm:
- `applyTo: "**/test/**"` file-based instructions shaped the test style automatically
- Method names: `should_[expected]_when_[condition]`
- Assertions use AssertJ (`assertThat`)
- AAA pattern with blank lines

---

## Phase 4 — Run and Fix Tests (10 min)

In Copilot Chat (Agent mode), type:
```
run the tests and fix any failures
```

**Copilot loads the `run-and-fix-tests` skill automatically** and:
1. Runs `mvn test -pl employee-service`
2. Parses the output
3. Reports `BUILD SUCCESS` — or lists failures with root cause + fix

If there are failures, apply the suggested fixes and ask Copilot to re-run.

Keep going until you see `BUILD SUCCESS`.

---

## Phase 5 — Refactor (10 min)

Switch to the **Refactoring Expert** agent (agent picker → "Refactoring Expert").

Open `EmployeeServiceImpl.java` and ask:
```
Review the findByJobTitle method I just added and refactor it if needed.
```

The Refactoring Expert will:
1. Diagnose any smells (long method, missing guard clause, etc.)
2. Show before/after diffs
3. Warn about any risks
4. Offer the "Run Tests After Refactor" handoff

Click **"Run Tests After Refactor"** to confirm nothing broke.

---

## Phase 6 — Code Review (10 min)

Back in default Copilot Chat, open `EmployeeController.java`.

Type:
```
/review-code
```

Focus on the new `search` endpoint.

**Expected result:** Copilot checks:
- Architecture compliance (no business logic in controller)
- Security (input validated with `@Valid` / `@NotBlank`)
- Logging (incoming request logged, no PII)
- Exception handling (no `try/catch` in controller)

**If issues are found:** fix them and re-run `/review-code` until you get "Pass".

---

## Phase 7 — Test the Live API (10 min)

Make sure the app is running:
```bash
mvn spring-boot:run -pl employee-launcher
```

In Copilot Chat, say:
```
call the employee API to search for all employees with job title ENGINEER
```

The `call-employee-api` skill activates automatically and runs:
```bash
curl -s "http://localhost:8080/api/employees/search?jobTitle=ENGINEER" | jq .
```

**Verify:** the response includes all engineers from the sample data inserted by `V2__insert_sample_employees.sql`.

---

## Phase 8 — Create a GitHub Issue for Follow-Up (10 min)

Using the **GitHub MCP server**, ask:
```
Create a GitHub issue titled "Add pagination support to GET /api/employees/search" 
with label "enhancement" and a description explaining that the current implementation 
returns all results and should support page/size parameters like the main list endpoint.
```

**Observe:** Copilot makes a real API call and returns the issue URL.

---

## Full Primitives Map — What Was Used and When

| Phase | Action | Primitive Used |
|-------|--------|---------------|
| 1 | Architecture explained (auto-context) | Always-On Instructions |
| 1 | `/explain-architecture` invoked | Prompt File |
| 2 | Feature implementation (follows layering rules) | Always-On Instructions |
| 3 | `/generate-tests` invoked | Prompt File |
| 3 | Test style (AssertJ, AAA, naming) applied to test file | File-Based Instructions |
| 4 | "run the tests and fix failures" → Maven executed | Skill (auto-loaded) |
| 5 | Refactoring Expert persona active | Custom Agent |
| 5 | "Run Tests" triggered post-refactor | Agent Handoff |
| 6 | `/review-code` quality gate | Prompt File |
| 7 | "call the employee API" → curl executed | Skill (auto-loaded) |
| 8 | GitHub issue created | MCP Server |

---

## Debrief Questions

Answer these in the group discussion:

1. At which point did you type the fewest words and get the most done? Why?
2. Which primitive saved the most time compared to not having it?
3. Which rule from `copilot-instructions.md` was enforced automatically (without you asking)?
4. What would break if the `tests.instructions.md` file did not exist?
5. What would you add to the instructions file based on what you learned today?

---

## What a Complete Copilot Environment Looks Like

```
.github/
├── copilot-instructions.md           ← Always-On: universal rules
├── instructions/
│   ├── tests.instructions.md         ← File-Based: test-specific rules
│   └── controllers.instructions.md   ← File-Based: controller rules (exercise)
├── prompts/
│   ├── review-code.prompt.md         ← Prompt: /review-code
│   ├── generate-tests.prompt.md      ← Prompt: /generate-tests
│   ├── explain-architecture.prompt.md← Prompt: /explain-architecture
│   └── add-endpoint.prompt.md        ← Prompt: /add-endpoint (Lab 03 exercise)
├── skills/
│   ├── run-and-fix-tests/SKILL.md    ← Skill: auto-runs Maven on intent
│   └── call-employee-api/SKILL.md    ← Skill: auto-calls API on intent
└── agents/
    ├── refactoring-expert.agent.md   ← Agent: refactoring specialist
    └── spring-migration-expert.agent.md ← Agent: migration specialist
.vscode/
└── mcp.json                          ← MCP: GitHub, DB, API, Jira
```

---

**Previous:** [Lab 05 — Custom Agents](./lab-05-custom-agents.md)
