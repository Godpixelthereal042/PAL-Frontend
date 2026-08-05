/**
 * Autonomous Executive Agent Mesh 2.0 Test Suite (PAL-TDD-007, Sprint 20 Milestone 2)
 *
 * Verifies:
 *   1. Domain heartbeat scans produce proactive domain insights.
 *   2. Hybrid communication model pairs structured payloads with rich reasoning context.
 *   3. Inter-agent messages are logged with causal trace metadata.
 *   4. Multi-agent collaboration merges insights into unified recommendations.
 *   5. CEO synthesis aggregates mesh outputs into coherent executive directives.
 */

import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { ExecutiveAgentMesh } from "../lib/agents/mesh/agentMesh.ts";

describe("Sprint 20 Milestone 2 — Autonomous Executive Agent Mesh 2.0", () => {
    const mesh = ExecutiveAgentMesh.getInstance();

    it("1. Proactive domain heartbeat scans generate structured domain insights", () => {
        const report = mesh.runMeshCycle("ws_demo_company");

        assert.equal(report.workspaceId, "ws_demo_company");
        assert.ok(report.insightsDiscovered.length >= 3);

        const cfoInsight = report.insightsDiscovered.find(i => i.agentRole === "cfo");
        assert.ok(cfoInsight);
        assert.equal(cfoInsight.domain, "finance");
        assert.ok(cfoInsight.opportunityFactor.includes("cash runway"));
    });

    it("2. Enforces hybrid communication model (structured payload + reasoning context)", () => {
        const report = mesh.runMeshCycle("ws_demo_company");
        const log = mesh.getMessageLog();

        assert.ok(log.length >= 3);
        const croMsg = log.find(m => m.fromAgent === "cro" && m.toAgent === "cfo");
        assert.ok(croMsg);

        // Structured payload
        assert.equal(croMsg.dataPayload.targetAccounts, 4);
        assert.equal(croMsg.dataPayload.proposedDiscountPct, 15);

        // Rich reasoning context
        assert.ok(croMsg.reasoningContext.summary.includes("dropped 18%"));
        assert.equal(croMsg.reasoningContext.confidenceScore, 0.94);
        assert.ok(croMsg.reasoningContext.assumptions.length >= 1);
        assert.ok(croMsg.reasoningContext.supportingEvidence.length >= 1);
        assert.equal(croMsg.reasoningContext.supportingEvidence[0].metric, "Pipeline Conversion Drop");
    });

    it("3. Logs inter-agent messages with causal metadata and urgency levels", () => {
        const log = mesh.getMessageLog();

        const cooMsg = log.find(m => m.fromAgent === "coo");
        assert.ok(cooMsg);
        assert.equal(cooMsg.toAgent, "ceo");
        assert.equal(cooMsg.messageType, "request");
        assert.equal(cooMsg.urgency, "low");
    });

    it("4. Merges multi-agent insights into collaborative recommendations", () => {
        const report = mesh.runMeshCycle("ws_demo_company");

        assert.ok(report.collaborativeRecommendations.length >= 1);
        const rec = report.collaborativeRecommendations[0];

        assert.deepEqual(rec.participatingAgents, ["cro", "cfo", "ceo"]);
        assert.equal(rec.combinedConfidenceScore, 0.96);
        assert.equal(rec.estimatedFinancialImpactUSD, 46200);
        assert.equal(rec.reasoningTrace.length, 3);
    });

    it("5. CEO Agent synthesizes mesh findings into single executive directive summary", () => {
        const report = mesh.runMeshCycle("ws_demo_company");

        assert.ok(report.ceoDirectiveSummary.includes("Executive Agent Mesh consensus reached"));
        assert.equal(report.activeAgentsCount, 4);
    });
});
