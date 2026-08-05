/**
 * Executive Council & Negotiation Types (PAL-TDD-005, PAL-ARCH-DOC-034)
 */

import type { DepartmentType } from "./schedulerTypes.ts";

export interface ExecutiveCouncilMember {
    id: string;
    name: string;
    department: DepartmentType;
    authorityLevel: number; // 1 - 10
    voteWeight: number; // 1.0 - 5.0
    expertise: string[];
    biasProfile?: string;
}

export interface Proposal {
    id: string;
    title: string;
    objective: string;
    expectedBenefitUSD: number;
    estimatedCostUSD: number;
    estimatedRisk: number; // 0 - 100
    reversibilityScore: number; // 0.0 - 1.0
    supportingEvidence: string[];
    affectedDepartments: DepartmentType[];
    strategyAlignment: number; // 0 - 100
    confidence: number; // 0.0 - 1.0
    createdAt: number;
}

export interface MemberOpinion {
    memberId: string;
    memberName: string;
    department: DepartmentType;
    stance: "support" | "concern" | "neutral";
    rationale: string;
    timestamp: number;
}

export interface MemberCritique {
    memberId: string;
    targetDepartment: DepartmentType;
    critiquePoints: string[];
    suggestedAdjustments: string[];
    timestamp: number;
}

export interface CouncilMemberVote {
    memberId: string;
    memberName: string;
    department: DepartmentType;
    vote: "YES" | "NO";
    confidence: number; // 0.0 - 1.0
    voteWeight: number;
    rationale: string;
    timestamp: number;
}

export interface DissentRecord {
    memberId: string;
    memberName: string;
    department: DepartmentType;
    objectionReason: string;
    underestimatedRiskCategory: string;
    timestamp: number;
}

export interface NegotiationRound {
    roundIndex: number;
    opinions: MemberOpinion[];
    critiques: MemberCritique[];
    revisedProposal?: Proposal;
    timestamp: number;
}

export interface ConsensusResult {
    proposalId: string;
    approved: boolean;
    consensusScore: number; // 0.0 - 1.0
    aggregateConfidence: number; // 0.0 - 1.0
    votes: CouncilMemberVote[];
    dissentingVotes: DissentRecord[];
    history: NegotiationRound[];
    approvedAt: number;
}
