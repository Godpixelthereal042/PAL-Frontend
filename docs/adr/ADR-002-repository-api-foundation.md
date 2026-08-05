# ADR 002: Concrete Repositories, API Response Framework & Pipeline Middleware

**Status**: Accepted  
**Date**: 2026-07-27  
**Governing Bible Chapters**: Chapter 4 (Domain Model & Business Entities), Chapter 23 (Identity & Auth), Chapter 25 (Observability), Chapter 27 (Platform API & DX Architecture), Chapter 28 (DevOps & Infrastructure), Chapter 29 (Architecture Governance)  

---

## Context
Following the completion of Sprint 1A (Foundation Refactor), PAL required concrete database repository implementations (`UserRepository`, `BusinessBrainRepository`, `DecisionRepository`), a standardized API response framework for consistent client responses, request execution middleware for correlation tracing and error mapping, automated test runner configs, and CI/CD pipelines.

---

## Decision
We adopt the **Repository Layer Extension, API Response Standards, Middleware Pipeline & CI/CD Strategy**:

1. **Concrete Repositories (`lib/db/repositories/`)**:
   - `UserRepository`: Encapsulates user entity persistence and lookup (`findByEmail`).
   - `BusinessBrainRepository`: Encapsulates Business Brain knowledge items (`findByCategory`, `upsertBrainItem`).
   - `DecisionRepository`: Encapsulates decision memory and lifecycle updates (`findActiveDecisions`, `updateStatus`).
   - All extend `BaseRepository<T>` to guarantee parameter binding and safety.

2. **Standardized API Response Framework (`lib/core/apiResponse.ts`)**:
   - Provides unified JSON structure: `APIResponse<T>` containing `success: boolean`, `data?: T`, `error?: ErrorDetails`, `meta?: ResponseMetadata`.
   - Propagates Correlation ID on all responses (`X-Correlation-ID`).
   - Standardizes pagination helpers (`buildPaginatedResponse`).

3. **API Middleware Execution Pipeline (`lib/core/apiMiddleware.ts`)**:
   - Wraps Next.js API route handlers to inject correlation context, catch unhandled errors, convert domain exceptions to HTTP responses, and record audit logs.

4. **CI/CD Workflow (`.github/workflows/ci.yml`)**:
   - GitHub Actions pipeline enforcing automated installation, TypeScript compilation, linting, test suite execution, and production build verification.

---

## Consequences

### Positive
- Uniform API contract across all endpoints.
- Type-safe database interactions encapsulated per domain entity.
- Automated CI pipeline catches build/test failures before deployment.

### Negative / Trade-offs
- Requires wrapping route handlers with `withAPIMiddleware`.

---

## Compliance Mapping
- **Bible Chapter 4**: Enforced via domain-specific repositories.
- **Bible Chapter 23 & 25**: Enforced via correlation tracing in `apiMiddleware.ts`.
- **Bible Chapter 27**: Enforced via `APIResponse<T>` contract.
- **Bible Chapter 28**: Enforced via `.github/workflows/ci.yml`.
