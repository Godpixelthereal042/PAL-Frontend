# 📐 PAL-ARCH-DOC-036: Organizational Learning & Outcome Feedback Flywheel Architecture

**Governing Specification**: PAL-TDD-005 Part 5 (Sprint 6 Milestone 5)  
**Status**: APPROVED ARCHITECTURE SPECIFICATION  
**Component Scope**: `DecisionLedger`, `OutcomeFeedbackEngine`, `IKnowledgeGraphProvider`, `SimulatedKnowledgeGraphProvider`, `feedbackTypes`

---

## 1. Subsystem Overview

The **Organizational Learning & Outcome Feedback Flywheel Subsystem** turns PAL into a self-improving executive platform. It logs immutable decision records with full version lineage, performs quantitative deviation analysis between predicted simulation forecasts and observed real-world business results, and feeds calibrated updates back into `ExecutiveMemoryEngine` and `ExecutivePolicyEngine`.

```text
Decision Ledger Entry (Immutable Lineage Snapshot)
                     │
                     ▼
Observed Business Outcome (Event Stream & Connector Telemetry)
                     │
                     ▼
OutcomeFeedbackEngine: Quantitative Deviation Analysis (Prediction Error %)
                     │
                     ▼
Memory Confidence Calibration ➔ Executive Memory Engine Update
                     │
                     ▼
Policy Adjustment Recommendation ➔ Executive Policy Engine
```

---

## 2. Immutable Decision Ledger Schema

```typescript
export interface DecisionLedgerEntry {
    decisionId: string;
    proposalId: string;
    strategyVersion: string;
    policyVersion: string;
    constraintVersion: string;
    memorySnapshotVersion: string;
    simulationId: string;
    councilVotes: any[];
    predictedOutcome: Record<string, number>;
    observedOutcome?: Record<string, number>;
    outcomeDelta?: Record<string, number>; // Prediction error %
    recordedAt: number;
}
```

---

## 3. Provider-Agnostic Knowledge Graph Contract (`IKnowledgeGraphProvider`)

```typescript
export interface IKnowledgeGraphProvider {
    addEntity(entityId: string, type: string, properties: Record<string, any>): Promise<void>;
    addRelationship(sourceId: string, targetId: string, relationType: string, properties?: Record<string, any>): Promise<void>;
    queryNeighbors(entityId: string, relationType?: string): Promise<any[]>;
}
```
