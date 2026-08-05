/**
 * Enterprise Security Readiness Engine Test Suite (PAL-TDD-009, Sprint 22 Milestone 6)
 *
 * Verifies:
 *   1. Generates SOC 2, GDPR, and ISO 27001 enterprise procurement package.
 *   2. Generates automated answers to vendor security questionnaires (Encryption, Access Control, Audit, DR).
 */

import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { EnterpriseSecurityReadinessEngine } from "../lib/security/enterpriseSecurityReadinessEngine.ts";

describe("Sprint 22 Milestone 6 — Enterprise Security Readiness & Questionnaire Automation", () => {
    const securityEngine = EnterpriseSecurityReadinessEngine.getInstance();

    it("1. Generates enterprise procurement package with SOC 2, GDPR, and ISO 27001 certifications", () => {
        const pkg = securityEngine.generateProcurementPackage("ws_demo_company");

        assert.equal(pkg.soc2Status, "AUDIT_READY");
        assert.equal(pkg.gdprStatus, "COMPLIANT");
        assert.equal(pkg.iso27001Status, "ALIGNED");
        assert.ok(pkg.questionnaireAnswersCount >= 200);
    });

    it("2. Generates automated security questionnaire responses for enterprise vendor assessments", () => {
        const pkg = securityEngine.generateProcurementPackage("ws_demo_company");

        assert.ok(pkg.sampleQuestionnaireAnswers.length >= 4);
        const encAnswer = pkg.sampleQuestionnaireAnswers.find(a => a.category === "encryption");

        assert.ok(encAnswer);
        assert.ok(encAnswer.automatedAnswer.includes("AES-256-GCM"));
        assert.equal(encAnswer.confidenceScorePct, 100);
    });
});
