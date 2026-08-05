/**
 * Customer Success Intelligence Engine Test Suite (PAL-TDD-011, Sprint 24 Milestone 1)
 *
 * Verifies:
 *   1. Evaluates customer adoption rate, active agents count, decisions handled, and net ROI generated.
 *   2. Predicts churn risk level (low, medium, high) and generates recommended next actions.
 */

import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { CustomerSuccessIntelligenceEngine } from "../lib/customer/customerSuccessIntelligenceEngine.ts";

describe("Sprint 24 Milestone 1 — Customer Success Intelligence Center", () => {
    const csEngine = CustomerSuccessIntelligenceEngine.getInstance();

    it("1. Generates Customer Health Report with 88% adoption, 94% trust, and $95.4k ROI", () => {
        const report = csEngine.generateHealthReport({
            workspaceId: "ws_acme_saas_prod",
            companyName: "Acme Cloud SaaS"
        });

        assert.ok(report.reportId.startsWith("report_cs_"));
        assert.equal(report.adoptionPct, 88);
        assert.equal(report.trustScorePct, 94);
        assert.equal(report.roiGeneratedUsd, 95400);
        assert.equal(report.churnRiskLevel, "low");
    });

    it("2. Predicts churn risk level based on adoption score and trust threshold", () => {
        const atRiskReport = csEngine.generateHealthReport({
            workspaceId: "ws_risk_co",
            companyName: "Risk Corp",
            adoptionPct: 35,
            trustScorePct: 55
        });

        assert.equal(atRiskReport.churnRiskLevel, "high");
        assert.ok(atRiskReport.recommendedNextActions.length >= 3);
    });
});
