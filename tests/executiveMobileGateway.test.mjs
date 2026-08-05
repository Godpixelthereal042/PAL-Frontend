/**
 * Executive Mobile Gateway Test Suite (PAL-TDD-009, Sprint 22 Milestone 4)
 *
 * Verifies:
 *   1. Generates Executive Voice Briefing ("Good morning. Revenue risk increased...").
 *   2. Formats actionable mobile push notification payloads with lockscreen buttons.
 */

import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { ExecutiveMobileGateway } from "../lib/cockpit/executiveMobileGateway.ts";

describe("Sprint 22 Milestone 4 — Executive Mobile Experience", () => {
    const mobileGateway = ExecutiveMobileGateway.getInstance();

    it("1. Generates morning Executive Voice Briefing with spoken headline and action summary", () => {
        const briefing = mobileGateway.generateVoiceBriefing({
            workspaceId: "ws_demo_company",
            recipientName: "CEO Jane",
            pendingApprovalsCount: 3,
            topRiskTitle: "pipeline conversion slowdown"
        });

        assert.ok(briefing.briefingId.startsWith("brief_voice_"));
        assert.ok(briefing.spokenHeadline.includes("Good morning, CEO Jane"));
        assert.ok(briefing.spokenHeadline.includes("pipeline conversion slowdown"));
        assert.ok(briefing.spokenSummary.includes("prepared 3 recovery actions"));
        assert.equal(briefing.recommendedActionsText.length, 3);
        assert.equal(briefing.audioDurationSeconds, 15);
    });

    it("2. Formats mobile push notification payload with actionable lockscreen buttons", () => {
        const push = mobileGateway.createMobilePushPayload({
            workspaceId: "ws_demo_company",
            targetUserId: "usr_ceo",
            cardId: "card_101",
            title: "PAL Recommendation: Cancel Datadog",
            body: "Estimated savings: $14,400/year. Confidence: 98%."
        });

        assert.ok(push.notificationId.startsWith("push_"));
        assert.equal(push.urgency, "high");
        assert.equal(push.actionableButtons.length, 3);
        assert.equal(push.actionableButtons[0].actionResponse, "approve");
        assert.equal(push.actionableButtons[1].actionResponse, "reject");
    });
});
