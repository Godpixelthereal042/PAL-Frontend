/**
 * Sprint 21 — PAL Autonomous Company Validation Layer E2E Integration Suite (v2.1.0)
 *
 * Verifies the complete 8-milestone validation layer pipeline:
 *   1. Runtime Persistence serializes operational state & restores snapshot on cold boot.
 *   2. Pilot Engine onboards SaaS company and delivers Day Zero Intelligence.
 *   3. Webhook Intelligence Gateway ingests Stripe event & notifies Agent Mesh.
 *   4. Executive Approval Center formats 5-Question Approval Card & handles CEO approval.
 *   5. Passport Verification Center audits SHA-256 cryptographic proof (CERTIFIED_VALID).
 *   6. ROI Proof Engine quantifies $69,000 total business value and 23.0x ROI multiple.
 *   7. Enterprise Demo Datasets hydrate SaaS (2,000 cust), Healthcare, and Commerce environments.
 *   8. Production Readiness Engine computes 94% Enterprise Readiness score.
 */

import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { createHmac } from "node:crypto";
import { RuntimePersistenceEngine } from "../lib/infrastructure/runtimePersistenceEngine.ts";
import { ProductionPilotEngine } from "../lib/pilot/productionPilotEngine.ts";
import { WebhookIntelligenceGateway } from "../lib/connectors/webhookIntelligenceGateway.ts";
import { ExecutiveApprovalCenter } from "../lib/cockpit/executiveApprovalCenter.ts";
import { PassportVerificationCenter } from "../lib/security/passportVerificationCenter.ts";
import { ROIProofEngine } from "../lib/outcomes/roiProofEngine.ts";
import { EnterpriseDemoDatasets } from "../lib/simulation/enterpriseDemoDatasets.ts";
import { ProductionReadinessEngine } from "../lib/security/productionReadinessEngine.ts";
import { AIDecisionPassportEngine } from "../lib/trust/aiDecisionPassport.ts";

describe("Sprint 21 — PAL Autonomous Company Validation Layer (v2.1.0 E2E)", () => {
    const persistenceEngine = RuntimePersistenceEngine.getInstance();
    const pilotEngine = ProductionPilotEngine.getInstance();
    const webhookGateway = WebhookIntelligenceGateway.getInstance();
    const approvalCenter = ExecutiveApprovalCenter.getInstance();
    const verificationCenter = PassportVerificationCenter.getInstance();
    const roiEngine = ROIProofEngine.getInstance();
    const readinessEngine = ProductionReadinessEngine.getInstance();
    const passportEngine = AIDecisionPassportEngine.getInstance();

    const workspaceId = "ws_e2e_val_corp";
    const webhookSecret = "secret_e2e_key";

    it("1. Hydrates runtime state via RuntimePersistenceEngine", () => {
        const snap = persistenceEngine.saveSnapshot(workspaceId, {
            trustProfiles: [],
            actionHistory: [],
            memories: []
        });

        assert.equal(snap.workspaceId, workspaceId);

        const restored = persistenceEngine.restoreSnapshot(workspaceId);
        assert.ok(restored);
        assert.equal(restored.snapshotId, snap.snapshotId);
    });

    it("2. Onboards company pilot and delivers instant Day Zero Intelligence insight", () => {
        const report = pilotEngine.onboardPilotCompany({
            workspaceId,
            companyName: "ValCorp SaaS",
            industryTemplate: "saas",
            monthlyRevenueUSD: 60000,
            monthlyExpensesUSD: 40000,
            teamSize: 20
        });

        assert.equal(report.companyName, "ValCorp SaaS");
        assert.ok(report.dayZeroInsightHeadline.includes("reducing unutilized SaaS spend"));
        assert.ok(report.projected90DayROIUSD > 50000);
    });

    it("3. Ingests live Stripe webhook event and updates Business Knowledge Graph", () => {
        const rawBody = JSON.stringify({ id: "sub_e2e_99", customer: "cus_e2e", amount: 199 });
        const signature = createHmac("sha256", webhookSecret).update(rawBody).digest("hex");

        const result = webhookGateway.processIncomingWebhook({
            webhookId: "wh_e2e_stripe_101",
            provider: "stripe",
            eventType: "customer.subscription.deleted",
            rawBody,
            signature,
            secret: webhookSecret,
            receivedAt: Date.now()
        }, workspaceId);

        assert.equal(result.status, "processed");
        assert.equal(result.meshNotified, true);
        assert.equal(result.graphUpdated, true);
    });

    it("4. Formats 5-Question Approval Card and executes CEO 'Approve' action", () => {
        const card = approvalCenter.createApprovalCard({
            workspaceId,
            actionId: "act_e2e_cancel_datadog",
            agentRole: "cfo",
            agentName: "Chief Financial Agent",
            whatHappened: "Unutilized Datadog monitoring subscription detected ($1,200/mo spend).",
            whyPALRecommendsThis: "Canceling Datadog extends cash runway without impacting uptime.",
            supportingEvidence: ["Datadog usage metrics: 0 queries in 60 days"],
            whatHappensIfApproved: "Saves $1,200/month immediately.",
            whatHappensIfRejected: "Spend drift continues.",
            estimatedFinancialImpactUSD: 14400,
            confidenceScorePct: 98,
            riskClassification: "reversible"
        });

        const res = approvalCenter.respondToApprovalCard({
            cardId: card.cardId,
            response: "approve"
        });

        assert.equal(res.success, true);
        assert.equal(res.card.status, "approved");
        assert.equal(res.actionResult.approvedByCEO, true);
    });

    it("5. Audits cryptographic AI Decision Passport with CERTIFIED_VALID status", () => {
        const passport = passportEngine.issuePassport({
            decisionId: "dec_e2e_101",
            workspaceId,
            actionSummary: "CFO: Cancel Datadog Subscription ($1,200/mo)",
            whyPALDidThis: "Datadog usage showed 0 queries in 60 days.",
            dataInfluences: ["AWS Billing API"],
            alternativesConsidered: ["Keep subscription"],
            approvedByUserId: "usr_ceo",
            approvalRole: "CEO"
        });

        const audit = verificationCenter.verifyPassport(passport.passportId);

        assert.equal(audit.auditStatus, "CERTIFIED_VALID");
        assert.equal(audit.isValidSignature, true);
        assert.equal(audit.fivePointProof.whoApproved.approverId, "usr_ceo");
    });

    it("6. Computes $69,000 total business value and 23.0x ROI multiple in ROIProofEngine", () => {
        const report = roiEngine.generateROIReport({
            workspaceId,
            companyName: "ValCorp SaaS",
            timeframeDays: 90,
            beforePALMonthlyRevenueUSD: 50000,
            beforePALMonthlyExpensesUSD: 35000,
            afterPALMonthlyRevenueUSD: 64000,
            afterPALMonthlyExpensesUSD: 31000,
            hoursAutomatedPerMonth: 100,
            monthlyPALSubscriptionCostUSD: 1000
        });

        assert.equal(report.totalBusinessValueUSD, 69000);
        assert.equal(report.roiMultiple, 23.0);
        assert.ok(report.caseStudyHeadline.includes("23x ROI"));
    });

    it("7. Hydrates 2,000-customer SaaS Enterprise Demo environment", () => {
        const demo = EnterpriseDemoDatasets.getSaaSEnterpriseDemo();

        assert.equal(demo.customerRecordCount, 2000);
        assert.equal(demo.companyName, "Acme Cloud Enterprise");
        assert.ok(demo.roiProofReport.roiMultiple > 10.0);
    });

    it("8. Evaluates Production Readiness Score (94% Enterprise Ready)", () => {
        const readiness = readinessEngine.evaluateProductionReadiness(workspaceId);

        assert.equal(readiness.overallReadinessPct, 94);
        assert.equal(readiness.readinessGrade, "ENTERPRISE_READY");
        assert.ok(readiness.readinessSummary.includes("94% Enterprise Ready"));
    });

    it("9. Verifies Day Zero Intelligence scan output across all 3 pilot templates", () => {
        const saas = pilotEngine.onboardPilotCompany({ workspaceId: "ws_val_saas", companyName: "SaaS Co", industryTemplate: "saas", monthlyRevenueUSD: 100000, monthlyExpensesUSD: 70000, teamSize: 25 });
        const ecom = pilotEngine.onboardPilotCompany({ workspaceId: "ws_val_ecom", companyName: "Ecom Co", industryTemplate: "ecommerce", monthlyRevenueUSD: 150000, monthlyExpensesUSD: 110000, teamSize: 15 });
        const agency = pilotEngine.onboardPilotCompany({ workspaceId: "ws_val_agency", companyName: "Agency Co", industryTemplate: "agency", monthlyRevenueUSD: 90000, monthlyExpensesUSD: 60000, teamSize: 30 });

        assert.ok(saas.dayZeroInsightHeadline.includes("SaaS spend"));
        assert.ok(ecom.dayZeroInsightHeadline.includes("Inventory holding"));
        assert.ok(agency.dayZeroInsightHeadline.includes("Billable team utilization"));
    });

    it("10. Verifies Webhook Intelligence Gateway deduplication and invalid signature protection", () => {
        const rawBody = JSON.stringify({ event: "ping" });
        const resDup = webhookGateway.processIncomingWebhook({
            webhookId: "wh_e2e_stripe_101", // duplicate from test 3
            provider: "stripe",
            eventType: "ping",
            rawBody,
            signature: "sig",
            secret: webhookSecret,
            receivedAt: Date.now()
        }, workspaceId);

        assert.equal(resDup.status, "duplicate_rejected");

        const resBadSig = webhookGateway.processIncomingWebhook({
            webhookId: "wh_bad_sig_999",
            provider: "stripe",
            eventType: "ping",
            rawBody,
            signature: "bad_signature",
            secret: webhookSecret,
            receivedAt: Date.now()
        }, workspaceId);

        assert.equal(resBadSig.status, "signature_failed");
    });

    it("11. Verifies Executive Approval Center 'Modify' action records CEO override in Preference Model", () => {
        const card = approvalCenter.createApprovalCard({
            workspaceId,
            actionId: "act_mod_e2e",
            agentRole: "cro",
            agentName: "Chief Revenue Agent",
            whatHappened: "Pipeline conversion drop",
            whyPALRecommendsThis: "Discount 30%",
            supportingEvidence: ["4 enterprise trials"],
            whatHappensIfApproved: "Close trials",
            whatHappensIfRejected: "Remain stagnant",
            estimatedFinancialImpactUSD: 20000,
            confidenceScorePct: 90,
            riskClassification: "reversible"
        });

        const res = approvalCenter.respondToApprovalCard({
            cardId: card.cardId,
            response: "modify",
            overrideNotes: "Keep firm pricing; add free onboarding support",
            modifiedParams: { addFreeOnboarding: true }
        });

        assert.equal(res.card.status, "modified");
        assert.equal(res.actionResult.status, "modified_and_executed");
    });

    it("12. Verifies Passport Verification Center returns PASSPORT_NOT_FOUND for invalid ID", () => {
        const report = verificationCenter.verifyPassport("psp_invalid_99999");
        assert.equal(report.auditStatus, "PASSPORT_NOT_FOUND");
        assert.equal(report.isValidSignature, false);
    });

    it("13. Verifies Healthcare and Commerce enterprise demo environments produce ROI reports", () => {
        const hc = EnterpriseDemoDatasets.getHealthcareEnterpriseDemo();
        const ecom = EnterpriseDemoDatasets.getCommerceEnterpriseDemo();

        assert.ok(hc.roiProofReport);
        assert.ok(hc.roiProofReport.roiMultiple > 5.0);
        assert.ok(ecom.roiProofReport);
        assert.ok(ecom.roiProofReport.roiMultiple > 5.0);
    });

    it("14. Verifies Production Readiness Engine evaluates all 4 category scores", () => {
        const readiness = readinessEngine.evaluateProductionReadiness(workspaceId);

        const sec = readiness.categories.find(c => c.categoryKey === "security");
        const rel = readiness.categories.find(c => c.categoryKey === "reliability");
        const trust = readiness.categories.find(c => c.categoryKey === "ai_trust");
        const data = readiness.categories.find(c => c.categoryKey === "data_quality");

        assert.ok(sec && sec.scorePct >= 90);
        assert.ok(rel && rel.scorePct >= 90);
        assert.ok(trust && trust.scorePct >= 90);
        assert.ok(data && data.scorePct >= 90);
    });
});
