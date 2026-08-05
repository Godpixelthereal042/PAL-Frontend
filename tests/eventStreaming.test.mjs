import test, { describe, it } from "node:test";
import assert from "node:assert/strict";

import { EventStreamEngine } from "../lib/integrations/events/eventStreamEngine.ts";
import { EventNormalizer } from "../lib/integrations/events/eventNormalizer.ts";
import { WebhookVerifier } from "../lib/integrations/events/webhookVerifier.ts";
import { ConnectorManager } from "../lib/integrations/connectorManager.ts";

import { StripeConnector } from "../lib/integrations/connectors/stripeConnector.ts";
import { GitHubConnector } from "../lib/integrations/connectors/githubConnector.ts";
import { GmailConnector } from "../lib/integrations/connectors/gmailConnector.ts";

describe("Sprint 5 — Milestone 4: Universal Event Normalizer & Real-Time Sync", () => {
    const workspaceId = "ws_test_m4";

    it("EventNormalizer converts raw Stripe and GitHub payloads into normalized PalEvent schema", () => {
        const normalizer = new EventNormalizer();

        // 1. Stripe Payment Event
        const stripeEvt = normalizer.normalizeWebhook({
            connectorId: "stripe",
            headers: { "stripe-signature": "sig_valid" },
            rawBody: "{}",
            parsedBody: { type: "payment_intent.succeeded", amountUSD: 500, customerId: "cus_123", chargeId: "ch_999" },
            workspaceId,
            correlationId: "corr_stripe_1",
            causationId: "cause_stripe_1"
        });

        assert.equal(stripeEvt.version, 1);
        assert.equal(stripeEvt.connectorId, "stripe");
        assert.equal(stripeEvt.classification, "FinancialEvent");
        assert.equal(stripeEvt.correlationId, "corr_stripe_1");
        assert.equal(stripeEvt.causationId, "cause_stripe_1");
        assert.equal(stripeEvt.payload.amountUSD, 500);

        // 2. GitHub PR Event
        const githubEvt = normalizer.normalizeWebhook({
            connectorId: "github",
            headers: { "x-hub-signature-256": "sha256_valid" },
            rawBody: "{}",
            parsedBody: { action: "opened", repository: { full_name: "pal/pal-frontend" }, pull_request: { number: 42 } },
            workspaceId
        });

        assert.equal(githubEvt.connectorId, "github");
        assert.equal(githubEvt.classification, "EngineeringEvent");
        assert.ok(githubEvt.correlationId.startsWith("corr_evt_"));
        assert.equal(githubEvt.payload.repository, "pal/pal-frontend");
    });

    it("EventStreamEngine verifies signatures, distributes to classification channels, and executes event replay", async () => {
        const manager = new ConnectorManager();
        manager.registerDriver(new StripeConnector());
        manager.registerDriver(new GitHubConnector());

        const verifier = new WebhookVerifier(manager);
        const engine = new EventStreamEngine(verifier);

        const receivedFinancialEvents = [];
        engine.subscribe("FinancialEvent", (evt) => {
            receivedFinancialEvents.push(evt);
        });

        // Process Stripe Webhook with valid signature
        const res1 = await engine.processWebhook({
            connectorId: "stripe",
            headers: { "stripe-signature": "valid_sig" },
            rawBody: '{"charge":"ch_100"}',
            parsedBody: { type: "charge.succeeded", amountUSD: 250, customerId: "cus_456" },
            workspaceId
        });

        assert.equal(res1.processed, true);
        assert.ok(res1.event);
        assert.equal(receivedFinancialEvents.length, 1);
        assert.equal(receivedFinancialEvents[0].payload.amountUSD, 250);

        // Process Webhook with invalid signature (Should fail verification)
        const res2 = await engine.processWebhook({
            connectorId: "stripe",
            headers: {}, // missing signature
            rawBody: '{}',
            parsedBody: {},
            workspaceId
        });
        assert.equal(res2.processed, false);
        assert.ok(res2.errorDetails?.includes("verification failed"));

        // Event Replay Verification
        const replayed = [];
        const count = await engine.replayEvents(workspaceId, { classification: "FinancialEvent" }, (evt) => {
            replayed.push(evt);
        });

        assert.equal(count, 1);
        assert.equal(replayed.length, 1);
        assert.equal(replayed[0].id, res1.event.id);
    });
});
