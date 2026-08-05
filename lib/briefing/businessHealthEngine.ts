/**
 * Business Health Engine
 *
 * PAL Milestone 5A — Daily Briefing Engine
 *
 * Evaluates business operational health (0-100 score, status, trend, contributing factors).
 */

import type { BusinessContext } from "../contextEngine.ts";
import type { BusinessHealth, HealthStatus, HealthTrend, HealthFactor } from "./types.ts";

export function calculateBusinessHealth(context: BusinessContext): BusinessHealth {
    let score = 85; // Base starting score
    const factors: HealthFactor[] = [];
    const todayStr = new Date().toISOString().split("T")[0];

    // 1. Task Completion & Workload Evaluation
    const totalTasks = context.tasks.length;
    const completedTasks = context.tasks.filter((t) => t.status.toLowerCase() === "done").length;
    const overdueTasks = context.tasks.filter((t) => t.dueDate && t.dueDate < todayStr && t.status.toLowerCase() !== "done");

    if (totalTasks > 0) {
        const completionRate = completedTasks / totalTasks;
        if (completionRate >= 0.75) {
            score += 5;
            factors.push({
                name: "High Task Completion",
                impact: "positive",
                description: `${Math.round(completionRate * 100)}% of tasks completed`,
                scoreDelta: 5,
            });
        } else if (completionRate < 0.4) {
            score -= 10;
            factors.push({
                name: "Low Task Completion",
                impact: "negative",
                description: `Only ${Math.round(completionRate * 100)}% of tasks completed`,
                scoreDelta: -10,
            });
        }
    }

    if (overdueTasks.length > 0) {
        const penalty = Math.min(25, overdueTasks.length * 5);
        score -= penalty;
        factors.push({
            name: "Overdue Tasks",
            impact: "negative",
            description: `${overdueTasks.length} task(s) past due date`,
            scoreDelta: -penalty,
        });
    } else {
        score += 5;
        factors.push({
            name: "No Overdue Tasks",
            impact: "positive",
            description: "All pending tasks are on schedule",
            scoreDelta: 5,
        });
    }

    // 2. Project Health & Momentum
    const activeProjects = context.projects.filter((p) => {
        const st = p.status.toLowerCase();
        return st !== "completed" && st !== "done";
    });

    const overdueProjects = activeProjects.filter((p) => p.dueDate && p.dueDate < todayStr);

    if (overdueProjects.length > 0) {
        score -= 10;
        factors.push({
            name: "Overdue Projects",
            impact: "negative",
            description: `${overdueProjects.length} project(s) past target due date`,
            scoreDelta: -10,
        });
    } else if (activeProjects.length > 0) {
        score += 5;
        factors.push({
            name: "Active Project Momentum",
            impact: "positive",
            description: `${activeProjects.length} active project(s) progressing`,
            scoreDelta: 5,
        });
    }

    // 3. Financial Health (Invoices)
    const overdueInvoices = context.invoices.filter((i) => i.status.toLowerCase() === "overdue");
    if (overdueInvoices.length > 0) {
        score -= 15;
        factors.push({
            name: "Overdue Invoices",
            impact: "negative",
            description: `${overdueInvoices.length} unpaid overdue invoice(s)`,
            scoreDelta: -15,
        });
    } else if (context.invoices.length > 0) {
        score += 5;
        factors.push({
            name: "Healthy Invoicing",
            impact: "positive",
            description: "No overdue client invoices",
            scoreDelta: 5,
        });
    }

    // 4. Strategic Alignment (Business Brain & Decision Memory)
    if (context.business && context.business.name) {
        score += 5;
        factors.push({
            name: "Configured Business Brain",
            impact: "positive",
            description: "Core priorities and goals defined",
            scoreDelta: 5,
        });
    }

    if (context.decisions && context.decisions.length > 0) {
        score += 5;
        factors.push({
            name: "Confirmed Strategic Decisions",
            impact: "positive",
            description: `${context.decisions.length} active strategic decision(s) logged`,
            scoreDelta: 5,
        });
    }

    // Final Score Normalization (0-100)
    const finalScore = Math.max(0, Math.min(100, Math.round(score)));

    let status: HealthStatus = "good";
    if (finalScore >= 85) status = "excellent";
    else if (finalScore >= 70) status = "good";
    else if (finalScore >= 50) status = "fair";
    else status = "poor";

    let trend: HealthTrend = "stable";
    if (finalScore >= 80 && overdueTasks.length === 0 && overdueInvoices.length === 0) {
        trend = "improving";
    } else if (overdueTasks.length >= 2 || overdueInvoices.length >= 1 || finalScore < 60) {
        trend = "declining";
    }

    const summary = `Business Health is ${status.toUpperCase()} (${finalScore}/100) with a ${trend} trend. ${factors.length} key operational factor(s) evaluated.`;

    return {
        score: finalScore,
        status,
        trend,
        factors,
        summary,
    };
}
