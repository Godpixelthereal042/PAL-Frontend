/**
 * Sprint 17 — Enterprise Adoption, Distribution & AI Workforce Marketplace Verification
 *
 * Verifies:
 *   1. SkillMarketplaceEngine installs specialized skills (Legal Ops, HR Agent, Sales, Finance, Marketing, Operations).
 *   2. EnterpriseCommandCenter enforces departmental spend rules & monitors company-wide AI activity.
 *   3. AIEmployeeWorkspace supports human-agent collaboration threads and proposal sign-off statuses.
 *   4. CompanyKnowledgeFabric federates knowledge across Slack, Notion, and Gmail to answer historical decision queries.
 *   5. AIWorkforceRoiCalculator calculates FTE productivity leverage (4 FTEs) and net annual ROI savings ($252k/yr).
 */

import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { SkillMarketplaceEngine } from "../lib/skills/skillMarketplaceEngine.ts";
import { EnterpriseCommandCenter } from "../lib/admin/enterpriseCommandCenter.ts";
import { AIEmployeeWorkspace } from "../lib/collaboration/aiEmployeeWorkspace.ts";
import { CompanyKnowledgeFabric } from "../lib/memory/companyKnowledgeFabric.ts";
import { AIWorkforceRoiCalculator } from "../lib/analytics/aiWorkforceRoiCalculator.ts";

describe("Sprint 17 — Enterprise Adoption, Distribution & AI Workforce Marketplace (v1.7.0)", () => {
    const marketplaceEngine = SkillMarketplaceEngine.getInstance();
    const commandCenter = EnterpriseCommandCenter.getInstance();
    const employeeWorkspace = AIEmployeeWorkspace.getInstance();
    const knowledgeFabric = CompanyKnowledgeFabric.getInstance();
    const roiCalculator = AIWorkforceRoiCalculator.getInstance();

    it("1. SkillMarketplaceEngine includes Legal Ops and HR skills in Skills Store", () => {
        const skills = marketplaceEngine.getSkills();

        assert.ok(skills.length >= 6);
        assert.ok(skills.some(s => s.skillId === "skill_legal_ops"));
        assert.ok(skills.some(s => s.skillId === "skill_hr_agent"));

        const installed = marketplaceEngine.installSkill("skill_legal_ops");
        assert.equal(installed, true);
    });

    it("2. EnterpriseCommandCenter enforces departmental spend approval rules", () => {
        const summary = commandCenter.getCommandCenterSummary("ws_demo_company");

        assert.equal(summary.totalActiveAgents, 6);
        assert.equal(summary.departmentRules.length, 4);

        const mktgRule = summary.departmentRules.find(r => r.department === "marketing");
        assert.ok(mktgRule);
        assert.equal(mktgRule.autoSpendLimitUSD, 5000);
        assert.equal(mktgRule.requiresFinanceApprovalAboveUSD, 2000);
    });

    it("3. AIEmployeeWorkspace manages human-agent collaboration threads", () => {
        const threadId = "th_q3_marketing";
        const messages = employeeWorkspace.getThreadMessages(threadId);

        assert.ok(messages.length >= 2);
        assert.equal(messages[0].senderType, "human");
        assert.equal(messages[1].senderType, "agent");
        assert.equal(messages[1].status, "awaiting_approval");

        const post = employeeWorkspace.postHumanMessage(threadId, "Sarah", "Marketing Lead", "Approved. Proceed with $18k budget.");
        assert.ok(post.messageId.startsWith("msg_"));
        assert.equal(employeeWorkspace.getThreadMessages(threadId).length, 3);
    });

    it("4. CompanyKnowledgeFabric federates cross-source knowledge to answer historical decision queries", () => {
        const query = "Why did we stop targeting enterprise customers?";
        const result = knowledgeFabric.queryKnowledgeFabric("ws_demo_company", query);

        assert.ok(result.synthesizedAnswer.includes("March 12, 2026"));
        assert.ok(result.supportingSources.length >= 2);
        assert.equal(result.confidenceScore, 0.96);
    });

    it("5. AIWorkforceRoiCalculator computes 4 FTE leverage and net annual savings", () => {
        const roi = roiCalculator.calculateROI("ws_demo_company", 199);

        assert.equal(roi.equivalentFteLeverageCount, 4);
        assert.equal(roi.humanAnalystEquivalenceUSD, 255000);
        assert.ok(roi.netAnnualSavingsUSD > 250000);
        assert.ok(roi.roiPercentagePct > 10000);
    });
});
