/**
 * Sprint 22 — PAL Enterprise Reality Layer E2E Integration Suite (v2.2.0)
 *
 * Verifies the complete 6-milestone commercial deployment pipeline:
 *   1. Production Database Engine manages PostgreSQL cluster & migration v22.
 *   2. Enterprise Identity Manager resolves 11-Step RBAC & issues team invitations.
 *   3. Connector Marketplace Engine installs verified Stripe & HubSpot connectors.
 *   4. Executive Mobile Gateway synthesizes morning voice briefing & push payloads.
 *   5. Customer Deployment Framework completes 5-step onboarding wizard to Go Live.
 *   6. Enterprise Security Readiness Engine generates 200+ vendor security answers.
 */

import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { ProductionDatabaseEngine } from "../lib/infrastructure/productionDatabaseEngine.ts";
import { EnterpriseIdentityManager } from "../lib/tenant/enterpriseIdentityManager.ts";
import { ConnectorMarketplaceEngine } from "../lib/marketplace/connectorMarketplaceEngine.ts";
import { ExecutiveMobileGateway } from "../lib/cockpit/executiveMobileGateway.ts";
import { CustomerDeploymentFramework } from "../lib/deployment/customerDeploymentFramework.ts";
import { EnterpriseSecurityReadinessEngine } from "../lib/security/enterpriseSecurityReadinessEngine.ts";

describe("Sprint 22 — PAL Enterprise Reality Layer (v2.2.0 E2E)", () => {
    const dbEngine = ProductionDatabaseEngine.getInstance();
    const identityManager = EnterpriseIdentityManager.getInstance();
    const marketplace = ConnectorMarketplaceEngine.getInstance();
    const mobileGateway = ExecutiveMobileGateway.getInstance();
    const deploymentFramework = CustomerDeploymentFramework.getInstance();
    const securityEngine = EnterpriseSecurityReadinessEngine.getInstance();

    const workspaceId = "ws_e2e_reality_corp";

    it("1. Verifies PostgreSQL cluster status and migration version 22", () => {
        const status = dbEngine.getClusterStatus();

        assert.equal(status.primaryRegion, "us-east-1");
        assert.equal(status.migrationVersion, 22);
        assert.equal(status.isMultiRegionReplicationActive, true);
    });

    it("2. Verifies 11-step RBAC permissions and creates team invitation with audit log", () => {
        assert.equal(identityManager.evaluateRBACPermission("CEO", "action:approve_l3"), true);

        const inv = identityManager.createTeamInvitation({
            workspaceId,
            email: "cfo@realitycorp.com",
            assignedRole: "CFO",
            invitedByEmail: "ceo@realitycorp.com"
        });

        assert.ok(inv.invitationToken);
        assert.equal(inv.assignedRole, "CFO");
    });

    it("3. Installs verified Stripe connector and checks SLA uptime status", () => {
        const installed = marketplace.installConnector(workspaceId, "conn_stripe_prod");

        assert.equal(installed.connectorName, "Stripe Enterprise Billing Gateway");
        assert.equal(installed.isVerifiedEnterprise, true);
        assert.equal(installed.uptimeSlaPct, 99.99);
    });

    it("4. Generates Executive Voice Briefing and mobile push payload", () => {
        const briefing = mobileGateway.generateVoiceBriefing({
            workspaceId,
            recipientName: "CEO Jane",
            pendingApprovalsCount: 2,
            topRiskTitle: "unutilized SaaS spend"
        });

        assert.ok(briefing.spokenHeadline.includes("Good morning, CEO Jane"));
        assert.equal(briefing.audioDurationSeconds, 15);

        const push = mobileGateway.createMobilePushPayload({
            workspaceId,
            targetUserId: "usr_ceo",
            cardId: "card_101",
            title: "PAL Action: Cancel Datadog",
            body: "Saves $14,400/yr"
        });

        assert.equal(push.actionableButtons.length, 3);
    });

    it("5. Completes 5-step Customer Deployment Wizard to executive Go Live certification", () => {
        deploymentFramework.initializeCustomerDeployment(workspaceId, "Reality Corp");

        deploymentFramework.advanceDeploymentStep(workspaceId, 2);
        deploymentFramework.advanceDeploymentStep(workspaceId, 3);
        deploymentFramework.advanceDeploymentStep(workspaceId, 4);
        const finalDep = deploymentFramework.advanceDeploymentStep(workspaceId, 5);

        assert.equal(finalDep.isGoLiveCompleted, true);
        assert.equal(finalDep.palAdoptionScorePct, 100);
    });

    it("6. Generates Enterprise Procurement Package and answers vendor security questions", () => {
        const pkg = securityEngine.generateProcurementPackage(workspaceId);

        assert.equal(pkg.soc2Status, "AUDIT_READY");
        assert.equal(pkg.gdprStatus, "COMPLIANT");
        assert.equal(pkg.iso27001Status, "ALIGNED");
        assert.ok(pkg.questionnaireAnswersCount >= 200);
        assert.ok(pkg.sampleQuestionnaireAnswers.some(a => a.automatedAnswer.includes("AES-256-GCM")));
    });

    it("7. Verifies Database migration history contains all 4 major sprint versions (v1, v20, v21, v22)", () => {
        const history = dbEngine.getMigrationHistory();
        assert.ok(history.some(m => m.version === 1));
        assert.ok(history.some(m => m.version === 20));
        assert.ok(history.some(m => m.version === 21));
        assert.ok(history.some(m => m.version === 22));
    });

    it("8. Verifies Enterprise Identity Manager RBAC permissions across all 6 role tiers", () => {
        assert.equal(identityManager.evaluateRBACPermission("Owner", "any:permission"), true);
        assert.equal(identityManager.evaluateRBACPermission("CEO", "any:permission"), true);
        assert.equal(identityManager.evaluateRBACPermission("CFO", "finance:write"), true);
        assert.equal(identityManager.evaluateRBACPermission("Executive", "report:view"), true);
        assert.equal(identityManager.evaluateRBACPermission("Operator", "action:execute"), true);
        assert.equal(identityManager.evaluateRBACPermission("Viewer", "dashboard:read"), true);
    });

    it("9. Verifies Real Connector Marketplace catalog features verified badges and SLA metrics", () => {
        const catalog = marketplace.getCatalog();
        const hubspot = catalog.find(c => c.connectorId === "conn_hubspot_prod");
        const slack = catalog.find(c => c.connectorId === "conn_slack_prod");

        assert.ok(hubspot && hubspot.isVerifiedEnterprise);
        assert.ok(slack && slack.uptimeSlaPct >= 99.9);
    });

    it("10. Verifies Executive Mobile Gateway voice briefing formatting and duration calculation", () => {
        const briefing = mobileGateway.generateVoiceBriefing({
            workspaceId,
            recipientName: "CEO Jane",
            pendingApprovalsCount: 5,
            topRiskTitle: "unutilized SaaS tool drift"
        });

        assert.ok(briefing.spokenHeadline.includes("unutilized SaaS tool drift"));
        assert.equal(briefing.pendingApprovalsCount, 5);
        assert.equal(briefing.audioDurationSeconds, 15);
    });

    it("11. Verifies Customer Deployment Framework 5-step wizard progression and adoption scoring", () => {
        const dep = deploymentFramework.getDeploymentStatus(workspaceId);
        assert.ok(dep);
        assert.equal(dep.isGoLiveCompleted, true);
        assert.equal(dep.palAdoptionScorePct, 100);
        assert.equal(dep.steps.length, 5);
    });

    it("12. Verifies Enterprise Security Readiness Engine answers encryption, access control, and audit questions", () => {
        const pkg = securityEngine.generateProcurementPackage(workspaceId);
        const qEnc = pkg.sampleQuestionnaireAnswers.find(q => q.category === "encryption");
        const qAccess = pkg.sampleQuestionnaireAnswers.find(q => q.category === "access_control");

        assert.ok(qEnc && qEnc.confidenceScorePct === 100);
        assert.ok(qAccess && qAccess.automatedAnswer.includes("Row-Level Security"));
    });
});
