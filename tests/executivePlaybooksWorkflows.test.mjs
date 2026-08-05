import test, { describe, it } from "node:test";
import assert from "node:assert/strict";
import { PlaybookRegistry } from "../lib/intelligence/playbooks/playbookRegistry.ts";
import { WorkflowEngine } from "../lib/intelligence/workflows/workflowEngine.ts";
import { RollbackManager } from "../lib/intelligence/workflows/rollbackManager.ts";

describe("Milestone 5: Executive Playbooks & Workflow Engine", () => {
    const workspaceId = "ws_test_m5";
    const correlationId = "corr_test_m5";

    it("PlaybookRegistry registers, versions, and lists domain playbooks", () => {
        const registry = new PlaybookRegistry();
        const salesPlaybooks = registry.listPlaybooks(workspaceId, "sales");

        assert.ok(salesPlaybooks.length >= 1);
        const pb = salesPlaybooks[0];
        assert.equal(pb.category, "sales");
        assert.equal(pb.version, "1.0.0");
        assert.equal(pb.status, "active");
    });

    it("WorkflowEngine executes playbook steps and pauses for human approval sign-off", async () => {
        const registry = new PlaybookRegistry();
        const engine = new WorkflowEngine(registry);

        // Start Sales Qualification Workflow (has step 2 = human_approval)
        const initialInstance = await engine.startWorkflow(
            workspaceId,
            correlationId,
            "playbook_sales_qualification",
            { lead_domain: "acme.com" }
        );

        assert.equal(initialInstance.workspaceId, workspaceId);
        assert.equal(initialInstance.status, "paused_for_approval");
        assert.equal(initialInstance.currentStepIndex, 1);
        assert.equal(initialInstance.executedSteps.length, 1); // step 1 enriched

        // Approve step 2
        const approvedInstance = await engine.approveWorkflowStep(initialInstance.instanceId, "user_founder");
        assert.equal(approvedInstance.status, "completed");
        assert.equal(approvedInstance.executedSteps.length, 3);
        assert.equal(approvedInstance.approvalState.approvedBy, "user_founder");
    });

    it("RollbackManager executes compensating step actions on workflow rollback", async () => {
        const registry = new PlaybookRegistry();
        const playbook = registry.getPlaybook("playbook_sales_qualification");
        const rollbackMgr = new RollbackManager();

        const mockInstance = {
            instanceId: "wf_mock_123",
            workspaceId,
            correlationId,
            playbookId: "playbook_sales_qualification",
            currentStepIndex: 3,
            status: "executing",
            executedSteps: [
                { stepId: "step_enrich", actionName: "enrich_domain", executedAt: Date.now(), output: {} },
                { stepId: "step_approval", actionName: "approve_sales_discount", executedAt: Date.now(), output: {} },
                { stepId: "step_assign", actionName: "assign_owner", executedAt: Date.now(), output: {} },
            ],
            createdAt: Date.now(),
            updatedAt: Date.now(),
        };

        const rolledBack = await rollbackMgr.rollbackWorkflow(mockInstance, playbook, "Target API unreachable");

        assert.equal(rolledBack.status, "failed");
        assert.ok(rolledBack.rollbackState);
        assert.equal(rolledBack.rollbackState.compensatedStepsCount, 1); // step_assign has compensation
        assert.equal(rolledBack.rollbackState.rollbackReason, "Target API unreachable");
    });
});
