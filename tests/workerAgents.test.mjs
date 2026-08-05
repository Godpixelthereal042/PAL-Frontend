import test, { describe, it } from "node:test";
import assert from "node:assert/strict";
import { WorkerFactory } from "../lib/workers/workerFactory.ts";
import { ContextHydrator } from "../lib/runtime/contextHydrator.ts";

describe("Milestone 4: Worker Agent System (9 Specialized Domain Workers)", () => {
    const workspaceId = "ws_test_m4";
    const correlationId = "corr_test_m4";
    const hydrator = new ContextHydrator();

    it("WorkerFactory instantiates all 9 domain worker agents", () => {
        const factory = new WorkerFactory();
        const workers = factory.getAllWorkers();

        assert.equal(workers.length, 9);
        const roles = workers.map((w) => w.getWorkerRole());
        assert.ok(roles.includes("research"));
        assert.ok(roles.includes("email"));
        assert.ok(roles.includes("calendar"));
        assert.ok(roles.includes("crm"));
        assert.ok(roles.includes("finance"));
        assert.ok(roles.includes("engineering"));
        assert.ok(roles.includes("social"));
        assert.ok(roles.includes("document"));
        assert.ok(roles.includes("automation"));
    });

    it("All 9 worker agents adhere to the shared WorkerExecutionResponse contract", async () => {
        const factory = new WorkerFactory();
        const workers = factory.getAllWorkers();

        for (const worker of workers) {
            const role = worker.getWorkerRole();
            const context = hydrator.hydrateContext(`inst_${role}`, {
                workspaceId,
                correlationId,
                workerRole: role,
                taskDescription: `Test task for ${role}`,
                userId: "user_founder",
            });

            const response = await worker.executeTask({
                taskId: `task_${role}`,
                workspaceId,
                correlationId,
                taskDescription: `Test task for ${role}`,
                inputParameters: { testParam: "value" },
                context,
            });

            assert.equal(response.taskId, `task_${role}`);
            assert.equal(response.workerRole, role);
            assert.ok(response.status === "success" || response.status === "requires_approval");
            assert.ok(response.outputs);
            assert.ok(Array.isArray(response.artifacts));
            assert.ok(typeof response.metrics.latencyMs === "number");
            assert.ok(typeof response.metrics.inputTokens === "number");
            assert.ok(typeof response.metrics.outputTokens === "number");
            assert.ok(typeof response.metrics.estimatedCostUSD === "number");
            assert.ok(Array.isArray(response.invokedTools));
            assert.equal(typeof response.retryable, "boolean");
            assert.equal(typeof response.humanApprovalRequired, "boolean");
        }
    });

    it("FinanceWorker flags high spend tasks for human approval sign-off", async () => {
        const factory = new WorkerFactory();
        const financeWorker = factory.getWorker("finance");
        assert.ok(financeWorker);

        const context = hydrator.hydrateContext("inst_fin", {
            workspaceId,
            correlationId,
            workerRole: "finance",
            taskDescription: "Process large invoice refund",
            userId: "user_founder",
        });

        // High spend invoice ($2,500 > $1,000 auto limit)
        const response = await financeWorker.executeTask({
            taskId: "task_fin_high",
            workspaceId,
            correlationId,
            taskDescription: "Process large invoice refund",
            inputParameters: { amountUSD: 2500 },
            context,
        });

        assert.equal(response.status, "requires_approval");
        assert.equal(response.humanApprovalRequired, true);
        assert.ok(response.warnings.length >= 1);
    });
});
