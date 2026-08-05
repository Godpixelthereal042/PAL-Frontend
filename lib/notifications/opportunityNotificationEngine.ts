/**
 * Opportunity Notification Candidate Engine
 *
 * PAL Milestone 5B — Notification Intelligence Engine
 */

import type { BusinessContext } from "../contextEngine.ts";
import type { CandidateNotification } from "./types.ts";

export function generateOpportunityCandidates(context: BusinessContext): CandidateNotification[] {
    const candidates: CandidateNotification[] = [];

    // 1. Focus Time Block Available
    if (context.calendar.length <= 2) {
        candidates.push({
            id: "cand_opp_focus",
            category: "opportunities",
            type: "available_focus_time",
            title: "Uninterrupted Focus Time Available",
            message: "Light calendar schedule today provides a prime window for deep work on core priorities.",
            priority: "low",
            severity: "low",
            actionLabel: "View Priorities",
            actionUrl: "/dashboard",
        });
    }

    // 2. Project Milestone Completion Opportunity
    for (const proj of context.projects) {
        const projTasks = context.tasks.filter((t) => t.projectId === proj.id);
        const completed = projTasks.filter((t) => t.status.toLowerCase() === "done").length;

        if (projTasks.length >= 2 && completed === projTasks.length) {
            candidates.push({
                id: `cand_opp_proj_complete_${proj.id}`,
                category: "tasks",
                type: "milestone_completed",
                title: `Project Completed: ${proj.title}`,
                message: `All ${projTasks.length} tasks completed for project '${proj.title}'!`,
                priority: "medium",
                severity: "low",
                actionLabel: "View Project",
                actionUrl: `/projects?id=${proj.id}`,
                metadata: { projectId: proj.id },
            });
        }
    }

    // 3. Pending Receivables Opportunity
    const pendingInvoices = context.invoices.filter(
        (i) => i.status.toLowerCase() === "pending" || i.status.toLowerCase() === "sent"
    );

    if (pendingInvoices.length > 0) {
        const totalAmount = pendingInvoices.reduce((sum, inv) => sum + (parseFloat(inv.amount.replace(/[^0-9.]/g, "")) || 0), 0);
        candidates.push({
            id: "cand_opp_receivables",
            category: "financial",
            type: "payment_received",
            title: "Pending Client Receivables",
            message: `${pendingInvoices.length} invoice(s) totaling $${totalAmount.toFixed(2)} sent to clients.`,
            priority: "low",
            severity: "low",
            actionLabel: "View Invoices",
            actionUrl: "/invoices",
        });
    }

    return candidates;
}
