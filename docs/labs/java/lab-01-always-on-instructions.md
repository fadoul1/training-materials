---
title: "Lab 01 — Always-On Instructions"
sidebar_position: 2
---

# Lab 01 — Primitive 1: Always-On Instructions

**Duration:** 45 minutes  
**Module:** Day 1 — Module 2  
**Level:** Foundational

---

## Learning Objectives

By the end of this lab, you will be able to:
- Explain what the `copilot-instructions.md` file does and when it loads
- Create a repository-level instructions file that shapes Copilot's behaviour
- Verify that Copilot is reading and applying the instructions
- Iterate and refine instructions to improve output quality

---

## Key Concept

> **Always-On Instructions** are the foundation of Copilot customisation. They are loaded automatically at the start of **every** Copilot Chat session in the repository. You never have to reference them manually.

### File location

```
.github/copilot-instructions.md    ← Shared with the team (commited to Git)
```

### What it does

Without `copilot-instructions.md`, Copilot treats every repository identically. It does not know:
- That you use **MapStruct** (not manual mapping)
- That your exception hierarchy is `EmployeeNotFoundException` → `404`
- That `@Autowired` field injection is forbidden
- That tests must follow AAA pattern with AssertJ

With the file, all of this is **permanent context** — Copilot knows it before you type a single word.

### What it does NOT affect

Inline suggestions (ghost text as you type) are **not** affected. The file only influences Copilot **Chat** interactions.

---

## The Instructions File in This Project

Open [`.github/copilot-instructions.md`](pathname:///resources/java/copilot-instructions.md).

Notice the structure:

| Section | Purpose |
|---------|---------|
| **Project Overview** | Tells Copilot what this project is |
| **Tech Stack** | Prevents wrong framework suggestions |
| **Architecture & Layering Rules** | Enforces n-tier boundaries |
| **Coding Standards** | Naming, exception handling, validation |
| **Security Requirements** | Guardrails around logging and queries |
| **Testing Requirements** | Test framework, patterns, coverage |
| **What NOT to Do** | Explicit anti-patterns to avoid |
| **Why These Rules Exist** | Rationale — helps Copilot make better edge-case decisions |

---

## Exercise 1 — Verify the Instructions Load (10 min)

### Step 1 — Open Copilot Chat

Press `Ctrl+Alt+I` (or click the Copilot icon in the sidebar).

### Step 2 — Test without context

Ask Copilot:
```
What are the coding standards for this project?
```

**Expected result:** Copilot lists the conventions from `copilot-instructions.md` — naming, injection style, testing rules, etc.

If it doesn't, check:
- The file is named exactly `copilot-instructions.md`
- It is in the `.github/` folder at the workspace root
- VS Code setting `chat.includeApplyingInstructions` is `true` (default)

---

## Exercise 2 — See Copilot Enforce the Rules (15 min)

### Scenario: New service method

Ask Copilot in Agent mode:
```
Add a method findByEmail(String email) to EmployeeServiceImpl that:
- searches by email
- returns EmployeeResponse
- throws the correct exception if not found
```

**Observe:**
- Does Copilot use `EmployeeNotFoundException` (not `RuntimeException`)?
- Does it use the mapper to convert Entity → DTO?
- Does it add `@Slf4j` logging at the right level?
- Does it use constructor injection?

If yes — the instructions are working.

---

## Exercise 3 — Break a Rule Deliberately (10 min)

Ask Copilot:
```
Show me how to inject EmployeeRepository using @Autowired on a field.
```

**Expected result:** Copilot refuses or immediately flags this as violating the project standard and offers the constructor-injection alternative instead.

Now ask:
```
Write a service method that returns the Employee entity directly from the database.
```

**Expected result:** Copilot flags the entity exposure anti-pattern and suggests returning `EmployeeResponse` via the mapper.

---

## Exercise 4 — Iterate on the Instructions (10 min)

The instructions file is a living document. Add a new rule together:

1. Open `.github/copilot-instructions.md`
2. Add this section at the bottom:

```markdown
## Department Rules (Added in Lab)
- Employees must belong to a department.
- Department names must be from the enum: ENGINEERING, HR, FINANCE, OPS.
- Never accept a raw String for department — use the `Department` enum.
```

3. Ask Copilot again:
```
Add a department field to EmployeeRequest.
```

**Observe** how the suggestion changes compared to before the instruction was added.

---

## Key Takeaways

| Insight | Why It Matters |
|---------|---------------|
| Instructions load automatically | No prompting overhead for every request |
| Include rationale (not just rules) | Copilot makes better edge-case decisions with context |
| Use ✅/❌ examples | Concrete patterns outperform abstract rules |
| Keep it under ~2000 words | Longer files dilute the important rules |
| Review quarterly | Instructions drift from reality if not maintained |

---

## Quick Reference

```
.github/
└── copilot-instructions.md   ← Primitive 1 (always-on, every session)
```

**Next:** [Lab 02 — File-Based Instructions](./lab-02-file-based-instructions.md)
