# 📐 PAL-ARCH-DOC-030: Executive Command Center & Reasoning UI Architecture

**Governing Specification**: PAL-TDD-004 Part 5 (Sprint 5 Milestone 5)  
**Status**: APPROVED ARCHITECTURE SPECIFICATION  
**Component Scope**: `CommandCenterStore`, `ExecutiveCommandCenterDashboard`, Reasoning Inspector, Real-Time Widgets

---

## 1. Subsystem Overview

The **Executive Command Center** serves as PAL's primary operational cockpit. Rather than a conventional static dashboard, it is a fully reactive, event-driven command center connected directly to `EventStreamEngine`, `ConnectorRuntime`, `AutonomousExecutionEngine`, and `AdaptiveMemoryEngine`.

```text
EventStreamEngine ➔ Executive Event Bus
        │
        ▼
CommandCenterStore (State Manager)
        │
        ├── 1. Executive Activity Feed
        ├── 2. Business Health & KPIs (Revenue, Cash Flow, Worker Status)
        ├── 3. Executive Memory Live Insights (Supplier habits, Customer profiles)
        ├── 4. Active Executions Monitor (Live DAG task states)
        ├── 5. Connector Command Center (Latency, Rate limits, Scopes)
        └── 6. Decision & Reasoning Inspector (Explainability, Confidence %, Time Saved)
```

---

## 2. Six Operational Cockpit Modules

1. **Executive Feed**: Live streaming log of autonomous decisions, completed tasks, lead qualifications, merged code, and security risks.
2. **Business Health**: Real-time business metrics including MRR, cash flow, burn rate, active workers, and connector uptime.
3. **Executive Memory Live Insights**: Real-time display of learned business patterns (writing style, customer habits, pricing history).
4. **Active Executions Monitor**: Visual breakdown of task DAG execution progress (Planning, Running, Waiting Approval, Failed).
5. **Connector Command Center**: Live connector health, latency, rate limits remaining, scopes, and sandbox/production toggle.
6. **Decision & Reasoning Inspector**: Surfacing explainability metadata for every autonomous decision:
   - Reasoning rationale
   - Supporting evidence
   - Confidence percentage (e.g. 94%)
   - Memory items used
   - Tools & workers involved
   - Estimated cost USD
   - Time saved
