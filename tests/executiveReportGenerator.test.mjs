/**
 * Executive Report Generator Test Suite (PAL-TDD-011, Sprint 24 Milestone 4)
 *
 * Verifies:
 *   1. Generates Weekly CEO Briefs, Investor Updates, and Board Summaries.
 *   2. Synthesizes key business wins, emerging risks, net ROI USD, and formatted Markdown content.
 */

import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { ExecutiveReportGenerator } from "../lib/reports/executiveReportGenerator.ts";

describe("Sprint 24 Milestone 4 — Autonomous Executive Intelligence Reports", () => {
    const reportGen = ExecutiveReportGenerator.getInstance();

    it("1. Generates Weekly CEO Brief with key wins, risks, and agent operational summary", () => {
        const report = reportGen.generateReport({
            workspaceId: "ws_acme_saas_prod",
            companyName: "Acme Cloud SaaS",
            reportType: "weekly_ceo_brief"
        });

        assert.ok(report.reportId.includes("weekly_ceo_brief"));
        assert.ok(report.title.includes("Weekly CEO Intelligence Briefing"));
        assert.equal(report.keyWins.length, 3);
        assert.equal(report.topRisks.length, 2);
        assert.equal(report.netRoiUsd, 95400);
    });

    it("2. Formats Investor Updates and Board Summaries into structured GitHub Markdown", () => {
        const invReport = reportGen.generateReport({
            workspaceId: "ws_acme_saas_prod",
            companyName: "Acme Cloud SaaS",
            reportType: "investor_update"
        });

        assert.ok(invReport.formattedContentMarkdown.includes("# Monthly Investor Growth & ROI Update"));
        assert.ok(invReport.formattedContentMarkdown.includes("Total Net Value Created"));
        assert.ok(invReport.formattedContentMarkdown.includes("31.8x"));
    });
});
