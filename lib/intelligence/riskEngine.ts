/**
 * Risk Intelligence Engine
 *
 * PAL Milestone 7A — Executive Intelligence Engine
 */

import type { RiskInsight, Severity } from "./types.ts";
import type { BusinessContext } from "../contextEngine.ts";

export class RiskIntelligenceEngine {
    public analyzeRisks(ctx: BusinessContext): RiskInsight[] {
        const risks: RiskInsight[] = [];
        const now = Date.now();

        // 1. Task Overdue Risks
        const overdueTasks = (ctx.tasks || []).filter(
            (t) => t.dueDate && new Date(t.dueDate).getTime() < now && t.status.toLowerCase() !== "completed" && t.status.toLowerCase() !== "done"
        );
        if (overdueTasks.length > 0) {
            const isCritical = overdueTasks.length >= 3;
            risks.push({
                id: `risk_tasks_${now}`,
                title: `${overdueTasks.length} Overdue Operational Task${overdueTasks.length > 1 ? "s" : ""}`,
                description: `Multiple task deadlines have elapsed without completion, threatening operational momentum.`,
                severity: isCritical ? "critical" : "high",
                confidence: 0.95,
                evidence: overdueTasks.map((t) => `Task "${t.title}" was due on ${t.dueDate}`),
                recommendedAction: "Review and complete or reassign overdue tasks immediately.",
                impact: "Delays milestone delivery and creates operational bottlenecks.",
                category: "operational",
            });
        }

        // 2. Financial Invoice Overdue Risk
        const unpaidInvoices = (ctx.invoices || []).filter((inv) => inv.status.toLowerCase() === "unpaid" || inv.status.toLowerCase() === "past_due" || inv.status.toLowerCase() === "overdue");
        if (unpaidInvoices.length > 0) {
            const totalAmount = unpaidInvoices.reduce((sum, inv) => sum + (parseFloat(String(inv.amount)) || 0), 0);
            risks.push({
                id: `risk_invoices_${now}`,
                title: `Past-Due Accounts Receivable ($${totalAmount.toLocaleString()})`,
                description: `${unpaidInvoices.length} past-due invoice(s) outstanding, impacting projected cash flow.`,
                severity: totalAmount > 10000 ? "critical" : "high",
                confidence: 0.98,
                evidence: unpaidInvoices.map((inv) => `Invoice #${inv.id} for $${inv.amount} status: ${inv.status}`),
                recommendedAction: "Send automated payment reminder or schedule collection call.",
                impact: "Restricts operating cash liquidity for upcoming payroll & expenses.",
                category: "financial",
            });
        }

        // 3. Relationship Health Risk (Overdue Stakeholder Follow-ups & At-Risk Insights)
        const relCtx = ctx.relationships;
        if (relCtx) {
            const atRiskInsights = (relCtx.insights || []).filter(
                (ins) => ins.severity === "high" || ins.severity === "critical" || ins.category === "at_risk" || ins.category === "overdue_follow_up"
            );
            if (atRiskInsights.length > 0 || relCtx.atRiskCount > 0) {
                const investorRisks = atRiskInsights.filter((ins) => ins.relationshipType.toLowerCase() === "investor" || ins.category === "investor_attention");
                const isInvestorUrgent = investorRisks.length > 0;

                risks.push({
                    id: `risk_rel_${now}`,
                    title: `${relCtx.atRiskCount || atRiskInsights.length} Stakeholder Relationship${(relCtx.atRiskCount || atRiskInsights.length) > 1 ? "s" : ""} At-Risk`,
                    description: `Key contact interactions are overdue (>30 days since last contact).`,
                    severity: isInvestorUrgent ? "critical" : "medium",
                    confidence: 0.92,
                    evidence: atRiskInsights.map(
                        (ins) => `${ins.personName} (${ins.relationshipType}) — ${ins.description}`
                    ),
                    recommendedAction: "Schedule priority catch-up call or send relationship check-in update.",
                    impact: "Weakens stakeholder trust and risks investor/client churn.",
                    category: "relationship",
                });
            }
        }

        // 4. Decision Bottlenecks
        const pendingDecisions = (ctx.decisions || []).filter((d) => d.status.toLowerCase() === "pending_confirmation");
        if (pendingDecisions.length > 0) {
            risks.push({
                id: `risk_decisions_${now}`,
                title: `${pendingDecisions.length} Strategic Decision${pendingDecisions.length > 1 ? "s" : ""} Awaiting Confirmation`,
                description: "Key business choices are pending founder sign-off, blocking execution.",
                severity: "medium",
                confidence: 0.88,
                evidence: pendingDecisions.map((d) => `Decision "${d.title}" pending confirmation`),
                recommendedAction: "Review Decision Memory log and confirm or reject pending choices.",
                impact: "Causes execution stagnation across dependent projects.",
                category: "decision",
            });
        }

        // Sort by severity (critical -> high -> medium -> low)
        const severityOrder: Record<Severity, number> = { critical: 4, high: 3, medium: 2, low: 1 };
        return risks.sort((a, b) => severityOrder[b.severity] - severityOrder[a.severity]);
    }
}

export const riskEngine = new RiskIntelligenceEngine();
