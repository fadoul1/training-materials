# Employee Service — Copilot Instructions

## Project Overview
This is a Java 21 Spring Boot REST API for managing employees. It follows an n-tier architecture with strict layering rules.

## Tech Stack
- Java 21, Spring Boot 3.x, Spring Data JPA, PostgreSQL
- MapStruct for Entity ↔ DTO mapping
- Flyway for database migrations
- JUnit 5 + Mockito + AssertJ for testing
- Lombok for boilerplate reduction (`@Slf4j`, `@RequiredArgsConstructor`)

## Architecture & Layering Rules
- **Controller** → **Service** → **Repository** (strict direction, no skipping layers)
- Controllers never access repositories directly
- Services never return entities — always DTOs via MapStruct
- Repositories are Spring Data interfaces — no custom SQL unless absolutely necessary

## Coding Standards
- Constructor injection only — `@Autowired` on fields is forbidden
- Use `@RequiredArgsConstructor` from Lombok for injection
- Exception hierarchy: `EmployeeNotFoundException` → 404, `DuplicateEmailException` → 409
- Use `@Slf4j` for logging — never `System.out.println`

## Security Requirements
- Never log PII (email, full name) — log employee ID only
- Always use parameterized queries — never concatenate SQL strings
- Never expose entity internals in API responses — use DTOs

## Testing Requirements
- JUnit 5 + Mockito + AssertJ (no JUnit 4, no Hamcrest)
- Method naming: `should_[expected]_when_[condition]`
- AAA pattern with blank lines between Arrange / Act / Assert
- Unit tests use `@ExtendWith(MockitoExtension.class)`, not `@SpringBootTest`

## What NOT to Do
- ❌ `@Autowired` field injection
- ❌ Return entities from controllers
- ❌ Business logic in controllers
- ❌ `@Transactional` on controllers
- ❌ Magic strings or hardcoded values
- ❌ Catching exceptions in controllers (use `@ControllerAdvice`)
