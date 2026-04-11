# Leave Management API — Copilot Instructions

## Project Overview
This is a .NET 10 ASP.NET Core Web API for managing employee leave requests. It follows Clean Architecture with CQRS via MediatR.

## Tech Stack
- .NET 10, ASP.NET Core, C# 14
- MediatR for CQRS (Commands / Queries / Handlers)
- FluentValidation for input validation
- EF Core with PostgreSQL
- xUnit + FluentAssertions + NSubstitute for unit testing
- Reqnroll for BDD integration testing
- Scalar for API documentation (replaces Swashbuckle)

## Architecture & Layering (Clean Architecture)
- **API** → **Application** → **Domain** ← **Infrastructure**
- Application layer must NOT reference Infrastructure
- Handlers contain business logic — controllers only dispatch via `_mediator.Send()`
- Use `BaseResponse` pattern — never throw exceptions for business failures

## C# 14 & .NET 10 Conventions
- Use **primary constructors** — no traditional constructor bodies
- Use **collection expressions** (`[1, 2, 3]`) where applicable
- Enable `<Nullable>enable</Nullable>` — no nullable warnings ignored
- Use `[LoggerMessage]` source-generated logging — never string interpolation in log calls

## CQRS & MediatR Conventions
- Commands for writes, Queries for reads
- Handler naming: `Create{Entity}Handler`, `Get{Entity}ByIdHandler`
- Validation runs before handler logic via `IPipelineBehavior`
- `CancellationToken` must be passed through every async call

## EF Core Conventions
- Soft deletes with `DeletedAt` property — never hard delete
- Audit timestamps: `CreatedAt`, `UpdatedAt` on all entities
- Never hand-edit generated migration files

## Security Requirements
- Never log PII (email, full name) — log entity ID only
- Connection strings from environment variables — never hardcoded
- No `ExecuteSqlRaw()` with unsanitised input

## What NOT to Do
- ❌ Traditional constructor bodies (use primary constructors)
- ❌ `Assert.Equal()` in tests (use FluentAssertions)
- ❌ String interpolation in logger calls (use `[LoggerMessage]`)
- ❌ Direct `DbContext` usage in handlers (use repository abstractions)
- ❌ `AllowAny*` CORS in non-development environments
