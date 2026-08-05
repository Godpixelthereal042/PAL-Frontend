/**
 * Strategic Simulation & Multidimensional Risk Types (PAL-TDD-005, PAL-ARCH-DOC-035)
 */

export type SimulationMode =
    | "deterministic"
    | "monte_carlo"
    | "sensitivity_analysis"
    | "worst_case"
    | "best_case"
    | "expected_value"
    | "stress_test";

export interface RiskDimensionBreakdown {
    financialRisk: number; // 0 - 100
    complianceRisk: number; // 0 - 100
    operationalRisk: number; // 0 - 100
    reputationRisk: number; // 0 - 100
    securityRisk: number; // 0 - 100
    compositeRiskScore: number; // 0 - 100
    rationale: string;
}

export interface ScenarioAssumption {
    variable: string;
    description: string;
    baselineValue: number;
    perturbedValue: number;
    changePercentage: number;
}

export interface ForecastDistribution {
    metricKey: string;
    metricName: string;
    unit: string;
    min: number;
    median: number;
    max: number;
    ci95Lower: number;
    ci95Upper: number;
}

export interface SimulationResult {
    simulationId: string;
    proposalId: string;
    strategyVersion: string;
    mode: SimulationMode;
    riskBreakdown: RiskDimensionBreakdown;
    assumptions: ScenarioAssumption[];
    forecasts: ForecastDistribution[];
    recommendation: "proceed" | "proceed_with_caution" | "reject" | "require_cfo_signoff";
    confidenceScore: number; // 0.0 - 1.0
    simulatedAt: number;
}
