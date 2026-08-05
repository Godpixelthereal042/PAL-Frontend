/**
 * Autonomous Market Research Agent Test Suite (PAL-TDD-015, Sprint 28 Milestone 4)
 */

import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { MarketResearchAgent } from "../lib/research/marketResearchAgent.ts";

describe("Sprint 28 Milestone 4 — Autonomous Market Research Agent", () => {
    const researchAgent = MarketResearchAgent.getInstance();

    it("1. Detects competitor pricing move and dispatches HIGH severity alert", () => {
        const alerts = researchAgent.runMarketScan("ws_mkt_scan_101");

        assert.ok(alerts.length >= 2);
        const compAlert = alerts.find(a => a.category === "Competitor");

        assert.ok(compAlert);
        assert.equal(compAlert.impactSeverity, "HIGH");
        assert.ok(compAlert.headline.includes("seat-based AI assistant"));
    });

    it("2. Detects EU AI Act regulatory update and recommends Enterprise Trust Portal collateral", () => {
        const alerts = researchAgent.runMarketScan("ws_mkt_scan_101");

        const regAlert = alerts.find(a => a.category === "Regulatory");
        assert.ok(regAlert);
        assert.equal(regAlert.impactSeverity, "HIGH");
        assert.ok(regAlert.actionableRecommendation.includes("Enterprise Trust Portal"));
    });
});
