---
applyTo: "**/test/**"
---

# Test-Specific Rules — Employee Service
> Demonstrates **Primitive 2: File-Based Instructions** (activated only when editing test files)

## Test Framework Stack
- **JUnit 5** — `@Test`, `@ExtendWith(MockitoExtension.class)`, `@SpringBootTest`
- **Mockito** — `when()`, `verify()`, `@Mock`, `@InjectMocks`
- **AssertJ** — `assertThat()` for all assertions. NEVER use `assertEquals()` or `assertTrue()`.
- **Spring Boot Test** — `@SpringBootTest`, `@WebMvcTest`, `@DataJpaTest`

## Naming Conventions

| What | Convention | Example |
|------|-----------|---------|
| Test class | `{ClassName}Test` | `EmployeeServiceTest` |
| Integration test | `{ClassName}IT` | `EmployeeControllerIT` |
| Test method | `should_[expected]_when_[condition]` | `should_throw_404_when_employee_not_found` |

## Mandatory Test Structure (AAA Pattern)

Every test method MUST follow Arrange–Act–Assert with blank lines separating the three blocks:

```java
@Test
void should_return_employee_when_valid_id() {
    // Arrange
    Employee employee = Employee.builder().id(1L).email("john.doe@accenture.com").build();
    when(employeeRepository.findById(1L)).thenReturn(Optional.of(employee));

    // Act
    EmployeeResponse result = employeeService.findById(1L);

    // Assert
    assertThat(result.getId()).isEqualTo(1L);
    assertThat(result.getEmail()).isEqualTo("john.doe@accenture.com");
}
```

## Unit Test Rules (Service Layer)

```java
// ✅ Correct: Mockito extension, constructor injection mocks
@ExtendWith(MockitoExtension.class)
class EmployeeServiceTest {

    @Mock
    private EmployeeRepository employeeRepository;

    @Mock
    private EmployeeMapper employeeMapper;

    @InjectMocks
    private EmployeeServiceImpl employeeService;
}
```

- Mock **all** dependencies — never instantiate real implementations.
- Verify interactions with `verify(mock).method(...)` when side-effect matters.
- Use `@Captor` ArgumentCaptor to inspect arguments passed to mocks.

## Controller Tests (WebMvc Slice)

```java
// ✅ Correct: WebMvcTest slice for controller-only tests
@WebMvcTest(EmployeeController.class)
class EmployeeControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private EmployeeService employeeService;

    @Test
    void should_return_201_when_valid_request() throws Exception {
        // Arrange
        EmployeeRequest request = new EmployeeRequest("John", "Doe", "john.doe@accenture.com", "ENGINEER");
        EmployeeResponse response = new EmployeeResponse(1L, "John", "Doe", "john.doe@accenture.com", "ENGINEER");
        when(employeeService.create(any())).thenReturn(response);

        // Act + Assert
        mockMvc.perform(post("/api/employees")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
            .andExpect(status().isCreated())
            .andExpect(jsonPath("$.id").value(1L))
            .andExpect(jsonPath("$.email").value("john.doe@accenture.com"));
    }
}
```

## Exception / Error Path Tests

Always test the error paths — not just happy paths:

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

## What NOT to Do in Tests

- ❌ Never use `assertEquals` — use `assertThat(...).isEqualTo(...)`
- ❌ Never use `@SpringBootTest` for unit tests — only for integration tests
- ❌ Never mock entities — mock repositories instead
- ❌ Never test Spring internals (dependency injection, bean loading)
- ❌ Never use `Thread.sleep()` — use mocks for async behavior
- ❌ Never share test state through static fields
- ❌ Never ignore test failures with empty catch blocks
