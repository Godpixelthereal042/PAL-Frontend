/**
 * Strategy Reasoning Provider Interfaces & Types (PAL-TDD-005A, PAL-ARCH-DOC-040)
 */

import type { AlignmentScoreResult, ExecutiveIntent, ExecutivePolicy, OKRItem } from "./strategyTypes.ts";
import type { CouncilMemberVote, MemberCritique, Proposal } from "./negotiationTypes.ts";
import type { SimulationMode } from "./simulationTypes.ts";

export interface IReasoningProvider {
    name: string;
    generateOKRs(intent: ExecutiveIntent, policies: ExecutivePolicy[]): Promise<OKRItem[]>;
    evaluateCouncilVote(memberId: string, memberName: string, department: string, voteWeight: number, proposal: Proposal): Promise<CouncilMemberVote>;
    generateNegotiationCritique(proposal: Proposal, round: number): Promise<MemberCritique[]>;
    computeSimulationConfidence(proposal: Proposal, mode: SimulationMode): Promise<number>;
    evaluateAlignmentScore(task: Record<string, any>, strategyVersion: string): Promise<AlignmentScoreResult>;
}
