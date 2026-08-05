/**
 * PAL Executive Briefing Engine Types & Interfaces (PAL-TDD-002)
 */

export type BriefType = "morning" | "weekly" | "risk" | "revenue" | "operational" | "decision";
export type DeliveryChannel = "in_app_chat" | "dashboard" | "push" | "email";

export interface BriefSection {
    heading: string;
    contentMarkdown: string;
    keyMetrics?: Record<string, string | number>;
    actionableOptions?: Array<{
        optionId: string;
        label: string;
        description: string;
        isRecommended: boolean;
    }>;
}

export interface ExecutiveBrief {
    id: string;
    workspaceId: string;
    targetUserId: string;
    briefType: BriefType;
    title: string;
    executiveSummary: string;
    sections: BriefSection[];
    urgency: "low" | "medium" | "high" | "critical";
    deliveredChannels: DeliveryChannel[];
    readStatus: "unread" | "read" | "acknowledged";
    createdAt: number;
}

export interface IBriefingEngine {
    generateBrief(
        workspaceId: string,
        targetUserId: string,
        briefType: BriefType,
        customParams?: Record<string, any>
    ): Promise<ExecutiveBrief>;

    formatForChannel(brief: ExecutiveBrief, channel: DeliveryChannel): string | Record<string, any>;
}
