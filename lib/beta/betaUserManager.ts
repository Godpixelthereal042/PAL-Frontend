/**
 * Beta User Management & Access Engine (PAL-TDD-006, Sprint 10)
 *
 * Manages private beta invite codes, founder onboarding activation status,
 * Time-To-First-Value (TTV) metrics, and feedback tracking.
 */

export type BetaUserStatus = "invited" | "activated" | "power_user" | "paid" | "inactive";

export interface BetaUserRecord {
    userId: string;
    email: string;
    companyName: string;
    inviteCode: string;
    status: BetaUserStatus;
    onboardedAt?: number;
    firstStrategySessionAt?: number;
    ttvSeconds?: number; // Time-to-first-value in seconds
    totalSessionsCount: number;
    totalApprovalsCount: number;
    feedbackNotes: Array<{ note: string; timestamp: number }>;
}

export class BetaUserManager {
    private static instance: BetaUserManager;
    private betaUsers: Map<string, BetaUserRecord> = new Map();
    private validInviteCodes: Set<string> = new Set([
        "FOUNDER2026",
        "PAL-BETA-YC",
        "PAL-FOUNDER-01",
        "PAL-FOUNDER-02",
        "PAL-FOUNDER-03"
    ]);

    constructor() {
        // Seed default founding partner beta user
        this.registerBetaUser({
            userId: "usr_founder_01",
            email: "founder@acmesaas.com",
            companyName: "Acme SaaS Technologies",
            inviteCode: "FOUNDER2026",
            status: "power_user",
            onboardedAt: Date.now() - 7 * 86400 * 1000,
            firstStrategySessionAt: Date.now() - 7 * 86400 * 1000 + 120000, // 2 mins TTV
            ttvSeconds: 120,
            totalSessionsCount: 14,
            totalApprovalsCount: 5,
            feedbackNotes: [
                { note: "The Golden Path decision timeline gave immediate clarity to our CFO on Q3 budget allocation.", timestamp: Date.now() - 3 * 86400 * 1000 }
            ]
        });
    }

    public static getInstance(): BetaUserManager {
        if (!BetaUserManager.instance) {
            BetaUserManager.instance = new BetaUserManager();
        }
        return BetaUserManager.instance;
    }

    public validateInviteCode(code: string): boolean {
        return this.validInviteCodes.has(code.trim().toUpperCase());
    }

    public registerBetaUser(params: {
        userId: string;
        email: string;
        companyName: string;
        inviteCode: string;
        status?: BetaUserStatus;
        onboardedAt?: number;
        firstStrategySessionAt?: number;
        ttvSeconds?: number;
        totalSessionsCount?: number;
        totalApprovalsCount?: number;
        feedbackNotes?: Array<{ note: string; timestamp: number }>;
    }): BetaUserRecord {
        const record: BetaUserRecord = {
            userId: params.userId,
            email: params.email,
            companyName: params.companyName,
            inviteCode: params.inviteCode,
            status: params.status || "invited",
            onboardedAt: params.onboardedAt,
            firstStrategySessionAt: params.firstStrategySessionAt,
            ttvSeconds: params.ttvSeconds,
            totalSessionsCount: params.totalSessionsCount || 0,
            totalApprovalsCount: params.totalApprovalsCount || 0,
            feedbackNotes: params.feedbackNotes || []
        };

        this.betaUsers.set(params.userId, record);
        return record;
    }

    public recordFirstSession(userId: string): BetaUserRecord | undefined {
        const user = this.betaUsers.get(userId);
        if (!user) return undefined;

        const now = Date.now();
        if (!user.firstStrategySessionAt) {
            user.firstStrategySessionAt = now;
            user.status = "activated";
            if (user.onboardedAt) {
                user.ttvSeconds = Math.round((now - user.onboardedAt) / 1000);
            }
        }
        user.totalSessionsCount += 1;
        this.betaUsers.set(userId, user);
        return user;
    }

    public addFeedback(userId: string, note: string): boolean {
        const user = this.betaUsers.get(userId);
        if (!user) return false;

        user.feedbackNotes.push({ note, timestamp: Date.now() });
        this.betaUsers.set(userId, user);
        return true;
    }

    public getAllBetaUsers(): BetaUserRecord[] {
        return Array.from(this.betaUsers.values());
    }
}
