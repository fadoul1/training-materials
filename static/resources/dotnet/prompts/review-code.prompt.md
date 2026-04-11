---
name: review-code
description: "Perform a structured .NET code review checking Clean Architecture boundaries, C# 14 idioms, security, EF Core patterns, and test coverage"
mode: ask
model: gpt-4o
---

Review the currently open file (or the file I specify) against the project's standards defined in `.github/copilot-instructions.md`.

Produce a review table with this exact format:

| File / Location | Issue | Severity | Suggested Fix |
|-----------------|-------|----------|---------------|

Severity levels: **Critical** (security/data loss), **Major** (architecture violation), **Minor** (style/idiom), **Info** (suggestion).

Check for these categories in order:

### 1. Clean Architecture Boundaries
- Does `Application` directly reference `LeaveManagement.Infrastructure` types? → Major
- Does `Domain` reference `Application` or `Infrastructure`? → Major
- Is `ApplicationContext` injected into a handler? → Major (use `IBaseRepository<T>` instead)

### 2. C# 14 / .NET 10 Idioms
- Traditional constructor (`private readonly` + `this.x = x`) instead of primary constructor? → Minor
- `new List<T>()` instead of collection expression `[]`? → Minor
- Nullable reference type warnings suppressed with `!` without explanation? → Minor

### 3. CQRS / Handler Pattern
- Does a handler throw `ValidationException` instead of returning `BaseResponse { Success = false }`? → Major
- Is inline entity mapping in a handler (instead of extension method in `Mappers/`)? → Minor
- Does the handler call `validator.ValidateAsync` before any business logic? → Major if missing

### 4. Logging Standards
- String interpolation in `_logger.LogXxx($"...")` calls? → Major (use `[LoggerMessage]` partial methods)
- Does the handler class have `partial` modifier for `[LoggerMessage]` generation? → Minor if missing

### 5. Security
- Hardcoded connection string or secret? → Critical
- `ExecuteSqlRaw()` with user-supplied values? → Critical
- PII (name, email) included in log messages? → Major

### 6. EF Core Conventions
- `dbContext.Remove(entity)` instead of setting `DeletedAt`? → Critical (destroys audit trail)
- Raw `DELETE` SQL bypassing soft-delete? → Critical
- Manual `CreatedAt`/`UpdatedAt` setting instead of relying on `ApplicationContext`? → Minor
- N+1 query risk (missing `.Include()` in related-entity queries)? → Major

### 7. Test Coverage
- Is every public handler `Handle` method covered by at least one `[Fact]`? → Info if missing
- Are tests using `Assert.True(x == y)` instead of FluentAssertions? → Minor
- Are tests following `MethodName_StateUnderTest_ExpectedBehaviour` naming? → Minor if not

After the table, provide a **summary** (2-3 sentences) with the most important finding and overall assessment.
