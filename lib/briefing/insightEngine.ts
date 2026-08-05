/**
 * Insight Engine
 *
 * PAL Milestone 5A — Daily Briefing Engine
 *
 * Generates data-backed business insights across productivity, time allocation,
 * project velocity, decision trends, and revenue observations.
 */

import type { BusinessContext } from "../contextEngine.ts";
import type { Insight } from "./types.ts";

export function generateInsights(context: BusinessContext): Insight[] {
    const insights: Insight[] = [];

    // 1. Productivity & Task Execution Insight
    const totalTasks = context.tasks.length;
    const completedTasks = context.tasks.filter((t) => t.status.toLowerCase() === "done").length;

    if (totalTasks > 0) {
        const rate = Math.round((completedTasks / totalTasks) * 100);
        insights.push({
            id: "insight_task_productivity",
            category: "Productivity",
            title: "Task Completion Velocity",
            metric: `${rate}%`,
            description: `${completedTasks} of ${totalTasks} tasks completed in operational backlog.`,
            supportingEvidence: `Task database snapshot (${completedTasks} done, ${totalTasks - completedTasks} pending).`,
        });
    }

    // 2. Schedule & Time Allocation Insight
    const meetingCount = context.calendar.length;
    insights.push({
        id: "insight_calendar_workload",
        category: "Time Allocation",
        title: "Calendar Density",
        metric: `${meetingCount} event(s)`,
        description: meetingCount === 0
            ? "No meetings scheduled today; optimal for deep execution."
            : `${meetingCount} scheduled meeting(s) on today's calendar.`,
        supportingEvidence: "Calendar events context.",
    });

    // 3. Project Velocity Insight
    const activeProjects = context.projects.filter((p) => {
        const st = p.status.toLowerCase();
        return st !== "completed" && st !== "done";
    });

    if (activeProjects.length > 0) {
        const topProject = activeProjects[0];
        insights.push({
            id: "insight_project_velocity",
            category: "Project Velocity",
            title: "Active Strategic Focus",
            metric: topProject.title,
            description: `Primary active project '${topProject.title}' (${topProject.priority} priority).`,
            supportingEvidence: `Project record '${topProject.id}' in ${topProject.status} state.`,
        });
    }

    // 4. Decision Memory Trend Insight
    if (context.decisions && context.decisions.length > 0) {
        const activeCount = context.decisions.filter((d) => d.status.toLowerCase() === "active").length;
        insights.push({
            id: "insight_decision_trends",
            category: "Strategic Alignment",
            title: "Confirmed Decisions Memory",
            metric: `${activeCount} active`,
            description: `${activeCount} active strategic decision(s) stored in Decision Memory.`,
            supportingEvidence: "Decision Memory database snapshot.",
        });
    }

    return insights;
}
