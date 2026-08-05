/**
 * Notification Composer
 *
 * PAL Milestone 5B — Notification Intelligence Engine
 */

import type { CandidateNotification, Notification, DeliveryChannel } from "./types.ts";
import type { ScheduleDetails } from "./notificationScheduler.ts";

export function composeNotification(
    candidate: CandidateNotification,
    schedule: ScheduleDetails,
    userId: string,
    channel: DeliveryChannel = "dashboard"
): Notification {
    const now = Date.now();
    const id = candidate.id || `notif_${now}_${Math.random().toString(36).slice(2, 7)}`;
    const effectiveUserId = userId || "current_user";

    let actionLabel = candidate.actionLabel;
    let actionUrl = candidate.actionUrl;

    if (!actionLabel) {
        if (candidate.category === "tasks") {
            actionLabel = "View Tasks";
            actionUrl = "/tasks";
        } else if (candidate.category === "financial") {
            actionLabel = "View Invoices";
            actionUrl = "/invoices";
        } else if (candidate.category === "decisions") {
            actionLabel = "Review Decision";
            actionUrl = "/decisions";
        } else {
            actionLabel = "View Dashboard";
            actionUrl = "/dashboard";
        }
    }

    return {
        id,
        userId: effectiveUserId,
        category: candidate.category,
        type: candidate.type,
        title: candidate.title.trim(),
        message: candidate.message.trim(),
        priority: candidate.priority,
        severity: candidate.severity,
        actionLabel,
        actionUrl,
        channel,
        status: schedule.scheduledFor > now + 60000 ? "scheduled" : "created",
        scheduledFor: schedule.scheduledFor,
        expiresAt: schedule.expiresAt,
        createdAt: now,
        metadata: candidate.metadata,
    };
}
