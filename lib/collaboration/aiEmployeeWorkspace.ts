/**
 * AI Employee Workspace & Human-Agent Collaboration Engine (PAL-TDD-006, Sprint 17)
 *
 * Dedicated collaboration space where human team members and AI agent teammates converse,
 * co-create proposals, request approvals, and track execution status.
 */

export interface CollaborationThreadMessage {
    messageId: string;
    senderType: "human" | "agent";
    senderName: string;
    senderRole: string; // e.g. "Sarah (Marketing Lead)" or "PAL Growth Agent"
    content: string;
    proposalPayload?: Record<string, any>;
    status?: "draft" | "awaiting_approval" | "approved" | "executed";
    timestamp: number;
}

export class AIEmployeeWorkspace {
    private static instance: AIEmployeeWorkspace;
    private threads: Map<string, CollaborationThreadMessage[]> = new Map(); // key: threadId

    constructor() {
        this.initializeDemoThread("th_q3_marketing");
    }

    public static getInstance(): AIEmployeeWorkspace {
        if (!AIEmployeeWorkspace.instance) {
            AIEmployeeWorkspace.instance = new AIEmployeeWorkspace();
        }
        return AIEmployeeWorkspace.instance;
    }

    private initializeDemoThread(threadId: string): void {
        const messages: CollaborationThreadMessage[] = [
            {
                messageId: "msg_101",
                senderType: "human",
                senderName: "Sarah",
                senderRole: "Marketing Lead",
                content: "Launch Q3 campaign",
                timestamp: Date.now() - 3600000
            },
            {
                messageId: "msg_102",
                senderType: "agent",
                senderName: "PAL Growth Agent",
                senderRole: "Growth Agent",
                content: "I analyzed previous campaigns. Recommended budget: $18,000. Expected CAC reduction: 22%. Awaiting approval.",
                proposalPayload: { budgetUSD: 18000, expectedCacReductionPct: 22 },
                status: "awaiting_approval",
                timestamp: Date.now() - 1800000
            }
        ];
        this.threads.set(threadId, messages);
    }

    public getThreadMessages(threadId: string): CollaborationThreadMessage[] {
        return this.threads.get(threadId) || [];
    }

    public postHumanMessage(threadId: string, authorName: string, role: string, content: string): CollaborationThreadMessage {
        const list = this.getThreadMessages(threadId);
        const msg: CollaborationThreadMessage = {
            messageId: `msg_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
            senderType: "human",
            senderName: authorName,
            senderRole: role,
            content,
            timestamp: Date.now()
        };

        list.push(msg);
        this.threads.set(threadId, list);
        return msg;
    }
}
