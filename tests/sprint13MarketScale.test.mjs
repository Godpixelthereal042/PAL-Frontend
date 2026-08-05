/**
 * Sprint 13 — Market Dominance & Customer Scale Verification
 *
 * Verifies:
 *   1. CustomerSuccessEngine computes Founder Health Score (94) and triggers churn interventions for inactive accounts.
 *   2. BusinessKnowledgeGraph constructs graph nodes & relation edges linking metrics to recommendations and outcomes.
 *   3. MonthlyBoardReportGenerator compiles board reports & PDF export structures across CEO, CFO, COO, & Growth.
 *   4. TeamCollaborationEngine manages decision comments, @mentions, and enterprise role RBAC capabilities.
 *   5. AgentAutonomyEngine configures Autonomy Levels 1 through 4 (Advisor, Assistant, Operator, Executive Agent).
 */

import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { CustomerSuccessEngine } from "../lib/cs/customerSuccessEngine.ts";
import { BusinessKnowledgeGraph } from "../lib/graph/businessKnowledgeGraph.ts";
import { MonthlyBoardReportGenerator } from "../lib/reports/monthlyBoardReportGenerator.ts";
import { TeamCollaborationEngine } from "../lib/collaboration/teamCollaborationEngine.ts";
import { AgentAutonomyEngine } from "../lib/autonomy/agentAutonomyEngine.ts";

describe("Sprint 13 — Market Dominance & Customer Scale", () => {
    const csEngine = CustomerSuccessEngine.getInstance();
    const graphEngine = BusinessKnowledgeGraph.getInstance();
    const boardGen = MonthlyBoardReportGenerator.getInstance();
    const collabEngine = TeamCollaborationEngine.getInstance();
    const autonomyEngine = AgentAutonomyEngine.getInstance();

    it("1. CustomerSuccessEngine calculates health score and triggers churn intervention", () => {
        const healthy = csEngine.calculateFounderHealth("ws_demo_company");
        assert.equal(healthy.healthScore, 94);
        assert.equal(healthy.churnRisk, "low");

        const inactive = csEngine.evaluateChurnRisk("ws_inactive_founder", 14);
        assert.equal(inactive.churnRisk, "high");
        assert.ok(typeof inactive.recommendedIntervention === "string");
    });

    it("2. BusinessKnowledgeGraph constructs graph topology with nodes and edges", () => {
        const topo = graphEngine.getGraphTopology();

        assert.ok(topo.nodesCount >= 5);
        assert.ok(topo.edgesCount >= 4);
        assert.ok(topo.nodes.some(n => n.category === "customer"));
        assert.ok(topo.edges.some(e => e.relationType === "RESULTED_IN_OUTCOME"));
    });

    it("3. MonthlyBoardReportGenerator compiles monthly board report", () => {
        const report = boardGen.generateBoardReport("ws_demo_company", "Acme SaaS");

        assert.ok(report.reportId.startsWith("brd_"));
        assert.equal(report.companyName, "Acme SaaS");
        assert.ok(report.cfoSection.keyMetrics.cashRunwayMonths >= 12);
        assert.ok(report.exportPdfUrl.includes("/api/reports/board-report/export"));
    });

    it("4. TeamCollaborationEngine manages comments, @mentions, and role RBAC", () => {
        const comment = collabEngine.addComment({
            decisionId: "dec_q3_budget",
            authorUserId: "usr_cfo_01",
            authorName: "Sarah CFO",
            role: "finance_lead",
            text: "Approved spend after verifying 18 months runway @AlexFounder",
            mentions: ["AlexFounder"]
        });

        assert.ok(comment.commentId.startsWith("cmt_"));
        assert.equal(comment.mentions[0], "AlexFounder");

        assert.equal(collabEngine.checkRoleCapability("finance_lead", "view_financials"), true);
        assert.equal(collabEngine.checkRoleCapability("sales_lead", "view_financials"), false);
    });

    it("5. AgentAutonomyEngine configures Autonomy Levels 1 - 4", () => {
        const workspaceId = "ws_autonomy_test";
        const updated = autonomyEngine.setAutonomyLevel(workspaceId, "finance", 4);

        assert.equal(updated.level, 4);
        assert.equal(updated.levelName, "Level 4 — Executive Agent");
        assert.equal(updated.requiresHumanApproval, false);
        assert.equal(updated.maxAutoSpendLimitUSD, 10000);
    });
});
