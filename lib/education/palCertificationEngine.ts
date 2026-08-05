/**
 * PAL Certification Academy Engine (PAL-TDD-013, Sprint 26 Milestone 2)
 *
 * Manages learner enrollment across 3 certification tracks (Operator, Agent Builder, Enterprise Architect),
 * evaluates exam scores, issues official certificates, and tracks partner eligibility.
 *
 * Architecture: PAL-ARCH-DOC-075
 */

export type CertificationTrack = "PAL Operator" | "PAL AI Agent Builder" | "PAL Enterprise Architect";

export interface CertificationRecord {
    recordId: string;
    learnerId: string;
    learnerName: string;
    track: CertificationTrack;
    scorePct: number;
    isCertified: boolean;
    issuedAt?: number;
    expiresAt?: number;
}

export class PalCertificationEngine {
    private static instance: PalCertificationEngine;

    public static getInstance(): PalCertificationEngine {
        if (!PalCertificationEngine.instance) {
            PalCertificationEngine.instance = new PalCertificationEngine();
        }
        return PalCertificationEngine.instance;
    }

    public issueCertification(params: {
        learnerId: string;
        learnerName: string;
        track: CertificationTrack;
        scorePct: number;
    }): CertificationRecord {
        const timestamp = Date.now();
        const recordId = `cert_${timestamp}`;
        const isCertified = params.scorePct >= 85;

        return {
            recordId,
            learnerId: params.learnerId,
            learnerName: params.learnerName,
            track: params.track,
            scorePct: params.scorePct,
            isCertified,
            issuedAt: isCertified ? timestamp : undefined,
            expiresAt: isCertified ? timestamp + 365 * 86400 * 1000 : undefined
        };
    }
}
