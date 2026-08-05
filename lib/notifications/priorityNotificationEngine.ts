/**
 * Priority Notification Candidate Engine
 *
 * PAL Milestone 5B — Notification Intelligence Engine
 */

import type { BusinessContext } from "../contextEngine.ts";
import type { CandidateNotification } from "./types.ts";

export function generatePriorityCandidates(context: BusinessContext): CandidateNotification[] {
    const candidates: CandidateNotification[] = [];

    // 1. High priority tasks due today
    const todayStr = new Date().toISOString().split("T")[0];
    const todayHighTasks = context.tasks.filter(
        (t) => t.dueDate === todayStr && t.priority.toLowerCase() === "high" && t.status.toLowerCase() !== "done"
    );

    for (const task of todayHighTasks) {
        candidates.push({
            id: `cand_task_today_${task.id}`,
            category: "tasks",
            type: "deadline_today",
            title: `High Priority Deadline Today: ${task.title}`,
            message: `Task '${task.title}' is due today. Complete it to maintain project momentum.`,
            priority: "high",
            severity: "high",
            actionLabel: "View Task",
            actionUrl: `/tasks?id=${task.id}`,
            metadata: { taskId: task.id, projectId: task.projectId },
        });
    }

    // 2. Active Goal Attention
    if (context.business && context.business.priorities && context.business.priorities.trim()) {
        candidates.push({
            id: "cand_priority_focus",
            category: "executive",
            type: "daily_brief_ready",
            title: "Founder Strategic Focus Area",
            message: `Primary business focus for today: ${context.business.priorities.trim()}`,
            priority: "medium",
            severity: "medium",
            actionLabel: "View Dashboard",
            actionUrl: "/dashboard",
        });
    }

    return candidates;
}
