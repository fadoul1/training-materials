---
name: run-and-fix-tests
description: Run Maven unit tests, analyse failures, and suggest targeted code corrections. Use when the user wants to run tests, check test results, investigate test failures, or fix failing unit tests.
metadata:
  author: accenture-training
  version: "1.0"
---

# Run and Fix Tests — Employee Service

## When to Use This Skill

Use this skill when:
- User wants to run the Maven test suite
- User asks "why is my test failing?"
- User wants failure analysis and fix suggestions
- User mentions `mvn test`, `surefire`, or `JUnit`

## Prerequisites

- Maven installed (`mvn --version` must succeed)
- Working directory at project root (where the parent `pom.xml` is)
- Java 21 JDK on the PATH

## Step 1 — Run the Tests

Run the full test suite:

```bash
mvn test -pl employee-service --no-transfer-progress 2>&1
```

For a specific test class only:

```bash
mvn test -pl employee-service -Dtest=EmployeeServiceTest --no-transfer-progress 2>&1
```

Capture the output. Look for:
- `BUILD SUCCESS` — all tests passed ✅
- `BUILD FAILURE` — at least one test failed ❌
- `Tests run: X, Failures: Y, Errors: Z`

## Step 2 — Analyse Failures

For each failing test, extract:
1. **Test class and method name** (e.g. `EmployeeServiceTest#should_throw_404_when_not_found`)
2. **Failure type**: assertion failure, unexpected exception, NullPointerException, etc.
3. **Expected vs. Actual values** from the AssertJ message

Example failure message to parse:
```
org.opentest4j.AssertionFailedError:
expected: <"john.doe@accenture.com">
 but was: <null>
    at EmployeeServiceTest.should_return_employee_when_valid_id(EmployeeServiceTest.java:45)
```

## Step 3 — Diagnose Root Cause

For each failure, open the source and test files and identify:

| Symptom | Likely Root Cause |
|---------|------------------|
| `NullPointerException` in service | Mapper not mocked / returning null |
| AssertJ field mismatch | Business logic bug — wrong field mapped |
| `EmployeeNotFoundException` not thrown | Missing `orElseThrow()` in repository call |
| `DuplicateEmailException` not thrown | Missing `existsByEmail()` check in service |
| HTTP 400 in controller test | Missing `@Valid` or wrong field constraint |

## Step 4 — Suggest Fixes

For each failure, provide:
1. The exact method to fix (file path + line number)
2. The corrected code snippet
3. A brief explanation of why the original was wrong

## Step 5 — Re-run After Fix

After applying fixes, re-run:
```bash
mvn test -pl employee-service --no-transfer-progress 2>&1
```

Confirm `BUILD SUCCESS` before closing.

## Common Patterns

| Scenario | Fix Pattern |
|----------|------------|
| Mock returns wrong value | `when(repo.findById(1L)).thenReturn(Optional.of(employee))` |
| Mapper not set up in test | Add `@Mock EmployeeMapper employeeMapper` and configure `when(mapper.toResponse(...)).thenReturn(...)` |
| Wrong HTTP status asserted | Verify `@ResponseStatus` annotation or `ResponseEntity` status in controller |
| Test ignores exception | Use `assertThatThrownBy(...).isInstanceOf(ExpectedException.class)` |