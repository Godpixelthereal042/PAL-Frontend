# 📐 PAL-ARCH-DOC-031: Executive Memory Engine Architecture

**Governing Specification**: PAL-TDD-004 Part 6 (Sprint 5 Milestone 6)  
**Status**: APPROVED ARCHITECTURE SPECIFICATION  
**Component Scope**: `ExecutiveMemoryEngine`, `IVectorMemoryProvider`, 5 Memory Layers, Observation Pipeline

---

## 1. Subsystem Overview

The **Executive Memory Engine** serves as PAL's adaptive business brain. Rather than a single flat store, it organizes memory into 5 distinct specialized layers governed by confidence scoring, time-decay functions, observation ingestion gates, self-explaining evidence tracking, and vector provider abstractions.

```text
Worker Observation / Event Stream
        │
        ▼
ExecutiveMemoryEngine (Observation Ingestion & Sanitization Gate)
        │
        ├── 1. Working Memory (Active execution, conversation, short-term context)
        ├── 2. Semantic Memory (Facts: Suppliers, Customers, Products, Pricing)
        ├── 3. Behavioral Memory (User habits, Communication style, Approval patterns)
        ├── 4. Strategic Memory (Company goals, KPIs, Governance policies)
        └── 5. Business Memory (Operational habits, Supplier discounts, Seasonality)
        │
        ▼
IVectorMemoryProvider (pgvector / LanceDB / Qdrant Abstraction)
```

---

## 2. Five Specialized Memory Layers

1. **Working Memory**: In-memory transient execution state (`taskId`, active context parameters).
2. **Semantic Memory**: Business facts (e.g. "Acme Corp payment terms are Net-30").
3. **Behavioral Memory**: User preferences (e.g. "User prefers bulleted executive summaries on Mondays").
4. **Strategic Memory**: Organizational targets (e.g. "Target MRR growth 15% per quarter").
5. **Business Memory**: Operational patterns learned from event streams (e.g. "Supplier discounts 5% for early 10-day settlement").

---

## 3. Decay, Confidence & Self-Explanation

- **Confidence Score**: $C \in [0.0, 1.0]$, incremented by repeated observations.
- **Decay Function**: Memory weight decays over time based on half-life, importance, and recency.
- **Explainability**: Every memory entry maintains `observationsCount`, `sources[]`, and `explanation` so PAL can answer *"Why do you believe this?"*
- **Strict Write Isolation**: Workers CANNOT write directly to memory. Workers emit `Observation` objects that must be evaluated and approved by the `ExecutiveMemoryEngine`.
