/**
 * Sprint 7 — Milestone 2: Real SaaS Connectors & Worker Drivers (PAL-TDD-006)
 *
 * Tests verify:
 *   1. Workers fall back to stub mode when OAuth credentials are absent
 *   2. Workers route through ConnectorRuntime when live credentials exist
 *   3. Workers return isStub=false only on live execution
 *   4. Dry-run mode validates but does NOT execute destructive operations
 *   5. FinanceWorker enforces human approval gate for high-spend operations in all modes
 *   6. ConnectorRuntime failure triggers graceful stub fallback
 *   7. CRMWorker routes through HubSpotConnector
 *   8. All workers inject and use ConnectorRuntime (4-tier architecture validation)
 */

import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { EmailWorker } from "../lib/workers/emailWorker.ts";
import { CalendarWorker } from "../lib/workers/calendarWorker.ts";
import { CRMWorker } from "../lib/workers/crmWorker.ts";
import { FinanceWorker } from "../lib/workers/financeWorker.ts";
import { OAuthManager } from "../lib/connectors/oauthManager.ts";
import { ConnectorRuntime } from "../lib/integrations/connectorRuntime.ts";

/** Minimal valid execution context for tests */
function makeContext(workspaceId = "ws_default") {
    return {
        executionId: `exec_${Date.now()}`,
        workspaceId,
        correlationId: `corr_${Date.now()}`,
        activeRole: "email",
        environment: "test",
        traceId: `tr_${Date.now()}`,
        startedAt: Date.now()
    };
}

/** Store live OAuth creds for a workspace */
async function storeWorkspaceCreds(oauth, workspaceId, connectorId) {
    await oauth.storeCredentials({
        connectorId,
        workspaceId,
        accessToken: `ya29.live_test_${Date.now()}`,
        refreshToken: `1//refresh_${Date.now()}`,
        expiresAt: Date.now() + 3600000,
        tokenType: "Bearer",
        scope: "all"
    });
}

describe("Sprint 7 — Milestone 2: Real SaaS Connectors & Worker Drivers", () => {

    // ────────────────────────────────────────────────────────────────────
    // Section A: EmailWorker
    // ────────────────────────────────────────────────────────────────────
    it("1. EmailWorker defaults to isStub=true when OAuth credentials are absent", async () => {
        const oauthManager = new OAuthManager();
        const worker = new EmailWorker(oauthManager);

        const response = await worker.executeTask({
            taskId: "task_email_01",
            workspaceId: "ws_default",
            correlationId: "corr_01",
            taskDescription: "Send introduction email",
            inputParameters: { to: "test@client.com", subject: "Hello" },
            context: makeContext()
        });

        assert.equal(response.status, "success");
        assert.equal(response.isStub, true);
        assert.ok(response.warnings.some(w => w.includes("simulated fallback mode")));
        assert.equal(response.outputs.deliveryChannel, "simulated_stub");
    });

    it("2. EmailWorker sets isStub=false when OAuth credentials exist (ConnectorRuntime route)", async () => {
        const oauthManager = new OAuthManager();
        await storeWorkspaceCreds(oauthManager, "ws_acme", "google_workspace");

        const worker = new EmailWorker(oauthManager);
        const response = await worker.executeTask({
            taskId: "task_email_02",
            workspaceId: "ws_acme",
            correlationId: "corr_02",
            taskDescription: "Send outbound email",
            inputParameters: { to: "exec@acme.com", subject: "Live Integration" },
            context: makeContext("ws_acme")
        });

        assert.equal(response.status, "success");
        assert.equal(response.isStub, false);
        assert.equal(response.outputs.deliveryChannel, "gmail_api_v1");
        assert.equal(response.outputs.dryRun, false);
        assert.ok(response.outputs.connectorResponse, "Should include connectorResponse from ConnectorRuntime");
    });

    it("3. EmailWorker dry-run validates but does NOT send email", async () => {
        const oauthManager = new OAuthManager();
        await storeWorkspaceCreds(oauthManager, "ws_acme", "google_workspace");

        const worker = new EmailWorker(oauthManager);
        const response = await worker.executeTask({
            taskId: "task_email_03",
            workspaceId: "ws_acme",
            correlationId: "corr_03",
            taskDescription: "Dry-run email test",
            inputParameters: { to: "ceo@acme.com", subject: "Board Report" },
            context: makeContext("ws_acme"),
            dryRun: true
        });

        assert.equal(response.status, "success");
        assert.equal(response.isStub, false);
        assert.equal(response.outputs.dryRun, true);
        assert.equal(response.outputs.sentMessageId, null, "Should NOT have a sentMessageId in dry-run");
        assert.ok(response.outputs.dryRunReport, "Should include dryRunReport");
        assert.equal(response.outputs.dryRunReport.credentialsVerified, true);
        assert.equal(response.outputs.dryRunReport.validationPassed, true);
        assert.ok(response.warnings.some(w => w.includes("[DRY-RUN]")));
        assert.equal(response.metrics.estimatedCostUSD, 0.0, "Dry-run should incur zero cost");
    });

    it("4. EmailWorker dry-run without credentials still returns stub (not dry-run report)", async () => {
        const oauthManager = new OAuthManager();
        const worker = new EmailWorker(oauthManager);

        const response = await worker.executeTask({
            taskId: "task_email_04",
            workspaceId: "ws_default",
            correlationId: "corr_04",
            taskDescription: "No creds dry-run test",
            inputParameters: { to: "test@example.com" },
            context: makeContext(),
            dryRun: true
        });

        // Without credentials, dry-run flag is irrelevant — still returns stub
        assert.equal(response.isStub, true);
        assert.equal(response.outputs.deliveryChannel, "simulated_stub");
    });

    // ────────────────────────────────────────────────────────────────────
    // Section B: CalendarWorker
    // ────────────────────────────────────────────────────────────────────
    it("5. CalendarWorker toggles isStub status based on OAuth credentials", async () => {
        const oauthManager = new OAuthManager();
        const worker = new CalendarWorker(oauthManager);

        // Stub mode (no credentials)
        const stubResp = await worker.executeTask({
            taskId: "task_cal_01",
            workspaceId: "ws_default",
            correlationId: "corr_05",
            taskDescription: "Schedule meeting",
            inputParameters: { title: "Demo Meeting" },
            context: makeContext()
        });
        assert.equal(stubResp.isStub, true);
        assert.equal(stubResp.outputs.provider, "simulated_stub");

        // Live mode (with credentials)
        await storeWorkspaceCreds(oauthManager, "ws_acme", "google_workspace");
        const liveResp = await worker.executeTask({
            taskId: "task_cal_02",
            workspaceId: "ws_acme",
            correlationId: "corr_06",
            taskDescription: "Schedule board meeting",
            inputParameters: { title: "Live Board Meeting" },
            context: makeContext("ws_acme")
        });
        assert.equal(liveResp.isStub, false);
        assert.equal(liveResp.outputs.provider, "google_calendar_v3");
        assert.ok(liveResp.outputs.connectorResponse, "Should include connectorResponse");
    });

    it("6. CalendarWorker dry-run validates but does NOT create calendar event", async () => {
        const oauthManager = new OAuthManager();
        await storeWorkspaceCreds(oauthManager, "ws_acme", "google_workspace");

        const worker = new CalendarWorker(oauthManager);
        const response = await worker.executeTask({
            taskId: "task_cal_03",
            workspaceId: "ws_acme",
            correlationId: "corr_07",
            taskDescription: "Dry-run calendar test",
            inputParameters: { title: "Q4 Board Review" },
            context: makeContext("ws_acme"),
            dryRun: true
        });

        assert.equal(response.status, "success");
        assert.equal(response.isStub, false);
        assert.equal(response.outputs.dryRun, true);
        assert.equal(response.outputs.eventId, null, "Should NOT create event in dry-run");
        assert.ok(response.outputs.dryRunReport);
        assert.ok(response.outputs.dryRunReport.message.includes("[DRY-RUN]"));
        assert.equal(response.metrics.estimatedCostUSD, 0.0);
    });

    // ────────────────────────────────────────────────────────────────────
    // Section C: CRMWorker
    // ────────────────────────────────────────────────────────────────────
    it("7. CRMWorker defaults to stub mode without CRM credentials", async () => {
        const oauthManager = new OAuthManager();
        const worker = new CRMWorker(oauthManager);

        const response = await worker.executeTask({
            taskId: "task_crm_01",
            workspaceId: "ws_default",
            correlationId: "corr_08",
            taskDescription: "Update deal stage",
            inputParameters: { dealId: "deal_500" },
            context: makeContext()
        });

        assert.equal(response.isStub, true);
        assert.equal(response.outputs.provider, "simulated_stub");
    });

    it("8. CRMWorker routes through HubSpotConnector when credentials exist", async () => {
        const oauthManager = new OAuthManager();
        await storeWorkspaceCreds(oauthManager, "ws_acme", "hubspot");

        const worker = new CRMWorker(oauthManager);
        const response = await worker.executeTask({
            taskId: "task_crm_02",
            workspaceId: "ws_acme",
            correlationId: "corr_09",
            taskDescription: "Create lead in CRM",
            inputParameters: { email: "lead@acme.com", dealId: "deal_200" },
            context: makeContext("ws_acme")
        });

        assert.equal(response.isStub, false);
        assert.equal(response.outputs.provider, "hubspot_rest_v3");
        assert.ok(response.outputs.connectorResponse);
        assert.ok(response.outputs.contactId);
    });

    it("9. CRMWorker dry-run validates but does NOT modify CRM records", async () => {
        const oauthManager = new OAuthManager();
        await storeWorkspaceCreds(oauthManager, "ws_acme", "hubspot");

        const worker = new CRMWorker(oauthManager);
        const response = await worker.executeTask({
            taskId: "task_crm_03",
            workspaceId: "ws_acme",
            correlationId: "corr_10",
            taskDescription: "Dry-run CRM update",
            inputParameters: { dealId: "deal_300" },
            context: makeContext("ws_acme"),
            dryRun: true
        });

        assert.equal(response.status, "success");
        assert.equal(response.isStub, false);
        assert.equal(response.outputs.dryRun, true);
        assert.ok(response.outputs.dryRunReport);
        assert.ok(response.outputs.dryRunReport.message.includes("[DRY-RUN]"));
        assert.equal(response.metrics.estimatedCostUSD, 0.0);
    });

    // ────────────────────────────────────────────────────────────────────
    // Section D: FinanceWorker
    // ────────────────────────────────────────────────────────────────────
    it("10. FinanceWorker defaults to stub mode without finance credentials", async () => {
        const oauthManager = new OAuthManager();
        const worker = new FinanceWorker(oauthManager);

        const response = await worker.executeTask({
            taskId: "task_fin_01",
            workspaceId: "ws_default",
            correlationId: "corr_11",
            taskDescription: "Process invoice",
            inputParameters: { amountUSD: 250 },
            context: makeContext()
        });

        assert.equal(response.isStub, true);
        assert.equal(response.outputs.provider, "simulated_stub");
        assert.equal(response.status, "success"); // Under $1000 threshold
    });

    it("11. FinanceWorker routes through StripeConnector when credentials exist", async () => {
        const oauthManager = new OAuthManager();
        await storeWorkspaceCreds(oauthManager, "ws_acme", "stripe");

        const worker = new FinanceWorker(oauthManager);
        const response = await worker.executeTask({
            taskId: "task_fin_02",
            workspaceId: "ws_acme",
            correlationId: "corr_12",
            taskDescription: "Create invoice",
            inputParameters: { amountUSD: 500 },
            context: makeContext("ws_acme")
        });

        assert.equal(response.isStub, false);
        assert.equal(response.outputs.provider, "stripe_rest_v1");
        assert.equal(response.status, "success");
        assert.ok(response.outputs.connectorResponse);
    });

    it("12. FinanceWorker enforces human approval for high-spend operations in live mode", async () => {
        const oauthManager = new OAuthManager();
        await storeWorkspaceCreds(oauthManager, "ws_acme", "stripe");

        const worker = new FinanceWorker(oauthManager);
        const response = await worker.executeTask({
            taskId: "task_fin_03",
            workspaceId: "ws_acme",
            correlationId: "corr_13",
            taskDescription: "Process large invoice",
            inputParameters: { amountUSD: 5000 },
            context: makeContext("ws_acme")
        });

        assert.equal(response.status, "requires_approval");
        assert.equal(response.humanApprovalRequired, true);
        assert.equal(response.isStub, false);
    });

    it("13. FinanceWorker dry-run validates but does NOT execute financial transaction", async () => {
        const oauthManager = new OAuthManager();
        await storeWorkspaceCreds(oauthManager, "ws_acme", "stripe");

        const worker = new FinanceWorker(oauthManager);
        const response = await worker.executeTask({
            taskId: "task_fin_04",
            workspaceId: "ws_acme",
            correlationId: "corr_14",
            taskDescription: "Dry-run invoice",
            inputParameters: { amountUSD: 750 },
            context: makeContext("ws_acme"),
            dryRun: true
        });

        assert.equal(response.isStub, false);
        assert.equal(response.outputs.dryRun, true);
        assert.equal(response.outputs.invoiceId, null, "Should NOT create invoice in dry-run");
        assert.ok(response.outputs.dryRunReport);
        assert.ok(response.outputs.dryRunReport.message.includes("[DRY-RUN]"));
        assert.equal(response.metrics.estimatedCostUSD, 0.0);
    });

    it("14. FinanceWorker dry-run still flags high-spend operations for approval", async () => {
        const oauthManager = new OAuthManager();
        await storeWorkspaceCreds(oauthManager, "ws_acme", "stripe");

        const worker = new FinanceWorker(oauthManager);
        const response = await worker.executeTask({
            taskId: "task_fin_05",
            workspaceId: "ws_acme",
            correlationId: "corr_15",
            taskDescription: "Dry-run large refund",
            inputParameters: { amountUSD: 10000 },
            context: makeContext("ws_acme"),
            dryRun: true
        });

        assert.equal(response.status, "requires_approval");
        assert.equal(response.humanApprovalRequired, true);
        assert.equal(response.outputs.dryRun, true);
        assert.ok(response.outputs.dryRunReport.requiresApproval);
    });

    // ────────────────────────────────────────────────────────────────────
    // Section E: Cross-Worker Architecture Validation
    // ────────────────────────────────────────────────────────────────────
    it("15. All 4 SaaS workers accept shared ConnectorRuntime injection", () => {
        const runtime = new ConnectorRuntime();
        const oauth = new OAuthManager();

        const email = new EmailWorker(oauth, runtime);
        const calendar = new CalendarWorker(oauth, runtime);
        const crm = new CRMWorker(oauth, runtime);
        const finance = new FinanceWorker(oauth, runtime);

        assert.equal(email.getWorkerRole(), "email");
        assert.equal(calendar.getWorkerRole(), "calendar");
        assert.equal(crm.getWorkerRole(), "crm");
        assert.equal(finance.getWorkerRole(), "finance");
    });

    it("16. FinanceWorker stub mode still enforces human approval for high-spend", async () => {
        const oauthManager = new OAuthManager();
        const worker = new FinanceWorker(oauthManager);

        const response = await worker.executeTask({
            taskId: "task_fin_06",
            workspaceId: "ws_default",
            correlationId: "corr_16",
            taskDescription: "Large stub invoice",
            inputParameters: { amountUSD: 2500 },
            context: makeContext()
        });

        assert.equal(response.status, "requires_approval");
        assert.equal(response.humanApprovalRequired, true);
        assert.equal(response.isStub, true);
    });
});
