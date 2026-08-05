# ADR 001: Adoption of 9-Layer Downward Architecture & Core Infrastructure Framework

**Status**: Accepted  
**Date**: 2026-07-26  
**Governing Bible Chapters**: Chapter 3 (Layered Architecture), Chapter 23 (Identity & Security), Chapter 25 (Observability), Chapter 27 (API Standards), Chapter 28 (Infrastructure), Chapter 29 (Architecture Governance)  

---

## Context
PAL is an AI-Native Executive Operating System requiring strict decoupling, high maintainability, enterprise security, and auditability. The existing codebase contained flat directory structures (`lib/`), scattered environment variables, unstandardized logging (`console.error`), and direct SQL queries without parameter safety wrappers.

To ensure long-term architectural stability, PAL must enforce a strict multi-layer architectural hierarchy where dependencies flow strictly downwards.

---

## Decision
We adopt the **9-Layer Downward Architectural Hierarchy** and establish the **Core Infrastructure Framework** in `lib/core` and `lib/db`:

1. **Strict Downward Layer Dependencies**:
   - `L1: Founder Experience UI` -> `L2: AI COO Facade` -> `L3: Executive Agents` -> `L4: Executive Intelligence` -> `L5: Platform Services` -> `L6: Executive Memory` -> `L7: Enterprise Connectivity` -> `L8: Plugin Platform` -> `L9: Infrastructure & Security`
   - Cross-layer cyclic dependencies or upward calls are explicitly forbidden.

2. **Core Infrastructure Modules**:
   - **`lib/core/config.ts`**: Type-safe, validated environment configuration enforcing runtime contract checks at boot (Bible Ch. 23, 28).
   - **`lib/core/logger.ts`**: Structured `PALLogger` supporting log levels (`DEBUG`, `INFO`, `WARN`, `ERROR`), Correlation ID context propagation, and structured JSON output (Bible Ch. 25).
   - **`lib/core/errors.ts`**: Unified exception hierarchy (`PALError`, `NotFoundError`, `UnauthorizedError`, `ValidationError`, `GovernanceError`, `RateLimitError`) with HTTP status mapping (Bible Ch. 27).
   - **`lib/db/baseRepository.ts`**: Abstract `BaseRepository<T>` pattern wrapping database interactions with type safety, parameter binding, and query tracing (Bible Ch. 4, 28).

---

## Consequences

### Positive
- Strict separation of concerns across 9 architectural layers.
- Centralized type-safe environment configuration prevents silent misconfiguration bugs.
- Structured logging with Correlation IDs enables end-to-end request tracing across AI COO, agents, and storage.
- Repository pattern insulates domain logic from database drivers (SQLite / Supabase).

### Negative / Trade-offs
- Slight initial boilerplate overhead for repositories and typed error handling.

---

## Compliance Mapping
- **Bible Chapter 3**: Enforced via 9-layer directory structure.
- **Bible Chapter 23 & 28**: Enforced via `lib/core/config.ts`.
- **Bible Chapter 25**: Enforced via `lib/core/logger.ts`.
- **Bible Chapter 27**: Enforced via `lib/core/errors.ts`.
- **Bible Chapter 4 & 28**: Enforced via `lib/db/baseRepository.ts`.
