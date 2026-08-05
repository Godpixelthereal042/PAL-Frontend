/**
 * Customer Deployment Framework Test Suite (PAL-TDD-009, Sprint 22 Milestone 5)
 *
 * Verifies:
 *   1. Initializes customer deployment with 5-step onboarding wizard.
 *   2. Advances onboarding steps and updates adoption score (0-100%).
 *   3. Certifies executive Go Live upon completing step 5.
 */

import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { CustomerDeploymentFramework } from "../lib/deployment/customerDeploymentFramework.ts";

describe("Sprint 22 Milestone 5 — First Customer Deployment Framework", () => {
    const deploymentFramework = CustomerDeploymentFramework.getInstance();

    it("1. Initializes customer onboarding deployment wizard with 5 structured steps", () => {
        const dep = deploymentFramework.initializeCustomerDeployment("ws_pilot_co", "Acme Pilot Corp");

        assert.ok(dep.deploymentId.startsWith("dep_"));
        assert.equal(dep.companyName, "Acme Pilot Corp");
        assert.equal(dep.steps.length, 5);
        assert.equal(dep.currentStepNumber, 2);
        assert.equal(dep.palAdoptionScorePct, 20); // 1/5 completed -> 20%
    });

    it("2. Advances deployment steps sequentially to 100% adoption and Go Live certification", () => {
        deploymentFramework.advanceDeploymentStep("ws_pilot_co", 2);
        deploymentFramework.advanceDeploymentStep("ws_pilot_co", 3);
        deploymentFramework.advanceDeploymentStep("ws_pilot_co", 4);
        const finalDep = deploymentFramework.advanceDeploymentStep("ws_pilot_co", 5);

        assert.equal(finalDep.isGoLiveCompleted, true);
        assert.equal(finalDep.palAdoptionScorePct, 100);
        assert.ok(finalDep.goLiveDate);
    });
});
