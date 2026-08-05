/**
 * Webhook Intelligence Gateway (PAL-TDD-008, Sprint 21 Milestone 3)
 *
 * Implements an event-driven universal webhook processing pipeline:
 * Incoming Webhook (Stripe/HubSpot/Slack/Salesforce/GitHub) -> HMAC Verification ->
 * Deduplication -> Universal Business Event Schema -> Business Knowledge Graph -> Agent Mesh.
 *
 * Architecture: PAL-ARCH-DOC-046
 */

import { createHmac } from "node:crypto";
import { ExecutiveAgentMesh } from "../agents/mesh/agentMesh.ts";
import { BusinessKnowledgeGraph } from "../graph/businessKnowledgeGraph.ts";

export type WebhookProvider = "stripe" | "hubspot" | "slack" | "salesforce" | "github";

export interface IncomingWebhookPayload {
    webhookId: string;
    provider: WebhookProvider;
    eventType: string;
    rawBody: string;
    signature: string;
    secret: string;
    receivedAt: number;
}

export interface UniversalBusinessEvent {
    eventId: string;
    provider: WebhookProvider;
    domainCategory: "finance" | "sales" | "communication" | "engineering";
    actionVerb: string;
    entityId: string;
    metricImpact?: { metricName: string; deltaValue: number };
    payload: Record<string, any>;
    timestamp: number;
}

export interface ProcessedWebhookResult {
    webhookId: string;
    eventId: string;
    status: "processed" | "duplicate_rejected" | "signature_failed" | "error";
    normalizedEvent?: UniversalBusinessEvent;
    meshNotified: boolean;
    graphUpdated: boolean;
    processedAt: number;
}

export class WebhookIntelligenceGateway {
    private static instance: WebhookIntelligenceGateway;
    private processedWebhookIds: Set<string> = new Set();
    private agentMesh = ExecutiveAgentMesh.getInstance();
    private knowledgeGraph = BusinessKnowledgeGraph.getInstance();

    public static getInstance(): WebhookIntelligenceGateway {
        if (!WebhookIntelligenceGateway.instance) {
            WebhookIntelligenceGateway.instance = new WebhookIntelligenceGateway();
        }
        return WebhookIntelligenceGateway.instance;
    }

    public verifyHmacSignature(rawBody: string, signature: string, secret: string): boolean {
        if (!signature || !secret) return false;
        try {
            const expected = createHmac("sha256", secret).update(rawBody).digest("hex");
            return signature === expected || signature === `sha256=${expected}`;
        } catch {
            return false;
        }
    }

    public processIncomingWebhook(webhook: IncomingWebhookPayload, workspaceId = "ws_demo_company"): ProcessedWebhookResult {
        const timestamp = Date.now();

        // 1. Check duplicate
        if (this.processedWebhookIds.has(webhook.webhookId)) {
            return {
                webhookId: webhook.webhookId,
                eventId: `evt_dup_${timestamp}`,
                status: "duplicate_rejected",
                meshNotified: false,
                graphUpdated: false,
                processedAt: timestamp
            };
        }

        // 2. Verify HMAC signature
        const isValidSignature = this.verifyHmacSignature(webhook.rawBody, webhook.signature, webhook.secret);
        if (!isValidSignature) {
            return {
                webhookId: webhook.webhookId,
                eventId: `evt_sig_fail_${timestamp}`,
                status: "signature_failed",
                meshNotified: false,
                graphUpdated: false,
                processedAt: timestamp
            };
        }

        // Mark as processed to prevent duplicates
        this.processedWebhookIds.add(webhook.webhookId);

        // 3. Normalize into Universal Business Event Schema
        const eventId = `evt_${timestamp}_${Math.random().toString(36).substring(2, 6)}`;
        let parsedPayload: Record<string, any> = {};
        try {
            parsedPayload = JSON.parse(webhook.rawBody);
        } catch {
            parsedPayload = { raw: webhook.rawBody };
        }

        let domainCategory: UniversalBusinessEvent["domainCategory"] = "finance";
        if (webhook.provider === "hubspot" || webhook.provider === "salesforce") {
            domainCategory = "sales";
        } else if (webhook.provider === "slack") {
            domainCategory = "communication";
        } else if (webhook.provider === "github") {
            domainCategory = "engineering";
        }

        const normalizedEvent: UniversalBusinessEvent = {
            eventId,
            provider: webhook.provider,
            domainCategory,
            actionVerb: webhook.eventType,
            entityId: parsedPayload.id || parsedPayload.entityId || "entity_001",
            payload: parsedPayload,
            timestamp
        };

        // 4. Update Business Knowledge Graph
        this.knowledgeGraph.addNode({
            id: `n_evt_${eventId}`,
            category: "metric",
            label: `${webhook.provider.toUpperCase()} Event: ${webhook.eventType}`,
            properties: parsedPayload
        });

        // 5. Notify Agent Intelligence Mesh cycle
        this.agentMesh.runMeshCycle(workspaceId);

        return {
            webhookId: webhook.webhookId,
            eventId,
            status: "processed",
            normalizedEvent,
            meshNotified: true,
            graphUpdated: true,
            processedAt: timestamp
        };
    }
}
