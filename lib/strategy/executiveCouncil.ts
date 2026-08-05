/**
 * Executive Council & Consensus Confidence Calculator (PAL-TDD-005, PAL-TDD-005A, PAL-ARCH-DOC-034, PAL-ARCH-DOC-040)
 */

import { createDefaultOrganization, type Organization } from "./organizationModel.ts";
import type { ConsensusResult, CouncilMemberVote, DissentRecord, ExecutiveCouncilMember, NegotiationRound, Proposal } from "./negotiationTypes.ts";
import type { IReasoningProvider } from "./reasoningTypes.ts";
import { StaticReasoningProvider } from "./staticReasoningProvider.ts";

export class ConsensusConfidenceCalculator {
    calculateConsensus(votes: CouncilMemberVote[]): { consensusScore: number; aggregateConfidence: number } {
        if (votes.length === 0) return { consensusScore: 0, aggregateConfidence: 0 };

        let weightedScoreSum = 0;
        let totalWeightConfidenceSum = 0;
        let totalWeightSum = 0;
        let weightedConfidenceSum = 0;

        for (const v of votes) {
            const numericVote = v.vote === "YES" ? 1 : 0;
            const weightConf = v.voteWeight * v.confidence;

            weightedScoreSum += numericVote * weightConf;
            totalWeightConfidenceSum += weightConf;

            totalWeightSum += v.voteWeight;
            weightedConfidenceSum += v.confidence * v.voteWeight;
        }

        const consensusScore = totalWeightConfidenceSum > 0 ? weightedScoreSum / totalWeightConfidenceSum : 0;
        const aggregateConfidence = totalWeightSum > 0 ? weightedConfidenceSum / totalWeightSum : 0;

        return {
            consensusScore: Number(consensusScore.toFixed(4)),
            aggregateConfidence: Number(aggregateConfidence.toFixed(4))
        };
    }
}

export class ExecutiveCouncil {
    private org: Organization;
    private calculator: ConsensusConfidenceCalculator;
    private reasoningProvider: IReasoningProvider;

    constructor(
        org?: Organization,
        calculator?: ConsensusConfidenceCalculator,
        reasoningProvider?: IReasoningProvider
    ) {
        this.org = org || createDefaultOrganization();
        this.calculator = calculator || new ConsensusConfidenceCalculator();
        this.reasoningProvider = reasoningProvider || new StaticReasoningProvider();
    }

    getCouncilMembers(): ExecutiveCouncilMember[] {
        return this.org.councilMembers;
    }

    async conductVotingAsync(proposal: Proposal, history: NegotiationRound[] = []): Promise<ConsensusResult> {
        const votes: CouncilMemberVote[] = [];
        const dissentingVotes: DissentRecord[] = [];

        for (const member of this.org.councilMembers) {
            const voteRecord = await this.reasoningProvider.evaluateCouncilVote(
                member.id,
                member.name,
                member.department,
                member.voteWeight,
                proposal
            );
            votes.push(voteRecord);

            if (voteRecord.vote === "NO") {
                dissentingVotes.push({
                    memberId: member.id,
                    memberName: member.name,
                    department: member.department,
                    objectionReason: voteRecord.rationale,
                    underestimatedRiskCategory: member.department === "finance" ? "capital_budget_overrun" : "legal_compliance_risk",
                    timestamp: Date.now()
                });
            }
        }

        const math = this.calculator.calculateConsensus(votes);
        const approved = math.consensusScore >= 0.65;

        return {
            proposalId: proposal.id,
            approved,
            consensusScore: math.consensusScore,
            aggregateConfidence: math.aggregateConfidence,
            votes,
            dissentingVotes,
            history,
            approvedAt: Date.now()
        };
    }

    conductVoting(proposal: Proposal, history: NegotiationRound[] = []): ConsensusResult {
        const votes: CouncilMemberVote[] = [];
        const dissentingVotes: DissentRecord[] = [];

        for (const member of this.org.councilMembers) {
            const isFinanceRisk = proposal.estimatedCostUSD > 10000 && member.department === "finance";
            const isHighRisk = proposal.estimatedRisk > 70 && (member.department === "general" || member.department === "engineering");

            const voteChoice: "YES" | "NO" = isFinanceRisk || isHighRisk ? "NO" : "YES";
            const confidence = isFinanceRisk ? 0.85 : 0.92;

            const voteRecord: CouncilMemberVote = {
                memberId: member.id,
                memberName: member.name,
                department: member.department,
                vote: voteChoice,
                confidence,
                voteWeight: member.voteWeight,
                rationale: voteChoice === "YES"
                    ? `Proposal [${proposal.title}] aligns with ${member.department} objectives.`
                    : `Proposal [${proposal.title}] exceeds acceptable risk/budget thresholds for ${member.department}.`,
                timestamp: Date.now()
            };

            votes.push(voteRecord);

            if (voteChoice === "NO") {
                dissentingVotes.push({
                    memberId: member.id,
                    memberName: member.name,
                    department: member.department,
                    objectionReason: voteRecord.rationale,
                    underestimatedRiskCategory: isFinanceRisk ? "capital_budget_overrun" : "legal_compliance_risk",
                    timestamp: Date.now()
                });
            }
        }

        const math = this.calculator.calculateConsensus(votes);
        const approved = math.consensusScore >= 0.65;

        return {
            proposalId: proposal.id,
            approved,
            consensusScore: math.consensusScore,
            aggregateConfidence: math.aggregateConfidence,
            votes,
            dissentingVotes,
            history,
            approvedAt: Date.now()
        };
    }
}
