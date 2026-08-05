import test, { describe, it } from "node:test";
import assert from "node:assert/strict";
import { ExecutionStore } from "../lib/persistence/executionStore.ts";
import { RecoveryEngine } from "../lib/persistence/recoveryEngine.ts";

describe("Milestone 6: Persistence, Recovery & Monitoring", () => {
    const workspaceId = "ws_test_m6";
    const correlationId = "corr_test_m6";
    const instanceId = "inst_m6_rec";

    it("ExecutionStore saves, lists, and retrieves atomic state checkpoints", async () => {
        const store = new ExecutionStore();

        const checkpoint = {
            checkpointId: "chk_1",
            instanceId,
            workspaceId,
            correlationId,
            dagId: "dag_m6",
            executionVersion: 1,
            completedNodeIds: ["node_1"],
            activeNodeId: "node_2",
            nodeOutputs: { node_1: { success: true } },
            agentMemoryState: { step: 1 },
            consumedTokensTotal: { input: 1000, output: 250 },
            timestamp: Date.now(),
        };

        await store.saveCheckpoint(checkpoint);

        const latest = await store.getLatestCheckpoint(instanceId);
        assert.ok(latest);
        assert.equal(latest.checkpointId, "chk_1");
        assert.equal(latest.executionVersion, 1);

        const list = await store.listCheckpoints(workspaceId);
        assert.equal(list.length, 1);
    });

    it("ExecutionStore tracks idempotency keys to prevent duplicate side effects", async () => {
        const store = new ExecutionStore();
        const recoveryEngine = new RecoveryEngine(store);

        const idempotencyKey = "idemp_payment_12345";

        // Verify key is not present initially
        const isExecutedBefore = await recoveryEngine.verifyIdempotency(idempotencyKey);
        assert.equal(isExecutedBefore, false);

        // Save idempotency key record after payment tool invocation
        await store.saveIdempotencyKey({
            idempotencyKey,
            workspaceId,
            toolId: "stripe.refund_payment",
            actionName: "Refund Payment",
            outputData: { refundId: "re_999" },
            executedAt: Date.now(),
        });

        // Second check returns true (side-effect prevented)
        const isExecutedAfter = await recoveryEngine.verifyIdempotency(idempotencyKey);
        assert.equal(isExecutedAfter, true);
    });

    it("RecoveryEngine recovers interrupted task DAG, increments executionVersion, and logs recoveryReason", async () => {
        const store = new ExecutionStore();
        const recoveryEngine = new RecoveryEngine(store);

        // Save initial version 1 checkpoint
        await store.saveCheckpoint({
            checkpointId: "chk_crash_01",
            instanceId,
            workspaceId,
            correlationId,
            dagId: "dag_crash_test",
            executionVersion: 1,
            completedNodeIds: ["node_res"],
            activeNodeId: "node_doc",
            nodeOutputs: { node_res: { resultsCount: 5 } },
            agentMemoryState: { activeTask: "Generate Report" },
            consumedTokensTotal: { input: 1500, output: 400 },
            timestamp: Date.now(),
        });

        // Trigger crash recovery with reason "crash"
        const recovery = await recoveryEngine.recoverDAG(instanceId, "crash", store);

        assert.equal(recovery.version, 2); // Incremented executionVersion (1 -> 2)
        assert.equal(recovery.session.reason, "crash");
        assert.equal(recovery.session.previousVersion, 1);
        assert.equal(recovery.session.newVersion, 2);
        assert.ok(recovery.session.recoveryId.startsWith("rec_"));

        // Verify checkpoint in store now holds version 2
        const updatedCheckpoint = await store.getLatestCheckpoint(instanceId);
        assert.equal(updatedCheckpoint?.executionVersion, 2);
    });
});
