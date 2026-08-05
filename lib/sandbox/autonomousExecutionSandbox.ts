/**
 * Autonomous Execution Sandbox Engine (PAL-TDD-006, Sprint 16)
 *
 * Provides a safe simulation environment for dry-running operational changes
 * (e.g. pausing ad campaigns, adjusting prices, canceling subscriptions) prior to live execution.
 */

export interface SandboxExecutionSimulation {
    simulationId: string;
    workspaceId: string;
    actionName: string;
    currentMonthlySpendUSD: number;
    projectedMonthlySpendUSD: number;
    expectedImpactSummary: string;
    riskLevel: "low" | "medium" | "high";
    requiredApprovalRole: string;
    isSafeToExecute: boolean;
    simulatedAt: number;
}

export class AutonomousExecutionSandbox {
    private static instance: AutonomousExecutionSandbox;

    public static getInstance(): AutonomousExecutionSandbox {
        if (!AutonomousExecutionSandbox.instance) {
            AutonomousExecutionSandbox.instance = new AutonomousExecutionSandbox();
        }
        return AutonomousExecutionSandbox.instance;
    }

    public runSimulation(params: {
        workspaceId: string;
        actionName: string;
        currentSpendUSD: number;
        projectedSavingsUSD: number;
        riskLevel?: "low" | "medium" | "high";
    }): SandboxExecutionSimulation {
        const projectedSpend = Math.max(0, params.currentSpendUSD - params.projectedSavingsUSD);
        const risk = params.riskLevel || "medium";

        return {
            simulationId: `sim_sb_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
            workspaceId: params.workspaceId,
            actionName: params.actionName,
            currentMonthlySpendUSD: params.currentSpendUSD,
            projectedMonthlySpendUSD: projectedSpend,
            expectedImpactSummary: `Reduces monthly spend by $${params.projectedSavingsUSD} (${Math.round((params.projectedSavingsUSD / params.currentSpendUSD) * 100)}% reduction)`,
            riskLevel: risk,
            requiredApprovalRole: risk === "high" ? "founder" : "finance_lead",
            isSafeToExecute: true,
            simulatedAt: Date.now()
        };
    }
}
