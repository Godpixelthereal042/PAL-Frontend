/**
 * Finance Executive Agent
 *
 * PAL Milestone 8A — Autonomous Executive Agents Framework
 */

import { BaseAgent } from "../baseAgent.ts";
import type { AgentRole, AgentContext, AgentResponse, AgentFinding } from "../types.ts";

export class FinanceAgent extends BaseAgent {
    public readonly role: AgentRole = "finance";
    public readonly name = "Finance Agent";
    public readonly description = "Tracks invoices, monitors operating cash flow, forecasts financial risks, and highlights payment delays.";
    public readonly capabilities = ["invoice_tracking", "cashflow_forecasting", "payment_delay_detection"];
    public readonly priority = 85;

    public async analyze(context: AgentContext): Promise<AgentResponse> {
        const ctx = context.snapshot.businessContext;
        const findings: AgentFinding[] = [];

        const unpaid = (ctx.invoices || []).filter((i) => i.status.toLowerCase() === "unpaid" || i.status.toLowerCase() === "past_due" || i.status.toLowerCase() === "overdue");
        if (unpaid.length > 0) {
            const total = unpaid.reduce((sum, i) => sum + (parseFloat(String(i.amount)) || 0), 0);
            findings.push({
                id: `fin_invoices_${Date.now()}`,
                category: "financial",
                severity: total > 10000 ? "critical" : "high",
                title: `Uncollected Cash Flow: $${total.toLocaleString()} Past Due`,
                detail: `${unpaid.length} past-due invoice(s) pending collection.`,
                recommendation: "Send automated invoice payment reminder or execute collection call.",
                confidence: 0.98,
                actionUrl: "/tasks",
            });
        }

        return {
            agentRole: this.role,
            agentName: this.name,
            focus: "Cash Flow & Accounts Receivable Ledger",
            findings,
            confidence: 0.95,
        };
    }
}
