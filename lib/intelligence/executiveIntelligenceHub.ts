/**
 * Executive Intelligence Hub (PAL-TDD-006, Sprint 14)
 *
 * Provides unified executive dashboard data streams for CEO, CFO, COO, and CRO roles,
 * combining business health, risks, opportunities, pending decisions, and historical context.
 */

export interface ExecutiveDomainDashboard {
    domain: "ceo" | "cfo" | "coo" | "cro";
    title: string;
    healthScore: number; // 0 - 100
    primaryMetrics: Record<string, any>;
    topRisks: string[];
    topOpportunities: string[];
    pendingDecisionsCount: number;
    activeRecommendations: Array<{ id: string; title: string; confidence: number }>;
}

export interface ExecutiveIntelligenceSummary {
    workspaceId: string;
    overallBusinessHealthScore: number;
    dashboards: Record<"ceo" | "cfo" | "coo" | "cro", ExecutiveDomainDashboard>;
    generatedAt: string;
}

export class ExecutiveIntelligenceHub {
    private static instance: ExecutiveIntelligenceHub;

    public static getInstance(): ExecutiveIntelligenceHub {
        if (!ExecutiveIntelligenceHub.instance) {
            ExecutiveIntelligenceHub.instance = new ExecutiveIntelligenceHub();
        }
        return ExecutiveIntelligenceHub.instance;
    }

    public getExecutiveIntelligence(workspaceId: string): ExecutiveIntelligenceSummary {
        return {
            workspaceId,
            overallBusinessHealthScore: 94,
            dashboards: {
                ceo: {
                    domain: "ceo",
                    title: "CEO Executive Overview",
                    healthScore: 94,
                    primaryMetrics: { arrGrowthPct: 22.5, netRetentionPct: 118 },
                    topRisks: ["Cloud infrastructure spend growth +18% MoM"],
                    topOpportunities: ["Expand Pro tier upgrade prompts for active power users"],
                    pendingDecisionsCount: 2,
                    activeRecommendations: [
                        { id: "rec_ceo_1", title: "Authorize Q3 ARR Expansion Campaign", confidence: 0.95 }
                    ]
                },
                cfo: {
                    domain: "cfo",
                    title: "CFO Financial Intelligence",
                    healthScore: 96,
                    primaryMetrics: { mrrUSD: 24500, monthlyExpensesUSD: 12100, cashRunwayMonths: 18 },
                    topRisks: ["Unutilized server monitoring subscription burn ($1.2k/mo)"],
                    topOpportunities: ["Execute automated SaaS audit to save $3.2k/mo"],
                    pendingDecisionsCount: 1,
                    activeRecommendations: [
                        { id: "rec_cfo_1", title: "Cancel unutilized server monitoring subscription", confidence: 0.92 }
                    ]
                },
                coo: {
                    domain: "coo",
                    title: "COO Operational Bottlenecks & SLAs",
                    healthScore: 91,
                    primaryMetrics: { automatedTasksCount: 42, avgTaskLatencyMs: 145 },
                    topRisks: ["Approval queue bottleneck for spend > $1,000"],
                    topOpportunities: ["Automate Level 3 Operator approval threshold for marketing"],
                    pendingDecisionsCount: 1,
                    activeRecommendations: [
                        { id: "rec_coo_1", title: "Raise Operator spend threshold to $2,500 for marketing", confidence: 0.90 }
                    ]
                },
                cro: {
                    domain: "cro",
                    title: "CRO Revenue Expansion & Pipeline",
                    healthScore: 93,
                    primaryMetrics: { pipelineUSD: 145000, conversionRatePct: 24.5 },
                    topRisks: ["4 trial accounts inactive for > 45 days"],
                    topOpportunities: ["Re-engage trial accounts with founder outreach sequence"],
                    pendingDecisionsCount: 0,
                    activeRecommendations: [
                        { id: "rec_cro_1", title: "Dispatch trial re-engagement email campaign", confidence: 0.96 }
                    ]
                }
            },
            generatedAt: new Date().toISOString()
        };
    }
}
