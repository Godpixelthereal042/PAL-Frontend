/**
 * CEO Decision Model Engine Test Suite (PAL-TDD-015, Sprint 28 Milestone 3)
 */

import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { CeoDecisionModelEngine } from "../lib/executive/ceoDecisionModelEngine.ts";

describe("Sprint 28 Milestone 3 — CEO Decision Model Engine", () => {
    const decisionModel = CeoDecisionModelEngine.getInstance();

    it("1. Models CEO decision profile with Balanced risk tolerance and 96% historical approval rate", () => {
        const profile = decisionModel.modelExecutiveDecisionProfile("ws_ceo_pref_101", "CEO");

        assert.ok(profile.profileId.startsWith("ceo_model_"));
        assert.equal(profile.executiveRole, "CEO");
        assert.equal(profile.riskToleranceProfile, "Balanced");
        assert.equal(profile.historicalApprovalRatePct, 96);
        assert.equal(profile.predictedDecisionLikelihoodPct, 94);
    });

    it("2. Generates clear decision reasoning explanation referencing >10x ROI and decision passports", () => {
        const profile = decisionModel.modelExecutiveDecisionProfile("ws_ceo_pref_101");

        assert.ok(profile.decisionReasoningExplanation.includes(">10x ROI"));
        assert.ok(profile.decisionReasoningExplanation.includes("AIDecisionPassports"));
    });
});
