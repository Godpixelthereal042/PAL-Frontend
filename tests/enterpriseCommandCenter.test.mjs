/**
 * Enterprise Command Center Test Suite (PAL-TDD-014, Sprint 27 Milestone 4)
 */

import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { EnterpriseCommandCenter } from "../lib/cockpit/enterpriseCommandCenter.ts";

describe("Sprint 27 Milestone 4 — Enterprise Command Center 2.0", () => {
    const commandCenter = EnterpriseCommandCenter.getInstance();

    it("1. Generates CEO command snapshot with 94% company health and 12 active AI employees", () => {
        const snapshot = commandCenter.getCommandCenterSnapshot("ws_cmd_ceo", "Enterprise Global Corp");

        assert.ok(snapshot.snapshotId.startsWith("cmd_snap_"));
        assert.equal(snapshot.overallCompanyHealthScorePct, 94);
        assert.equal(snapshot.activeAiEmployeesCount, 12);
        assert.equal(snapshot.pendingExecutiveApprovalsCount, 2);
    });

    it("2. Includes top strategic recommendation, risk prediction, and $380,000 projected quarterly net value", () => {
        const snapshot = commandCenter.getCommandCenterSnapshot("ws_cmd_ceo");

        assert.ok(snapshot.topStrategicRecommendation.includes("Enterprise Autonomous Suite"));
        assert.ok(snapshot.topRiskPrediction.includes("SaaS vendor spend anomaly"));
        assert.equal(snapshot.projectedNetValueQuarterUsd, 380000);
    });
});
