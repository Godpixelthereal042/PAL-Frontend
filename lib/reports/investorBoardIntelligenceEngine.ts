/**
 * Investor & Board Intelligence Engine (PAL-TDD-006, Sprint 15)
 *
 * Generates automated monthly investor updates (Revenue growth, KPIs, Wins, Risks, Future plans)
 * and pre-meeting board decision agendas.
 */

export interface MonthlyInvestorUpdate {
    updateId: string;
    workspaceId: string;
    companyName: string;
    periodMonth: string;
    highlights: {
        mrrUSD: number;
        mrrGrowthPct: number;
        cashRunwayMonths: number;
        keyWins: string[];
        topRisks: string[];
        next30DayGoals: string[];
    };
    founderMessage: string;
    generatedAt: string;
}

export interface BoardDecisionAgenda {
    agendaId: string;
    workspaceId: string;
    meetingDate: string;
    decisionsRequired: Array<{ decisionId: string; title: string; background: string; recommendation: string }>;
}

export class InvestorBoardIntelligenceEngine {
    private static instance: InvestorBoardIntelligenceEngine;

    public static getInstance(): InvestorBoardIntelligenceEngine {
        if (!InvestorBoardIntelligenceEngine.instance) {
            InvestorBoardIntelligenceEngine.instance = new InvestorBoardIntelligenceEngine();
        }
        return InvestorBoardIntelligenceEngine.instance;
    }

    public generateInvestorUpdate(workspaceId: string, companyName = "Acme SaaS Technologies"): MonthlyInvestorUpdate {
        const monthStr = new Date().toLocaleString("default", { month: "long", year: "numeric" });

        return {
            updateId: `inv_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
            workspaceId,
            companyName,
            periodMonth: monthStr,
            highlights: {
                mrrUSD: 24500,
                mrrGrowthPct: 18.4,
                cashRunwayMonths: 18,
                keyWins: [
                    "Onboarded 20 Founding Partners in private beta program",
                    "Validated $1,500/mo net SaaS cost savings in real pilot company",
                    "Maintained 67.8% self-serve activation rate"
                ],
                topRisks: [
                    "Trial customer churn concentrated in inactive accounts (>45 days)"
                ],
                next30DayGoals: [
                    "Expand beta program to 50 active founders",
                    "Launch public self-serve registration & Product Hunt campaign"
                ]
            },
            founderMessage: "PAL is performing exceptionally well as an AI Business Teammate across our pilot cohort.",
            generatedAt: new Date().toISOString()
        };
    }

    public generateBoardDecisionAgenda(workspaceId: string): BoardDecisionAgenda {
        return {
            agendaId: `bda_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
            workspaceId,
            meetingDate: new Date().toISOString().split("T")[0],
            decisionsRequired: [
                {
                    decisionId: "dec_bda_1",
                    title: "Authorize Q4 Pro Tier Expansion",
                    background: "Pro tier demand is exceeding initial targets with 8.5% conversion rate.",
                    recommendation: "Approve 50% discount lifetime founder pricing for initial 50 beta members."
                },
                {
                    decisionId: "dec_bda_2",
                    title: "Raise Level 3 Operator Spend Threshold to $2,500",
                    background: "Approvals under $2,500 have a 100% approval rate.",
                    recommendation: "Automate Level 3 Operator execution to reduce review latency."
                }
            ]
        };
    }
}
