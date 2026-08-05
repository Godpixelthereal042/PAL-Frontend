# 📐 PAL-ARCH-DOC-033: OKR Strategy Engine & Policy Governance Architecture

**Governing Specification**: PAL-TDD-005 Part 2 (Sprint 6 Milestone 2)  
**Status**: APPROVED ARCHITECTURE SPECIFICATION  
**Component Scope**: `IStrategyProvider`, `ExecutiveIntentEngine`, `ExecutivePolicyEngine`, `KPIRegistry`, `OKRStrategyEngine`, `Strategy Alignment Score`

---

## 1. Subsystem Overview

The **OKR Strategy Engine & Governance Subsystem** translates natural language CEO directives into structured quarterly OKRs, sub-initiatives, projects, tasks, and execution DAGs while enforcing versioned executive policies, corporate constraints, and strategy alignment scoring.

```text
CEO Directive / Goal
         │
         ▼
IStrategyProvider ➔ ExecutiveIntentEngine (Intent + Strategy Versioning)
         │
         ▼
ExecutivePolicyEngine (Versioned Policy Rules & Metadata)
         │
         ▼
ConstraintEngine (Permanent Corporate Boundaries)
         │
         ▼
KPIRegistry (Single Source of Truth for Business Metrics)
         │
         ▼
Strategy Alignment Evaluator (0–100 Strategy Alignment Score)
         │
         ▼
OKRStrategyEngine (Hierarchical Lineage: Goal ➔ Intent ➔ Policy ➔ Constraint ➔ OKR ➔ Task ➔ DAG)
```

---

## 2. Ancestry & Lineage Specification

Every node produced by `OKRStrategyEngine` maintains explicit ancestry metadata for full auditability:

```typescript
export interface LineageMetadata {
    parentId?: string;
    originIntentId: string;
    originPolicyIds: string[];
    originConstraintIds: string[];
    strategyVersion: string;
    alignmentScore: number;
}
```

---

## 3. Strategy Alignment Score (0–100)

Every generated task receives a composite `Strategy Alignment Score` computed via:

$$\text{AlignmentScore} = w_1 \cdot \text{IntentMatch} + w_2 \cdot \text{PolicyCompliance} + w_3 \cdot \text{ConstraintCompliance} + w_4 \cdot \text{KPIImpact} - w_5 \cdot \text{RiskScore}$$

The scheduler multiplies `EconomicPriorityRating` ($EPR$) by $\frac{\text{AlignmentScore}}{100}$ to ensure executive alignment drives task priority.
