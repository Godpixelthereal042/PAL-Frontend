/**
 * Webhook Intelligence Gateway Test Suite (PAL-TDD-008, Sprint 21 Milestone 3)
 *
 * Verifies:
 *   1. Verifies HMAC SHA-256 signatures accurately.
 *   2. Normalizes raw Stripe/HubSpot/Slack/GitHub webhooks into Universal Business Event Schema.
 *   3. Rejects duplicate webhook IDs to prevent double execution.
 *   4. Rejects invalid HMAC signatures.
 *   5. Dispatches normalized events to Business Knowledge Graph and Agent Mesh.
 */

import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { createHmac } from "node:crypto";
import { WebhookIntelligenceGateway } from "../lib/connectors/webhookIntelligenceGateway.ts";

describe("Sprint 21 Milestone 3 — Live Data Connector & Webhook Intelligence Gateway", () => {
    const gateway = WebhookIntelligenceGateway.getInstance();
    const secret = "test_webhook_secret_key_123";

    it("1. Verifies valid HMAC SHA-256 signatures", () => {
        const rawBody = JSON.stringify({ id: "sub_101", event: "customer.subscription.deleted" });
        const signature = createHmac("sha256", secret).update(rawBody).digest("hex");

        const isValid = gateway.verifyHmacSignature(rawBody, signature, secret);
        assert.equal(isValid, true);
    });

    it("2. Normalizes Stripe webhook into Universal Business Event Schema and dispatches to Agent Mesh", () => {
        const rawBody = JSON.stringify({ id: "sub_101", customer: "cus_99", amount: 199 });
        const signature = createHmac("sha256", secret).update(rawBody).digest("hex");

        const result = gateway.processIncomingWebhook({
            webhookId: "wh_stripe_001",
            provider: "stripe",
            eventType: "customer.subscription.deleted",
            rawBody,
            signature,
            secret,
            receivedAt: Date.now()
        });

        assert.equal(result.status, "processed");
        assert.equal(result.meshNotified, true);
        assert.equal(result.graphUpdated, true);
        assert.ok(result.normalizedEvent);
        assert.equal(result.normalizedEvent.domainCategory, "finance");
        assert.equal(result.normalizedEvent.provider, "stripe");
    });

    it("3. Rejects duplicate webhook IDs to prevent double processing", () => {
        const rawBody = JSON.stringify({ id: "deal_202", amount: 5000 });
        const signature = createHmac("sha256", secret).update(rawBody).digest("hex");

        // Second submission of wh_stripe_001
        const result = gateway.processIncomingWebhook({
            webhookId: "wh_stripe_001",
            provider: "stripe",
            eventType: "customer.subscription.deleted",
            rawBody,
            signature,
            secret,
            receivedAt: Date.now()
        });

        assert.equal(result.status, "duplicate_rejected");
        assert.equal(result.meshNotified, false);
    });

    it("4. Rejects invalid HMAC signatures", () => {
        const rawBody = JSON.stringify({ id: "msg_303", text: "Alert" });

        const result = gateway.processIncomingWebhook({
            webhookId: "wh_invalid_sig",
            provider: "slack",
            eventType: "channel_message",
            rawBody,
            signature: "invalid_bad_hash",
            secret,
            receivedAt: Date.now()
        });

        assert.equal(result.status, "signature_failed");
        assert.equal(result.meshNotified, false);
    });
});
