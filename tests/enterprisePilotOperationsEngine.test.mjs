/**
 * Enterprise Pilot Operations Engine Test Suite (PAL-TDD-015, Sprint 28 Milestone 1)
 */

import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { EnterprisePilotOperationsEngine } from "../lib/pilot/enterprisePilotOperationsEngine.ts";

describe("Sprint 28 Milestone 1 — Enterprise Pilot Operations", () => {
    const pilotEngine = EnterprisePilotOperationsEngine.getInstance();

    it("1. Starts enterprise pilot in Initiation stage with 3 active connectors and 88% engagement score", () => {
        const pilot = pilotEngine.startEnterprisePilot("ws_ent_pilot_101", "Acme Global Enterprise");

        assert.ok(pilot.pilotId.startsWith("plt_op_"));
        assert.equal(pilot.currentStage, "Initiation");
        assert.equal(pilot.activeConnectorsCount, 3);
        assert.equal(pilot.executiveEngagementScorePct, 88);
    });

    it("2. Advances pilot stage to Graduated_Active and verifies 100% success criteria met", () => {
        pilotEngine.startEnterprisePilot("ws_ent_pilot_101", "Acme Global Enterprise");
        const graduated = pilotEngine.advancePilotStage("ws_ent_pilot_101", "Graduated_Active");

        assert.equal(graduated.currentStage, "Graduated_Active");
        assert.equal(graduated.adoptionRatePct, 94);
        assert.equal(graduated.targetSuccessCriteriaMetCount, graduated.totalSuccessCriteriaCount);
    });
});
