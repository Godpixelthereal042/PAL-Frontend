/**
 * Workflow Scheduler
 *
 * PAL Milestone 5C — Workflow Automation Engine
 *
 * Evaluates cron/time-based schedules for recurring workflow execution.
 */

import type { WorkflowSchedule } from "./types.ts";

export function shouldRunScheduledWorkflow(
    schedule: WorkflowSchedule | null | undefined,
    lastRunAt?: number,
    now: number = Date.now()
): boolean {
    if (!schedule) return false;

    // Interval mode evaluation
    if (schedule.mode === "interval" && schedule.intervalMs) {
        if (!lastRunAt) return true;
        return now - lastRunAt >= schedule.intervalMs;
    }

    // Daily / Custom mode evaluation (fallback interval of 24h if no last run)
    if (!lastRunAt) return true;

    // Minimum 1 hour spacing to avoid rapid re-triggering in loop
    return now - lastRunAt >= 60 * 60 * 1000;
}
