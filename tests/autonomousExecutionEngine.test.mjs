import test, { describe, it } from "node:test";
import assert from "node:assert/strict";
import { TaskGraphEngine } from "../lib/tasks/taskGraphEngine.ts";
import { ContextHydrator } from "../lib/runtime/contextHydrator.ts";
import { AutonomousExecutionEngine } from "../lib/execution/autonomousExecutionEngine.ts";
import { WorkerFactory } from "../lib/workers/workerFactory.ts";

describe("Milestone 5: Autonomous Execution Engine", () => {
    const workspaceId = "ws_test_m5";
    const correlationId = "corr_test_m5";

    const hydrator = new ContextHydrator();
    const taskEngine = new TaskGraphEngine();

    it("AutonomousExecutionEngine dispatches DAG nodes to worker agents with execution trace metadata", async () => {
        const engine = new AutonomousExecutionEngine();

        const nodes = [
            {
                nodeId: "node_res",
                title: "Research Market Landscape",
                type: "tool_call",
                assignedWorkerRole: "research",
                inputParameters: { query: "AI platform market" },
                prerequisites: [],
                retryPolicy: { maxRetries: 1, backoffFactorMs: 100 },
                timeoutMs: 5000,
                onFailure: "retry",
                status: "pending",
            },
            {
                nodeId: "node_doc",
                title: "Generate Research Brief",
                type: "agent_reasoning",
                assignedWorkerRole: "document",
                inputParameters: { title: "Executive Report" },
                prerequisites: ["node_res"],
                retryPolicy: { maxRetries: 1, backoffFactorMs: 100 },
                timeoutMs: 5000,
                onFailure: "halt",
                status: "pending",
            },
        ];

        const dag = taskEngine.createTaskDAG(workspaceId, correlationId, "Generate Market Report", nodes);
        const context = hydrator.hydrateContext("inst_m5", {
            workspaceId,
            correlationId,
            workerRole: "research",
            taskDescription: "Generate Market Report",
            userId: "user_founder",
        });

        const result = await engine.executeDAG(dag, context);

        assert.equal(result.status, "completed");
        assert.equal(result.nodeResponses.size, 2);
        assert.ok(result.executionTrace.length >= 2);

        // Verify trace metadata fields: executionId, dagId, taskNodeId, workerRole, attemptNumber
        const firstTrace = result.executionTrace[0];
        assert.ok(firstTrace.executionId.startsWith("exec_"));
        assert.equal(firstTrace.dagId, dag.dagId);
        assert.ok(typeof firstTrace.attemptNumber === "number");
    });

    it("AutonomousExecutionEngine routes high spend actions to human escalation queue (paused_for_approval)", async () => {
        const engine = new AutonomousExecutionEngine();

        const nodes = [
            {
                nodeId: "node_fin",
                title: "Process Large Refund",
                type: "tool_call",
                assignedWorkerRole: "finance",
                inputParameters: { amountUSD: 2500 }, // > $1,000 auto limit
                prerequisites: [],
                retryPolicy: { maxRetries: 1, backoffFactorMs: 100 },
                timeoutMs: 5000,
                onFailure: "escalate",
                status: "pending",
            },
        ];

        const dag = taskEngine.createTaskDAG(workspaceId, correlationId, "Process Large Refund", nodes);
        const context = hydrator.hydrateContext("inst_m5_fin", {
            workspaceId,
            correlationId,
            workerRole: "finance",
            taskDescription: "Process Large Refund",
            userId: "user_founder",
        });

        const result = await engine.executeDAG(dag, context);

        assert.equal(result.status, "paused_for_approval");
        assert.equal(result.nodeResponses.get("node_fin")?.humanApprovalRequired, true);
    });

    it("AutonomousExecutionEngine enqueues failed tasks into Dead Letter Queue (DLQ) after retries", async () => {
        // Custom worker factory with a failing worker for test
        const factory = new WorkerFactory();
        factory.registerWorker({
            getWorkerRole: () => "automation",
            getCapabilities: () => ["webhook.trigger"],
            executeTask: async () => {
                throw new Error("Target webhook API unreachable");
            },
        });

        const engine = new AutonomousExecutionEngine(factory);

        const nodes = [
            {
                nodeId: "node_fail",
                title: "Trigger Broken Webhook",
                type: "tool_call",
                assignedWorkerRole: "automation",
                inputParameters: { url: "https://invalid.url" },
                prerequisites: [],
                retryPolicy: { maxRetries: 1, backoffFactorMs: 50 },
                timeoutMs: 5000,
                onFailure: "retry",
                status: "pending",
            },
        ];

        const dag = taskEngine.createTaskDAG(workspaceId, correlationId, "Trigger Webhook", nodes);
        const context = hydrator.hydrateContext("inst_m5_fail", {
            workspaceId,
            correlationId,
            workerRole: "automation",
            taskDescription: "Trigger Webhook",
            userId: "user_founder",
        });

        const result = await engine.executeDAG(dag, context);

        assert.equal(result.status, "failed");
        assert.equal(result.dlqRecords.length, 1);

        const dlqRecord = result.dlqRecords[0];
        assert.equal(dlqRecord.taskNodeId, "node_fail");
        assert.equal(dlqRecord.failedAttemptsCount, 2); // 1 initial + 1 retry
        assert.ok(dlqRecord.errorDetails.includes("Target webhook API unreachable"));

        const fetchedDLQ = await engine.getDLQRecords(workspaceId);
        assert.ok(fetchedDLQ.length >= 1);
    });
});
