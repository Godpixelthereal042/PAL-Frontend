/**
 * Executive Command Center Types (PAL-TDD-004, PAL-ARCH-DOC-030)
 */

import type { PalEvent } from "../events/universalEventTypes.ts";
import type { ConnectorHealthStatus } from "../connectorTypes.ts";

export interface BusinessHealthKPIs {
    revenueUSD: number;
    cashFlowUSD: number;
    mrrUSD: number;
    burnRateUSD: number;
    activeTasks: number;
    approvalsWaiting: number;
    connectedCount: number;
    healthyCount: number;
    totalWorkersActive: number;
}

export interface ExecutiveMemoryInsight {
    id: string;
    category: "supplier_habit" | "writing_style" | "customer_profile" | "pricing_history" | "risk_profile";
    summary: string;
    confidence: number;
    updatedAt: number;
}

export interface ExecutionTaskStatus {
    taskId: string;
    taskName: string;
    workerRole: string;
    status: "planning" | "executing" | "waiting_approval" | "completed" | "failed";
    progressPct: number;
    updatedAt: number;
}

export interface DecisionExplainability {
    decisionId: string;
    title: string;
    reasoning: string;
    evidence: string[];
    confidence: number;
    memoryUsed: string[];
    toolsUsed: string[];
    workersInvolved: string[];
    estimatedCostUSD: number;
    timeSavedHours: number;
    actionType: "approve_reject" | "view_only";
    timestamp: number;
}

export interface CommandCenterState {
    activityFeed: PalEvent[];
    businessKPIs: BusinessHealthKPIs;
    memoryInsights: ExecutiveMemoryInsight[];
    activeExecutions: ExecutionTaskStatus[];
    connectorStatuses: ConnectorHealthStatus[];
    decisionFeed: DecisionExplainability[];
}
