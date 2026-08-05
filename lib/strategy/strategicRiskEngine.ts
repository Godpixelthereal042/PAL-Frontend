/**
 * Multidimensional Strategic Risk Engine (PAL-TDD-005, PAL-ARCH-DOC-035)
 */

import type { Proposal } from "./negotiationTypes.ts";
import type { RiskDimensionBreakdown } from "./simulationTypes.ts";

export class StrategicRiskEngine {
    evaluateProposalRisk(proposal: Proposal): RiskDimensionBreakdown {
        const financialRisk = Math.min(100, Math.round((proposal.estimatedCostUSD / 25000) * 50 + proposal.estimatedRisk * 0.3));
        const complianceRisk = proposal.affectedDepartments.includes("general") ? Math.min(100, proposal.estimatedRisk + 20) : Math.round(proposal.estimatedRisk * 0.4);
        const operationalRisk = Math.min(100, Math.round((1 - proposal.reversibilityScore) * 80 + proposal.estimatedRisk * 0.2));
        const reputationRisk = proposal.affectedDepartments.includes("sales") || proposal.affectedDepartments.includes("marketing") ? 35 : 15;
        const securityRisk = proposal.affectedDepartments.includes("engineering") ? 25 : 10;

        const compositeRiskScore = Math.round(
            financialRisk * 0.30 +
            complianceRisk * 0.25 +
            operationalRisk * 0.20 +
            securityRisk * 0.15 +
            reputationRisk * 0.10
        );

        return {
            financialRisk,
            complianceRisk,
            operationalRisk,
            reputationRisk,
            securityRisk,
            compositeRiskScore,
            rationale: `Multidimensional Risk: Financial ${financialRisk}/100, Compliance ${complianceRisk}/100, Operational ${operationalRisk}/100, Security ${securityRisk}/100, Reputation ${reputationRisk}/100. Composite: ${compositeRiskScore}/100.`
        };
    }
}
