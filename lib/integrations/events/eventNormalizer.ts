/**
 * Universal Event Normalizer (PAL-TDD-004, PAL-ARCH-DOC-029)
 */

import type { PalEvent, PalEventClassification, RawWebhookPayload } from "./universalEventTypes.ts";

export class EventNormalizer {

    normalizeWebhook(rawPayload: RawWebhookPayload): PalEvent {
        const { connectorId, parsedBody, workspaceId, correlationId, causationId } = rawPayload;
        const now = Date.now();
        const cid = correlationId || `corr_evt_${now}_${Math.random().toString(36).substring(2, 6)}`;
        const causeId = causationId || cid;
        const evtId = `evt_${now}_${Math.random().toString(36).substring(2, 6)}`;

        switch (connectorId) {
            case "stripe":
                return {
                    id: evtId,
                    version: 1,
                    source: "stripe_webhook",
                    connectorId: "stripe",
                    provider: "Stripe Payments",
                    eventType: parsedBody.type || "payment_intent.succeeded",
                    classification: "FinancialEvent",
                    occurredAt: parsedBody.created ? parsedBody.created * 1000 : now,
                    receivedAt: now,
                    workspaceId,
                    correlationId: cid,
                    causationId: causeId,
                    payload: {
                        amountUSD: parsedBody.data?.object?.amount ? parsedBody.data.object.amount / 100 : parsedBody.amountUSD || 0,
                        currency: parsedBody.data?.object?.currency || "usd",
                        customerId: parsedBody.data?.object?.customer || parsedBody.customerId || "cus_unknown",
                        chargeId: parsedBody.data?.object?.id || parsedBody.chargeId || "ch_unknown"
                    }
                };

            case "github":
                return {
                    id: evtId,
                    version: 1,
                    source: "github_webhook",
                    connectorId: "github",
                    provider: "GitHub DevOps",
                    eventType: parsedBody.action ? `pull_request.${parsedBody.action}` : "push",
                    classification: "EngineeringEvent",
                    occurredAt: now,
                    receivedAt: now,
                    workspaceId,
                    correlationId: cid,
                    causationId: causeId,
                    payload: {
                        repository: parsedBody.repository?.full_name || parsedBody.repo || "unknown/repo",
                        action: parsedBody.action || "opened",
                        prNumber: parsedBody.pull_request?.number || parsedBody.prNumber || 1,
                        sender: parsedBody.sender?.login || "github_user"
                    }
                };

            case "gmail":
                return {
                    id: evtId,
                    version: 1,
                    source: "gmail_push",
                    connectorId: "gmail",
                    provider: "Google Workspace",
                    eventType: "email.received",
                    classification: "CommunicationEvent",
                    occurredAt: now,
                    receivedAt: now,
                    workspaceId,
                    correlationId: cid,
                    causationId: causeId,
                    payload: {
                        messageId: parsedBody.messageId || `msg_${now}`,
                        sender: parsedBody.sender || "unknown@sender.com",
                        subject: parsedBody.subject || "No Subject"
                    }
                };

            case "hubspot":
                return {
                    id: evtId,
                    version: 1,
                    source: "hubspot_webhook",
                    connectorId: "hubspot",
                    provider: "HubSpot CRM",
                    eventType: "contact.created",
                    classification: "CRMEvent",
                    occurredAt: now,
                    receivedAt: now,
                    workspaceId,
                    correlationId: cid,
                    causationId: causeId,
                    payload: {
                        contactId: parsedBody.contactId || `hs_${now}`,
                        email: parsedBody.email || "lead@company.com",
                        company: parsedBody.company || "Acme Corp"
                    }
                };

            case "slack":
                return {
                    id: evtId,
                    version: 1,
                    source: "slack_events_api",
                    connectorId: "slack",
                    provider: "Slack Messaging",
                    eventType: "message.posted",
                    classification: "CommunicationEvent",
                    occurredAt: now,
                    receivedAt: now,
                    workspaceId,
                    correlationId: cid,
                    causationId: causeId,
                    payload: {
                        channel: parsedBody.event?.channel || parsedBody.channel || "C012345",
                        user: parsedBody.event?.user || "U09999",
                        text: parsedBody.event?.text || parsedBody.text || ""
                    }
                };

            default:
                return {
                    id: evtId,
                    version: 1,
                    source: `${connectorId}_event`,
                    connectorId,
                    provider: connectorId,
                    eventType: "generic.event",
                    classification: "AutomationEvent",
                    occurredAt: now,
                    receivedAt: now,
                    workspaceId,
                    correlationId: cid,
                    causationId: causeId,
                    payload: parsedBody
                };
        }
    }
}
