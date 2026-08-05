# 📐 PAL-ARCH-DOC-034: Executive Council Consensus & Negotiation Architecture

**Governing Specification**: PAL-TDD-005 Part 3 (Sprint 6 Milestone 3)  
**Status**: APPROVED ARCHITECTURE SPECIFICATION  
**Component Scope**: `ExecutiveCouncil`, `AgentNegotiationEngine`, `ConsensusConfidenceCalculator`, `Proposal`, `ExecutiveCouncilMember`

---

## 1. Subsystem Overview

The **Executive Council Consensus Subsystem** acts as PAL's Layer 9 governance body. Departmental representatives (`CFO`, `CTO`, `CMO`, `Legal`) debate immutable `Proposal` objects through multi-round adversarial critique, weighted voting, dissent recording, and consensus calculation before submitting approved strategies to the Economic Scheduler.

```text
OKR Strategy Engine / Goal
           │
           ▼
Immutable Proposal Object (Benefit, Cost, Risk, Reversibility, Evidence)
           │
           ▼
Executive Council Phase 1: Departmental Member Opinions (CFO, CTO, CMO, Legal)
           │
           ▼
Executive Council Phase 2: Cross Critique & Proposal Revision
           │
           ▼
Executive Council Phase 3: Weighted Voting & Dissent Recording
           │
           ▼
ConsensusConfidenceCalculator (Weighted Consensus Score & Confidence Math)
           │
           ▼
Decision Ledger & Layer 6 Economic Scheduler
```

---

## 2. Standardized Proposal Schema

```typescript
export interface Proposal {
    id: string;
    title: string;
    objective: string;
    expectedBenefitUSD: number;
    estimatedCostUSD: number;
    estimatedRisk: number; // 0 - 100
    reversibilityScore: number; // 0.0 - 1.0
    supportingEvidence: string[];
    affectedDepartments: DepartmentType[];
    strategyAlignment: number; // 0 - 100
    confidence: number; // 0.0 - 1.0
    createdAt: number;
}
```

---

## 3. Weighted Voting & Consensus Confidence Math

Each council member $m_i$ casts a vote with weight $w_i$ and confidence $c_i$:

$$\text{ConsensusScore} = \frac{\sum_{i} (v_i \cdot w_i \cdot c_i)}{\sum_{i} (w_i \cdot c_i)}$$

Where $v_i = 1$ for YES and $v_i = 0$ for NO. Dissenting votes ($v_i = 0$) are recorded in `dissentingVotes[]` alongside their specific objections for future outcome auditability.
