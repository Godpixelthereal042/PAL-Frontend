/**
 * Notification Policy Engine
 *
 * PAL Milestone 5B — Notification Intelligence Engine
 *
 * Evaluates deduplication, batching, quiet hours, preference thresholds, and priority filtering.
 */

import type { CandidateNotification, NotificationPreferences, Notification } from "./types.ts";

export function isQuietHours(now: Date, startStr: string, endStr: string): boolean {
    const currentMinutes = now.getHours() * 60 + now.getMinutes();

    const [startH, startM] = startStr.split(":").map(Number);
    const [endH, endM] = endStr.split(":").map(Number);

    const startMinutes = startH * 60 + (startM || 0);
    const endMinutes = endH * 60 + (endM || 0);

    if (startMinutes <= endMinutes) {
        return currentMinutes >= startMinutes && currentMinutes < endMinutes;
    } else {
        // Overnight window (e.g. 22:00 to 07:00)
        return currentMinutes >= startMinutes || currentMinutes < endMinutes;
    }
}

export function evaluateNotificationPolicies(
    candidates: CandidateNotification[],
    preferences: NotificationPreferences,
    recentHistory: Notification[],
    now: Date = new Date()
): CandidateNotification[] {
    let processed = [...candidates];

    // 1. Preference Filter: Enabled Categories
    processed = processed.filter((c) => preferences.enabledCategories.includes(c.category));

    // 2. Preference Filter: Priority Threshold
    const priorityWeights: Record<string, number> = { low: 1, medium: 2, high: 3, urgent: 4 };
    const minWeight = priorityWeights[preferences.minPriority] || 1;
    processed = processed.filter((c) => (priorityWeights[c.priority] || 1) >= minWeight);

    // 3. Intelligent Batching Rule
    if (preferences.batchingEnabled) {
        // A. Batch multiple overdue tasks (>= 2) into 1 summary candidate
        const overdueTaskCands = processed.filter((c) => c.type === "task_overdue");
        if (overdueTaskCands.length >= 2) {
            processed = processed.filter((c) => c.type !== "task_overdue");
            processed.push({
                id: `cand_batch_tasks_overdue_${now.getTime()}`,
                category: "tasks",
                type: "batched_tasks_overdue",
                title: `${overdueTaskCands.length} Overdue Tasks Require Attention`,
                message: `${overdueTaskCands.length} tasks are past their due date. Review and update target dates today.`,
                priority: "high",
                severity: "high",
                actionLabel: "View Overdue Tasks",
                actionUrl: "/tasks?filter=overdue",
                metadata: { count: overdueTaskCands.length },
            });
        }

        // B. Batch multiple overdue invoices (>= 2) into 1 summary candidate
        const overdueInvCands = processed.filter((c) => c.type === "invoice_overdue");
        if (overdueInvCands.length >= 2) {
            processed = processed.filter((c) => c.type !== "invoice_overdue");
            processed.push({
                id: `cand_batch_inv_overdue_${now.getTime()}`,
                category: "financial",
                type: "invoice_overdue",
                title: `${overdueInvCands.length} Overdue Invoices Require Action`,
                message: `${overdueInvCands.length} client invoices are overdue. Review receivables to maintain cash flow.`,
                priority: "urgent",
                severity: "critical",
                actionLabel: "View Receivables",
                actionUrl: "/invoices?filter=overdue",
                metadata: { count: overdueInvCands.length },
            });
        }
    }

    // 4. Quiet Hours Suppression / Deferral
    if (preferences.quietHoursEnabled && isQuietHours(now, preferences.quietHoursStart, preferences.quietHoursEnd)) {
        // During Quiet Hours, suppress all except critical severity or urgent priority
        processed = processed.filter((c) => c.severity === "critical" || c.priority === "urgent");
    }

    // 5. Deduplication Rule: Suppress candidate if identical type & target entity delivered in last 12h
    const twelveHoursAgo = now.getTime() - 12 * 60 * 60 * 1000;
    const recentTypes = new Set(
        recentHistory
            .filter((h) => h.createdAt >= twelveHoursAgo && h.status !== "dismissed")
            .map((h) => `${h.category}:${h.type}:${h.metadata?.taskId || h.metadata?.invoiceId || h.metadata?.decisionId || ""}`)
    );

    processed = processed.filter((c) => {
        const key = `${c.category}:${c.type}:${c.metadata?.taskId || c.metadata?.invoiceId || c.metadata?.decisionId || ""}`;
        return !recentTypes.has(key);
    });

    return processed;
}
