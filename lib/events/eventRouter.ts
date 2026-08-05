/**
 * Executive Event Router (PAL-TDD-005A, PAL-ARCH-DOC-042)
 *
 * Provides subscriber isolation, execution timeouts, non-blocking async dispatch,
 * and event dispatch metrics.
 */

import type { ExecutiveEvent } from "./eventTypes.ts";

export type EventListener = (event: ExecutiveEvent) => Promise<void>;

export class EventRouter {
    private listeners: Map<string, Set<EventListener>> = new Map();
    private metrics = {
        totalDispatched: 0,
        totalFailed: 0,
        subscriberTimeouts: 0
    };

    public subscribe(eventType: string, listener: EventListener): void {
        if (!this.listeners.has(eventType)) {
            this.listeners.set(eventType, new Set());
        }
        this.listeners.get(eventType)!.add(listener);
    }

    public async dispatch(event: ExecutiveEvent, timeoutMs: number = 5000): Promise<void> {
        this.metrics.totalDispatched += 1;
        const specific = this.listeners.get(event.type) || new Set();
        const wildcard = this.listeners.get("*") || new Set();
        const targets = [...Array.from(specific), ...Array.from(wildcard)];

        await Promise.all(targets.map((listener) => this.executeListenerWithTimeout(listener, event, timeoutMs)));
    }

    public dispatchAsync(event: ExecutiveEvent, timeoutMs: number = 5000): void {
        setImmediate(() => {
            this.dispatch(event, timeoutMs).catch((err) => {
                console.error(`Async dispatch unhandled error for ${event.type}:`, err);
            });
        });
    }

    private async executeListenerWithTimeout(listener: EventListener, event: ExecutiveEvent, timeoutMs: number): Promise<void> {
        let timer: NodeJS.Timeout;
        const timeoutPromise = new Promise<never>((_, reject) => {
            timer = setTimeout(() => {
                this.metrics.subscriberTimeouts += 1;
                reject(new Error(`Event subscriber timeout after ${timeoutMs}ms for event type ${event.type}`));
            }, timeoutMs);
        });

        try {
            await Promise.race([listener(event), timeoutPromise]);
        } catch (err: any) {
            this.metrics.totalFailed += 1;
            console.error(`Error in event listener for [${event.type}]:`, err.message || err);
        } finally {
            clearTimeout(timer!);
        }
    }

    public getMetrics() {
        return { ...this.metrics };
    }
}

export const eventRouter = new EventRouter();
