/**
 * Static Deterministic Reasoning Provider (PAL-TDD-005A, PAL-ARCH-DOC-040)
 *
 * Implements IReasoningProvider using existing deterministic algorithms.
 * Used for fast unit tests, predictable offline execution, and baseline fallbacks.
 */

import type { AlignmentScoreResult, ExecutiveIntent, ExecutivePolicy, OKRItem } from "./strategyTypes.ts";
import type { CouncilMemberVote, MemberCritique, Proposal } from "./negotiationTypes.ts";
import type { SimulationMode } from "./simulationTypes.ts";
import type { IReasoningProvider } from "./reasoningTypes.ts";

export class StaticReasoningProvider implements IReasoningProvider {
    name = "StaticReasoningProvider";

    async generateOKRs(intent: ExecutiveIntent, policies: ExecutivePolicy[] = []): Promise<OKRItem[]> {
        const policyIds = policies.length > 0 ? policies.map((p) => p.id) : ["pol_default_1"];
        return [
            {
                id: `okr_${Date.now()}_1`,
                objective: `Drive Strategic Alignment for ${intent.title}`,
                keyResults: [
                    `Increase MRR towards target by end of quarter`,
                    `Maintain Cash Runway above 18 months`,
                    `Achieve >90% Policy & Restraint Compliance score`
                ],
                initiatives: [
                    "Automate high-value refund workflows with CFO approval bounds",
                    "Deploy economic scheduling across departmental worker tasks",
                    "Enforce strict reversibility indexing on autonomous executions"
                ],
                lineage: {
                    originIntentId: intent.id,
                    originPolicyIds: policyIds,
                    originConstraintIds: ["const_runway_18m"],
                    strategyVersion: intent.strategyVersion,
                    alignmentScore: 92
                }
            }
        ];
    }

    async evaluateCouncilVote(
        memberId: string,
        memberName: string,
        department: any,
        voteWeight: number,
        proposal: Proposal
    ): Promise<CouncilMemberVote> {
        let vote: "YES" | "NO" = "YES";
        let rationale = `Member ${memberName} (${department}): Approved based on risk-benefit alignment.`;
        let confidence = proposal.confidence;

        if (department === "finance" && proposal.estimatedCostUSD > 10000) {
            vote = "NO";
            rationale = `CFO Veto: Estimated cost $${proposal.estimatedCostUSD} USD exceeds automatic threshold of $10,000 USD.`;
            confidence = 0.95;
        } else if (proposal.estimatedRisk > 75) {
            vote = "NO";
            rationale = `High Risk Veto: Proposal risk rating ${proposal.estimatedRisk}/100 exceeds acceptable threshold.`;
        }

        return {
            memberId,
            memberName,
            department,
            vote,
            confidence,
            voteWeight,
            rationale,
            timestamp: Date.now()
        };
    }

    async generateNegotiationCritique(proposal: Proposal, _round: number): Promise<MemberCritique[]> {
        return [
            {
                memberId: "mem_cfo",
                targetDepartment: "engineering",
                critiquePoints: [
                    "Compute cost estimation is optimistic",
                    "Requires 10% risk buffer for unexpected token consumption"
                ],
                suggestedAdjustments: [
                    `Cap compute budget at $15,000 USD`,
                    `Increase reversibility score buffer to ${(proposal.reversibilityScore + 0.05).toFixed(2)}`
                ],
                timestamp: Date.now()
            }
        ];
    }

    async computeSimulationConfidence(proposal: Proposal, _mode: SimulationMode): Promise<number> {
        return Math.min(0.99, Math.max(0.60, proposal.confidence * 0.9 + 0.05));
    }

    async evaluateAlignmentScore(task: Record<string, any>, _strategyVersion: string): Promise<AlignmentScoreResult> {
        const cost = (task.tokenCostUSD || 0) + (task.computeCostUSD || 0);
        const riskPenalty = task.riskScore ? Math.round(task.riskScore * 0.3) : 10;
        const score = Math.max(50, Math.min(98, 90 - Math.round(cost * 2) - riskPenalty));

        return {
            score,
            breakdown: {
                intentMatch: 90,
                policyCompliance: 95,
                constraintCompliance: 90,
                kpiContribution: 85,
                riskPenalty
            },
            rationale: `Strategy Alignment Score ${score}/100 computed based on Static Alignment Evaluation with risk penalty -${riskPenalty}.`
        };
    }
}
