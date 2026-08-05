/**
 * Risk Analyzer
 *
 * PAL Milestone 5A — Daily Briefing Engine
 *
 * Detects operational, financial, technical, and strategic risks with severity classifications.
 */

import type { BusinessContext } from "../contextEngine.ts";
import type { Risk, RiskSeverity } from "./types.ts";

export function analyzeRisks(context: BusinessContext): Risk[] {
    const risks: Risk[] = [];
    const todayStr = new Date().toISOString().split("T")[0];

    // 1. Financial Risk: Overdue Invoices
    const overdueInvoices = context.invoices.filter((i) => i.status.toLowerCase() === "overdue");
    if (overdueInvoices.length > 0) {
        const totalAmount = overdueInvoices.reduce((sum, inv) => sum + (parseFloat(inv.amount.replace(/[^0-9.]/g, "")) || 0), 0);
        risks.push({
            id: "risk_overdue_invoices",
            title: `${overdueInvoices.length} Overdue Invoice(s)`,
            severity: "critical",
            category: "financial",
            impact: `Delays cash flow collection ($${totalAmount.toFixed(2)} outstanding)`,
            mitigation: "Send invoice reminder to clients or check payment status.",
        });
    }

    // 2. Schedule & Operational Risk: Overdue Tasks
    const overdueTasks = context.tasks.filter((t) => t.dueDate && t.dueDate < todayStr && t.status.toLowerCase() !== "done");
    if (overdueTasks.length > 0) {
        const severity: RiskSeverity = overdueTasks.length >= 3 ? "critical" : "high";
        risks.push({
            id: "risk_overdue_tasks",
            title: `${overdueTasks.length} Overdue Task(s)`,
            severity,
            category: "schedule",
            impact: "Threatens project delivery deadlines and operational momentum.",
            mitigation: "Re-prioritize or reschedule overdue tasks today.",
            relatedItem: overdueTasks[0].title,
        });
    }

    // 3. Project Delivery Risk: Overdue Projects
    const overdueProjects = context.projects.filter((p) => p.dueDate && p.dueDate < todayStr && p.status.toLowerCase() !== "completed");
    if (overdueProjects.length > 0) {
        risks.push({
            id: "risk_overdue_projects",
            title: `Project Deadline Missed: ${overdueProjects[0].title}`,
            severity: "high",
            category: "operational",
            impact: "Project has passed its target completion date.",
            mitigation: "Review project milestones and adjust timeline or scope.",
            relatedItem: overdueProjects[0].id,
        });
    }

    // 4. Workload / Calendar Risk
    if (context.calendar.length >= 5) {
        risks.push({
            id: "risk_heavy_calendar",
            title: "Heavy Meeting Schedule",
            severity: "medium",
            category: "operational",
            impact: `${context.calendar.length} events scheduled today, limiting focus execution time.`,
            mitigation: "Protect small gaps between meetings for deep work.",
        });
    }

    // 5. Strategic Risk: Missing Business Brain Configuration
    if (!context.business || !context.business.name) {
        risks.push({
            id: "risk_unconfigured_brain",
            title: "Unconfigured Business Brain",
            severity: "low",
            category: "strategic",
            impact: "AI reasoning operates on generic assumptions without explicit company context.",
            mitigation: "Complete Business Brain onboarding setup.",
        });
    }

    // 6. Relationship Risk: At-Risk Key Relationships & Overdue Follow-ups
    if (context.relationships) {
        if (context.relationships.atRiskCount > 0) {
            risks.push({
                id: "risk_relationship_attention",
                title: `${context.relationships.atRiskCount} Relationship(s) Require Attention`,
                severity: "high",
                category: "strategic",
                impact: "Key client, investor, or partner engagement has degraded.",
                mitigation: "Review relationship timeline and schedule a check-in.",
            });
        }
    }

    return risks;
}
