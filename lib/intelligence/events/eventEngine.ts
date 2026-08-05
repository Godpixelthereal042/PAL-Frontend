import { TimelineEngine } from "./timelineEngine.ts";
import type { BusinessEvent, IEventEngine, IExecutiveWatcher } from "./types.ts";
import { RevenueWatcher } from "./watchers/revenueWatcher.ts";
import { CashWatcher } from "./watchers/cashWatcher.ts";
import { SalesWatcher } from "./watchers/salesWatcher.ts";
import { RiskWatcher } from "./watchers/riskWatcher.ts";
import { CustomerWatcher } from "./watchers/customerWatcher.ts";
import { LegalWatcher } from "./watchers/legalWatcher.ts";
import { HiringWatcher } from "./watchers/hiringWatcher.ts";
import { SecurityWatcher } from "./watchers/securityWatcher.ts";

export class EventEngine implements IEventEngine {
    private watchers: Map<string, IExecutiveWatcher> = new Map();
    private priorityQueue: BusinessEvent[] = [];
    private deduplicationCache: Map<string, number> = new Map();
    private timelineEngine: TimelineEngine;

    constructor(timelineEngine?: TimelineEngine, watchers?: IExecutiveWatcher[]) {
        this.timelineEngine = timelineEngine || new TimelineEngine();

        const defaultWatchers = watchers || [
            new RevenueWatcher(),
            new CashWatcher(),
            new SalesWatcher(),
            new RiskWatcher(),
            new CustomerWatcher(),
            new LegalWatcher(),
            new HiringWatcher(),
            new SecurityWatcher(),
        ];

        defaultWatchers.forEach((w) => this.registerWatcher(w));
    }

    registerWatcher(watcher: IExecutiveWatcher): void {
        this.watchers.set(watcher.getWatcherId(), watcher);
    }

    async publishEvent(event: BusinessEvent): Promise<void> {
        // Deduplication Check: Ignore identical events within 60 seconds
        const dedupKey = `${event.workspaceId}:${event.eventType}:${event.domain}`;
        const lastSeen = this.deduplicationCache.get(dedupKey);
        const now = Date.now();

        if (lastSeen && now - lastSeen < 60000) {
            return; // Suppress duplicate
        }

        this.deduplicationCache.set(dedupKey, now);

        // Push to priority queue
        this.priorityQueue.push(event);
        this.sortPriorityQueue();

        // Log to Executive Timeline (Organizational Memory)
        await this.timelineEngine.logEvent(event);
    }

    async executeWatchers(workspaceId: string): Promise<BusinessEvent[]> {
        const publishedEvents: BusinessEvent[] = [];

        for (const watcher of this.watchers.values()) {
            try {
                const evt = await watcher.checkCondition(workspaceId);
                if (evt) {
                    await this.publishEvent(evt);
                    publishedEvents.push(evt);
                }
            } catch (err) {
                // Ignore individual watcher failure safely
            }
        }

        return publishedEvents;
    }

    getPriorityQueue(): BusinessEvent[] {
        return this.priorityQueue;
    }

    private sortPriorityQueue(): void {
        const severityRank: Record<string, number> = {
            critical: 4,
            high: 3,
            medium: 2,
            info: 1,
        };

        this.priorityQueue.sort((a, b) => {
            const rankDiff = (severityRank[b.severity] || 0) - (severityRank[a.severity] || 0);
            if (rankDiff !== 0) return rankDiff;
            return b.timestamp - a.timestamp;
        });
    }
}
