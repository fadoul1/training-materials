# Project Guidelines — Employee Service

Java 21 / Spring Boot 4 REST microservice that manages employees.

- `employee-service` — business logic library (service, repository, mapper, DTOs, entities)
- `employee-launcher` — Spring Boot application, Flyway migrations, `GlobalExceptionHandler`, OpenAPI spec

## Tech Stack

- Java 21 (records, pattern matching), Spring Boot 4 (Web, Data JPA, Validation), Maven multi-module
- MySQL in production with Flyway; H2 in memory for the `local` profile (port 8085, Flyway disabled)
- MapStruct for mapping, Lombok (`@RequiredArgsConstructor`, `@Builder`, `@Slf4j`)
- JUnit 5, Mockito, AssertJ (test rules: `.github/instructions/tests.instructions.md`)

## Architecture

Strict n-tier: **Controller → Service interface → Service impl → Repository → Entity**. Never skip a layer.

- **Controllers:** HTTP mapping only. No business logic, no repository access, no `@Transactional`, no try/catch.
- **Services:** business logic behind an interface (`EmployeeService` + `impl/EmployeeServiceImpl`).
- **DTOs:** the only types in the API. **Never expose entities.**
- **Mappers:** MapStruct only — no manual mapping.

```java
// ✅ Controller delegates, returns a DTO
@PostMapping
public ResponseEntity<EmployeeResponse> create(@Valid @RequestBody EmployeeRequest request) {
    return ResponseEntity.status(HttpStatus.CREATED).body(employeeService.create(request));
}

// ❌ Entity exposed, logic in the controller
@PostMapping
public EmployeeEntity create(@RequestBody EmployeeRequest request) {
    if (employeeRepository.existsByEmail(request.email())) { ... }
}
```

## Coding Standards

- Constructor injection only (`@RequiredArgsConstructor`). Never `@Autowired` on fields.
- Methods ≤ 30 lines in services and controllers; extract private helpers.
- Throw domain exceptions: `EmployeeNotFoundException` → 404, `DuplicateEmailException` → 409. Never `RuntimeException`, never `Optional.get()`.
- Validate at the controller boundary with `@Valid`; constraints live on DTO fields.
- `@Slf4j` logging: `info` for incoming requests, `debug` for internal steps, `error` for exceptions.

## Security

- **Never** log passwords, tokens, or sensitive PII fields.
- Parameterized queries only — never concatenate JPQL.
- No stack traces in API error responses.
- Never commit secrets; use environment variables.

## Database & Migrations

- Every schema change is a new Flyway migration in `employee-launcher/src/main/resources/db/migration/`, named `V{n}__{description}.sql`.
- **Never alter an existing migration file** — create the next `V{n}` instead.
- `snake_case` for tables and columns.

## Do Not

- ❌ Wildcard imports (`import ...*;`)
- ❌ `var` where the type is not obvious
- ❌ `System.out.println` — use the logger
- ❌ Returning `null` from a service — use `Optional` or throw
- ❌ Lombok `@Data` on JPA entities

## Why These Rules Exist

- **MapStruct:** manual mapping caused production bugs when new DTO fields were not copied. MapStruct fails at compile time.
- **No entity exposure:** entities are the database schema; exposing them makes every schema change a breaking API change.
- **Never alter migrations:** an edited migration breaks Flyway checksums in every environment where it was already applied.