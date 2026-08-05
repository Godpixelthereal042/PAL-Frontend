/**
 * Customer Onboarding Agent Test Suite (PAL-TDD-012, Sprint 25 Milestone 2)
 *
 * Verifies:
 *   1. Starts automated customer onboarding session with smart connector pairing.
 *   2. Completes onboarding and delivers first business value ($14.4k discovered) within 24-hour SLA (1.5 hrs).
 */

import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { CustomerOnboardingAgent } from "../lib/onboarding/customerOnboardingAgent.ts";

describe("Sprint 25 Milestone 2 — Autonomous Customer Onboarding Agent", () => {
    const onboardingAgent = CustomerOnboardingAgent.getInstance();

    it("1. Initializes onboarding session with smart connector recommendations and $14.4k Day 0 value scan", () => {
        const session = onboardingAgent.startOnboardingSession("ws_fast_co", "FastCorp Cloud");

        assert.ok(session.sessionId.startsWith("onb_sess_"));
        assert.equal(session.status, "provisioning");
        assert.equal(session.recommendedConnectors.length, 3);
        assert.equal(session.initialScanValueDiscoveredUsd, 14400);
    });

    it("2. Completes onboarding session in 1.5 hours meeting the 24-hour time-to-first-value SLA", () => {
        onboardingAgent.startOnboardingSession("ws_fast_co", "FastCorp Cloud");
        const completed = onboardingAgent.completeOnboardingSession("ws_fast_co");

        assert.equal(completed.status, "first_value_delivered");
        assert.equal(completed.timeToFirstValueHours, 1.5);
        assert.equal(completed.is24HourSlaMet, true);
        assert.ok(completed.completedAt);
    });
});
