/**
 * Collective Intelligence Engine & Platform Learning Flywheel (PAL-TDD-006, Sprint 18)
 *
 * Aggregates privacy-preserving, anonymized cross-company decision outcomes
 * (e.g. "73% of similar SaaS companies improved retention after onboarding automation")
 * to build PAL's global intelligence flywheel.
 */

export interface CollectiveInsight {
    insightId: string;
    industryCategory: "saas" | "ecommerce" | "agency" | "fintech";
    patternTitle: string;
    insightSummary: string;
    confidencePercentage: number; // e.g. 73%
    sampleSizeCompanies: number;
    recommendedStrategy: string;
    generatedAt: number;
}

export class CollectiveIntelligenceEngine {
    private static instance: CollectiveIntelligenceEngine;
    private insights: Map<string, CollectiveInsight[]> = new Map();

    constructor() {
        this.initializeDemoInsights();
    }

    public static getInstance(): CollectiveIntelligenceEngine {
        if (!CollectiveIntelligenceEngine.instance) {
            CollectiveIntelligenceEngine.instance = new CollectiveIntelligenceEngine();
        }
        return CollectiveIntelligenceEngine.instance;
    }

    private initializeDemoInsights(): void {
        const defaultInsights: CollectiveInsight[] = [
            {
                insightId: "ins_saas_onboarding",
                industryCategory: "saas",
                patternTitle: "Onboarding Automation & Retention",
                insightSummary: "73% of similar SaaS companies improved customer retention by > 15% after implementing automated first-week onboarding workflows.",
                confidencePercentage: 73,
                sampleSizeCompanies: 240,
                recommendedStrategy: "Implement automated 4-step onboarding journey for trial accounts.",
                generatedAt: Date.now()
            },
            {
                insightId: "ins_saas_pricing",
                industryCategory: "saas",
                patternTitle: "Pricing Tier Expansion Timing",
                insightSummary: "68% of B2B SaaS scale-ups achieved +25% MRR expansion after introducing a dedicated $999/mo Business tier.",
                confidencePercentage: 68,
                sampleSizeCompanies: 180,
                recommendedStrategy: "Upgrade active power users to Business tier with advanced governance.",
                generatedAt: Date.now()
            }
        ];
        this.insights.set("saas", defaultInsights);
    }

    public getInsightsByIndustry(industry: CollectiveInsight["industryCategory"]): CollectiveInsight[] {
        return this.insights.get(industry) || [];
    }
}
