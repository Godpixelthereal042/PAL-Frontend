import type { BusinessEvent, EventCategory, EventSeverity, ITimelineEngine } from "./types.ts";

export class TimelineEngine implements ITimelineEngine {
    private timeline: Map<string, BusinessEvent[]> = new Map();

    async logEvent(event: BusinessEvent): Promise<void> {
        const events = this.timeline.get(event.workspaceId) || [];
        events.push(event);
        this.timeline.set(event.workspaceId, events);
    }

    async getTimeline(
        workspaceId: string,
        category?: EventCategory,
        severity?: EventSeverity,
        limit: number = 50
    ): Promise<BusinessEvent[]> {
        let events = this.timeline.get(workspaceId) || [];

        if (category) {
            events = events.filter((e) => e.category === category);
        }

        if (severity) {
            events = events.filter((e) => e.severity === severity);
        }

        // Sort descending by timestamp
        return events.sort((a, b) => b.timestamp - a.timestamp).slice(0, limit);
    }
}
