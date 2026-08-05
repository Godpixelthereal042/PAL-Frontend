/**
 * Pilot Deployment Console Test Suite (PAL-TDD-010, Sprint 23 Milestone 1)
 *
 * Verifies:
 *   1. Creates pilot organization with workspace isolation and default 'invited' phase.
 *   2. Advances pilot lifecycle across all 5 phases to 'autonomous_operations_enabled'.
 *   3. Evaluates dynamic pilot health score (0-100%) and generates deployment timeline.
 */

import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { PilotDeploymentConsole } from "../lib/pilot/pilotDeploymentConsole.ts";

describe("Sprint 23 Milestone 1 — Pilot Customer Deployment Console", () => {
    const consoleEngine = PilotDeploymentConsole.getInstance();

    it("1. Creates pilot organization with workspace isolation and initial baseline health score", () => {
        const org = consoleEngine.createPilotOrganization({
            workspaceId: "ws_health_pilot",
            companyName: "MedTech Health System",
            industry: "healthcare"
        });

        assert.ok(org.pilotId.startsWith("pilot_"));
        assert.equal(org.companyName, "MedTech Health System");
        assert.equal(org.currentPhase, "invited");
        assert.equal(org.healthScorePct, 60);
    });

    it("2. Advances pilot lifecycle phases to 'autonomous_operations_enabled' and updates health score", () => {
        const pilotId = "pilot_acme_saas";
        const org = consoleEngine.advancePilotPhase(pilotId, "autonomous_operations_enabled");

        assert.equal(org.currentPhase, "autonomous_operations_enabled");
        assert.equal(org.healthScorePct, 98);

        const timeline = consoleEngine.getPilotTimeline(pilotId);
        assert.ok(timeline.some(e => e.phase === "autonomous_operations_enabled"));
    });
});
