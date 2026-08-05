/**
 * Executive Event History
 *
 * PAL Milestone 8B — Autonomous Monitoring & Event-Driven Agent System
 */

import type { ExecutiveEvent } from "./eventTypes.ts";

export class EventHistory {
    private history: ExecutiveEvent[] = [];
    private maxHistory = 100;

    public record(event: ExecutiveEvent): void {
        this.history.unshift(event);
        if (this.history.length > this.maxHistory) {
            this.history.pop();
        }
    }

    public getRecentEvents(limit = 20): ExecutiveEvent[] {
        return this.history.slice(0, limit);
    }

    public clear(): void {
        this.history = [];
    }
}

export const eventHistory = new EventHistory();
