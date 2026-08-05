/**
 * Executive Briefing Composer
 *
 * PAL Milestone 5A — Daily Briefing Engine
 *
 * Assembles the structured DailyBriefing object and formats markdown executive summary output.
 */

import type { BusinessContext } from "../contextEngine.ts";
import type {
    DailyBriefing,
    BusinessHealth,
    Priority,
    Risk,
    Opportunity,
    Insight,
    Recommendation,
    ScheduleItem,
    FinancialSummary,
    PendingDecisionBrief,
} from "./types.ts";

export function composeBriefing(
    context: BusinessContext,
    health: BusinessHealth,
    priorities: Priority[],
    risks: Risk[],
    opportunities: Opportunity[],
    insights: Insight[],
    recommendation: Recommendation
): DailyBriefing {
    const now = Date.now();
    const id = `brief_${now}_${Math.random().toString(36).slice(2, 7)}`;
    const founderName = context.founder.name || "Founder";

    // 1. Schedule Items
    const schedule: ScheduleItem[] = (context.calendar || []).map((evt: any) => ({
        id: evt.id,
        title: evt.title,
        time: evt.time || evt.startsAt || "Scheduled",
        location: evt.location || undefined,
        status: evt.status || "confirmed",
    }));

    // 2. Financial Highlights
    let overdueAmt = 0;
    let pendingAmt = 0;
    for (const inv of context.invoices || []) {
        const val = parseFloat(inv.amount.replace(/[^0-9.]/g, "")) || 0;
        const st = inv.status.toLowerCase();
        if (st === "overdue") overdueAmt += val;
        else if (st === "pending" || st === "sent") pendingAmt += val;
    }

    const financialHighlights: FinancialSummary = {
        overdueInvoicesAmount: overdueAmt,
        pendingInvoicesAmount: pendingAmt,
        summary: overdueAmt > 0
            ? `$${overdueAmt.toFixed(2)} overdue across ${context.invoices.filter((i) => i.status.toLowerCase() === "overdue").length} invoice(s)`
            : `$${pendingAmt.toFixed(2)} pending in receivables`,
    };

    // 3. Pending Decisions (Awaiting Founder Confirmation)
    const pendingDecisions: PendingDecisionBrief[] = (context.decisions || [])
        .filter((d) => d.status.toLowerCase() === "pending_confirmation")
        .map((d) => ({
            id: d.id,
            title: d.title,
            rationale: d.rationale,
            createdAt: d.createdAt,
        }));

    // 4. Format Executive Markdown Summary
    const mdLines: string[] = [];
    mdLines.push(`Good morning, ${founderName}.\n`);

    mdLines.push(`### Business Health`);
    mdLines.push(`**${health.score}/100** (${health.status.toUpperCase()}, ${health.trend})\n`);

    if (priorities.length > 0) {
        mdLines.push(`### Today's Priorities`);
        priorities.slice(0, 3).forEach((p) => {
            mdLines.push(`• **${p.title}** — ${p.reason}`);
        });
        mdLines.push("");
    }

    if (schedule.length > 0) {
        mdLines.push(`### Today's Schedule`);
        schedule.forEach((s) => {
            mdLines.push(`• **${s.time}** – ${s.title}`);
        });
        mdLines.push("");
    }

    if (risks.length > 0) {
        mdLines.push(`### Risks`);
        risks.forEach((r) => {
            mdLines.push(`• **[${r.severity.toUpperCase()}]** ${r.title}: ${r.impact}`);
        });
        mdLines.push("");
    }

    if (opportunities.length > 0) {
        mdLines.push(`### Opportunities`);
        opportunities.forEach((o) => {
            mdLines.push(`• **${o.title}**: ${o.description}`);
        });
        mdLines.push("");
    }

    if (pendingDecisions.length > 0) {
        mdLines.push(`### Pending Decisions`);
        pendingDecisions.forEach((d) => {
            mdLines.push(`• **${d.title}** (Awaiting confirmation)`);
        });
        mdLines.push("");
    }

    mdLines.push(`### Financial Highlights`);
    mdLines.push(`• ${financialHighlights.summary}\n`);

    mdLines.push(`### AI Recommendation`);
    mdLines.push(`**${recommendation.title}**`);
    mdLines.push(`${recommendation.reason}`);

    return {
        id,
        userId: context.founder.email || "current_user",
        founderName,
        generatedAt: now,
        businessHealth: health,
        priorities,
        schedule,
        risks,
        opportunities,
        pendingDecisions,
        financialHighlights,
        insights,
        recommendation,
        markdownSummary: mdLines.join("\n"),
    };
}
