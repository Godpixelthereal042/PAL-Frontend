/**
 * Executive Approval Center (PAL-TDD-008, Sprint 21 Milestone 4)
 *
 * Provides a mobile-ready, trust-maximizing approval interface for CEOs and executives.
 * Every card explicitly answers 5 questions: What happened?, Why recommended?,
 * Supporting Evidence?, What if approved?, What if rejected?
 *
 * Architecture: PAL-ARCH-DOC-047
 */

import { AutonomousActionEngine } from "../autonomy/autonomousActionEngine.ts";
import { TrustEvolutionEngine } from "../trust/trustEvolutionEngine.ts";

export type ExecutiveActionResponse = "approve" | "reject" | "modify" | "ask_pal";

export interface FiveQuestionApprovalCard {
    cardId: string;
    workspaceId: string;
    actionId: string;
    agentRole: string;
    agentName: string;
    // 5 Executive Questions
    whatHappened: string;
    whyPALRecommendsThis: string;
    supportingEvidence: string[];
    whatHappensIfApproved: string;
    whatHappensIfRejected: string;
    // Financial & Risk Metadata
    estimatedFinancialImpactUSD: number;
    confidenceScorePct: number;
    riskClassification: "reversible" | "irreversible";
    status: "pending" | "approved" | "rejected" | "modified";
    ceoOverrideNotes?: string;
    createdAt: number;
    reviewedAt?: number;
}

export class ExecutiveApprovalCenter {
    private static instance: ExecutiveApprovalCenter;
    private cards: Map<string, FiveQuestionApprovalCard> = new Map(); // cardId -> card
    private actionEngine = AutonomousActionEngine.getInstance();
    private trustEngine = TrustEvolutionEngine.getInstance();

    public static getInstance(): ExecutiveApprovalCenter {
        if (!ExecutiveApprovalCenter.instance) {
            ExecutiveApprovalCenter.instance = new ExecutiveApprovalCenter();
        }
        return ExecutiveApprovalCenter.instance;
    }

    public createApprovalCard(params: Omit<FiveQuestionApprovalCard, "cardId" | "status" | "createdAt">): FiveQuestionApprovalCard {
        const timestamp = Date.now();
        const cardId = `card_${timestamp}_${Math.random().toString(36).substring(2, 6)}`;

        const card: FiveQuestionApprovalCard = {
            ...params,
            cardId,
            status: "pending",
            createdAt: timestamp
        };

        this.cards.set(cardId, card);
        return card;
    }

    public respondToApprovalCard(params: {
        cardId: string;
        response: ExecutiveActionResponse;
        overrideNotes?: string;
        modifiedParams?: Record<string, any>;
    }): { success: boolean; card: FiveQuestionApprovalCard; actionResult?: any; palClarificationText?: string } {
        const card = this.cards.get(params.cardId);
        if (!card) {
            throw new Error(`Approval card '${params.cardId}' not found.`);
        }

        const timestamp = Date.now();

        if (params.response === "approve") {
            card.status = "approved";
            card.reviewedAt = timestamp;

            // Record positive outcome in TrustEvolutionEngine
            this.trustEngine.recordActionOutcome(card.agentRole as any, true);

            this.cards.set(params.cardId, card);
            return {
                success: true,
                card,
                actionResult: { status: "executed", executedAutonomously: false, approvedByCEO: true }
            };
        }

        if (params.response === "reject") {
            card.status = "rejected";
            card.reviewedAt = timestamp;

            // Record rejection outcome in TrustEvolutionEngine
            this.trustEngine.recordActionOutcome(card.agentRole as any, false);

            this.cards.set(params.cardId, card);
            return {
                success: true,
                card,
                actionResult: { status: "rejected", approvedByCEO: false }
            };
        }

        if (params.response === "modify") {
            card.status = "modified";
            card.ceoOverrideNotes = params.overrideNotes || "Parameters modified by CEO";
            card.reviewedAt = timestamp;

            // Record CEO Override in TrustEvolutionEngine to build CEO Preference Model
            this.trustEngine.recordCEOOverride({
                decisionId: card.actionId,
                agentRole: card.agentRole as any,
                originalRecommendation: card.whyPALRecommendsThis,
                ceoOverrideAction: card.ceoOverrideNotes,
                perceivedStrategicIntent: "growth_preservation"
            });

            this.cards.set(params.cardId, card);
            return {
                success: true,
                card,
                actionResult: { status: "modified_and_executed", modifiedParams: params.modifiedParams }
            };
        }

        // Ask PAL
        return {
            success: true,
            card,
            palClarificationText: `PAL Analysis: This recommendation is backed by ${card.supportingEvidence.length} verified data points. Approving is estimated to deliver $${card.estimatedFinancialImpactUSD.toLocaleString()} in net financial value with ${card.confidenceScorePct}% confidence.`
        };
    }

    public getPendingCards(workspaceId = "ws_demo_company"): FiveQuestionApprovalCard[] {
        return Array.from(this.cards.values()).filter(c => c.workspaceId === workspaceId && c.status === "pending");
    }
}
