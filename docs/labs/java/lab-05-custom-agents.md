---
title: "Lab 05 — Custom Agents"
sidebar_position: 6
---

# Lab 05 — Primitive 5: Custom Agents

**Duration:** 75 minutes  
**Module:** Day 2 — Module 7  
**Level:** Advanced

---

## Learning Objectives

By the end of this lab, you will be able to:
- Explain what custom agents are and when they outperform default Copilot
- Activate a custom agent and observe how its persona shapes the output
- Use handoffs to chain agents in a workflow
- Create a new custom agent for a targeted engineering role
- Implement a sub-agent pattern for context isolation

---

## Key Concept

> **Custom Agents** are specialized AI personas with constrained tool sets, defined behaviours, and consistent response styles. Where instructions say "how to write code", agents define "how to think and respond". A custom agent is a specialist you can summon — a security reviewer, a refactoring expert, a mentor.

### Instructions vs. Custom Agents

| Always-On Instructions | Custom Agent |
|------------------------|-------------|
| "Use MapStruct for mapping" | "I am a refactoring expert. I diagnose code smells." |
| Passive style rules | Active persona with methodology |
| Always in context | Activated by user (or as sub-agent) |
| No conversation memory | Maintains persona throughout session |

### File location & naming

```
.github/
└── agents/
    └── {name}.agent.md        ← any .md file in agents/ folder
```

### Frontmatter fields

```yaml
---
name: 'Refactoring Expert'           ← shown in agent picker
description: '...'                   ← shown as placeholder text in chat
tools: ["readFile", "editFiles"]     ← tools this agent can use
model: claude-sonnet-4-5             ← model to use
handoffs:                            ← workflow transitions
  - label: "Run Tests"
    agent: agent
    prompt: "Run tests to validate."
    send: false
---
```

---

## Agents in This Project

### Agent 1 — Refactoring Expert

File: [`.github/agents/refactoring-expert.agent.md`](pathname:///resources/java/agents/refactoring-expert.agent.md)

**Persona:** Principal Java engineer, 15 years experience  
**Specialty:** Code smell detection, SOLID principles, Java 21 idioms  
**Tools:** `readFile`, `editFiles`, `search`  
**Handoffs:** → Run Tests → Review Code

### Agent 2 — Spring Migration Expert

File: [`.github/agents/spring-migration-expert.agent.md`](pathname:///resources/java/agents/spring-migration-expert.agent.md)

**Persona:** Senior Java architect specialised in Spring Boot migrations  
**Specialty:** `javax.*` → `jakarta.*`, dependency upgrades, incremental migration  
**Tools:** `readFile`, `editFiles`, `search`, `runInTerminal`  
**Handoffs:** → Build After Migration → Review Migration Changes

---

## Exercise 1 — Activate and Compare Agents (15 min)

### Step 1 — Default Copilot

Open `EmployeeServiceImpl.java`. In the **default** Copilot agent mode, ask:
```
Review this file and suggest improvements.
```

Note the tone, structure, and depth of the response.

### Step 2 — Refactoring Expert

Switch to the **Refactoring Expert** agent (click the agent picker in Copilot Chat, select "Refactoring Expert").

Ask the same question:
```
Review this file and suggest improvements.
```

**Observe the difference:**
- The Refactoring Expert starts with a formal **diagnosis** listing named code smells
- Each issue has a label (e.g. "Long Method", "Magic String")
- Before/after code blocks with diffs
- Explicit risk warnings for changes that affect public API
- Ends with a handoff suggestion: "Run Tests After Refactor"

---

## Exercise 2 — Use Handoffs (10 min)

Still in the **Refactoring Expert** session after the previous exercise:

1. Review the suggested refactoring changes
2. Click the **"Run Tests After Refactor"** button at the bottom of the response
3. Copilot switches to a new agent session that:
   - Runs `mvn test -pl employee-service`
   - Reports pass/fail
   - Links failures back to the refactoring changes

This is **agent orchestration** — one agent triggers another.

---

## Exercise 3 — Run a Migration with the Spring Expert (15 min)

Switch to the **Spring Migration Expert** agent.

Ask:
```
Check if there are any javax imports that should be jakarta in this project.
```

**The agent will:**
1. Search all Java files for `javax.` imports
2. Identify which ones are affected by the Spring Boot 3.x migration
3. Generate a migration plan with risk levels
4. Apply changes file by file
5. Offer the "Run Build After Migration" handoff

**Key observation:** The agent works **incrementally** — it verifies compilation after each file change, not at the end. This is the agent's built-in behaviour from its persona definition.

---

## Exercise 4 — Create a New Custom Agent (35 min)

You will create a **Security Reviewer** agent for the employee service.

### Step 1 — Create the file

Create `.github/agents/security-reviewer.agent.md`:

```markdown
---
name: Security Reviewer
description: Reviews code for security vulnerabilities — OWASP Top 10, input validation, SQL injection, logging of PII. Use when you want a security-focused code review.
tools: ["readFile", "search"]
model: claude-sonnet-4-5
handoffs:
  - label: "Apply Security Fixes"
    agent: agent
    prompt: "Apply the security fixes identified in the review above. Fix one issue at a time and verify the code still compiles."
    send: false
---

# Who You Are

You are a senior application security engineer with expertise in Java and Spring Boot.
You have performed security reviews on 50+ enterprise applications.
You think in terms of **attack vectors**, not just code style.

# How You Think

You always ask:
1. Can an attacker control this input?
2. Can this log statement leak sensitive data?
3. Can this query be injected?
4. Does this endpoint require authentication?
5. Is there appropriate rate limiting or brute-force protection?

# Your Expertise

- **OWASP Top 10** — ranked vulnerabilities with CWE references
- **Input Validation** — Jakarta Validation, boundary checks, allowlist vs. denylist
- **SQL Injection** — Spring Data JPA parameterized queries, JPQL safety
- **Sensitive Data Exposure** — PII in logs, stack traces in API responses
- **Broken Access Control** — missing authorization checks
- **Security Misconfiguration** — Spring Security defaults, Actuator endpoints

# How You Respond

1. **Risk Assessment** — start with `CRITICAL / HIGH / MEDIUM / LOW / INFO`
2. **Finding List** — for each issue:
   - Vulnerability type + CWE reference (e.g. `CWE-89: SQL Injection`)
   - Affected file + line number
   - Attack scenario: "An attacker could..."
   - Recommended fix with code example
3. **Positive Notes** — acknowledge what is done well
4. **Summary** — overall security posture + top priority to fix

# What You Always Do

- Reference specific CWE numbers for every finding
- Provide concrete exploitability context ("An attacker could bypass auth by...")
- Give a code fix, not just a description of the problem
- Check the `copilot-instructions.md` guardrails are being followed

# What You Never Do

- Never mark something as a vulnerability without evidence in the code
- Never suggest adding security-sensitive logic to controllers (belongs in service/filter)
- Never recommend disabling Spring Security features without justification
- Never overlook the logging rules — PII in logs is a GDPR violation
```

### Step 2 — Test it

Switch to your new **Security Reviewer** agent. Open `EmployeeController.java` and ask:
```
Review this controller for security issues.
```

**The agent should check:**
- Are inputs validated with `@Valid` before use?
- Are there any log statements that could expose PII (email, names)?
- Does the error response contain stack traces?
- Are there missing rate-limiting or auth annotations?

---

## Key Takeaways

| Insight | Why It Matters |
|---------|---------------|
| Persona specificity produces consistency | Vague agents produce generic answers |
| Tools list scopes capability | A reviewer doesn't need `runInTerminal` |
| Handoffs chain specialists together | Avoids context bloat — each agent stays focused |
| `What You Never Do` prevents persona drift | Guards are as important as capabilities |
| Sub-agents isolate context | Complex tasks can be delegated without polluting the main session |

---

## The Agent Formula

```
Who You Are      → Persona + background
How You Think    → Methodology + questions you always ask
How You Respond  → Output structure + format
What You Always Do → Consistent behaviours
What You Never Do  → Guardrails
```

---

## Agents vs. Prompts — Quick Decision Guide

| Use a **Prompt** when | Use a **Custom Agent** when |
|-----------------------|-----------------------------|
| One-shot specific task (generate tests) | Entire conversation needs a persona (security review) |
| You need fill-in-the-blank variables | Persona is set at session start |
| The task is the same every time | The expert needs to ask questions and iterate |
| Short execution (< 1 minute) | Long, multi-step engagement |

---

**Previous:** [Lab 04 — Skills](./lab-04-skills.md)  
**Next:** [Lab 06 — MCP](./lab-06-end-to-end-workflow.md)
