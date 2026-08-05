/**
 * Event Deduplicator
 *
 * PAL Milestone 8B — Autonomous Monitoring & Event-Driven Agent System
 */

import type { ExecutiveEvent } from "./eventTypes.ts";

export class EventDeduplicator {
    private recentKeys: Map<string, number> = new Map();
    private windowMs = 5000; // 5-second deduplication window

    public isDuplicate(event: ExecutiveEvent): boolean {
        const entityKey = event.relatedEntities?.projectId || event.relatedEntities?.personId || event.relatedEntities?.invoiceId || event.relatedEntities?.workflowId || "none";
        const key = `${event.type}_${entityKey}`;
        const now = Date.now();

        const lastSeen = this.recentKeys.get(key);
        if (lastSeen && now - lastSeen < this.windowMs) {
            return true;
        }

        this.recentKeys.set(key, now);
        return false;
    }

    public clear(): void {
        this.recentKeys.clear();
    }
}

export const eventDeduplicator = new EventDeduplicator();
