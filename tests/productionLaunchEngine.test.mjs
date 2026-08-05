/**
 * Production Launch Engine Test Suite (PAL-TDD-015, Phase 3)
 */

import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { ProductionLaunchEngine } from "../lib/infrastructure/productionLaunchEngine.ts";

describe("Phase 3 — Production Infrastructure & Security", () => {
    const launchEngine = ProductionLaunchEngine.getInstance();

    it("1. Runs production audit and evaluates 98% launch readiness score", () => {
        const report = launchEngine.runProductionAudit();

        assert.equal(report.readinessScorePct, 98);
        assert.equal(report.multiTenantIsolationStatus, "VERIFIED_SECURE");
        assert.ok(report.environmentChecks.length >= 6);
    });

    it("2. Verifies environment checks array contains DATABASE_URL and JWT_SECRET", () => {
        const report = launchEngine.runProductionAudit();
        const dbCheck = report.environmentChecks.find(c => c.name === "DATABASE_URL");
        const jwtCheck = report.environmentChecks.find(c => c.name === "JWT_SECRET");

        assert.ok(dbCheck);
        assert.ok(jwtCheck);
    });
});
