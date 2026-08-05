# 📚 PAL Architecture Specification — PAL-ARCH-DOC-015

## Executive Memory & Context Model

**Subsystem**: Executive Brain & Executive Context Engine (`PAL-TDD-002`)  
**Governing Standard**: PAL Architecture Bible v1.0 (Chapters 23 & 24)  
**Status**: **APPROVED ARCHITECTURE SPECIFICATION**  

---

## 1. Subsystem Architecture Overview

The **Executive Memory & Context Model** provides long-term cognitive persistence, real-time business state synthesis, and multi-tiered runtime context hydration for the PAL platform.

```mermaid
graph TD
    subgraph Executive Brain (Cognitive Persistence)
        WM[World Model - Observed / Inferred / Predicted State]
        KG[Knowledge Graph - Semantic Entity Mapping]
        OBJ[Objectives Registry - North Star / OKRs / KPIs]
        LE[Learning Engine - Closed-Loop Outcome Analytics]
    end

    subgraph Executive Context Engine (Runtime Hydration)
        PContext[1. Persistent Context]
        OContext[2. Operational Context]
        CContext[3. Conversational Context]
        EContext[4. Environmental Context]
        XContext[5. External Context]
    end

    Connectors[Enterprise Connectors] --> WM
    WM --> OContext
    OBJ --> PContext
    LE --> WM
```

---

## 2. Executive Brain Subsystem Components

### A. World Model (`WorldModel`)
Synthesizes multi-source connector streams into a consistent, three-tier state snapshot:
1. **Observed State**: Verified factual metrics (runway, ARR, cash balance, incident counts).
2. **Inferred State**: Computed operational indices (financial health score, burn risk category, operational velocity score).
3. **Predicted State**: Forecasted trajectories (30-day projected ARR, runway depletion, confidence intervals).

### B. Knowledge Graph (`KnowledgeGraph`)
Stores semantic relations between enterprise entities (`User`, `Project`, `Task`, `Connector`, `Metric`) using node-edge structures (`OWNS`, `DELEGATED_TO`, `DEPENDS_ON`, `BLOCKS`, `MANAGES`, `MONITORS`, `IMPACTS`).

### C. Objectives Registry (`ObjectivesRegistry`)
Maintains strategic priorities (North Star metrics, quarterly OKRs, departmental KPIs) ensuring all executive reasoning is grounded in measurable business goals.

### D. Learning Engine (`LearningEngine`)
Implements closed-loop outcome verification:
$$\text{Action} \longrightarrow \text{Outcome} \longrightarrow \text{Delta Calculation} \longrightarrow \text{Memory Confidence Update}$$

---

## 3. Executive Context Engine Layers (`ContextEngine`)

The Context Engine slices workspace context into 5 distinct, token-budgeted layers with explicit freshness metadata (`source`, `lastUpdated`, `confidenceLevel`, `stalenessIndicator`, `refreshPolicy`):

1. **Persistent Context**: Company stage, governance rules, and core strategic objectives.
2. **Operational Context**: World Model state snapshot, active top projects, and urgent pending approvals.
3. **Conversational Context**: Recent interaction thread and active domain focus.
4. **Environmental Context**: User timezone, current time, location, and upcoming calendar meetings.
5. **External Context**: Connector health statuses (Stripe, GitHub, Slack) and macro market signals.

---

## 4. Performance & Caching Strategy

Context payloads are cached using `ICacheProvider` (Sprint 2 memory/Redis abstraction) with a $60\text{s}$ TTL to guarantee sub-5ms hydration latencies for recurring reasoning cycles while strictly respecting token budgets.
