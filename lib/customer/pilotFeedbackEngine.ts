/**
 * Pilot Feedback Intelligence Engine (PAL-TDD-010, Sprint 23 Milestone 5)
 *
 * Aggregates pilot customer feedback, CEO sentiment analysis, team adoption metrics,
 * and dispatches trust calibration signals to the TrustEvolutionEngine.
 *
 * Architecture: PAL-ARCH-DOC-062
 */

export type CEOSentiment = "enthusiastic" | "satisfied" | "neutral" | "concerned";

export interface PilotFeedbackEntry {
    feedbackId: string;
    workspaceId: string;
    submittedByRole: "CEO" | "CFO" | "Operator";
    satisfactionScore: 1 | 2 | 3 | 4 | 5;
    ceoSentiment: CEOSentiment;
    qualitativeFeedback: string;
    featureRequests: string[];
    submittedAt: number;
}

export interface FeedbackSummaryReport {
    workspaceId: string;
    totalFeedbackEntriesCount: number;
    avgSatisfactionScore: number;
    primaryCEOSentiment: CEOSentiment;
    topFeatureRequests: string[];
    trustAdjustmentSignal: "INCREASE_AUTONOMY" | "MAINTAIN_THRESHOLDS" | "DECREASE_AUTONOMY";
}

export class PilotFeedbackEngine {
    private static instance: PilotFeedbackEngine;
    private feedbackStore: Map<string, PilotFeedbackEntry[]> = new Map(); // workspaceId -> entries

    constructor() {
        this.seedDefaultFeedback("ws_acme_saas_prod");
    }

    public static getInstance(): PilotFeedbackEngine {
        if (!PilotFeedbackEngine.instance) {
            PilotFeedbackEngine.instance = new PilotFeedbackEngine();
        }
        return PilotFeedbackEngine.instance;
    }

    private seedDefaultFeedback(workspaceId: string): void {
        const entries: PilotFeedbackEntry[] = [
            {
                feedbackId: "fb_ceo_01",
                workspaceId,
                submittedByRole: "CEO",
                satisfactionScore: 5,
                ceoSentiment: "enthusiastic",
                qualitativeFeedback: "PAL approval cards save me 2 hours every morning. The voice briefing is invaluable.",
                featureRequests: ["Multi-currency billing reports", "Mobile dark mode widget"],
                submittedAt: Date.now() - 7 * 86400 * 1000
            },
            {
                feedbackId: "fb_cfo_01",
                workspaceId,
                submittedByRole: "CFO",
                satisfactionScore: 5,
                ceoSentiment: "satisfied",
                qualitativeFeedback: "CFO Agent unutilized SaaS audit saved us $14.4k instantly.",
                featureRequests: ["NetSuite connector integration"],
                submittedAt: Date.now() - 3 * 86400 * 1000
            }
        ];

        this.feedbackStore.set(workspaceId, entries);
    }

    public submitFeedback(params: {
        workspaceId: string;
        submittedByRole: "CEO" | "CFO" | "Operator";
        satisfactionScore: 1 | 2 | 3 | 4 | 5;
        qualitativeFeedback: string;
        featureRequests?: string[];
    }): PilotFeedbackEntry {
        const timestamp = Date.now();
        const feedbackId = `fb_${timestamp}_${Math.random().toString(36).substring(2, 6)}`;

        let ceoSentiment: CEOSentiment = "satisfied";
        if (params.satisfactionScore === 5) ceoSentiment = "enthusiastic";
        if (params.satisfactionScore === 3) ceoSentiment = "neutral";
        if (params.satisfactionScore <= 2) ceoSentiment = "concerned";

        const entry: PilotFeedbackEntry = {
            feedbackId,
            workspaceId: params.workspaceId,
            submittedByRole: params.submittedByRole,
            satisfactionScore: params.satisfactionScore,
            ceoSentiment,
            qualitativeFeedback: params.qualitativeFeedback,
            featureRequests: params.featureRequests || [],
            submittedAt: timestamp
        };

        const existing = this.feedbackStore.get(params.workspaceId) || [];
        existing.push(entry);
        this.feedbackStore.set(params.workspaceId, existing);

        return entry;
    }

    public summarizeFeedback(workspaceId: string): FeedbackSummaryReport {
        const entries = this.feedbackStore.get(workspaceId) || [];
        if (entries.length === 0) {
            return {
                workspaceId,
                totalFeedbackEntriesCount: 0,
                avgSatisfactionScore: 5,
                primaryCEOSentiment: "satisfied",
                topFeatureRequests: [],
                trustAdjustmentSignal: "MAINTAIN_THRESHOLDS"
            };
        }

        const sumScore = entries.reduce((acc, curr) => acc + curr.satisfactionScore, 0);
        const avgSatisfactionScore = parseFloat((sumScore / entries.length).toFixed(1));

        const featureRequests = entries.flatMap(e => e.featureRequests);

        let trustAdjustmentSignal: FeedbackSummaryReport["trustAdjustmentSignal"] = "MAINTAIN_THRESHOLDS";
        if (avgSatisfactionScore >= 4.5) trustAdjustmentSignal = "INCREASE_AUTONOMY";
        if (avgSatisfactionScore < 3.0) trustAdjustmentSignal = "DECREASE_AUTONOMY";

        return {
            workspaceId,
            totalFeedbackEntriesCount: entries.length,
            avgSatisfactionScore,
            primaryCEOSentiment: entries[0].ceoSentiment,
            topFeatureRequests: featureRequests,
            trustAdjustmentSignal
        };
    }
}
