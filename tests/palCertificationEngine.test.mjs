/**
 * PAL Certification Academy Test Suite (PAL-TDD-013, Sprint 26 Milestone 2)
 */

import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { PalCertificationEngine } from "../lib/education/palCertificationEngine.ts";

describe("Sprint 26 Milestone 2 — PAL Certification Academy", () => {
    const certEngine = PalCertificationEngine.getInstance();

    it("1. Issues PAL Enterprise Architect Certification for learner scoring 94%", () => {
        const cert = certEngine.issueCertification({
            learnerId: "user_architect_101",
            learnerName: "John Doe",
            track: "PAL Enterprise Architect",
            scorePct: 94
        });

        assert.ok(cert.recordId.startsWith("cert_"));
        assert.equal(cert.track, "PAL Enterprise Architect");
        assert.equal(cert.scorePct, 94);
        assert.equal(cert.isCertified, true);
        assert.ok(cert.issuedAt);
        assert.ok(cert.expiresAt);
    });

    it("2. Rejects certification for score below 85% passing threshold (78%)", () => {
        const cert = certEngine.issueCertification({
            learnerId: "user_operator_202",
            learnerName: "Jane Smith",
            track: "PAL Operator",
            scorePct: 78
        });

        assert.equal(cert.isCertified, false);
        assert.equal(cert.issuedAt, undefined);
    });

    it("3. Issues PAL Operator Certification for score of 85% exactly", () => {
        const cert = certEngine.issueCertification({
            learnerId: "user_op_303",
            learnerName: "Bob Tester",
            track: "PAL Operator",
            scorePct: 85
        });

        assert.equal(cert.isCertified, true);
        assert.equal(cert.track, "PAL Operator");
    });

    it("4. Issues PAL AI Agent Builder Certification for score of 90%", () => {
        const cert = certEngine.issueCertification({
            learnerId: "user_builder_404",
            learnerName: "Alice Coder",
            track: "PAL AI Agent Builder",
            scorePct: 90
        });

        assert.equal(cert.isCertified, true);
        assert.equal(cert.track, "PAL AI Agent Builder");
    });

    it("5. Sets certificate expiration date to 1 year (365 days) from issuance", () => {
        const cert = certEngine.issueCertification({
            learnerId: "user_arch_505",
            learnerName: "Charlie Arch",
            track: "PAL Enterprise Architect",
            scorePct: 98
        });

        assert.ok(cert.issuedAt);
        assert.ok(cert.expiresAt);
        const diffDays = Math.round((cert.expiresAt - cert.issuedAt) / (1000 * 86400));
        assert.equal(diffDays, 365);
    });

    it("6. Verifies learner name and learner ID are stored accurately", () => {
        const cert = certEngine.issueCertification({
            learnerId: "user_op_606",
            learnerName: "David Miller",
            track: "PAL Operator",
            scorePct: 92
        });

        assert.equal(cert.learnerId, "user_op_606");
        assert.equal(cert.learnerName, "David Miller");
    });

    it("7. Verifies failing exam score 50% does not populate expiration timestamp", () => {
        const cert = certEngine.issueCertification({
            learnerId: "user_op_707",
            learnerName: "Eva Fail",
            track: "PAL Operator",
            scorePct: 50
        });

        assert.equal(cert.expiresAt, undefined);
    });
});
