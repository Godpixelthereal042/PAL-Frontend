# 📐 PAL-ARCH-DOC-029: Universal Event Streaming & Real-Time Sync Architecture

**Governing Specification**: PAL-TDD-004 Part 4 (Sprint 5 Milestone 4)  
**Status**: APPROVED ARCHITECTURE SPECIFICATION  
**Component Scope**: `EventStreamEngine`, `EventNormalizer`, `WebhookVerifier`, `universalEventTypes`

---

## 1. Subsystem Overview

The **Universal Event Streaming Subsystem** acts as PAL's central nervous system. It receives external SaaS webhooks, verifies HMAC signatures, normalizes provider-specific payloads into standard PAL Events (`PalEvent`), persists event streams for replayability, and routes events into the Executive Event Bus, Adaptive Memory Engine, Decision Engine, and Executive Command Center.

```text
External Webhook / Stream
     │
     ▼
WebhookVerifier (HMAC Verification & Security Audit)
     │
     ▼
EventNormalizer (Raw Payload ➔ Universal PalEvent with Correlation & Causation IDs)
     │
     ▼
EventStreamEngine (Persistence, Event Replay, Domain Classification)
     │
     ▼
Executive Event Bus ➔ Executive Memory ➔ Decision Engine ➔ Executive Command Center
```

---

## 2. Universal PAL Event Schema (`PalEvent`)

```typescript
export type PalEventClassification =
    | "FinancialEvent"
    | "CommunicationEvent"
    | "EngineeringEvent"
    | "CRMEvent"
    | "SchedulingEvent"
    | "DocumentEvent"
    | "SecurityEvent"
    | "AutomationEvent";

export interface PalEvent<T = Record<string, any>> {
    id: string;
    version: number;
    source: string;
    connectorId: string;
    provider: string;
    eventType: string;
    classification: PalEventClassification;
    occurredAt: number;
    receivedAt: number;
    workspaceId: string;
    correlationId: string;
    causationId: string;
    payload: T;
}
```

---

## 3. Event Replay & Causal Lineage

- **Causation & Correlation**: `correlationId` tracks the overall operational trace across systems, while `causationId` links parent-child triggers (e.g. `Invoice Paid` $\rightarrow$ `Customer Record Updated`).
- **Event Replayability**: All normalized events are stored atomically to allow replaying historical business streams through updated decision models without re-fetching external API webhooks.
