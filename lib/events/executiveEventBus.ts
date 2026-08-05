/**
 * Executive Event Bus Singleton
 *
 * PAL Milestone 8B — Autonomous Monitoring & Event-Driven Agent System
 */

import { eventDeduplicator } from "./eventDeduplicator.ts";
import { eventHistory } from "./eventHistory.ts";
import { eventRouter, type EventListener } from "./eventRouter.ts";
import type { ExecutiveEvent } from "./eventTypes.ts";

export class ExecutiveEventBus {
    public async publish(event: ExecutiveEvent): Promise<boolean> {
        if (eventDeduplicator.isDuplicate(event)) {
            return false;
        }

        eventHistory.record(event);
        await eventRouter.dispatch(event);
        return true;
    }

    public subscribe(eventType: string, listener: EventListener): void {
        eventRouter.subscribe(eventType, listener);
    }
}

export const executiveEventBus = new ExecutiveEventBus();
