/**
 * Executive Approval Queue Manager
 *
 * PAL Milestone 8B — Autonomous Monitoring & Event-Driven Agent System
 */

import { getDB } from "../db.ts";
import { actionEngine } from "../actionEngine/engine.ts";

export interface ApprovalItem {
    id: string;
    userId: string;
    eventId?: string;
    agentRole: string;
    actionType: string;
    actionTitle: string;
    actionPayload: any;
    status: "pending" | "approved" | "rejected" | "scheduled";
    createdAt: number;
    reviewedAt?: number;
}

export class ExecutiveApprovalQueue {
    public async stageAction(
        userId: string,
        agentRole: string,
        actionType: string,
        actionTitle: string,
        actionPayload: Record<string, any>,
        eventId?: string
    ): Promise<ApprovalItem> {
        const db = await getDB();
        const now = Date.now();
        const id = `appr_${now}_${Math.random().toString(36).substr(2, 4)}`;

        await db.run(
            "INSERT INTO approval_queue (id, user_id, event_id, agent_role, action_type, action_title, action_payload, status, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)",
            [id, userId, eventId || null, agentRole, actionType, actionTitle, JSON.stringify(actionPayload), "pending", now]
        );

        return {
            id,
            userId,
            eventId,
            agentRole,
            actionType,
            actionTitle,
            actionPayload,
            status: "pending",
            createdAt: now,
        };
    }

    public async listPending(userId = "user_default"): Promise<ApprovalItem[]> {
        const db = await getDB();
        const items = await db.all("SELECT * FROM approval_queue WHERE (user_id = ? OR user_id = 'user_default') AND status = 'pending' ORDER BY created_at DESC", [userId]);
        return items.map((i) => ({
            id: i.id,
            userId: i.user_id,
            eventId: i.event_id,
            agentRole: i.agent_role,
            actionType: i.action_type,
            actionTitle: i.action_title,
            actionPayload: JSON.parse(i.action_payload || "{}"),
            status: i.status,
            createdAt: i.created_at,
            reviewedAt: i.reviewed_at,
        }));
    }

    public async approveAction(approvalId: string, userId = "user_default"): Promise<{ success: boolean; actionResult: any }> {
        const db = await getDB();
        const item = await db.get("SELECT * FROM approval_queue WHERE id = ?", [approvalId]);

        if (!item) {
            throw new Error(`Approval item '${approvalId}' not found`);
        }

        const payload = JSON.parse(item.action_payload || "{}");
        const actionResult = await actionEngine.execute({
            type: item.action_type as any,
            userId,
            params: payload,
        });

        const now = Date.now();
        await db.run("UPDATE approval_queue SET status = 'approved', reviewed_at = ? WHERE id = ?", [now, approvalId]);

        return { success: true, actionResult };
    }

    public async rejectAction(approvalId: string): Promise<boolean> {
        const db = await getDB();
        const now = Date.now();
        await db.run("UPDATE approval_queue SET status = 'rejected', reviewed_at = ? WHERE id = ?", [now, approvalId]);
        return true;
    }
}

export const executiveApprovalQueue = new ExecutiveApprovalQueue();
