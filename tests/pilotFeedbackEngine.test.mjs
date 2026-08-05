/**
 * Pilot Feedback Engine Test Suite (PAL-TDD-010, Sprint 23 Milestone 5)
 *
 * Verifies:
 *   1. Submits pilot customer feedback with CEO sentiment analysis (enthusiastic, satisfied, neutral, concerned).
 *   2. Generates feedback summary report and trust adjustment signals (INCREASE_AUTONOMY).
 */

import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { PilotFeedbackEngine } from "../lib/customer/pilotFeedbackEngine.ts";

describe("Sprint 23 Milestone 5 — Pilot Feedback Intelligence", () => {
    const feedbackEngine = PilotFeedbackEngine.getInstance();

    it("1. Submits customer feedback and evaluates CEO sentiment classification", () => {
        const entry = feedbackEngine.submitFeedback({
            workspaceId: "ws_acme_saas_prod",
            submittedByRole: "CEO",
            satisfactionScore: 5,
            qualitativeFeedback: "Outstanding execution speed on trial churn playbooks.",
            featureRequests: ["Salesforce custom field mapping"]
        });

        assert.ok(entry.feedbackId.startsWith("fb_"));
        assert.equal(entry.ceoSentiment, "enthusiastic");
        assert.equal(entry.satisfactionScore, 5);
    });

    it("2. Generates feedback summary report and emits INCREASE_AUTONOMY trust adjustment signal", () => {
        const summary = feedbackEngine.summarizeFeedback("ws_acme_saas_prod");

        assert.ok(summary.totalFeedbackEntriesCount >= 2);
        assert.ok(summary.avgSatisfactionScore >= 4.5);
        assert.equal(summary.trustAdjustmentSignal, "INCREASE_AUTONOMY");
    });
});
