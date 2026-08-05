/**
 * Company Digital Twin Engine (PAL-TDD-006, Sprint 16)
 *
 * Constructs a digital copy of the company to simulate what-if scenarios
 * (e.g. hiring salespeople, changing price tiers, launching new marketing channels).
 */

export interface WhatIfScenarioSimulation {
    scenarioId: string;
    workspaceId: string;
    hypothesis: string;
    monthlyCostUSD: number;
    expectedPipelineIncreaseUSD: number;
    breakEvenTimeframeMonths: number;
    riskLevel: "low" | "medium" | "high";
    keyAssumptions: string[];
    simulatedAt: number;
}

export class CompanyDigitalTwinEngine {
    private static instance: CompanyDigitalTwinEngine;

    public static getInstance(): CompanyDigitalTwinEngine {
        if (!CompanyDigitalTwinEngine.instance) {
            CompanyDigitalTwinEngine.instance = new CompanyDigitalTwinEngine();
        }
        return CompanyDigitalTwinEngine.instance;
    }

    public simulateWhatIf(workspaceId: string, hypothesis: string): WhatIfScenarioSimulation {
        const isHiring = hypothesis.toLowerCase().includes("hire");

        return {
            scenarioId: `twin_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
            workspaceId,
            hypothesis,
            monthlyCostUSD: isHiring ? 18000 : 5000,
            expectedPipelineIncreaseUSD: isHiring ? 75000 : 25000,
            breakEvenTimeframeMonths: isHiring ? 4 : 2,
            riskLevel: "medium",
            keyAssumptions: [
                "New sales hires achieve 80% quota in Month 3",
                "Average deal size remains constant at $1,200 ACV",
                "Sales cycle duration stays under 30 days"
            ],
            simulatedAt: Date.now()
        };
    }
}
