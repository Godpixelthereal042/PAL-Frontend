/**
 * Strategy Cockpit Store (PAL-TDD-005, PAL-ARCH-DOC-037)
 */

import { ExecutiveIntentEngine } from "../executiveIntentEngine.ts";
import { KPIRegistry } from "../kpiRegistry.ts";
import { ApprovalMatrixEngine, type ApprovalRequest } from "../approvalMatrix.ts";
import type { KPIMetric, OKRItem } from "../strategyTypes.ts";
import type { SimulationResult } from "../simulationTypes.ts";
import type { LearningUpdate } from "../feedbackTypes.ts";

export interface CockpitState {
    strategyVersion: string;
    activeIntentTitle: string;
    okrs: OKRItem[];
    kpis: KPIMetric[];
    pendingApprovals: ApprovalRequest[];
    recentSimulations: SimulationResult[];
    recentLearningUpdates: LearningUpdate[];
    updatedAt: number;
}

export class StrategyCockpitStore {
    private state: CockpitState;
    private listeners: Set<() => void> = new Set();

    constructor(
        intentEngine: ExecutiveIntentEngine = new ExecutiveIntentEngine(),
        kpiRegistry: KPIRegistry = new KPIRegistry(),
        approvalEngine: ApprovalMatrixEngine = new ApprovalMatrixEngine()
    ) {
        this.state = {
            strategyVersion: intentEngine.getStrategyVersion(),
            activeIntentTitle: intentEngine.getActiveIntents()[0]?.title || "Accelerate Enterprise MRR",
            okrs: [],
            kpis: kpiRegistry.getAllMetrics(),
            pendingApprovals: approvalEngine.getPendingRequests(),
            recentSimulations: [],
            recentLearningUpdates: [],
            updatedAt: Date.now()
        };
    }

    getState(): CockpitState {
        return this.state;
    }

    subscribe(listener: () => void): () => void {
        this.listeners.add(listener);
        return () => this.listeners.delete(listener);
    }

    private notify(): void {
        this.state.updatedAt = Date.now();
        this.listeners.forEach((fn) => fn());
    }

    setOKRs(okrs: OKRItem[]): void {
        this.state.okrs = okrs;
        this.notify();
    }

    addSimulation(sim: SimulationResult): void {
        this.state.recentSimulations.unshift(sim);
        if (this.state.recentSimulations.length > 5) this.state.recentSimulations.pop();
        this.notify();
    }

    addLearningUpdate(update: LearningUpdate): void {
        this.state.recentLearningUpdates.unshift(update);
        if (this.state.recentLearningUpdates.length > 5) this.state.recentLearningUpdates.pop();
        this.notify();
    }

    updateApprovals(requests: ApprovalRequest[]): void {
        this.state.pendingApprovals = requests;
        this.notify();
    }
}
