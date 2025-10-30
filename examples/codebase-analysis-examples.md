# Codebase Analysis Examples

## Using codebase-analyzer

### Understanding Implementation

```
Use codebase-analyzer to understand how user authentication works
```

**Output Example:**
```
## Analysis: User Authentication

### Overview
Authentication uses JWT tokens with refresh token rotation. Login validates
credentials, generates access/refresh tokens, and stores refresh token in
httpOnly cookie.

### Entry Points
- `api/auth/login.ts:15` - POST /api/auth/login endpoint
- `middleware/auth.ts:8` - Authentication middleware

### Core Implementation

#### 1. Login Flow (`api/auth/login.ts:15-45`)
- Validates email/password at line 18
- Generates JWT access token at line 28
- Creates refresh token at line 31
- Sets httpOnly cookie at line 38

#### 2. Token Validation (`middleware/auth.ts:12-35`)
- Extracts Bearer token from header at line 14
- Verifies JWT signature at line 18
- Checks expiration at line 23
- Attaches user to request at line 30

### Data Flow
1. Request → `api/auth/login.ts:15`
2. Credential validation → `services/auth.ts:42`
3. Token generation → `utils/jwt.ts:8`
4. Cookie setting → `api/auth/login.ts:38`
```

### Tracing Data Flow

```
Use codebase-analyzer to trace how user profile data flows from database to API response
```

**Output Shows:**
- Database query in repository layer
- Data transformation in service layer
- DTO mapping
- Response serialization
- Each step with exact file:line references

### Understanding Error Handling

```
Use codebase-analyzer to understand how API errors are handled and logged
```

**Output Shows:**
- Error catching mechanisms
- Error transformation
- Logging points
- Response formatting
- HTTP status code mapping

## Using codebase-locator

### Finding Components

```
Use codebase-locator to find all authentication middleware
```

**Output:**
- `middleware/auth.ts` - JWT authentication
- `middleware/api-key.ts` - API key validation
- `middleware/rate-limit.ts` - Rate limiting

### Finding Route Handlers

```
Use codebase-locator to find all API routes that handle user data
```

**Output:**
- `api/users/[id].ts` - Get/update user
- `api/users/profile.ts` - User profile
- `api/admin/users.ts` - Admin user management

### Finding Specific Functions

```
Use codebase-locator to find where database connections are initialized
```

**Output:**
- `lib/db.ts:12` - Connection pool setup
- `config/database.ts:8` - Configuration
- `scripts/migrate.ts:5` - Migration connection

## Using codebase-pattern-finder

### Identifying Design Patterns

```
Use codebase-pattern-finder to identify all repository patterns in the codebase
```

**Output:**
- Repository pattern in `repositories/` directory
- Interface definitions
- Implementation classes
- Dependency injection points

### Finding Validation Patterns

```
Use codebase-pattern-finder to identify data validation patterns
```

**Output:**
- Zod schemas in `schemas/` directory
- Validation middleware
- Custom validators
- Error handling patterns

### Architecture Discovery

```
Use codebase-pattern-finder to identify the overall architecture pattern
```

**Output:**
- Layered architecture (API → Service → Repository → Database)
- Dependency injection via constructor
- Factory pattern for service creation
- Middleware chain pattern

## Combined Analysis Workflow

### Understanding a Feature End-to-End

```bash
# 1. Locate components
Use codebase-locator to find all payment-related files

# 2. Find patterns
Use codebase-pattern-finder to identify payment processing patterns

# 3. Deep analysis
Use codebase-analyzer to understand how payment validation and processing works
```

### Debugging Workflow

```bash
# 1. Locate error source
Use codebase-locator to find all error handling in checkout flow

# 2. Trace execution
Use codebase-analyzer to trace the checkout flow from cart to order confirmation

# 3. Identify root cause
Use codebase-analyzer to understand how the inventory check works
```

### Refactoring Preparation

```bash
# 1. Identify current patterns
Use codebase-pattern-finder to identify all API client implementations

# 2. Analyze implementation
Use codebase-analyzer to understand how the API client manages requests and responses

# 3. Locate all usages
Use codebase-locator to find all files that import the API client
```

## Tips for Effective Analysis

### Be Specific About What to Analyze

❌ **Too broad:**
```
Use codebase-analyzer to analyze the codebase
```

✅ **Specific:**
```
Use codebase-analyzer to understand how webhooks are validated and processed
```

### Combine Agents for Complete Understanding

1. **Locate** first (codebase-locator)
2. **Find patterns** (codebase-pattern-finder)
3. **Deep dive** (codebase-analyzer)

### Focus on Specific Questions

Good questions for analysis:
- "How does X feature work?"
- "Where is Y data transformed?"
- "How are Z errors handled?"
- "What happens when user does X?"
- "How is data validated before saving?"

## Output Usage

### For Documentation

Use analysis output to:
- Write technical documentation
- Create architecture diagrams
- Document API flows
- Explain complex logic

### For Planning

Use analysis to inform:
- Refactoring plans
- Bug fix approaches
- Feature implementations
- Performance optimizations

### For Onboarding

Use analysis to help new team members understand:
- How features work
- Where to make changes
- Project architecture
- Code conventions
