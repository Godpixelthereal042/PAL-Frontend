/**
 * PAL Agent Runtime Types & Interfaces (PAL-TDD-003, PAL-ARCH-DOC-021, PAL-ARCH-DOC-025)
 */

export type AgentStatus =
    | "initializing"
    | "hydrating_context"
    | "idle"
    | "executing"
    | "paused_for_approval"
    | "checkpointing"
    | "recovering"
    | "completed"
    | "failed"
    | "cancelled";

export type WorkerRoleType =
    | "research"
    | "email"
    | "calendar"
    | "crm"
    | "finance"
    | "engineering"
    | "social"
    | "document"
    | "automation";

export interface ExecutionContext {
    instanceId: string;
    workspaceId: string;
    correlationId: string;
    agentId: string;
    workerRole: WorkerRoleType;
    tenantIsolationToken: string;
    securityProfile: {
        userId: string;
        roles: string[];
        grantedPermissions: string[];
        maxBudgetPerAction: number;
        isHighRiskAllowed: boolean;
    };
    tokenBudget: {
        maxInputTokens: number;
        maxOutputTokens: number;
        consumedInputTokens: number;
        consumedOutputTokens: number;
    };
    environmentVariables: Record<string, string>;
    createdAt: number;
}

export interface AgentStateCheckpoint {
    checkpointId: string;
    instanceId: string;
    workspaceId: string;
    correlationId: string;
    status: AgentStatus;
    completedStepsCount: number;
    memoryState: Record<string, any>;
    consumedInputTokens: number;
    consumedOutputTokens: number;
    timestamp: number;
}

export interface WorkerHealth {
    workerRole: WorkerRoleType;
    instanceId: string;
    healthStatus: "healthy" | "degraded" | "failing";
    latencyMs: number;
    failureRatePercentage: number;
    lastRunTimestamp: number;
    averageRuntimeMs: number;
    successRatePercentage: number;
    toolCallsCount: number;
    queueLength: number;
}

export interface CostMetrics {
    instanceId: string;
    workspaceId: string;
    totalInputTokens: number;
    totalOutputTokens: number;
    totalApiCallsCount: number;
    totalExecutionTimeMs: number;
    estimatedCostUSD: number;
}

export interface SpawnAgentRequest {
    workspaceId: string;
    correlationId: string;
    workerRole: WorkerRoleType;
    taskDescription: string;
    userId: string;
    grantedPermissions?: string[];
    maxBudgetPerAction?: number;
    maxTokens?: number;
}

export interface AgentInstance {
    instanceId: string;
    workspaceId: string;
    correlationId: string;
    workerRole: WorkerRoleType;
    taskDescription: string;
    status: AgentStatus;
    context: ExecutionContext;
    checkpoints: AgentStateCheckpoint[];
    health: WorkerHealth;
    cost: CostMetrics;
    lastHeartbeatTimestamp: number;
    createdAt: number;
    updatedAt: number;
}

export interface IAgentRuntime {
    spawnAgent(request: SpawnAgentRequest): Promise<AgentInstance>;
    getAgentInstance(instanceId: string): AgentInstance | undefined;
    pauseAgent(instanceId: string, reason: string): Promise<AgentInstance>;
    resumeAgent(instanceId: string): Promise<AgentInstance>;
    cancelAgent(instanceId: string, reason: string): Promise<AgentInstance>;
    checkpointState(instanceId: string, memoryState?: Record<string, any>): Promise<AgentStateCheckpoint>;
    recoverAgent(instanceId: string, checkpointId: string): Promise<AgentInstance>;
    getWorkerHealth(instanceId: string): WorkerHealth;
    getCostMetrics(instanceId: string): CostMetrics;
}
