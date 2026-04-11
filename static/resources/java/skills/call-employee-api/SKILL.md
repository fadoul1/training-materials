---
name: call-employee-api
description: Make HTTP calls to the Employee REST API (create, find, update, delete employees). Use when the user wants to test the API, send a request to the employee service, call an endpoint manually, or demonstrate the API behaviour.
metadata:
  author: accenture-training
  version: "1.0"
---

# HTTP Client — Employee Service API

## When to Use This Skill

Use this skill when:
- User wants to call the Employee REST API
- User asks to test an endpoint (create / get / update / delete)
- User wants to see an example HTTP request/response
- User mentions "curl", "HTTPie", "call the API", or "test the endpoint"

## Prerequisites

- The application is running locally (`mvn spring-boot:run -pl employee-launcher`)
- Default base URL: `http://localhost:8080`
- Check health: `curl -s http://localhost:8080/actuator/health`

## Base URL

```
http://localhost:8080/api/employees
```

## Endpoints

### Create Employee — POST /api/employees

```bash
curl -s -X POST http://localhost:8080/api/employees \
  -H "Content-Type: application/json" \
  -d '{
    "firstName": "Jane",
    "lastName": "Doe",
    "email": "jane.doe@accenture.com",
    "jobTitle": "ENGINEER"
  }' | jq .
```

Expected response — `201 Created`:
```json
{
  "id": 1,
  "firstName": "Jane",
  "lastName": "Doe",
  "email": "jane.doe@accenture.com",
  "jobTitle": "ENGINEER",
  "createdAt": "2026-04-10T10:00:00"
}
```

### Get Employee by ID — GET /api/employees/{id}

```bash
curl -s http://localhost:8080/api/employees/1 | jq .
```

Expected response — `200 OK`:
```json
{
  "id": 1,
  "firstName": "Jane",
  "lastName": "Doe",
  "email": "jane.doe@accenture.com",
  "jobTitle": "ENGINEER"
}
```

### List All Employees — GET /api/employees (paginated)

```bash
curl -s "http://localhost:8080/api/employees?page=0&size=10&sortBy=createdAt&direction=asc" | jq .
```

### Update Employee — PUT /api/employees/{id}

```bash
curl -s -X PUT http://localhost:8080/api/employees/1 \
  -H "Content-Type: application/json" \
  -d '{
    "firstName": "Jane",
    "lastName": "Smith",
    "email": "jane.smith@accenture.com",
    "jobTitle": "SENIOR_ENGINEER"
  }' | jq .
```

### Delete Employee — DELETE /api/employees/{id}

```bash
curl -s -X DELETE http://localhost:8080/api/employees/1 -w "%{http_code}"
```

Expected: `204 No Content`

## Error Responses

| Scenario | Status | Body |
|----------|--------|------|
| Employee not found | 404 | `{"error": "Employee not found", "id": 99}` |
| Duplicate email | 409 | `{"error": "Email already in use"}` |
| Validation error | 400 | `{"errors": ["email must be a valid email"]}` |

## HTTPie Alternative (if installed)

```bash
# Create
http POST :8080/api/employees firstName=Jane lastName=Doe email=jane.doe@accenture.com jobTitle=ENGINEER

# Get
http GET :8080/api/employees/1

# List
http GET :8080/api/employees page==0 size==10
```

## Diagnosing Errors

1. If `Connection refused` → the service is not running. Start with `mvn spring-boot:run -pl employee-launcher`
2. If `400 Bad Request` → check the request body against the OpenAPI spec at `http://localhost:8080/swagger-ui.html`
3. If `404 Not Found` → ensure the employee ID exists. List all with `GET /api/employees`
4. If `409 Conflict` → the email is already used. Use a different email address.