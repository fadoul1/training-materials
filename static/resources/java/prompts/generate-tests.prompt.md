---
name: generate-tests
description: Generate JUnit 5 unit tests for a service or controller class
agent: agent
model: claude-sonnet-4-5
tools: ["editFiles", "createFile"]
---

# Generate Unit Tests — Employee Service

Generate a complete JUnit 5 test class for: **${input:className}** (e.g. `EmployeeServiceImpl`, `EmployeeController`)

## Step 1 — Analyse the Class

Read the source file and identify:
- All public methods
- All injected dependencies (to mock)
- All happy paths (valid inputs → expected output)
- All error paths (invalid/missing data → expected exception)
- All edge cases (empty list, boundary values, null handling)

## Step 2 — Generate the Test Class

### Class Setup
- Annotate with `@ExtendWith(MockitoExtension.class)` for service tests
- Use `@WebMvcTest` + `MockMvc` for controller tests
- Declare `@Mock` for every dependency
- Use `@InjectMocks` to instantiate the class under test

### Test Methods — One scenario per method
Follow the naming convention: `should_[expected]_when_[condition]`

```java
@Test
void should_return_employee_when_valid_id() {
    // Arrange
    Employee employee = Employee.builder()
        .id(1L)
        .firstName("John")
        .lastName("Doe")
        .email("john.doe@accenture.com")
        .build();
    when(employeeRepository.findById(1L)).thenReturn(Optional.of(employee));

    // Act
    EmployeeResponse result = employeeService.findById(1L);

    // Assert
    assertThat(result.getId()).isEqualTo(1L);
    assertThat(result.getEmail()).isEqualTo("john.doe@accenture.com");
}
```

### Mandatory Scenarios to Cover
1. **Happy path** — valid input, successful response
2. **Not found** — `EmployeeNotFoundException` is thrown with correct message
3. **Duplicate** — `DuplicateEmailException` is thrown when email already exists
4. **Validation** — invalid input is rejected at the controller level

## Step 3 — Place the File

Place the generated test class at:
`employee-service/src/test/java/com/accenture/employee/{package}/{ClassName}Test.java`

## Constraints
- Use **AssertJ** only (`assertThat`). Never `assertEquals`.
- Use **Mockito** for mocking. Never instantiate real dependencies.
- Follow the AAA pattern with blank lines between Arrange / Act / Assert.
- Import only what is needed — no wildcard imports.
