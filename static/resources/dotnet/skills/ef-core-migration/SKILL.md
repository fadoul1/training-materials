---
name: ef-core-migration
description: "Manage EF Core migrations for this project: add, apply, rollback, remove. Use when: add migration, EF migration, database schema change, dotnet ef, schema update, update database, apply migration, rollback migration."
argument-hint: "Migration name (e.g. AddDepartmentEntity) — required for 'add'"
---

# EF Core Migration Workflow — Leave Management API

## Prerequisites

```bash
# Verify EF Core tools
dotnet ef --version

# Install if missing
dotnet tool install --global dotnet-ef
```

> ⚠️ **Current project state**: This project uses `Database.EnsureCreatedAsync()` for dev-only schema creation (see `src/LeaveManagement.API/StartupExtensions.cs`). Follow **Step 0** if migrations have not been initialised yet.

---

## Step 0 — First-Time Migration Setup (if not yet using migrations)

If the project is still on `EnsureCreatedAsync()`:

1. Comment out or remove the `Database.EnsureCreatedAsync()` call in `StartupExtensions.cs`
2. Capture the current schema as the initial migration:
```bash
dotnet ef migrations add InitialCreate \
  --project src/LeaveManagement.Infrastructure \
  --startup-project src/LeaveManagement.API
```
3. Apply to a fresh database:
```bash
dotnet ef database update \
  --project src/LeaveManagement.Infrastructure \
  --startup-project src/LeaveManagement.API
```
4. Verify: `src/LeaveManagement.Infrastructure/Migrations/` should now contain `{timestamp}_InitialCreate.cs`

---

## Step 1 — Add a Migration

```bash
dotnet ef migrations add {DescriptiveName} \
  --project src/LeaveManagement.Infrastructure \
  --startup-project src/LeaveManagement.API
```

**Good migration names**: `AddEmployeeSoftDelete`, `AddLeaveStatusIndex`, `AddDepartmentEntityWithForeignKey`

**Bad migration names**: `Migration1`, `FixBug`, `Update20240411`

---

## Step 2 — Review the Generated File

Open `src/LeaveManagement.Infrastructure/Migrations/{timestamp}_{DescriptiveName}.cs` and verify:

- [ ] `Up()` contains only the expected schema changes
- [ ] No unexpected `DROP COLUMN` or `DROP TABLE` (often caused by a rename detected as drop+add)
- [ ] `Down()` is the correct inverse — drops what `Up()` created
- [ ] `BuildTargetModel()` snapshot is consistent with current `ApplicationContext` model

> ❌ **Never edit** `Up()`, `Down()`, or `BuildTargetModel()` manually.

---

## Step 3 — Apply the Migration

```bash
dotnet ef database update \
  --project src/LeaveManagement.Infrastructure \
  --startup-project src/LeaveManagement.API
```

---

## Step 4 — Rollback (if needed)

```bash
# Roll back to a specific previous migration (database only — file stays)
dotnet ef database update {PreviousMigrationName} \
  --project src/LeaveManagement.Infrastructure \
  --startup-project src/LeaveManagement.API
```

---

## Step 5 — Remove Last Migration (unapplied only)

```bash
# Only works if the migration has NOT been applied to any DB
dotnet ef migrations remove \
  --project src/LeaveManagement.Infrastructure \
  --startup-project src/LeaveManagement.API
```

If already applied: rollback via Step 4 first, then remove.

---

## Common Errors

| Error | Cause | Fix |
|-------|-------|-----|
| `No DbContext was found` | EF tools can't locate `ApplicationContext` | Ensure `--project` points to `LeaveManagement.Infrastructure` and `--startup-project` to `LeaveManagement.API` |
| `Unable to create a 'DbContext'` | Missing connection string at design-time | Set `LeaveManagementConnectionString` in `appsettings.Development.json` |
| `The migration '...' has already been applied` | Trying to re-apply | Database is already up to date; no action needed |
| `Column 'X' of relation 'Y' does not exist` | Rollback missed — DB out of sync with model | Run `dotnet ef database update 0` to wipe, then re-apply from scratch (dev only) |
| `Build failed` | Compilation error in Infrastructure project | Run `dotnet build src/LeaveManagement.Infrastructure` and fix errors first |
