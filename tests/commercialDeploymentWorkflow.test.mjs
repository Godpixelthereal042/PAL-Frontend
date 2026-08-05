/**
 * Commercial Deployment Workflow Test Suite (PAL-TDD-015, Phase 5)
 */

import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { CommercialDeploymentWorkflow } from "../lib/deployment/commercialDeploymentWorkflow.ts";

describe("Phase 5 — Commercial Customer Deployment Workflow", () => {
    const deploymentWorkflow = CommercialDeploymentWorkflow.getInstance();

    it("1. Executes 7-step customer deployment workflow achieving 100% activation & 18.5x ROI", () => {
        const progress = deploymentWorkflow.executeDeploymentWorkflow("Acme SaaS Corp");

        assert.ok(progress.deploymentId.startsWith("dpl_com_"));
        assert.equal(progress.currentStep, "7_Outcomes_Measured");
        assert.equal(progress.activationPct, 100);
        assert.equal(progress.adoptionPct, 94);
        assert.equal(progress.netRoiMultiple, 18.5);
        assert.equal(progress.retentionRiskLevel, "LOW");
    });
});
