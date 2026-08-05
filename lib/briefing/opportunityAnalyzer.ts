/**
 * Opportunity Analyzer
 *
 * PAL Milestone 5A — Daily Briefing Engine
 *
 * Detects positive business opportunities (focus blocks, revenue opportunities, momentum milestones).
 */

import type { BusinessContext } from "../contextEngine.ts";
import type { Opportunity } from "./types.ts";

export function analyzeOpportunities(context: BusinessContext): Opportunity[] {
    const opportunities: Opportunity[] = [];

    // 1. Available Focus Work Block
    if (context.calendar.length <= 2) {
        opportunities.push({
            id: "opp_focus_time",
            title: "Focus Time Available",
            type: "productivity",
            description: "Light meeting schedule today provides a dedicated block for deep focus work on primary goals.",
            potentialValue: "Unblocks high-impact strategic priorities",
        });
    }

    // 2. High-Momentum / Near Completion Projects
    for (const proj of context.projects) {
        const projTasks = context.tasks.filter((t) => t.projectId === proj.id);
        if (projTasks.length >= 2) {
            const completed = projTasks.filter((t) => t.status.toLowerCase() === "done").length;
            const completionRatio = completed / projTasks.length;

            if (completionRatio >= 0.5 && completionRatio < 1.0) {
                opportunities.push({
                    id: `opp_momentum_${proj.id}`,
                    title: `Project Nearing Completion: ${proj.title}`,
                    type: "momentum",
                    description: `${completed} of ${projTasks.length} tasks completed (${Math.round(completionRatio * 100)}%). A final push will finish this project.`,
                    potentialValue: `Complete project '${proj.title}'`,
                });
            }
        }
    }

    // 3. Pending Revenue Invoices
    const pendingInvoices = context.invoices.filter((i) => i.status.toLowerCase() === "pending" || i.status.toLowerCase() === "sent");
    if (pendingInvoices.length > 0) {
        const totalPending = pendingInvoices.reduce((sum, inv) => sum + (parseFloat(inv.amount.replace(/[^0-9.]/g, "")) || 0), 0);
        opportunities.push({
            id: "opp_pending_revenue",
            title: "Pending Revenue Realization",
            type: "revenue",
            description: `${pendingInvoices.length} pending invoice(s) totaling $${totalPending.toFixed(2)} sent to clients.`,
            potentialValue: `$${totalPending.toFixed(2)} cash inflow upon collection`,
        });
    }

    // 4. Confirmed Strategic Decisions Ready for Execution
    if (context.decisions && context.decisions.length > 0) {
        const activeDec = context.decisions.find((d) => d.status.toLowerCase() === "active");
        if (activeDec) {
            opportunities.push({
                id: `opp_decision_exec_${activeDec.id}`,
                title: `Execute Decision: ${activeDec.title}`,
                type: "strategy",
                description: activeDec.rationale ? `Confirmed decision: ${activeDec.rationale}` : "Decision confirmed and ready for operational execution.",
                potentialValue: "Aligns team with confirmed strategy",
            });
        }
    }

    return opportunities;
}
