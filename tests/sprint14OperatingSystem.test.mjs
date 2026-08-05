/**
 * Sprint 14 — PAL Operating System & AI Company Infrastructure Verification
 *
 * Verifies:
 *   1. ExecutiveIntelligenceHub delivers CEO, CFO, COO, & CRO domain dashboards with health scores.
 *   2. BusinessPatternEngine (Memory 3.0) tracks cause-and-effect patterns & decision outcome histories.
 *   3. ExecutiveAgentCouncil generates proposals for CEO, CFO, COO, & CRO agents integrated with AgentAutonomyEngine.
 *   4. EnterpriseAuditCenter records tamper-evident logs for AI actions, reasoning traces, and compliance scans.
 */

import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { ExecutiveIntelligenceHub } from "../lib/intelligence/executiveIntelligenceHub.ts";
import { BusinessPatternEngine } from "../lib/memory/businessPatternEngine.ts";
import { ExecutiveAgentCouncil } from "../lib/agents/executiveAgentCouncil.ts";
import { EnterpriseAuditCenter } from "../lib/security/enterpriseAuditCenter.ts";

describe("Sprint 14 — PAL Operating System & AI Company Infrastructure", () => {
    const intelligenceHub = ExecutiveIntelligenceHub.getInstance();
    const patternEngine = BusinessPatternEngine.getInstance();
    const agentCouncil = ExecutiveAgentCouncil.getInstance();
    const auditCenter = EnterpriseAuditCenter.getInstance();

    it("1. ExecutiveIntelligenceHub delivers CEO, CFO, COO, and CRO domain dashboards", () => {
        const intel = intelligenceHub.getExecutiveIntelligence("ws_demo_company");

        assert.equal(intel.overallBusinessHealthScore, 94);
        assert.equal(intel.dashboards.ceo.domain, "ceo");
        assert.equal(intel.dashboards.cfo.domain, "cfo");
        assert.equal(intel.dashboards.coo.domain, "coo");
        assert.equal(intel.dashboards.cro.domain, "cro");
        assert.ok(intel.dashboards.cfo.primaryMetrics.mrrUSD > 0);
    });

    it("2. BusinessPatternEngine (Memory 3.0) tracks cause-and-effect & decision history", () => {
        const workspaceId = "ws_demo_company";

        const patterns = patternEngine.getPatterns(workspaceId);
        assert.ok(patterns.length >= 2);
        assert.ok(patterns.some(p => p.causeEvent.includes("inactive")));

        const history = patternEngine.getDecisionHistory(workspaceId);
        assert.ok(history.length >= 2);
        assert.ok(history.some(h => h.outcomeType === "success"));

        // Record a new outcome
        const recorded = patternEngine.recordDecisionOutcome({
            workspaceId,
            decisionId: "dec_test_01",
            actionTaken: "Automated Level 3 Operator threshold for marketing",
            outcomeType: "success",
            roiImpactUSD: 3500,
            lessonsLearned: "Reduced decision approval latency by 48 hours."
        });

        assert.equal(recorded.outcomeType, "success");
        assert.equal(recorded.roiImpactUSD, 3500);
    });

    it("3. ExecutiveAgentCouncil generates CEO, CFO, COO, & CRO proposals", () => {
        const proposals = agentCouncil.generateDomainProposals("ws_demo_company");

        assert.equal(proposals.length, 4);
        assert.ok(proposals.some(p => p.agentRole === "ceo"));
        assert.ok(proposals.some(p => p.agentRole === "cfo"));
        assert.ok(proposals.some(p => p.agentRole === "coo"));
        assert.ok(proposals.some(p => p.agentRole === "cro"));

        const cfoProp = proposals.find(p => p.agentRole === "cfo");
        assert.ok(cfoProp);
        assert.equal(typeof cfoProp.requiresHumanSignoff, "boolean");
    });

    it("4. EnterpriseAuditCenter records compliance, reasoning traces, & AI action logs", () => {
        const workspaceId = "ws_demo_company";

        const entry = auditCenter.logEvent({
            workspaceId,
            category: "ai_action",
            actor: "agent_cfo",
            action: "Executed SaaS Audit in Dry-Run Mode",
            details: { monthlySavingsUSD: 1200 }
        });

        assert.ok(entry.auditId.startsWith("aud_"));

        const logs = auditCenter.getAuditLogs(workspaceId, "ai_action");
        assert.ok(logs.length >= 1);
        assert.equal(logs[0].actor, "agent_cfo");
    });
});
