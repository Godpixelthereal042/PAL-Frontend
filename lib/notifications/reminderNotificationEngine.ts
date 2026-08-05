/**
 * Reminder Notification Candidate Engine
 *
 * PAL Milestone 5B — Notification Intelligence Engine
 */

import type { BusinessContext } from "../contextEngine.ts";
import type { CandidateNotification } from "./types.ts";

export function generateReminderCandidates(context: BusinessContext): CandidateNotification[] {
    const candidates: CandidateNotification[] = [];

    // 1. Scheduled Events Reminders
    for (const evt of context.calendar) {
        const timeStr = (evt as any).time || evt.startsAt || "Scheduled";
        candidates.push({
            id: `cand_event_${evt.id}`,
            category: "calendar",
            type: "meeting_starts_soon",
            title: `Scheduled Meeting: ${evt.title}`,
            message: `Event '${evt.title}' is scheduled for today at ${timeStr}.`,
            priority: "medium",
            severity: "low",
            actionLabel: "View Schedule",
            actionUrl: "/calendar",
            metadata: { eventId: evt.id, time: timeStr },
        });
    }

    // 2. Schedule Conflict Warning
    if (context.calendar.length >= 5) {
        candidates.push({
            id: "cand_schedule_conflict",
            category: "calendar",
            type: "schedule_conflict",
            title: "Heavy Calendar Density Today",
            message: `${context.calendar.length} events scheduled today. Protect breaks for focus work.`,
            priority: "medium",
            severity: "medium",
            actionLabel: "Manage Schedule",
            actionUrl: "/calendar",
        });
    }

    return candidates;
}
