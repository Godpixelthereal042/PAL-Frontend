/**
 * CTO Production Audit — First Paying Customer Simulation (PAL v3.0)
 */

import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { CommercialDeploymentWorkflow } from "../lib/deployment/commercialDeploymentWorkflow.ts";
import { LiveConnectorHub } from "../lib/connectors/liveConnectorHub.ts";
import { ProductionLaunchEngine } from "../lib/infrastructure/productionLaunchEngine.ts";
import { CommercialBillingEngine } from "../lib/billing/commercialBillingEngine.ts";
import { BusinessOutcomeLearningEngine } from "../lib/intelligence/businessOutcomeLearningEngine.ts";
import { CeoDecisionModelEngine } from "../lib/executive/ceoDecisionModelEngine.ts";
import { PalDeveloperPlatform } from "../lib/platform/palDeveloperPlatform.ts";

describe("CTO Production Audit — First Paying Customer Simulation", () => {
    const deploymentWorkflow = CommercialDeploymentWorkflow.getInstance();
    const connectorHub = LiveConnectorHub.getInstance();
    const launchEngine = ProductionLaunchEngine.getInstance();
    const billingEngine = CommercialBillingEngine.getInstance();
    const outcomeEngine = BusinessOutcomeLearningEngine.getInstance();
    const decisionModel = CeoDecisionModelEngine.getInstance();
    const devPlatform = PalDeveloperPlatform.getInstance();

    const companyName = "Atlas SaaS Inc";
    const workspaceId = "ws_atlas_saas_001";

    it("Step 1: New company signs up & creates workspace", () => {
        const sub = billingEngine.getSubscription(workspaceId);
        assert.equal(sub.workspaceId, workspaceId);
        assert.equal(sub.tier, "Growth");
        assert.equal(sub.status, "ACTIVE");
    });

    it("Step 2: Connects Stripe & triggers sync", () => {
        const stripeStatus = connectorHub.getConnectorStatus("Stripe");
        assert.ok(stripeStatus);
        assert.equal(stripeStatus.status, "CONNECTED");
        const synced = connectorHub.triggerSync("Stripe");
        assert.equal(synced.status, "CONNECTED");
    });

    it("Step 3: PAL analyzes business & generates insights", () => {
        const audit = launchEngine.runProductionAudit();
        assert.equal(audit.readinessScorePct, 98);
        assert.equal(audit.multiTenantIsolationStatus, "VERIFIED_SECURE");
    });

    it("Step 4: CEO approves action & decision passport is verified", () => {
        const ceoProfile = decisionModel.modelExecutiveDecisionProfile(workspaceId, "CEO");
        assert.equal(ceoProfile.historicalApprovalRatePct, 96);
        assert.ok(ceoProfile.decisionReasoningExplanation.includes("AIDecisionPassports"));
    });

    it("Step 5: PAL executes & outcome learning measures ROI", () => {
        const deployment = deploymentWorkflow.executeDeploymentWorkflow(companyName);
        assert.equal(deployment.currentStep, "7_Outcomes_Measured");
        assert.equal(deployment.netRoiMultiple, 18.5);

        const outcome = outcomeEngine.recordOutcomeLearning({
            workspaceId,
            recommendationTitle: "Atlas SaaS Stripe Renewal Automation",
            predictedValueUsd: 45000,
            actualMeasuredValueUsd: 48200
        });
        assert.equal(outcome.predictionAccuracyPct, 93.4);
        assert.equal(outcome.status, "LEARNED");
    });

    it("Step 6: API key provision & rate limiting", () => {
        const apiKey = devPlatform.provisionApiKey(workspaceId, ["read:intelligence"]);
        assert.ok(apiKey.apiKeyMasked.startsWith("pal_live_..."));
        assert.equal(apiKey.rateLimitRpm, 600);
    });
});
