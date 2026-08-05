import test, { describe, it } from "node:test";
import assert from "node:assert/strict";
import { TaskGraphEngine } from "../lib/tasks/taskGraphEngine.ts";

describe("Milestone 3: Task Graph Engine & Autonomous Planning", () => {
    const workspaceId = "ws_test_m3";
    const correlationId = "corr_test_m3";

    it("TaskGraphEngine builds TaskDAG and computes topological execution layers for parallel worker dispatch", () => {
        const engine = new TaskGraphEngine();

        // Build 4-node DAG with parallel independent tasks
        const nodes = [
            {
                nodeId: "node_1",
                title: "Research Competitor Pricing",
                type: "tool_call",
                assignedWorkerRole: "research",
                toolId: "web_search",
                inputParameters: { query: "SaaS pricing models" },
                prerequisites: [],
                retryPolicy: { maxRetries: 2, backoffFactorMs: 1000 },
                timeoutMs: 5000,
                onFailure: "retry",
                status: "pending",
            },
            {
                nodeId: "node_2",
                title: "Extract CRM Leads",
                type: "tool_call",
                assignedWorkerRole: "crm",
                toolId: "hubspot.update_deal",
                inputParameters: { minARR: 100000 },
                prerequisites: [],
                retryPolicy: { maxRetries: 2, backoffFactorMs: 1000 },
                timeoutMs: 5000,
                onFailure: "retry",
                status: "pending",
            },
            {
                nodeId: "node_3",
                title: "Synthesize Lead Briefing",
                type: "agent_reasoning",
                assignedWorkerRole: "document",
                inputParameters: {},
                prerequisites: ["node_1", "node_2"], // Depends on Layer 0
                retryPolicy: { maxRetries: 1, backoffFactorMs: 1000 },
                timeoutMs: 5000,
                onFailure: "halt",
                status: "pending",
            },
            {
                nodeId: "node_4",
                title: "Dispatch Email Briefing",
                type: "tool_call",
                assignedWorkerRole: "email",
                toolId: "google_workspace.send_email",
                inputParameters: { to: "ceo@company.com" },
                prerequisites: ["node_3"],
                retryPolicy: { maxRetries: 2, backoffFactorMs: 1000 },
                timeoutMs: 5000,
                onFailure: "escalate",
                status: "pending",
            },
        ];

        const dag = engine.createTaskDAG(workspaceId, correlationId, "Automate Lead Briefing Generation", nodes);

        assert.equal(dag.workspaceId, workspaceId);
        assert.equal(dag.executionLayers.length, 3);

        // Layer 0: node_1 & node_2 (Parallel execution layer)
        assert.equal(dag.executionLayers[0].nodeIds.length, 2);
        assert.ok(dag.executionLayers[0].nodeIds.includes("node_1"));
        assert.ok(dag.executionLayers[0].nodeIds.includes("node_2"));

        // Layer 1: node_3
        assert.equal(dag.executionLayers[1].nodeIds[0], "node_3");

        // Layer 2: node_4
        assert.equal(dag.executionLayers[2].nodeIds[0], "node_4");
    });

    it("TaskGraphEngine evaluates condition_branch predicates against runtime outputs", () => {
        const engine = new TaskGraphEngine();

        const condNode = {
            nodeId: "node_cond",
            title: "Check Deal Size",
            type: "condition_branch",
            assignedWorkerRole: "crm",
            inputParameters: {},
            prerequisites: [],
            conditionPredicate: "arrUSD > 50000",
            retryPolicy: { maxRetries: 1, backoffFactorMs: 1000 },
            timeoutMs: 5000,
            onFailure: "halt",
            status: "pending",
        };

        const isQualifiedHigh = engine.evaluateConditionNode(condNode, { arrUSD: 120000 });
        assert.equal(isQualifiedHigh, true);

        const isQualifiedLow = engine.evaluateConditionNode(condNode, { arrUSD: 20000 });
        assert.equal(isQualifiedLow, false);
    });

    it("TaskGraphEngine manages human approval node sign-off lifecycle", () => {
        const engine = new TaskGraphEngine();

        const nodes = [
            {
                nodeId: "node_approval",
                title: "Executive Approval for Enterprise Discount",
                type: "human_approval",
                assignedWorkerRole: "finance",
                inputParameters: { discountPercent: 20 },
                prerequisites: [],
                retryPolicy: { maxRetries: 1, backoffFactorMs: 1000 },
                timeoutMs: 10000,
                onFailure: "escalate",
                status: "paused_for_approval",
            },
        ];

        const dag = engine.createTaskDAG(workspaceId, correlationId, "Enterprise Sales Approval", nodes);
        dag.nodes.get("node_approval").status = "paused_for_approval";

        const approvedDag = engine.approveTaskNode(dag.dagId, "node_approval", "user_founder");
        assert.equal(approvedDag.status, "completed");
        assert.equal(approvedDag.nodes.get("node_approval").status, "completed");
        assert.equal(approvedDag.nodes.get("node_approval").output.approvedBy, "user_founder");
    });
});
