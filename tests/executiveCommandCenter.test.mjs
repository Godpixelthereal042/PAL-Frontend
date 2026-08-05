import test, { describe, it } from "node:test";
import assert from "node:assert/strict";

import { CommandCenterStore } from "../lib/integrations/ui/commandCenterStore.ts";
import { EventStreamEngine } from "../lib/integrations/events/eventStreamEngine.ts";
import { EventNormalizer } from "../lib/integrations/events/eventNormalizer.ts";

describe("Sprint 5 — Milestone 5: Executive Command Center & Integration UI", () => {
    const workspaceId = "ws_m5_test";

    it("CommandCenterStore initializes state and updates KPIs dynamically from EventStreamEngine events", async () => {
        const engine = new EventStreamEngine();
        const store = new CommandCenterStore(engine);

        const initialState = store.getState();
        assert.ok(initialState.businessKPIs.revenueUSD > 0);
        assert.ok(initialState.decisionFeed.length >= 1);

        // Publish a live financial event to the engine
        const normalizer = new EventNormalizer();
        const financialEvt = normalizer.normalizeWebhook({
            connectorId: "stripe",
            headers: {},
            rawBody: "{}",
            parsedBody: { type: "payment_intent.succeeded", amountUSD: 5000, customerId: "cus_m5" },
            workspaceId
        });

        await engine.publishEvent(financialEvt);

        const updatedState = store.getState();
        assert.equal(updatedState.activityFeed.length, 1);
        assert.equal(updatedState.businessKPIs.revenueUSD, initialState.businessKPIs.revenueUSD + 5000);
    });

    it("CommandCenterStore manages decision explainability items and task status updates", () => {
        const store = new CommandCenterStore();

        store.addDecision({
            decisionId: "dec_999",
            title: "Approve High-Volume Stripe Batch Refund",
            reasoning: "Duplicate billing issue detected via GitHub Issue #402. Confidence high.",
            evidence: ["GitHub Issue #402", "Customer Support ticket #910"],
            confidence: 0.98,
            memoryUsed: ["mem_1"],
            toolsUsed: ["stripe.refund_payment"],
            workersInvolved: ["FinanceWorker"],
            estimatedCostUSD: 0.01,
            timeSavedHours: 5.0,
            actionType: "approve_reject",
            timestamp: Date.now()
        });

        const state = store.getState();
        assert.equal(state.decisionFeed[0].decisionId, "dec_999");
        assert.equal(state.decisionFeed[0].confidence, 0.98);
        assert.equal(state.decisionFeed[0].timeSavedHours, 5.0);

        // Update Task Execution Status
        store.updateTaskStatus("task_101", "completed", 100);
        const task = store.getState().activeExecutions.find((t) => t.taskId === "task_101");
        assert.ok(task);
        assert.equal(task.status, "completed");
        assert.equal(task.progressPct, 100);
    });
});
