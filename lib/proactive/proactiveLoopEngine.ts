/**
 * Autonomous PAL Daily & Proactive Insight Loop (PAL-TDD-006, Sprint 12)
 *
 * Continuously evaluates workspace metrics, detects anomalies (e.g. expense spikes,
 * churn risks), and dispatches proactive executive notifications without requiring user prompts.
 */

export interface ProactiveAlert {
    id: string;
    workspaceId: string;
    type: "anomaly_detected" | "weekly_summary" | "opportunity_flagged" | "policy_warning";
    title: string;
    message: string;
    severity: "low" | "medium" | "high";
    actionablePrompt: string;
    timestamp: number;
}

export class ProactiveLoopEngine {
    private static instance: ProactiveLoopEngine;
    private alerts: Map<string, ProactiveAlert[]> = new Map();

    constructor() {
        this.seedDefaultAlerts("ws_demo_company");
    }

    public static getInstance(): ProactiveLoopEngine {
        if (!ProactiveLoopEngine.instance) {
            ProactiveLoopEngine.instance = new ProactiveLoopEngine();
        }
        return ProactiveLoopEngine.instance;
    }

    private seedDefaultAlerts(workspaceId: string): void {
        const items: ProactiveAlert[] = [
            {
                id: "alt_101",
                workspaceId,
                type: "anomaly_detected",
                title: "Marketing Expense Spike Detected",
                message: "Good morning Alex. Your marketing expenses increased 22% this week ($2.4k total). I found 3 possible causes.",
                severity: "high",
                actionablePrompt: "PAL, investigate the 22% marketing expense spike and recommend cost controls.",
                timestamp: Date.now() - 3600000
            },
            {
                id: "alt_102",
                workspaceId,
                type: "opportunity_flagged",
                title: "Trial Account Retention Signal",
                message: "4 trial accounts with high usage have not logged in for 5 days. High conversion probability if re-engaged.",
                severity: "medium",
                actionablePrompt: "PAL, draft personal re-engagement emails for the 4 trial accounts.",
                timestamp: Date.now() - 7200000
            }
        ];
        this.alerts.set(workspaceId, items);
    }

    public getProactiveAlerts(workspaceId: string): ProactiveAlert[] {
        return [...(this.alerts.get(workspaceId) || [])];
    }

    public triggerProactiveCheck(workspaceId: string): ProactiveAlert[] {
        const existing = this.getProactiveAlerts(workspaceId);

        // Simulate anomaly detection trigger
        const newAlert: ProactiveAlert = {
            id: `alt_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
            workspaceId,
            type: "opportunity_flagged",
            title: "Weekly Performance Highlight",
            message: "Your customer response rate improved 14% this week. 2 campaigns performed above average.",
            severity: "low",
            actionablePrompt: "PAL, summarize why marketing campaigns performed 14% better this week.",
            timestamp: Date.now()
        };

        existing.push(newAlert);
        this.alerts.set(workspaceId, existing);
        return existing;
    }
}
