/**
 * Agent Negotiation Engine (PAL-TDD-005, PAL-TDD-005A, PAL-ARCH-DOC-034, PAL-ARCH-DOC-040)
 */

import { ExecutiveCouncil } from "./executiveCouncil.ts";
import type { ConsensusResult, MemberCritique, MemberOpinion, NegotiationRound, Proposal } from "./negotiationTypes.ts";
import type { IReasoningProvider } from "./reasoningTypes.ts";
import { StaticReasoningProvider } from "./staticReasoningProvider.ts";
import { CouncilVoteRepository, ProposalRepository } from "../db/repositories/governanceRepositories.ts";

export class AgentNegotiationEngine {
    private council: ExecutiveCouncil;
    private reasoningProvider: IReasoningProvider;
    private proposalRepo?: ProposalRepository;
    private voteRepo?: CouncilVoteRepository;

    constructor(
        council?: ExecutiveCouncil,
        reasoningProvider?: IReasoningProvider,
        proposalRepo?: ProposalRepository,
        voteRepo?: CouncilVoteRepository
    ) {
        this.council = council || new ExecutiveCouncil();
        this.reasoningProvider = reasoningProvider || new StaticReasoningProvider();
        this.proposalRepo = proposalRepo !== undefined ? proposalRepo : new ProposalRepository();
        this.voteRepo = voteRepo !== undefined ? voteRepo : new CouncilVoteRepository();
    }

    async negotiateProposal(initialProposal: Proposal): Promise<ConsensusResult> {
        const history: NegotiationRound[] = [];

        if (this.proposalRepo) {
            this.proposalRepo.upsertEntity({
                id: initialProposal.id,
                workspace_id: "default_workspace",
                title: initialProposal.title,
                objective: initialProposal.objective,
                expected_benefit_usd: initialProposal.expectedBenefitUSD,
                estimated_cost_usd: initialProposal.estimatedCostUSD,
                estimated_risk: initialProposal.estimatedRisk,
                reversibility_score: initialProposal.reversibilityScore,
                supporting_evidence: JSON.stringify(initialProposal.supportingEvidence || []),
                affected_departments: JSON.stringify(initialProposal.affectedDepartments || []),
                strategy_alignment: initialProposal.strategyAlignment,
                confidence: initialProposal.confidence,
                status: "negotiating",
                created_at: initialProposal.createdAt || Date.now()
            }).catch(err => console.error("Failed to persist proposal", err));
        }

        // Round 1: Opinion Gathering
        const round1Opinions: MemberOpinion[] = [];
        for (const member of this.council.getCouncilMembers()) {
            round1Opinions.push({
                memberId: member.id,
                memberName: member.name,
                department: member.department,
                stance: initialProposal.estimatedRisk > 50 ? "concern" : "support",
                rationale: `Initial stance by ${member.name}: Evaluating impact on ${member.department}`,
                timestamp: Date.now()
            });
        }

        history.push({
            roundIndex: 1,
            opinions: round1Opinions,
            critiques: [],
            timestamp: Date.now()
        });

        // Round 2: Adversarial Critique & Compromise Revision via IReasoningProvider
        const round2Critiques: MemberCritique[] = await this.reasoningProvider.generateNegotiationCritique(initialProposal, 2);

        const revisedProposal: Proposal = {
            ...initialProposal,
            estimatedCostUSD: Math.min(initialProposal.estimatedCostUSD, 15000),
            reversibilityScore: Math.min(1.0, initialProposal.reversibilityScore + 0.05)
        };

        history.push({
            roundIndex: 2,
            opinions: round1Opinions,
            critiques: round2Critiques,
            revisedProposal,
            timestamp: Date.now()
        });

        // Round 3: Executive Council Weighted Voting
        const consensusResult = await this.council.conductVotingAsync(revisedProposal, history);

        if (this.voteRepo) {
            for (const vote of consensusResult.votes) {
                this.voteRepo.insertEntity({
                    id: `vote_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
                    workspace_id: "default_workspace",
                    proposal_id: initialProposal.id,
                    member_id: vote.memberId,
                    member_name: vote.memberName,
                    department: vote.department,
                    vote: vote.vote,
                    confidence: vote.confidence,
                    vote_weight: vote.voteWeight,
                    rationale: vote.rationale,
                    round_index: 3,
                    created_at: vote.timestamp
                }).catch(err => console.error("Failed to persist council vote", err));
            }
        }

        return consensusResult;
    }
}
