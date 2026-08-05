import test, { describe, it } from "node:test";
import assert from "node:assert/strict";
import { AgentRuntime } from "../lib/runtime/agentRuntime.ts";
import { ContextHydrator } from "../lib/runtime/contextHydrator.ts";

describe("Milestone 1: Agent Runtime Foundation", () => {
    const workspaceId = "ws_test_m1";
    const correlationId = "corr_test_m1";

    it("ContextHydrator hydrates ExecutionContext with token budgeting and security profiles", () => {
        const hydrator = new ContextHydrator();
        const context = hydrator.hydrateContext("inst_123", {
            workspaceId,
            correlationId,
            workerRole: "finance",
            taskDescription: "Audit invoice anomalies",
            userId: "user_founder",
            maxTokens: 10000,
        });

        assert.equal(context.workspaceId, workspaceId);
        assert.equal(context.workerRole, "finance");
        assert.equal(context.tokenBudget.maxInputTokens, 7500);
        assert.equal(context.tokenBudget.maxOutputTokens, 2500);
        assert.ok(context.tenantIsolationToken.startsWith("tenant_token_"));
    });

    it("AgentRuntime spawns worker instance and executes state machine lifecycle", async () => {
        const runtime = new AgentRuntime();
        const instance = await runtime.spawnAgent({
            workspaceId,
            correlationId,
            workerRole: "research",
            taskDescription: "Gather competitive firmographics",
            userId: "user_founder",
        });

        assert.equal(instance.workspaceId, workspaceId);
        assert.equal(instance.workerRole, "research");
        assert.equal(instance.status, "executing");
        assert.equal(instance.checkpoints.length, 1);

        const fetched = runtime.getAgentInstance(instance.instanceId);
        assert.ok(fetched);
        assert.equal(fetched.instanceId, instance.instanceId);
    });

    it("AgentRuntime supports state checkpointing and checkpoint recovery", async () => {
        const runtime = new AgentRuntime();
        const instance = await runtime.spawnAgent({
            workspaceId,
            correlationId,
            workerRole: "crm",
            taskDescription: "Qualify enterprise lead",
            userId: "user_founder",
        });

        // Save checkpoint
        const checkpoint = await runtime.checkpointState(instance.instanceId, { qualifiedLeadId: "lead_99" });
        assert.equal(instance.checkpoints.length, 2);
        assert.equal(checkpoint.memoryState.qualifiedLeadId, "lead_99");

        // Recover agent from checkpoint
        const recovered = await runtime.recoverAgent(instance.instanceId, checkpoint.checkpointId);
        assert.equal(recovered.status, "executing");
    });

    it("AgentRuntime handles pause, resume, cost engine accounting, and graceful cancellation", async () => {
        const runtime = new AgentRuntime();
        const instance = await runtime.spawnAgent({
            workspaceId,
            correlationId,
            workerRole: "email",
            taskDescription: "Send outbound briefing email",
            userId: "user_founder",
        });

        // Pause agent for human approval
        const paused = await runtime.pauseAgent(instance.instanceId, "Budget threshold check");
        assert.equal(paused.status, "paused_for_approval");

        // Resume agent
        const resumed = await runtime.resumeAgent(instance.instanceId);
        assert.equal(resumed.status, "executing");

        // Update token consumption for cost metrics
        resumed.context.tokenBudget.consumedInputTokens = 5000;
        resumed.context.tokenBudget.consumedOutputTokens = 1000;

        const cost = runtime.getCostMetrics(instance.instanceId);
        assert.equal(cost.estimatedCostUSD, 0.008); // (5*0.001) + (1*0.003) = 0.008

        const health = runtime.getWorkerHealth(instance.instanceId);
        assert.equal(health.healthStatus, "healthy");

        // Graceful cancellation
        const cancelled = await runtime.cancelAgent(instance.instanceId, "User requested cancellation");
        assert.equal(cancelled.status, "cancelled");
    });
});
