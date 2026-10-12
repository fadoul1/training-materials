---
name: Test rules
description: JUnit 5, Mockito and AssertJ conventions for unit and controller tests in the Employee Service
applyTo: "**/test/**"
---

# Test Rules

- **JUnit 5 + Mockito + AssertJ.** Assert with `assertThat` / `assertThatThrownBy` only — never `assertEquals`, `assertTrue` or `assertThrows`.
- **Naming:** class `{ClassName}Test`; method `should_[expected]_when_[condition]`.
- **AAA:** `// Arrange`, `// Act`, `// Assert` blocks separated by a blank line.
- **Service tests:** `@ExtendWith(MockitoExtension.class)`, `@Mock` every dependency, `@InjectMocks` the implementation. No Spring context.
- **Controller tests:** `@WebMvcTest(EmployeeController.class)` + `@MockitoBean` (Spring Boot 4 removed `@MockBean`).
- Test every **error path**, not only the happy path.

```java
@Test
void should_throw_EmployeeNotFoundException_when_id_not_found() {
    // Arrange
    when(employeeRepository.findById(99L)).thenReturn(Optional.empty());

    // Act + Assert
    assertThatThrownBy(() -> employeeService.findById(99L))
        .isInstanceOf(EmployeeNotFoundException.class)
        .hasMessageContaining("99");
}
```

## Never

- ❌ `@SpringBootTest` for unit tests
- ❌ Mocking entities — mock repositories and mappers
- ❌ `Thread.sleep()` or shared static state