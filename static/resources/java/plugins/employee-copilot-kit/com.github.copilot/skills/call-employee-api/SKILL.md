---
name: call-employee-api
description: Make HTTP calls to the Employee REST API (create, find, update, delete employees). Use when the user wants to test the API, send a request to the employee service, call an endpoint manually, or demonstrate the API behaviour.
metadata:
  author: accenture-training
  version: "1.1"
---

# HTTP Client — Employee Service API

## When to Use This Skill

Use this skill when:
- User wants to call the Employee REST API
- User asks to test an endpoint (create / get / update / delete)
- User wants to see an example HTTP request/response
- User mentions "curl", "HTTPie", "call the API", or "test the endpoint"

## Prerequisites

- The application is running locally with the `local` profile (in-memory H2, no external DB needed):
  `mvn spring-boot:run -pl employee-launcher -Dspring-boot.run.profiles=local`
- Default base URL: `http://localhost:8085` (set by `server.port` in `application-local.yaml`)
- Check health: `curl -s http://localhost:8085/actuator/health`
- The `local` profile disables Flyway, so the sample data from `V2__insert_sample_employees.sql` is **not** loaded — create employees first.

## Base URL

```
http://localhost:8085/api/employees
```

## Request body

All write endpoints take an `EmployeeRequest` — every field is required:

| Field | Type | Validation |
|-------|------|-----------|
| `firstName` | string | `@NotBlank` |
| `lastName` | string | `@NotBlank` |
| `email` | string | `@NotBlank @Email`, must be unique |
| `phoneNumber` | string | `@NotBlank` |
| `department` | enum | `HR`, `IT`, `FINANCE`, `OPERATIONS`, `MARKETING`, `LEGAL` |

## Endpoints

### Create Employee — POST /api/employees

```bash
curl -s -X POST http://localhost:8085/api/employees \
  -H "Content-Type: application/json" \
  -d '{
    "firstName": "Jane",
    "lastName": "Doe",
    "email": "jane.doe@accenture.com",
    "phoneNumber": "+33-6-1234-5678",
    "department": "IT"
  }' | jq .
```

Expected response — `201 Created`:
```json
{
  "employeeId": 1,
  "firstName": "Jane",
  "lastName": "Doe",
  "phoneNumber": "+33-6-1234-5678",
  "email": "jane.doe@accenture.com",
  "department": "IT",
  "createdAt": "2026-04-10T10:00:00"
}
```

### Get Employee by ID — GET /api/employees/{id}

```bash
curl -s http://localhost:8085/api/employees/1 | jq .
```

Expected response — `200 OK` with the same `EmployeeResponse` shape as above.

### List All Employees — GET /api/employees (paginated)

```bash
curl -s "http://localhost:8085/api/employees?page=0&size=10&sortBy=createdAt&direction=asc" | jq .
```

`size` must be between 1 and 100.

### Update Employee — PUT /api/employees/{id}

```bash
curl -s -X PUT http://localhost:8085/api/employees/1 \
  -H "Content-Type: application/json" \
  -d '{
    "firstName": "Jane",
    "lastName": "Smith",
    "email": "jane.smith@accenture.com",
    "phoneNumber": "+33-6-1234-5678",
    "department": "FINANCE"
  }' | jq .
```

### Delete Employee — DELETE /api/employees/{id}

```bash
curl -s -X DELETE http://localhost:8085/api/employees/1 -w "%{http_code}"
```

Expected: `204 No Content`

## Error Responses

Errors are produced by `GlobalExceptionHandler`:

| Scenario | Status | Exception |
|----------|--------|-----------|
| Employee not found | 404 | `EmployeeNotFoundException` |
| Duplicate email | 409 | `DuplicateEmailException` |
| Validation error | 400 | Bean Validation (`@Valid`) |

## HTTPie Alternative (if installed)

```bash
# Create
http POST :8085/api/employees firstName=Jane lastName=Doe email=jane.doe@accenture.com phoneNumber=+33-6-1234-5678 department=IT

# Get
http GET :8085/api/employees/1

# List
http GET :8085/api/employees page==0 size==10
```

## Diagnosing Errors

1. If `Connection refused` → the service is not running. Start with `mvn spring-boot:run -pl employee-launcher -Dspring-boot.run.profiles=local`
2. If `400 Bad Request` → check the body against the `EmployeeRequest` table above (all five fields are required, `department` must be a valid enum value)
3. If `404 Not Found` → ensure the employee ID exists. List all with `GET /api/employees`
4. If `409 Conflict` → the email is already used. Use a different email address.