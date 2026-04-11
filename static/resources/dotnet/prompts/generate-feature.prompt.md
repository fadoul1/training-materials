---
name: generate-feature
description: "Scaffold a complete CQRS feature (Command + Handler + Validator OR Query + Handler + Validator) following the Leave Management project conventions"
mode: agent
model: gpt-4o
---

Scaffold a complete CQRS feature for this project. I need:

- **Entity name**: ${input:entityName:e.g. Leave, Employee, Department}
- **Feature type**: ${input:featureType:Command|Query}
- **Operation**: ${input:operation:e.g. Create, Update, Delete, Approve, GetById, GetList}

## What to Generate

### 1. Feature Folder
Create: `src/LeaveManagement.Application/Features/${entityName}s/${featureType}s/${operation}${entityName}/`

### 2. ${operation}${entityName}${featureType}.cs
```csharp
public class ${operation}${entityName}${featureType} : IRequest<BaseResponse>
{
    // Required input properties — use `required` + `init`-only
    public required Guid Id { get; init; }  // adjust to the operation
}
```

For **Query** types, return `${entityName}Response` or `IReadOnlyList<${entityName}Response>` instead of `BaseResponse`.

### 3. ${operation}${entityName}Handler.cs
Follow the handler conventions from `.github/instructions/handlers.instructions.md`:
- `partial class` with primary constructor
- Inject `IValidator<${operation}${entityName}${featureType}>` + `I${entityName}Repository`
- Validate FIRST, return `BaseResponse { Success = false }` on failure
- Use `[LoggerMessage]` partial method for success log
- Use mapper: `request.To${entityName}()` or `entity.To${entityName}Response()`

### 4. ${operation}${entityName}Validator.cs
```csharp
public class ${operation}${entityName}Validator : AbstractValidator<${operation}${entityName}${featureType}>
{
    public ${operation}${entityName}Validator()
    {
        // Add RuleFor() for each required property
        RuleFor(x => x.Id).NotEmpty();
    }
}
```

### 5. Mapper Extension (if new mapping needed)
Add to `src/LeaveManagement.Application/Mappers/${entityName}Mapper.cs`:
```csharp
public static ${entityName} To${entityName}(this ${operation}${entityName}${featureType} command)
    => new() { /* map properties */ };
```

### 6. Unit Test Stubs
Create `tests/LeaveManagement.Application.UnitTests/Features/${entityName}s/${operation}${entityName}HandlerTests.cs`:

```csharp
public class ${operation}${entityName}HandlerTests
{
    [Fact]
    public async Task Handle_Valid${featureType}_ReturnsSuccess()
    {
        // Arrange
        // Act
        // Assert — result.Success.Should().BeTrue();
    }

    [Fact]
    public async Task Handle_Invalid${featureType}_ReturnsFailure()
    {
        // Arrange — invalid/empty required field
        // Act
        // Assert — result.Success.Should().BeFalse();
    }
}
```

## Conventions to Enforce
- Primary constructor on handler class (must be `partial`)
- `CancellationToken cancellationToken` on all async calls
- No inline entity construction in handler — use mapper extension methods
- Validate before any repository call
- Return `BaseResponse`, never throw `ValidationException`
