/**
 * Priority Analyzer
 *
 * PAL Milestone 5A — Daily Briefing Engine
 *
 * Deterministic priority ranking algorithm evaluating due dates, importance,
 * decision urgency, project linkage, and dependencies.
 */

import type { BusinessContext } from "../contextEngine.ts";
import type { Priority } from "./types.ts";

export function analyzePriorities(context: BusinessContext): Priority[] {
    const priorities: Priority[] = [];
    const todayStr = new Date().toISOString().split("T")[0];

    // 1. High Priority & Overdue Tasks
    for (const task of context.tasks) {
        if (task.status.toLowerCase() !== "done") {
            let score = 50;
            let reason = "Pending action item";
            const isHigh = task.priority.toLowerCase() === "high";
            const isOverdue = Boolean(task.dueDate && task.dueDate < todayStr);
            const isDueToday = Boolean(task.dueDate && task.dueDate === todayStr);

            if (isHigh) {
                score += 25;
                reason = "Marked high priority task";
            }

            if (isOverdue) {
                score += 35;
                reason = `OVERDUE task (due ${task.dueDate})`;
            } else if (isDueToday) {
                score += 25;
                reason = "Task due TODAY";
            }

            const urgency: "critical" | "high" | "medium" | "low" = isOverdue
                ? "critical"
                : (isHigh || isDueToday ? "high" : "medium");

            priorities.push({
                id: `p_task_${task.id}`,
                title: task.title,
                score,
                reason,
                deadline: task.dueDate || null,
                relatedProject: task.projectId || null,
                urgency,
            });
        }
    }

    // 2. High Priority Projects
    for (const proj of context.projects) {
        const status = proj.status.toLowerCase();
        if (status !== "completed" && status !== "done") {
            let score = 60;
            let reason = "Active business project";
            let urgency: "critical" | "high" | "medium" | "low" = "medium";

            if (proj.priority.toLowerCase() === "high") {
                score += 20;
                reason = "High priority strategic project";
                urgency = "high";
            }

            if (proj.dueDate && proj.dueDate < todayStr) {
                score += 25;
                reason = `OVERDUE project deadline (${proj.dueDate})`;
                urgency = "critical";
            }

            priorities.push({
                id: `p_proj_${proj.id}`,
                title: `Project: ${proj.title}`,
                score,
                reason,
                deadline: proj.dueDate || null,
                relatedProject: proj.id,
                urgency,
            });
        }
    }

    // 3. Business Brain Priorities & Goals
    if (context.business && context.business.priorities && context.business.priorities.trim()) {
        priorities.push({
            id: "p_brain_priorities",
            title: `Focus: ${context.business.priorities.trim()}`,
            score: 85,
            reason: "Core founder priority in Business Brain",
            deadline: null,
            relatedProject: null,
            urgency: "high",
        });
    }

    if (context.business && context.business.goals) {
        for (const goal of context.business.goals) {
            if (goal.status.toLowerCase() === "active") {
                priorities.push({
                    id: `p_goal_${goal.id}`,
                    title: `Goal: ${goal.title}`,
                    score: 80,
                    reason: `Active business goal (${goal.timeframe || "Ongoing"})`,
                    deadline: goal.timeframe || null,
                    relatedProject: null,
                    urgency: "high",
                });
            }
        }
    }

    // 4. Active Confirmed Strategic Decisions
    if (context.decisions) {
        for (const dec of context.decisions) {
            if (dec.status.toLowerCase() === "active") {
                priorities.push({
                    id: `p_dec_${dec.id}`,
                    title: `Decision: ${dec.title}`,
                    score: 75,
                    reason: dec.rationale ? `Confirmed decision: ${dec.rationale}` : "Active strategic decision",
                    deadline: null,
                    relatedProject: dec.projectId,
                    urgency: "medium",
                });
            }
        }
    }

    // Sort priorities deterministically from highest score to lowest score
    return priorities.sort((a, b) => b.score - a.score);
}
