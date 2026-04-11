---
name: run-and-fix-tests
description: "Run dotnet test for this project, parse failures, diagnose root causes, and suggest fixes. Use when: run tests, fix failing tests, test output, dotnet test error, xUnit failure, Reqnroll failure, integration test crash."
argument-hint: "Optional: 'unit', 'integration', or a test class name filter"
---

# Run and Fix Tests — Leave Management API

## Step 1 — Choose Test Suite

| Suite | Command | Requirement |
|-------|---------|-------------|
| Unit tests (fast) | `dotnet test tests/LeaveManagement.Application.UnitTests --no-build --verbosity normal` | None |
| Integration tests (Docker) | `dotnet test tests/LeaveManagement.API.IntegrationTests --no-build --verbosity normal` | Docker running |
| Single test class | `dotnet test --filter "FullyQualifiedName~{TestClassName}" --verbosity normal` | Build must be current |

Run the appropriate command. If the build is stale, drop `--no-build`.

## Step 2 — Parse the Output

Look for these patterns in test output:

| Error pattern | Likely cause | Fix |
|---------------|-------------|-----|
| `System.InvalidOperationException: Unable to resolve service for type 'I...Repository'` | Missing DI registration | Add `services.AddScoped<I...Repository, ...Repository>()` to `InfrastructureServicesRegistration.cs` |
| `System.InvalidOperationException: Unable to resolve service for type 'IValidator<...>'` | Validator not registered | Check `ApplicationServiceRegistration.cs` — FluentValidation scan must include the feature assembly |
| `Npgsql.NpgsqlException: Connection refused` / `Docker unavailable` | Docker not running | Start Docker Desktop, re-run integration tests |
| `FluentValidation.ValidationException` | Test data fails validation rules | Fix Arrange section — use valid test data matching the validator rules |
| `Microsoft.EntityFrameworkCore.DbUpdateException: violates not-null constraint` | Entity config mismatch | Check `ApplicationContext.OnModelCreating` for required column config |
| `Reqnroll.TestRunnerManager: BDD step not found` | Missing step definition | Scaffold the step in `tests/LeaveManagement.API.IntegrationTests/StepDefinitions/` |
| `Respawn.RespawnException` | Respawn can't reset DB | Verify PostgreSQL connection string in `DatabaseHook.cs` matches Testcontainers container |
| `System.AggregateException: One or more errors occurred. (The Docker daemon is not running)` | Docker daemon stopped | Start Docker Desktop |
| `Xunit.Sdk.EqualException` | Value mismatch | Switch to FluentAssertions: `result.Should().Be(expected)` for better failure messages |

## Step 3 — Re-Run After Fix

After applying a fix, re-run only the failing test to confirm:

```bash
dotnet test --filter "FullyQualifiedName~{FailingTestMethod}" --verbosity normal
```

Then run the full suite to confirm no regressions:

```bash
dotnet test tests/LeaveManagement.Application.UnitTests --no-build
dotnet test tests/LeaveManagement.API.IntegrationTests --no-build   # if Docker running
```

## Step 4 — Common Quick Fixes

### Missing DI Registration
```csharp
// In src/LeaveManagement.Infrastructure/InfrastructureServicesRegistration.cs
services.AddScoped<IEmployeeRepository, EmployeeRepository>();

// In src/LeaveManagement.Application/ApplicationServiceRegistration.cs
services.AddValidatorsFromAssembly(Assembly.GetExecutingAssembly());
```

### Test NullReferenceException in Mock Setup
```csharp
// ✅ Correct — return a concrete object
mockRepo.GetByIdAsync(Arg.Any<Guid>(), Arg.Any<CancellationToken>())
        .Returns(new Employee { Id = Guid.NewGuid(), Name = "Test User" });

// ❌ Incorrect — returns null, handler will throw
mockRepo.GetByIdAsync(default, default).Returns((Employee?)null);
```

### Integration Test — DatabaseHook Identity Sequence
The `DatabaseHook` resets identity sequences manually after Respawn. If you add a new table with a SERIAL/IDENTITY column, add the sequence reset in `DatabaseHook.cs`:
```sql
ALTER SEQUENCE public."YourTable_Id_seq" RESTART WITH 1;
```
