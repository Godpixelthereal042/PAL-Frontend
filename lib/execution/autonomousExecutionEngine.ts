import { ExecutionSandbox } from "../tools/executionSandbox.ts";
import { WorkerFactory } from "../workers/workerFactory.ts";
import type { TaskDAG, TaskNode } from "../tasks/types.ts";
import type { ExecutionContext } from "../runtime/types.ts";
import { DeadLetterQueue } from "./deadLetterQueue.ts";
import type {
    DeadLetterQueueRecord,
    ExecutionResult,
    ExecutionTraceMetadata,
    IAutonomousExecutionEngine,
} from "./types.ts";
import type { WorkerExecutionResponse } from "../workers/types.ts";

export class AutonomousExecutionEngine implements IAutonomousExecutionEngine {
    private workerFactory: WorkerFactory;
    private sandbox: ExecutionSandbox;
    private dlq: DeadLetterQueue;

    constructor(workerFactory?: WorkerFactory, sandbox?: ExecutionSandbox, dlq?: DeadLetterQueue) {
        this.workerFactory = workerFactory || new WorkerFactory();
        this.sandbox = sandbox || new ExecutionSandbox();
        this.dlq = dlq || new DeadLetterQueue();
    }

    async executeDAG(dag: TaskDAG, context: ExecutionContext): Promise<ExecutionResult> {
        const startTime = Date.now();
        const nodeResponses = new Map<string, WorkerExecutionResponse>();
        const dlqRecords: DeadLetterQueueRecord[] = [];
        const executionTrace: ExecutionTraceMetadata[] = [];

        let currentStatus: string = "executing";

        for (const layer of dag.executionLayers) {
            const layerPromises = layer.nodeIds.map(async (nodeId) => {
                const node = dag.nodes.get(nodeId)!;

                // Skip node if prerequisite failed
                const prereqs = node.prerequisites || [];
                const prereqFailed = prereqs.some(
                    (pId) => nodeResponses.get(pId)?.status === "failed"
                );

                if (prereqFailed) {
                    node.status = "skipped";
                    return;
                }

                // Execute node with retry backoff & trace metadata
                const response = await this.executeNodeWithRetry(
                    dag,
                    node,
                    context,
                    executionTrace,
                    dlqRecords
                );

                nodeResponses.set(nodeId, response);

                if (response.status === "requires_approval") {
                    node.status = "paused_for_approval";
                    currentStatus = "paused_for_approval";
                } else if (response.status === "failed") {
                    node.status = "failed";
                    currentStatus = "failed";
                } else {
                    node.status = "completed";
                }
            });

            await Promise.all(layerPromises);

            if (currentStatus === "paused_for_approval" || currentStatus === "failed") {
                break;
            }
        }

        if (currentStatus === "executing") {
            currentStatus = "completed";
        }

        dag.status = currentStatus as TaskDAG["status"];

        return {
            dagId: dag.dagId,
            status: currentStatus === "paused_for_approval" || currentStatus === "failed" ? currentStatus : "completed",
            nodeResponses,
            dlqRecords,
            executionTrace,
            startedAt: startTime,
            completedAt: Date.now(),
        };
    }

    async resumeDAG(dagId: string, approverId: string, context: ExecutionContext): Promise<ExecutionResult> {
        // Implementation for resuming paused DAG following sign-off
        throw new Error("Use TaskGraphEngine.approveTaskNode and re-execute remaining DAG layers.");
    }

    async getDLQRecords(workspaceId: string): Promise<DeadLetterQueueRecord[]> {
        return this.dlq.getRecords(workspaceId);
    }

    private async executeNodeWithRetry(
        dag: TaskDAG,
        node: TaskNode,
        context: ExecutionContext,
        traceList: ExecutionTraceMetadata[],
        dlqList: DeadLetterQueueRecord[]
    ): Promise<WorkerExecutionResponse> {
        const worker = this.workerFactory.getWorker(node.assignedWorkerRole);
        if (!worker) {
            return {
                taskId: node.nodeId,
                workerRole: node.assignedWorkerRole,
                status: "failed",
                outputs: {},
                artifacts: [],
                metrics: { latencyMs: 0, inputTokens: 0, outputTokens: 0, estimatedCostUSD: 0 },
                invokedTools: [],
                retryable: false,
                humanApprovalRequired: false,
                warnings: [],
                errorDetails: `Worker for role '${node.assignedWorkerRole}' not registered`,
            };
        }

        let attempt = 1;
        const maxAttempts = (node.retryPolicy?.maxRetries || 0) + 1;
        let lastResponse: WorkerExecutionResponse | null = null;

        while (attempt <= maxAttempts) {
            const executionId = `exec_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
            const trace: ExecutionTraceMetadata = {
                executionId,
                workflowId: dag.correlationId,
                dagId: dag.dagId,
                taskNodeId: node.nodeId,
                workerRole: node.assignedWorkerRole,
                attemptNumber: attempt,
                startedAt: Date.now(),
            };

            traceList.push(trace);

            try {
                lastResponse = await worker.executeTask({
                    taskId: node.nodeId,
                    workspaceId: context.workspaceId,
                    correlationId: context.correlationId,
                    taskDescription: node.title,
                    inputParameters: node.inputParameters,
                    context,
                });

                trace.completedAt = Date.now();

                if (lastResponse.status === "success" || lastResponse.status === "requires_approval") {
                    return lastResponse;
                }
            } catch (err: any) {
                trace.completedAt = Date.now();
                lastResponse = {
                    taskId: node.nodeId,
                    workerRole: node.assignedWorkerRole,
                    status: "failed",
                    outputs: {},
                    artifacts: [],
                    metrics: { latencyMs: 0, inputTokens: 0, outputTokens: 0, estimatedCostUSD: 0 },
                    invokedTools: [],
                    retryable: attempt < maxAttempts,
                    humanApprovalRequired: false,
                    warnings: [],
                    errorDetails: err?.message || String(err),
                };
            }

            // Exponential backoff with jitter
            if (attempt < maxAttempts) {
                const backoffMs = Math.min(
                    1000,
                    (node.retryPolicy?.backoffFactorMs || 100) * Math.pow(2, attempt) + Math.random() * 50
                );
                await new Promise((resolve) => setTimeout(resolve, backoffMs));
            }

            attempt++;
        }

        // Enqueue to Dead Letter Queue (DLQ) if terminal failure
        const dlqRecord: DeadLetterQueueRecord = {
            dlqId: `dlq_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
            workspaceId: context.workspaceId,
            correlationId: context.correlationId,
            dagId: dag.dagId,
            taskNodeId: node.nodeId,
            workerRole: node.assignedWorkerRole,
            failedAttemptsCount: maxAttempts,
            errorDetails: lastResponse?.errorDetails || "Task execution failed after retries",
            inputParameters: node.inputParameters,
            contextSnapshot: context,
            enqueuedAt: Date.now(),
        };

        await this.dlq.enqueue(dlqRecord);
        dlqList.push(dlqRecord);

        return lastResponse!;
    }
}
