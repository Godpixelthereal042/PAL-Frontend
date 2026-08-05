/**
 * Executive Intent Engine (PAL-TDD-005, PAL-TDD-005A, PAL-ARCH-DOC-033, PAL-ARCH-DOC-039)
 */

import type { ExecutiveIntent } from "./strategyTypes.ts";
import { ExecutiveIntentRepository } from "../db/repositories/governanceRepositories.ts";

export class ExecutiveIntentEngine {
    private activeStrategyVersion: string = "v1.0_growth";
    private intents: Map<string, ExecutiveIntent> = new Map();
    private repo?: ExecutiveIntentRepository;

    constructor(repo?: ExecutiveIntentRepository) {
        this.repo = repo !== undefined ? repo : new ExecutiveIntentRepository();
    }

    setStrategyVersion(version: string): void {
        this.activeStrategyVersion = version;
    }

    getStrategyVersion(): string {
        return this.activeStrategyVersion;
    }

    registerIntent(params: {
        title: string;
        priority?: ExecutiveIntent["priority"];
        successMetrics?: string[];
        deadline?: number;
        owner?: string;
        confidence?: number;
        strategyVersion?: string;
    }): ExecutiveIntent {
        const id = `intent_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
        const intent: ExecutiveIntent = {
            id,
            title: params.title,
            priority: params.priority || "high",
            successMetrics: params.successMetrics || ["Increase MRR", "Reduce Churn"],
            deadline: params.deadline,
            owner: params.owner || "CEO",
            confidence: params.confidence || 0.90,
            strategyVersion: params.strategyVersion || this.activeStrategyVersion,
            status: "active",
            createdAt: Date.now()
        };

        this.intents.set(id, intent);

        if (this.repo) {
            this.repo.insertEntity({
                id,
                workspace_id: "default_workspace",
                title: intent.title,
                priority: intent.priority,
                success_metrics: JSON.stringify(intent.successMetrics),
                deadline: intent.deadline,
                owner: intent.owner,
                confidence: intent.confidence,
                strategy_version: intent.strategyVersion,
                status: intent.status,
                created_at: intent.createdAt
            }).catch(err => console.error("Failed to persist intent", err));
        }

        return intent;
    }

    getActiveIntents(strategyVersion?: string): ExecutiveIntent[] {
        const ver = strategyVersion || this.activeStrategyVersion;
        return Array.from(this.intents.values()).filter(
            (intent) => intent.strategyVersion === ver && intent.status === "active"
        );
    }

    getIntent(id: string): ExecutiveIntent | undefined {
        return this.intents.get(id);
    }
}
