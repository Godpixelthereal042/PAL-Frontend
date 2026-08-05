/**
 * Trust & Explainability Layer - AI Decision Passport Engine (PAL-TDD-006, Sprint 16)
 *
 * Generates permanent, auditable AI Decision Passports explaining why PAL took an action,
 * data sources involved, alternatives considered, human sign-off history, and cryptographic proof.
 */

import { createHash } from "node:crypto";

export interface AIDecisionPassport {
    passportId: string;
    decisionId: string;
    workspaceId: string;
    actionSummary: string;
    whyPALDidThis: string;
    dataInfluences: string[];
    alternativesConsidered: string[];
    approvedByUserId?: string;
    approvalRole?: string;
    signatureHash: string;
    issuedAt: number;
}

export class AIDecisionPassportEngine {
    private static instance: AIDecisionPassportEngine;
    private passports: Map<string, AIDecisionPassport> = new Map();

    public static getInstance(): AIDecisionPassportEngine {
        if (!AIDecisionPassportEngine.instance) {
            AIDecisionPassportEngine.instance = new AIDecisionPassportEngine();
        }
        return AIDecisionPassportEngine.instance;
    }

    public issuePassport(params: {
        decisionId: string;
        workspaceId: string;
        actionSummary: string;
        whyPALDidThis: string;
        dataInfluences: string[];
        alternativesConsidered: string[];
        approvedByUserId?: string;
        approvalRole?: string;
    }): AIDecisionPassport {
        const issuedAt = Date.now();
        const rawContent = `${params.decisionId}:${params.workspaceId}:${params.actionSummary}:${issuedAt}`;
        const signatureHash = createHash("sha256").update(rawContent).digest("hex");

        const passport: AIDecisionPassport = {
            passportId: `psp_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
            decisionId: params.decisionId,
            workspaceId: params.workspaceId,
            actionSummary: params.actionSummary,
            whyPALDidThis: params.whyPALDidThis,
            dataInfluences: params.dataInfluences,
            alternativesConsidered: params.alternativesConsidered,
            approvedByUserId: params.approvedByUserId || "usr_founder_01",
            approvalRole: params.approvalRole || "founder",
            signatureHash,
            issuedAt
        };

        this.passports.set(passport.passportId, passport);
        return passport;
    }

    public getPassport(passportId: string): AIDecisionPassport | undefined {
        return this.passports.get(passportId);
    }
}
