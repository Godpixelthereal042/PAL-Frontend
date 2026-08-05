/**
 * PAL Business Memory 2.0 Intelligence Engine (PAL-TDD-006, Sprint 10)
 *
 * Provides contextual memory synthesis, confidence scoring, lineage tracing,
 * and user edit history tracking for corporate business intelligence.
 */

export interface BusinessMemoryItem {
    id: string;
    workspaceId: string;
    category: "profile" | "financial_trend" | "risk_factor" | "governance_policy" | "customer_insight";
    factKey: string;
    factValue: string;
    confidenceScore: number; // 0.0 - 1.0
    source: "llm_synthesis" | "user_edit" | "connector_sync" | "council_decision";
    editHistory: Array<{ previousValue: string; editedBy: string; timestamp: number }>;
    createdAt: number;
    updatedAt: number;
}

export class BusinessMemoryEngine {
    private static instance: BusinessMemoryEngine;
    private memoryStore: Map<string, BusinessMemoryItem[]> = new Map(); // key: workspaceId

    constructor() {
        // Seed default memory items for demo workspace
        this.seedDefaultMemories("ws_demo_company");
    }

    public static getInstance(): BusinessMemoryEngine {
        if (!BusinessMemoryEngine.instance) {
            BusinessMemoryEngine.instance = new BusinessMemoryEngine();
        }
        return BusinessMemoryEngine.instance;
    }

    private seedDefaultMemories(workspaceId: string): void {
        const items: BusinessMemoryItem[] = [
            {
                id: "mem_201",
                workspaceId,
                category: "financial_trend",
                factKey: "Quarterly Revenue Growth",
                factValue: "SaaS MRR grew 18% this quarter; marketing spend increased 25%",
                confidenceScore: 0.96,
                source: "connector_sync",
                editHistory: [],
                createdAt: Date.now() - 5 * 86400 * 1000,
                updatedAt: Date.now() - 5 * 86400 * 1000
            },
            {
                id: "mem_202",
                workspaceId,
                category: "customer_insight",
                factKey: "Churn Risk Concentration",
                factValue: "Customer churn risk is concentrated among trial accounts inactive for > 45 days",
                confidenceScore: 0.92,
                source: "llm_synthesis",
                editHistory: [],
                createdAt: Date.now() - 3 * 86400 * 1000,
                updatedAt: Date.now() - 3 * 86400 * 1000
            },
            {
                id: "mem_203",
                workspaceId,
                category: "governance_policy",
                factKey: "Spend Approval Threshold",
                factValue: "Any operational expenditure > $1,000 USD requires human sign-off",
                confidenceScore: 1.0,
                source: "council_decision",
                editHistory: [],
                createdAt: Date.now() - 10 * 86400 * 1000,
                updatedAt: Date.now() - 10 * 86400 * 1000
            }
        ];
        this.memoryStore.set(workspaceId, items);
    }

    public getMemories(workspaceId: string): BusinessMemoryItem[] {
        return this.memoryStore.get(workspaceId) || [];
    }

    public storeMemory(params: {
        workspaceId: string;
        category: BusinessMemoryItem["category"];
        factKey: string;
        factValue: string;
        confidenceScore?: number;
        source?: BusinessMemoryItem["source"];
    }): BusinessMemoryItem {
        const items = this.getMemories(params.workspaceId);
        const newItem: BusinessMemoryItem = {
            id: `mem_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
            workspaceId: params.workspaceId,
            category: params.category,
            factKey: params.factKey,
            factValue: params.factValue,
            confidenceScore: params.confidenceScore || 0.9,
            source: params.source || "llm_synthesis",
            editHistory: [],
            createdAt: Date.now(),
            updatedAt: Date.now()
        };

        items.push(newItem);
        this.memoryStore.set(params.workspaceId, items);
        return newItem;
    }

    public updateMemoryValue(workspaceId: string, memoryId: string, newValue: string, editedBy: string): boolean {
        const items = this.getMemories(workspaceId);
        const item = items.find(m => m.id === memoryId);
        if (!item) return false;

        item.editHistory.push({
            previousValue: item.factValue,
            editedBy,
            timestamp: Date.now()
        });
        item.factValue = newValue;
        item.source = "user_edit";
        item.confidenceScore = 1.0;
        item.updatedAt = Date.now();

        this.memoryStore.set(workspaceId, items);
        return true;
    }
}
