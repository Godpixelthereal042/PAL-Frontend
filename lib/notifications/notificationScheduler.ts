/**
 * Notification Scheduler
 *
 * PAL Milestone 5B — Notification Intelligence Engine
 */

import type { CandidateNotification, ScheduleMode } from "./types.ts";

export interface ScheduleDetails {
    mode: ScheduleMode;
    scheduledFor: number;
    expiresAt: number | null;
}

export function determineNotificationSchedule(
    candidate: CandidateNotification,
    now: number = Date.now()
): ScheduleDetails {
    let mode: ScheduleMode = "immediate";
    let scheduledFor = now;

    // 1. Determine timing mode based on candidate type
    if (candidate.type === "meeting_starts_soon" && candidate.metadata?.time) {
        mode = "scheduled";
        try {
            const meetingTime = new Date(candidate.metadata.time).getTime();
            if (!isNaN(meetingTime) && meetingTime > now) {
                // Remind 15 minutes before
                scheduledFor = Math.max(now, meetingTime - 15 * 60 * 1000);
            }
        } catch {}
    }

    // 2. Determine expiration time
    let expiresAt: number | null = null;

    if (candidate.type === "meeting_starts_soon" && candidate.metadata?.time) {
        try {
            const meetingTime = new Date(candidate.metadata.time).getTime();
            if (!isNaN(meetingTime)) {
                expiresAt = meetingTime + 2 * 60 * 60 * 1000; // Expire 2 hours after meeting
            }
        } catch {}
    }

    if (!expiresAt) {
        if (candidate.expiresAt) {
            expiresAt = candidate.expiresAt;
        } else {
            // Default expiration: 7 days
            expiresAt = now + 7 * 24 * 60 * 60 * 1000;
        }
    }

    return {
        mode,
        scheduledFor,
        expiresAt,
    };
}
