import { ContextHydrator } from "./contextHydrator.ts";
import type {
    AgentInstance,
    AgentStateCheckpoint,
    CostMetrics,
    IAgentRuntime,
    SpawnAgentRequest,
    WorkerHealth,
} from "./types.ts";

export class AgentRuntime implements IAgentRuntime {
    private instances: Map<string, AgentInstance> = new Map();
    private hydrator: ContextHydrator;
    private abortControllers: Map<string, AbortController> = new Map();

    constructor(hydrator?: ContextHydrator) {
        this.hydrator = hydrator || new ContextHydrator();
    }

    async spawnAgent(request: SpawnAgentRequest): Promise<AgentInstance> {
        const instanceId = `inst_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
        const now = Date.now();

        const context = this.hydrator.hydrateContext(instanceId, request);
        const abortController = new AbortController();
        this.abortControllers.set(instanceId, abortController);

        const health: WorkerHealth = {
            workerRole: request.workerRole,
            instanceId,
            healthStatus: "healthy",
            latencyMs: 12,
            failureRatePercentage: 0,
            lastRunTimestamp: now,
            averageRuntimeMs: 150,
            successRatePercentage: 100,
            toolCallsCount: 0,
            queueLength: 0,
        };

        const cost: CostMetrics = {
            instanceId,
            workspaceId: request.workspaceId,
            totalInputTokens: 0,
            totalOutputTokens: 0,
            totalApiCallsCount: 0,
            totalExecutionTimeMs: 0,
            estimatedCostUSD: 0,
        };

        const instance: AgentInstance = {
            instanceId,
            workspaceId: request.workspaceId,
            correlationId: request.correlationId || `corr_runtime_${now}`,
            workerRole: request.workerRole,
            taskDescription: request.taskDescription,
            status: "initializing",
            context,
            checkpoints: [],
            health,
            cost,
            lastHeartbeatTimestamp: now,
            createdAt: now,
            updatedAt: now,
        };

        // Transition through lifecycle: initializing -> hydrating_context -> executing
        instance.status = "hydrating_context";
        instance.updatedAt = Date.now();

        // Initial checkpoint
        const initialCheckpoint: AgentStateCheckpoint = {
            checkpointId: `chk_${Date.now()}_0`,
            instanceId,
            workspaceId: request.workspaceId,
            correlationId: instance.correlationId,
            status: "idle",
            completedStepsCount: 0,
            memoryState: { initialTask: request.taskDescription },
            consumedInputTokens: 0,
            consumedOutputTokens: 0,
            timestamp: Date.now(),
        };

        instance.checkpoints.push(initialCheckpoint);
        instance.status = "executing";
        instance.updatedAt = Date.now();

        this.instances.set(instanceId, instance);
        return instance;
    }

    getAgentInstance(instanceId: string): AgentInstance | undefined {
        const instance = this.instances.get(instanceId);
        if (instance) {
            // Heartbeat update
            instance.lastHeartbeatTimestamp = Date.now();
        }
        return instance;
    }

    async pauseAgent(instanceId: string, reason: string): Promise<AgentInstance> {
        const instance = this.instances.get(instanceId);
        if (!instance) throw new Error(`Agent instance '${instanceId}' not found`);

        if (instance.status === "completed" || instance.status === "failed" || instance.status === "cancelled") {
            throw new Error(`Cannot pause agent in terminal state '${instance.status}'`);
        }

        instance.status = "paused_for_approval";
        instance.updatedAt = Date.now();
        return instance;
    }

    async resumeAgent(instanceId: string): Promise<AgentInstance> {
        const instance = this.instances.get(instanceId);
        if (!instance) throw new Error(`Agent instance '${instanceId}' not found`);

        if (instance.status !== "paused_for_approval") {
            throw new Error(`Agent instance '${instanceId}' is not currently paused`);
        }

        instance.status = "executing";
        instance.updatedAt = Date.now();
        return instance;
    }

    async cancelAgent(instanceId: string, reason: string): Promise<AgentInstance> {
        const instance = this.instances.get(instanceId);
        if (!instance) throw new Error(`Agent instance '${instanceId}' not found`);

        const controller = this.abortControllers.get(instanceId);
        if (controller) {
            controller.abort(reason);
        }

        instance.status = "cancelled";
        instance.updatedAt = Date.now();
        return instance;
    }

    async checkpointState(instanceId: string, memoryState: Record<string, any> = {}): Promise<AgentStateCheckpoint> {
        const instance = this.instances.get(instanceId);
        if (!instance) throw new Error(`Agent instance '${instanceId}' not found`);

        const previousStatus = instance.status;
        instance.status = "checkpointing";

        const checkpoint: AgentStateCheckpoint = {
            checkpointId: `chk_${Date.now()}_${instance.checkpoints.length + 1}`,
            instanceId,
            workspaceId: instance.workspaceId,
            correlationId: instance.correlationId,
            status: previousStatus,
            completedStepsCount: instance.checkpoints.length + 1,
            memoryState,
            consumedInputTokens: instance.context.tokenBudget.consumedInputTokens,
            consumedOutputTokens: instance.context.tokenBudget.consumedOutputTokens,
            timestamp: Date.now(),
        };

        instance.checkpoints.push(checkpoint);
        instance.status = previousStatus;
        instance.updatedAt = Date.now();

        return checkpoint;
    }

    async recoverAgent(instanceId: string, checkpointId: string): Promise<AgentInstance> {
        const instance = this.instances.get(instanceId);
        if (!instance) throw new Error(`Agent instance '${instanceId}' not found`);

        const checkpoint = instance.checkpoints.find((c) => c.checkpointId === checkpointId);
        if (!checkpoint) throw new Error(`Checkpoint '${checkpointId}' not found for agent '${instanceId}'`);

        instance.status = "recovering";
        instance.updatedAt = Date.now();

        // Restore context state
        instance.context.tokenBudget.consumedInputTokens = checkpoint.consumedInputTokens;
        instance.context.tokenBudget.consumedOutputTokens = checkpoint.consumedOutputTokens;

        instance.status = "executing";
        instance.updatedAt = Date.now();

        return instance;
    }

    getWorkerHealth(instanceId: string): WorkerHealth {
        const instance = this.instances.get(instanceId);
        if (!instance) throw new Error(`Agent instance '${instanceId}' not found`);
        return instance.health;
    }

    getCostMetrics(instanceId: string): CostMetrics {
        const instance = this.instances.get(instanceId);
        if (!instance) throw new Error(`Agent instance '${instanceId}' not found`);

        // Compute estimated USD cost based on token usage ($0.001 per 1k input, $0.003 per 1k output)
        const inputCost = (instance.context.tokenBudget.consumedInputTokens / 1000) * 0.001;
        const outputCost = (instance.context.tokenBudget.consumedOutputTokens / 1000) * 0.003;
        instance.cost.estimatedCostUSD = Number((inputCost + outputCost).toFixed(6));

        return instance.cost;
    }
}
