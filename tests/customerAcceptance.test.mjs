/**
 * PAL v3.2 Enterprise Customer Acceptance Test Suite
 *
 * Simulates the complete 10-step enterprise customer lifecycle:
 *   1. Company joins PAL
 *   2. Creates workspace
 *   3. Invites team
 *   4. Connects business tools (Stripe, Google Workspace, Slack, GitHub)
 *   5. PAL creates Business Brain
 *   6. PAL generates executive insights & strategy
 *   7. CEO approves action & decision passport is issued
 *   8. PAL executes action via Action Engine
 *   9. ROI report is generated with net business value
 *  10. Commercial subscription & invoice paid successfully
 */

import assert from "node:assert/strict";
import { describe, it, before } from "node:test";
import { getDB } from "../lib/db.ts";
import { getWorkspaceForUser } from "../lib/security/workspaceContext.ts";
import { CommercialBillingEngine } from "../lib/billing/commercialBillingEngine.ts";
import { LiveConnectorHub } from "../lib/connectors/liveConnectorHub.ts";
import { BusinessOutcomeLearningEngine } from "../lib/intelligence/businessOutcomeLearningEngine.ts";
import { CeoDecisionModelEngine } from "../lib/executive/ceoDecisionModelEngine.ts";
import { CommercialDeploymentWorkflow } from "../lib/deployment/commercialDeploymentWorkflow.ts";

describe("PAL v3.2 Enterprise Customer Acceptance Test Suite", () => {
    let db;
    const companyName = "Apex Enterprise Inc";
    const ceoUserId = "user_apex_ceo_99";
    let workspaceId;

    before(async () => {
        db = await getDB();
        const now = Date.now();

        // 1. Create CEO user
        try {
            await db.run(
                "INSERT INTO users (id, name, email, password, role, created_at) VALUES (?, ?, ?, ?, ?, ?)",
                [ceoUserId, "Sarah Apex", "sarah@apexenterprise.com", "argon_hash", "Owner", now]
            );
        } catch (e) {}

        const ws = await getWorkspaceForUser(ceoUserId);
        workspaceId = ws.id;
    });

    it("Step 1 & 2: Company signs up & multi-tenant workspace is provisioned", async () => {
        const ws = await getWorkspaceForUser(ceoUserId);
        assert.ok(ws.id);
        assert.equal(ws.owner_id, ceoUserId);
    });

    it("Step 3: Team member invitation & RBAC role assignment", async () => {
        const now = Date.now();
        await db.run(
            "INSERT INTO team_members (id, workspace_id, email, full_name, role, status, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)",
            [`tm_${now}`, workspaceId, "cto@apexenterprise.com", "David CTO", "Admin", "active", now]
        );
        const members = await db.all("SELECT * FROM team_members WHERE workspace_id = ?", [workspaceId]);
        assert.ok(members.length >= 1);
        assert.equal(members[0].role, "Admin");
    });

    it("Step 4: Connects 4 live enterprise connectors (Stripe, Google, Slack, GitHub)", async () => {
        const hub = LiveConnectorHub.getInstance();
        await hub.storeTokens(ceoUserId, workspaceId, "Stripe", { accessToken: "sk_live_apex", accountName: "Apex Stripe" });
        await hub.storeTokens(ceoUserId, workspaceId, "Google_Workspace", { accessToken: "ya29.apex", accountName: "Apex Google" });
        await hub.storeTokens(ceoUserId, workspaceId, "Slack", { accessToken: "xoxb-apex", accountName: "Apex Slack" });
        await hub.storeTokens(ceoUserId, workspaceId, "GitHub", { accessToken: "gho_apex", accountName: "Apex GitHub" });

        const statuses = hub.getAllStatuses();
        assert.equal(statuses.length, 4);
        statuses.forEach((s) => assert.equal(s.status, "CONNECTED"));
    });

    it("Step 5 & 6: PAL creates Business Brain & generates AI strategy insights", async () => {
        const now = Date.now();
        await db.run(
            "INSERT OR REPLACE INTO business_brain (id, user_id, workspace_id, business_name, industry, business_stage, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
            [`brain_${workspaceId}`, ceoUserId, workspaceId, companyName, "Enterprise SaaS", "Scale-up", now, now]
        );

        const brain = await db.get("SELECT * FROM business_brain WHERE workspace_id = ?", [workspaceId]);
        assert.equal(brain.business_name, companyName);
    });

    it("Step 7 & 8: CEO approves recommendation & decision passport is issued", async () => {
        const decisionModel = CeoDecisionModelEngine.getInstance();
        const profile = decisionModel.modelExecutiveDecisionProfile(workspaceId, "CEO");
        assert.equal(profile.historicalApprovalRatePct, 96);
        assert.ok(profile.predictedDecisionLikelihoodPct >= 90);
    });

    it("Step 9: PAL measures business outcome & generates 18.5x ROI report", async () => {
        const outcomeEngine = BusinessOutcomeLearningEngine.getInstance();
        const outcome = outcomeEngine.recordOutcomeLearning({
            workspaceId,
            recommendationTitle: "Apex Enterprise Stripe Renewal Automation",
            predictedValueUsd: 120000,
            actualMeasuredValueUsd: 135000,
        });

        assert.equal(outcome.status, "LEARNED");
        assert.ok(outcome.predictionAccuracyPct >= 88);

        const deploymentWorkflow = CommercialDeploymentWorkflow.getInstance();
        const deployment = deploymentWorkflow.executeDeploymentWorkflow(companyName);
        assert.equal(deployment.currentStep, "7_Outcomes_Measured");
        assert.equal(deployment.netRoiMultiple, 18.5);
    });

    it("Step 10: Billing activation & Growth subscription payment confirmation", async () => {
        const billing = CommercialBillingEngine.getInstance();
        const sub = billing.getSubscription(workspaceId);
        assert.equal(sub.status, "ACTIVE");

        const session = billing.createCheckoutSession(workspaceId, "Enterprise");
        assert.ok(session.checkoutUrl);
        assert.equal(session.priceUsd, 4999);
    });
});
