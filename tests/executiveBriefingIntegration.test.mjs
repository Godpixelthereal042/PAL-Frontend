import test, { describe, it } from "node:test";
import assert from "node:assert/strict";
import { ExecutiveBrain } from "../lib/intelligence/brain/executiveBrain.ts";
import { EventEngine } from "../lib/intelligence/events/eventEngine.ts";
import { BriefingEngine } from "../lib/intelligence/briefing/briefingEngine.ts";
import { PlanningEngine } from "../lib/intelligence/planning/planningEngine.ts";
import { ReasoningEngine } from "../lib/intelligence/reasoning/reasoningEngine.ts";
import { ExecutiveOrchestrator } from "../lib/intelligence/council/executiveOrchestrator.ts";
import { DecisionEngine } from "../lib/intelligence/decision/decisionEngine.ts";
import { WorkflowEngine } from "../lib/intelligence/workflows/workflowEngine.ts";

describe("Milestone 7: Executive Briefing Engine & End-to-End Platform Integration", () => {
    const workspaceId = "ws_test_m7";
    const correlationId = "corr_test_m7";

    it("BriefingEngine generates Morning, Risk, Revenue, and Decision briefs", async () => {
        const brain = new ExecutiveBrain();
        const eventEngine = new EventEngine();
        const briefingEngine = new BriefingEngine(brain, eventEngine);

        const morningBrief = await briefingEngine.generateBrief(workspaceId, "user_founder", "morning");
        assert.equal(morningBrief.workspaceId, workspaceId);
        assert.equal(morningBrief.briefType, "morning");
        assert.ok(morningBrief.sections.length >= 2);
        assert.ok(morningBrief.executiveSummary.includes("runway"));

        const riskBrief = await briefingEngine.generateBrief(workspaceId, "user_founder", "risk");
        assert.equal(riskBrief.briefType, "risk");
        assert.equal(riskBrief.urgency, "critical");

        const decisionBrief = await briefingEngine.generateBrief(workspaceId, "user_founder", "decision", {
            summary: "Option C recommended for cloud spend reduction",
            details: "Option C achieves $200 cost reduction with 22/100 risk score",
        });
        assert.equal(decisionBrief.briefType, "decision");
        assert.ok(decisionBrief.sections[0].actionableOptions);
    });

    it("BriefingEngine formats briefs for Chat, Dashboard, Email, and Push channels", async () => {
        const briefingEngine = new BriefingEngine();
        const brief = await briefingEngine.generateBrief(workspaceId, "user_founder", "morning");

        const chatOutput = briefingEngine.formatForChannel(brief, "in_app_chat");
        assert.ok(chatOutput.includes("Morning Executive Brief"));

        const dashOutput = briefingEngine.formatForChannel(brief, "dashboard");
        assert.equal(dashOutput.widgetTitle, "Morning Executive Brief");
        assert.ok(dashOutput.sectionData);

        const pushOutput = briefingEngine.formatForChannel(brief, "push");
        assert.ok(pushOutput.startsWith("PAL Alert"));
    });

    it("End-to-End Executive Intelligence Integration Test (Brain -> Planning -> Reasoning -> Council -> Decision -> Workflow -> Briefing)", async () => {
        // 1. Brain & World Model State
        const brain = new ExecutiveBrain();
        const worldModel = await brain.getWorldModel(workspaceId);
        assert.equal(worldModel.workspaceId, workspaceId);

        // 2. Planning Engine (Goal Decomposition & DAG)
        const planningEngine = new PlanningEngine();
        const plan = await planningEngine.createExecutionPlan(workspaceId, "Reduce AWS cloud infrastructure spend by 25%");
        assert.equal(plan.executionOrder.length, 3);

        // 3. Reasoning Engine (3-Option Scenario Generation)
        const reasoningEngine = new ReasoningEngine();
        const reasoningAnalysis = await reasoningEngine.analyzeChallenge(workspaceId, plan);
        assert.equal(reasoningAnalysis.scenarios.length, 3);

        // 4. Executive Council & Orchestrator (Discussion Rounds & Votes)
        const orchestrator = new ExecutiveOrchestrator();
        const councilConsolidation = await orchestrator.orchestrateCouncil(correlationId, "technology", reasoningAnalysis.scenarios, {});
        assert.equal(councilConsolidation.consensusOptionId, "option_c_balanced");

        // 5. Decision Engine (Scoring & Governance Check)
        const decisionEngine = new DecisionEngine();
        const mockAgentProfile = {
            id: "ai_ops",
            workspace_id: workspaceId,
            name: "AI Ops",
            role: "ai_ops",
            authority_level: "assisted",
            max_budget_per_action: 1000,
            created_at: Date.now(),
            updatedAt: Date.now(),
        };

        const decisionTrace = await decisionEngine.evaluateDecision(
            workspaceId,
            correlationId,
            plan.goalDescription,
            reasoningAnalysis.scenarios,
            councilConsolidation,
            mockAgentProfile
        );
        assert.ok(decisionTrace.decisionId);
        assert.equal(decisionTrace.selectedOption.optionId, "option_c_balanced");

        // 6. Workflow Engine (Resumable Step Execution & Approval Pause)
        const workflowEngine = new WorkflowEngine();
        const wfInstance = await workflowEngine.startWorkflow(workspaceId, correlationId, "playbook_sales_qualification", { lead_domain: "enterprise.com" });
        assert.equal(wfInstance.status, "paused_for_approval");

        // Approve workflow step
        const resumedWf = await workflowEngine.approveWorkflowStep(wfInstance.instanceId, "user_founder");
        assert.equal(resumedWf.status, "completed");

        // 7. Briefing Engine (Executive Intelligence Report)
        const briefingEngine = new BriefingEngine(brain);
        const finalBrief = await briefingEngine.generateBrief(workspaceId, "user_founder", "morning");
        assert.equal(finalBrief.workspaceId, workspaceId);
        assert.ok(finalBrief.executiveSummary);
    });
});
