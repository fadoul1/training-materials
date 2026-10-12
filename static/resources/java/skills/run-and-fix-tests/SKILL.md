---
name: run-and-fix-tests
description: Run Maven unit tests, analyse failures, and suggest targeted code corrections. Use when the user wants to run tests, check test results, investigate test failures, or fix failing unit tests.
---

# Run and Fix Tests — Employee Service

Run from the project root (where the parent `pom.xml` is). Requires Java 21 and Maven.

## Step 1 — Run

```bash
mvn test -pl employee-service --no-transfer-progress
```

One class only: add `-Dtest=<ClassName>`.

## Step 2 — Analyse

From the Surefire output, extract for each failure: test class and method, failure type, expected vs. actual value.

## Step 3 — Diagnose

| Symptom | Likely root cause |
|---------|-------------------|
| `package org.junit.jupiter.api does not exist` / `cannot find symbol: assertThat` | `employee-service/pom.xml` has no test dependencies — add `spring-boot-starter-test` with `<scope>test</scope>` (version managed by the Spring Boot parent) |
| `NullPointerException` in a service test | Mapper not mocked, or mock returns null |
| `EmployeeNotFoundException` not thrown | Missing `orElseThrow()` on the repository call |
| `DuplicateEmailException` not thrown | Missing `existsByEmail()` check in the service |
| HTTP 400 in a controller test | Missing `@Valid` or wrong field constraint |

## Step 4 — Fix

For each failure: the file and line, the corrected code, one sentence on why. Follow `.github/instructions/tests.instructions.md` when changing tests.

## Step 5 — Re-run

Re-run Step 1. Do not stop before `BUILD SUCCESS`.