---
name: review-code
description: Review the selected code against project standards (architecture, security, quality)
agent: ask
model: claude-sonnet-4-5
---

# Code Review — Employee Service Standards

Review the selected code against the project's standards. Provide actionable feedback.

## 1. Architecture Compliance
Check the n-tier architecture rules from `copilot-instructions.md`:
- Does the controller contain business logic? (should be in the service)
- Does the service expose JPA entities? (should return DTOs via MapStruct)
- Is dependency injection done via constructor? (never `@Autowired` on fields)
- Are domain exceptions used? (`EmployeeNotFoundException`, `DuplicateEmailException`)

## 2. Security
- Is user input validated with `@Valid` at the controller boundary?
- Are there any raw JPQL string concatenations? (parameterized queries only)
- Are sensitive fields (passwords, tokens, PII) protected from logging?
- Does the error response expose stack traces?

## 3. Code Quality
- Are methods longer than 30 lines? (recommend extracting private helpers)
- Is `var` used where the type is not obvious?
- Is there any `System.out.println`? (must use `@Slf4j` logger)
- Is there any `null` returned from service methods? (use `Optional` or throw)

## 4. Testing Gaps
- Are the happy paths and error paths both covered?
- Is the AAA pattern followed in tests?
- Are AssertJ assertions used (not JUnit `assertEquals`)?

## Format

For each issue found:
- **[MUST FIX]** — Blocks merge. Architecture violation or security risk.
- **[SHOULD FIX]** — Degrades quality. Fix before next release.
- **[SUGGESTION]** — Optional improvement.

End with a **Summary** section: overall assessment (Pass / Pass with comments / Needs rework).
