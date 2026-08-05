/**
 * Risk Notification Candidate Engine
 *
 * PAL Milestone 5B — Notification Intelligence Engine
 */

import type { BusinessContext } from "../contextEngine.ts";
import type { CandidateNotification } from "./types.ts";

export function generateRiskCandidates(context: BusinessContext): CandidateNotification[] {
    const candidates: CandidateNotification[] = [];
    const todayStr = new Date().toISOString().split("T")[0];

    // 1. Overdue Tasks (Individual Candidate per task for policy engine batching/deduping)
    const overdueTasks = context.tasks.filter(
        (t) => t.dueDate && t.dueDate < todayStr && t.status.toLowerCase() !== "done"
    );

    for (const task of overdueTasks) {
        candidates.push({
            id: `cand_task_overdue_${task.id}`,
            category: "tasks",
            type: "task_overdue",
            title: `Task Overdue: ${task.title}`,
            message: `Task '${task.title}' was due on ${task.dueDate} and remains pending.`,
            priority: task.priority.toLowerCase() === "high" ? "urgent" : "high",
            severity: task.priority.toLowerCase() === "high" ? "critical" : "high",
            actionLabel: "Resolve Task",
            actionUrl: `/tasks?id=${task.id}`,
            metadata: { taskId: task.id, dueDate: task.dueDate },
        });
    }

    // 2. Overdue Invoices
    const overdueInvoices = context.invoices.filter((i) => i.status.toLowerCase() === "overdue");
    for (const inv of overdueInvoices) {
        candidates.push({
            id: `cand_inv_overdue_${inv.id}`,
            category: "financial",
            type: "invoice_overdue",
            title: `Overdue Invoice: ${inv.client}`,
            message: `Invoice for ${inv.client} (${inv.amount}) is overdue for service '${inv.service}'.`,
            priority: "urgent",
            severity: "critical",
            actionLabel: "View Invoice",
            actionUrl: `/invoices?id=${inv.id}`,
            metadata: { invoiceId: inv.id, client: inv.client, amount: inv.amount },
        });
    }

    // 3. Decisions Awaiting Founder Confirmation
    const pendingDecisions = (context.decisions || []).filter(
        (d) => d.status.toLowerCase() === "pending_confirmation"
    );

    for (const dec of pendingDecisions) {
        candidates.push({
            id: `cand_dec_pending_${dec.id}`,
            category: "decisions",
            type: "decision_awaiting_approval",
            title: `Decision Awaiting Confirmation: ${dec.title}`,
            message: `Strategic decision '${dec.title}' is pending founder confirmation to enter active context.`,
            priority: "high",
            severity: "medium",
            actionLabel: "Confirm Decision",
            actionUrl: `/decisions?id=${dec.id}`,
            metadata: { decisionId: dec.id },
        });
    }

    // 4. At-Risk Relationship Insights
    if (context.relationships && context.relationships.insights) {
        for (const ins of context.relationships.insights) {
            if (ins.severity === "high" || ins.severity === "critical") {
                candidates.push({
                    id: `cand_rel_insight_${ins.id}`,
                    category: "relationships" as any,
                    type: ins.category,
                    title: ins.title,
                    message: ins.description,
                    priority: ins.severity === "critical" ? "urgent" : "high",
                    severity: ins.severity === "critical" ? "critical" : "high",
                    actionLabel: "View Relationship",
                    actionUrl: `/relationships?id=${ins.personId}`,
                    metadata: { personId: ins.personId, personName: ins.personName },
                });
            }
        }
    }

    return candidates;
}
