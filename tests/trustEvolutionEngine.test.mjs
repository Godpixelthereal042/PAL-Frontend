/**
 * PAL Trust Evolution Engine Test Suite (PAL-TDD-007, Sprint 20 Milestone 4)
 *
 * Verifies:
 *   1. Initial agent trust profiles calculate success rates accurately.
 *   2. Recording approved actions increases trust score and checks L4 promotion criteria.
 *   3. Agents with success rate >= 95% across >= 20 actions automatically promote from L3 -> L4.
 *   4. Success rate drop < 90% triggers automatic demotion from L4 -> L3.
 *   5. CEO overrides are captured to build the CEO Preference Model.
 *   6. CEO Preference Model identifies dominant executive strategic intent.
 */

import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { TrustEvolutionEngine } from "../lib/trust/trustEvolutionEngine.ts";

describe("Sprint 20 Milestone 4 — PAL Trust Evolution Engine", () => {
    const trustEngine = TrustEvolutionEngine.getInstance();

    it("1. Initializes agent trust profiles with accurate success rates", () => {
        const cooProfile = trustEngine.getTrustProfile("coo");

        assert.ok(cooProfile);
        assert.equal(cooProfile.totalActionsExecuted, 30);
        assert.equal(cooProfile.approvedActionsCount, 30);
        assert.equal(cooProfile.successRatePct, 100.0);
        assert.equal(cooProfile.isEligibleForL4Promotion, true);
    });

    it("2. Promotes L3 agent to L4 when success rate >= 95% across >= 20 actions", () => {
        const croProfile = trustEngine.getTrustProfile("cro");
        assert.ok(croProfile);

        // Record a series of successful approved actions
        for (let i = 0; i < 5; i++) {
            trustEngine.recordActionOutcome("cro", true);
        }

        const updatedProfile = trustEngine.getTrustProfile("cro");
        assert.ok(updatedProfile);
        assert.equal(updatedProfile.currentAutonomyLevel, 4);
        assert.equal(updatedProfile.isEligibleForL4Promotion, true);
    });

    it("3. Demotes L4 agent to L3 if success rate falls below 90%", () => {
        const cfoProfile = trustEngine.getTrustProfile("cfo");
        assert.ok(cfoProfile);

        // Record rejections to drop success rate
        for (let i = 0; i < 15; i++) {
            trustEngine.recordActionOutcome("cfo", false);
        }

        const updatedProfile = trustEngine.getTrustProfile("cfo");
        assert.ok(updatedProfile);
        assert.equal(updatedProfile.currentAutonomyLevel, 3);
        assert.equal(updatedProfile.isEligibleForL4Promotion, false);
    });

    it("4. Records CEO overrides and builds CEO Preference Model", () => {
        const ovr1 = trustEngine.recordCEOOverride({
            decisionId: "dec_201",
            agentRole: "cfo",
            originalRecommendation: "Reduce marketing budget by $10,000",
            ceoOverrideAction: "Maintain marketing budget, improve ad targeting",
            perceivedStrategicIntent: "growth_preservation"
        });

        assert.ok(ovr1.overrideId.startsWith("ovr_"));
        assert.equal(ovr1.perceivedStrategicIntent, "growth_preservation");

        trustEngine.recordCEOOverride({
            decisionId: "dec_202",
            agentRole: "cro",
            originalRecommendation: "Discount price by 30% for quick close",
            ceoOverrideAction: "Keep pricing firm, add premium onboarding support",
            perceivedStrategicIntent: "growth_preservation"
        });

        const model = trustEngine.getCEOPreferenceModel();

        assert.equal(model.totalOverridesRecorded, 2);
        assert.equal(model.dominantStrategicIntent, "growth_preservation");
    });
});
