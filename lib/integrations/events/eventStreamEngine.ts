/**
 * Universal Event Stream Engine & Central Event Bus (PAL-TDD-004, PAL-ARCH-DOC-029)
 */

import { EventNormalizer } from "./eventNormalizer.ts";
import type { PalEvent, PalEventClassification, RawWebhookPayload } from "./universalEventTypes.ts";
import { WebhookVerifier } from "./webhookVerifier.ts";

export type EventSubscriber = (event: PalEvent) => Promise<void> | void;

export class EventStreamEngine {
    private verifier: WebhookVerifier;
    private normalizer: EventNormalizer;
    private eventLog: PalEvent[] = [];
    private subscribers: Map<string, EventSubscriber[]> = new Map(); // key: classification or '*'

    constructor(verifier?: WebhookVerifier, normalizer?: EventNormalizer) {
        this.verifier = verifier || new WebhookVerifier();
        this.normalizer = normalizer || new EventNormalizer();
    }

    async processWebhook(payload: RawWebhookPayload): Promise<{ processed: boolean; event?: PalEvent; errorDetails?: string }> {
        const isValid = await this.verifier.verifyWebhook(payload);
        if (!isValid) {
            return { processed: false, errorDetails: "Webhook HMAC signature verification failed" };
        }

        const normalizedEvent = this.normalizer.normalizeWebhook(payload);
        await this.publishEvent(normalizedEvent);
        return { processed: true, event: normalizedEvent };
    }

    async publishEvent(event: PalEvent): Promise<void> {
        this.eventLog.push(event);

        // Notify specific classification subscribers
        const classificationSubs = this.subscribers.get(event.classification) || [];
        for (const sub of classificationSubs) {
            await sub(event);
        }

        // Notify wildcard subscribers
        const wildcardSubs = this.subscribers.get("*") || [];
        for (const sub of wildcardSubs) {
            await sub(event);
        }
    }

    subscribe(classification: PalEventClassification | "*", subscriber: EventSubscriber): void {
        const subs = this.subscribers.get(classification) || [];
        subs.push(subscriber);
        this.subscribers.set(classification, subs);
    }

    getEvents(workspaceId: string, classification?: PalEventClassification): PalEvent[] {
        return this.eventLog.filter((e) => {
            if (e.workspaceId !== workspaceId) return false;
            if (classification && e.classification !== classification) return false;
            return true;
        });
    }

    async replayEvents(
        workspaceId: string,
        filter?: { classification?: PalEventClassification; fromTimestamp?: number },
        targetSubscriber?: EventSubscriber
    ): Promise<number> {
        const events = this.getEvents(workspaceId, filter?.classification).filter((e) => {
            if (filter?.fromTimestamp && e.occurredAt < filter.fromTimestamp) return false;
            return true;
        });

        for (const evt of events) {
            if (targetSubscriber) {
                await targetSubscriber(evt);
            } else {
                await this.publishEvent(evt);
            }
        }

        return events.length;
    }
}
