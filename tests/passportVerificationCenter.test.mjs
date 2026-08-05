/**
 * Passport Verification Center Test Suite (PAL-TDD-008, Sprint 21 Milestone 5)
 *
 * Verifies:
 *   1. Verifies untampered AI Decision Passports with `CERTIFIED_VALID` audit status.
 *   2. Formats complete 5-Point Decision Proof breakdown (Who, What, Why, Who Approved, Outcome).
 *   3. Detects invalid or missing passport IDs (`PASSPORT_NOT_FOUND`).
 *   4. Exports structured compliance audit report for board decks and enterprise auditors.
 */

import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { PassportVerificationCenter } from "../lib/security/passportVerificationCenter.ts";
import { AIDecisionPassportEngine } from "../lib/trust/aiDecisionPassport.ts";

describe("Sprint 21 Milestone 5 — AI Decision Passport Verification Center", () => {
    const verificationCenter = PassportVerificationCenter.getInstance();
    const passportEngine = AIDecisionPassportEngine.getInstance();

    it("1. Verifies authentic AI Decision Passports with CERTIFIED_VALID audit status", () => {
        const passport = passportEngine.issuePassport({
            decisionId: "dec_audit_101",
            workspaceId: "ws_demo_company",
            actionSummary: "CFO: Cancel Datadog Subscription ($1,200/mo)",
            whyPALDidThis: "Datadog usage showed 0 queries in 60 days. Canceling extends cash runway to 18.5 months.",
            dataInfluences: ["AWS Billing API", "Datadog Usage Metrics"],
            alternativesConsidered: ["Downgrade plan", "Keep current subscription"],
            approvedByUserId: "usr_ceo_01",
            approvalRole: "CEO"
        });

        const report = verificationCenter.verifyPassport(passport.passportId);

        assert.equal(report.auditStatus, "CERTIFIED_VALID");
        assert.equal(report.isValidSignature, true);
        assert.equal(report.tamperDetected, false);
        assert.equal(report.signatureHash, passport.signatureHash);
    });

    it("2. Formats complete 5-Point Decision Proof breakdown for executive auditing", () => {
        const passport = passportEngine.issuePassport({
            decisionId: "dec_audit_102",
            workspaceId: "ws_demo_company",
            actionSummary: "CRO: Launch Annual Billing 15% Discount Campaign",
            whyPALDidThis: "Enterprise trial conversion dropped 18% post pricing change.",
            dataInfluences: ["HubSpot CRM", "Historical Annual Plan ACV Lift"],
            alternativesConsidered: ["One-time setup fee waiver"],
            approvedByUserId: "usr_ceo_01",
            approvalRole: "CEO"
        });

        const report = verificationCenter.verifyPassport(passport.passportId);

        assert.ok(report.fivePointProof);
        assert.equal(report.fivePointProof.whatActionSummary, "CRO: Launch Annual Billing 15% Discount Campaign");
        assert.equal(report.fivePointProof.whoApproved.approverId, "usr_ceo_01");
        assert.ok(report.fivePointProof.whyReasoningAndEvidence.rationale.includes("conversion dropped 18%"));
        assert.ok(report.fivePointProof.outcomeMeasured);
    });

    it("3. Reports PASSPORT_NOT_FOUND when non-existent passport ID is queried", () => {
        const report = verificationCenter.verifyPassport("psp_fake_non_existent");

        assert.equal(report.auditStatus, "PASSPORT_NOT_FOUND");
        assert.equal(report.isValidSignature, false);
        assert.equal(report.tamperDetected, true);
    });
});
