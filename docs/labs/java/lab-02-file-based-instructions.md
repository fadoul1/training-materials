---
title: "Lab 02 — File-Based Instructions"
sidebar_position: 3
---

# Lab 02 — Primitive 2: File-Based Instructions

**Duration:** 45 minutes  
**Module:** Day 1 — Module 2  
**Level:** Foundational

---

## Learning Objectives

By the end of this lab, you will be able to:
- Explain the difference between always-on instructions and file-based instructions
- Create a `*.instructions.md` file with an `applyTo` glob pattern
- Observe context-specific activation when editing targeted files
- Design a scoped instruction strategy for different layers of an application

---

## Key Concept

> **File-Based Instructions** are like always-on instructions — but they only load when Copilot is working on files that **match a glob pattern**. They solve the "context pollution" problem: rules for test files don't need to load when you're writing production code.

### File location & naming

```
.github/
└── instructions/
    └── {name}.instructions.md     ← must end in .instructions.md
```

### Frontmatter

```yaml
---
applyTo: "**/test/**"               ← glob pattern (required)
---
```

### How it activates

| Always-On | File-Based |
|-----------|-----------|
| Loaded every session | Loaded when active file matches `applyTo` |
| Global rules | Scoped rules |
| `copilot-instructions.md` | `*.instructions.md` files |
| One file | Multiple files (one per concern) |

---

## The Instructions File in This Project

Open [`.github/instructions/tests.instructions.md`](pathname:///resources/java/instructions/tests.instructions.md).

```yaml
---
applyTo: "**/test/**"
---
```

This file loads **only** when you are working on a file inside a `test/` directory.  
It adds test-specific rules on top of the always-on instructions:
- JUnit 5 + Mockito + AssertJ imports and patterns
- `should_[expected]_when_[condition]` naming convention
- AAA pattern with blank lines between Arrange / Act / Assert
- Explicit list of what NOT to do in tests

---

## Exercise 1 — Observe Scoped Activation (10 min)

### Step 1 — Open a production file

Open `employee-service/src/main/java/.../service/impl/EmployeeServiceImpl.java`.

Ask Copilot:
```
What testing rules apply to this codebase?
```

Note the answer — it mentions the testing rules from the always-on instructions.

### Step 2 — Open a test file

Open `employee-service/src/test/java/.../service/EmployeeServiceTest.java` (or any file in `src/test/`).

Ask the same question:
```
What testing rules apply to this file?
```

**Expected result:** Copilot now gives a richer, more detailed answer that includes the test-specific rules from `tests.instructions.md` — because the active file matches `**/test/**`.

---

## Exercise 2 — Generate a Test with Scoped Rules Active (15 min)

While `EmployeeServiceTest.java` is the active file, ask:
```
Add a test for the findById method — test the case where the employee does not exist.
```

**Observe that Copilot automatically:**
- Names the method `should_throw_EmployeeNotFoundException_when_id_not_found`
- Uses `@Test` (JUnit 5), not JUnit 4 annotations
- Mocks with `when(repo.findById(99L)).thenReturn(Optional.empty())`
- Asserts with `assertThatThrownBy(...)` from AssertJ — not `assertThrows`
- Follows AAA pattern with blank lines

**Now switch back** to a production class and ask for the same thing. Observe the difference.

---

## Exercise 3 — Create a New File-Based Instruction (20 min)

You will create a new scoped instruction for the **controller layer**.

### Step 1 — Create the file

Create `.github/instructions/controllers.instructions.md`:

```markdown
---
applyTo: "**/controller/**"
---

# Controller-Layer Rules

## HTTP Conventions
- All endpoints must declare explicit `produces` and `consumes` media types.
- Use `ResponseEntity<T>` for all return types — never return raw objects.
- Map HTTP verbs strictly: POST=create, GET=read, PUT=full update, PATCH=partial, DELETE=remove.

## Logging
- Log every incoming request at `info` level: method name, key path variables, and email if present.
- Never log request body content — it may contain PII.

## Validation
- Always annotate `@RequestBody` parameters with `@Valid`.
- Annotate the controller class with `@Validated` for constraint validation on `@PathVariable` / `@RequestParam`.

## What NOT to Do in Controllers
- No business logic
- No direct repository access
- No `@Transactional`
- No exception catching (let the global handler do it)
```

### Step 2 — Test it

Open `EmployeeController.java`. Ask:
```
Add a PATCH endpoint for partial update of an employee's job title.
```

**Observe:** Copilot includes `@Validated`, `@Valid`, explicit media types, `ResponseEntity<EmployeeResponse>`, and logs the incoming request — all from the scoped instruction.

---

## Key Takeaways

| Insight | Why It Matters |
|---------|---------------|
| `applyTo` is a glob pattern | Precise control over when rules activate |
| Keeps always-on instructions lean | Only universal rules go in `copilot-instructions.md` |
| Multiple files per concern | Separate files for controllers, tests, migrations, etc. |
| Additive, not replacing | File-based rules stack on top of always-on rules |

---

## Quick Reference

```
.github/
├── copilot-instructions.md           ← Primitive 1 (always-on)
└── instructions/
    ├── tests.instructions.md         ← Primitive 2 (applyTo: **/test/**)
    └── controllers.instructions.md   ← Primitive 2 (applyTo: **/controller/**)
```

---

## Decision Guide: Always-On vs. File-Based

| Rule type | Where to put it |
|-----------|----------------|
| Applies to ALL code | `copilot-instructions.md` |
| Applies only to test files | `tests.instructions.md` with `applyTo: **/test/**` |
| Applies only to controllers | `controllers.instructions.md` with `applyTo: **/controller/**` |
| Applies only to SQL migration files | `migrations.instructions.md` with `applyTo: **/*.sql` |

**Previous:** [Lab 01 — Always-On Instructions](./lab-01-always-on-instructions.md)  
**Next:** [Lab 03 — Prompt Files](./lab-03-prompt-files.md)
