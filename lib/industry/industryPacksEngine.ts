/**
 * Industry Intelligence Packs Engine (PAL-TDD-006, Sprint 15)
 *
 * Provides specialized domain metrics, reasoning prompts, and industry benchmarks
 * for SaaS Founders, E-Commerce Operators, and Digital Agencies.
 */

export interface IndustryPackDefinition {
    packId: "saas" | "ecommerce" | "agency" | "fintech";
    name: string;
    description: string;
    coreKPIs: string[];
    specializedPrompts: string[];
    benchmarkMetrics: Record<string, any>;
}

export class IndustryPacksEngine {
    private static instance: IndustryPacksEngine;
    private packs: Map<string, IndustryPackDefinition> = new Map();

    constructor() {
        this.initializePacks();
    }

    public static getInstance(): IndustryPacksEngine {
        if (!IndustryPacksEngine.instance) {
            IndustryPacksEngine.instance = new IndustryPacksEngine();
        }
        return IndustryPacksEngine.instance;
    }

    private initializePacks(): void {
        const defaultPacks: IndustryPackDefinition[] = [
            {
                packId: "saas",
                name: "SaaS Founder Intelligence Pack",
                description: "Optimized for subscription revenue, ARR growth, trial churn, CAC, LTV, and net revenue retention.",
                coreKPIs: ["ARR", "MRR Growth", "Trial Churn Rate", "CAC", "LTV", "Net Revenue Retention"],
                specializedPrompts: [
                    "PAL, analyze trial user inactivity for > 45 days and generate re-engagement campaign.",
                    "PAL, audit monthly software subscriptions and flag unutilized vendor spend."
                ],
                benchmarkMetrics: { targetGrowthRatePct: 20, maxMonthlyChurnPct: 2.0, targetGrossMarginPct: 85 }
            },
            {
                packId: "ecommerce",
                name: "E-Commerce Operator Intelligence Pack",
                description: "Optimized for Average Order Value (AOV), conversion rates, inventory turnover, and repeat purchase rate.",
                coreKPIs: ["AOV", "Checkout Conversion Rate", "Inventory Turnover", "Repeat Purchase Rate"],
                specializedPrompts: [
                    "PAL, identify abandoned cart cohorts and dispatch personalized recovery offers.",
                    "PAL, optimize reorder timing for top-selling SKUs based on 30-day velocity."
                ],
                benchmarkMetrics: { targetConversionPct: 3.5, targetAOVUSD: 85, targetRepeatRatePct: 30 }
            },
            {
                packId: "agency",
                name: "Agency & Services Intelligence Pack",
                description: "Optimized for billable utilization rate, client retention, invoice aging, and project profit margins.",
                coreKPIs: ["Billable Utilization Rate", "Client Retention Rate", "Invoice Aging (DSO)", "Project Margin"],
                specializedPrompts: [
                    "PAL, flag invoices unpaid after 30 days and generate automated payment reminders.",
                    "PAL, analyze project billable hours vs. fixed-fee budgets to prevent scope creep."
                ],
                benchmarkMetrics: { targetUtilizationPct: 75, targetProjectMarginPct: 50, targetDsoDays: 25 }
            }
        ];

        for (const p of defaultPacks) {
            this.packs.set(p.packId, p);
        }
    }

    public getPack(packId: string): IndustryPackDefinition | undefined {
        return this.packs.get(packId);
    }

    public getAllPacks(): IndustryPackDefinition[] {
        return Array.from(this.packs.values());
    }
}
