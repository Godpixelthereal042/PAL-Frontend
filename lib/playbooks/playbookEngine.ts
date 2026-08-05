/**
 * Autonomous Executive Playbook Engine
 *
 * PAL Milestone 8B — Autonomous Monitoring & Event-Driven Agent System
 */

import { executiveApprovalQueue, type ApprovalItem } from "../approvals/approvalQueue.ts";

export type PlaybookType = "investor_silent" | "project_delayed" | "invoice_overdue";

export interface PlaybookCatalogItem {
    type: PlaybookType;
    name: string;
    description: string;
    trigger: string;
    steps: string[];
}

export interface PlaybookExecutionResult {
    playbookType: PlaybookType;
    playbookName: string;
    stagedActions: ApprovalItem[];
    summary: string;
}

export class PlaybookEngine {
    private catalog: PlaybookCatalogItem[] = [
        {
            type: "investor_silent",
            name: "Investor Silent Playbook",
            description: "Triggers after 14 days of no investor interaction; drafts follow-up email and schedules reminder.",
            trigger: "Relationship recency drop on Investor contact",
            steps: ["Check interaction recency (>14d)", "Draft follow-up email spec", "Stage approval for founder review"],
        },
        {
            type: "project_delayed",
            name: "Project Delayed Playbook",
            description: "Triggers when milestone deadline slips; identifies blockers and drafts timeline extension proposal.",
            trigger: "Project milestone status overdue",
            steps: ["Identify blocking dependencies", "Notify project lead", "Stage timeline recommendation"],
        },
        {
            type: "invoice_overdue",
            name: "Invoice Overdue Playbook",
            description: "Triggers on past-due invoice; prepares polite payment reminder and evaluates client relationship score.",
            trigger: "Invoice status marked overdue",
            steps: ["Calculate outstanding balance", "Inspect relationship health score", "Stage automated reminder action"],
        },
    ];

    public getCatalog(): PlaybookCatalogItem[] {
        return this.catalog;
    }

    public async executePlaybook(
        playbookType: PlaybookType,
        userId = "user_default",
        params: Record<string, any> = {}
    ): Promise<PlaybookExecutionResult> {
        const item = this.catalog.find((p) => p.type === playbookType) || this.catalog[0];
        const stagedActions: ApprovalItem[] = [];

        switch (playbookType) {
            case "investor_silent": {
                const action = await executiveApprovalQueue.stageAction(
                    userId,
                    "sales_growth",
                    "CREATE_TASK",
                    "Investor Follow-up: Send Q3 Progress Summary to Sarah Jenkins",
                    {
                        title: "Send Q3 Progress Summary to Sarah Jenkins",
                        description: "Automated by Investor Silent Playbook (18 days since last contact).",
                        priority: "high",
                    }
                );
                stagedActions.push(action);
                break;
            }
            case "project_delayed": {
                const action = await executiveApprovalQueue.stageAction(
                    userId,
                    "project",
                    "CREATE_TASK",
                    "Reallocate Developer Resource to Customer Portal Milestone",
                    {
                        title: "Reallocate Developer Resource to Customer Portal Milestone",
                        description: "Automated by Project Delayed Playbook to preserve target deadline.",
                        priority: "high",
                    }
                );
                stagedActions.push(action);
                break;
            }
            case "invoice_overdue": {
                const action = await executiveApprovalQueue.stageAction(
                    userId,
                    "finance",
                    "CREATE_INVOICE",
                    "Issue Payment Reminder & Invoice Receipt to Apex Cybernetics",
                    {
                        client: params.client || "Apex Cybernetics",
                        amount: params.amount || 7500,
                        item: "Professional Services Retainer",
                    }
                );
                stagedActions.push(action);
                break;
            }
        }

        return {
            playbookType: item.type,
            playbookName: item.name,
            stagedActions,
            summary: `Executed '${item.name}': staged ${stagedActions.length} proposal(s) in Executive Approval Queue.`,
        };
    }
}

export const playbookEngine = new PlaybookEngine();
