/**
 * OKR Strategy Engine & Alignment Evaluator (PAL-TDD-005, PAL-TDD-005A, PAL-ARCH-DOC-033, PAL-ARCH-DOC-040)
 */

import { ExecutiveIntentEngine } from "./executiveIntentEngine.ts";
import { ExecutivePolicyEngine } from "./policyEngine.ts";
import { KPIRegistry } from "./kpiRegistry.ts";
import { StaticReasoningProvider } from "./staticReasoningProvider.ts";
import type { IReasoningProvider } from "./reasoningTypes.ts";
import type { AlignmentScoreResult, ExecutiveIntent, IStrategyProvider, OKRItem, StrategyCompilerOutput } from "./strategyTypes.ts";

export class OKRStrategyEngine implements IStrategyProvider {
    private intentEngine: ExecutiveIntentEngine;
    private policyEngine: ExecutivePolicyEngine;
    private kpiRegistry: KPIRegistry;
    private reasoningProvider: IReasoningProvider;

    constructor(
        intentEngine?: ExecutiveIntentEngine,
        policyEngine?: ExecutivePolicyEngine,
        kpiRegistry?: KPIRegistry,
        reasoningProvider?: IReasoningProvider
    ) {
        this.intentEngine = intentEngine || new ExecutiveIntentEngine();
        this.policyEngine = policyEngine || new ExecutivePolicyEngine();
        this.kpiRegistry = kpiRegistry || new KPIRegistry();
        this.reasoningProvider = reasoningProvider || new StaticReasoningProvider();
    }

    async compileIntent(goal: string, strategyVersion: string): Promise<StrategyCompilerOutput> {
        this.intentEngine.setStrategyVersion(strategyVersion);

        const intent = this.intentEngine.registerIntent({
            title: `Achieve: ${goal}`,
            strategyVersion
        });

        const okrs = await this.generateOKRs(intent);
        const policiesApplied = this.policyEngine.getPolicies();

        return {
            goal,
            strategyVersion,
            intent,
            policiesApplied,
            okrs,
            alignmentScore: 92
        };
    }

    async generateOKRs(intent: ExecutiveIntent): Promise<OKRItem[]> {
        const policies = this.policyEngine.getPolicies();
        return this.reasoningProvider.generateOKRs(intent, policies);
    }

    async evaluateAlignment(task: Record<string, any>): Promise<AlignmentScoreResult> {
        return this.reasoningProvider.evaluateAlignmentScore(task, "v1.0");
    }

    getIntentEngine(): ExecutiveIntentEngine {
        return this.intentEngine;
    }

    getPolicyEngine(): ExecutivePolicyEngine {
        return this.policyEngine;
    }

    getKPIRegistry(): KPIRegistry {
        return this.kpiRegistry;
    }

    getReasoningProvider(): IReasoningProvider {
        return this.reasoningProvider;
    }
}
