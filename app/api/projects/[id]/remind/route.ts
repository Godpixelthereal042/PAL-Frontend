import { NextResponse } from "next/server";
import { getDB } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import crypto from "crypto";

export async function POST(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const user = await getCurrentUser();
        if (!user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { id: projectId } = await params;
        const db = await getDB();

        // 1. Fetch project details and check user access
        const project = await db.get("SELECT title, owner_id FROM projects WHERE id = ?", [projectId]);
        if (!project) {
            return NextResponse.json({ error: "Project not found" }, { status: 404 });
        }

        const isMember = project.owner_id === user.id || 
            await db.get("SELECT 1 FROM project_members WHERE project_id = ? AND user_id = ?", [projectId, user.id]);
        if (!isMember) {
            return NextResponse.json({ error: "Forbidden" }, { status: 403 });
        }

        // 2. Fetch all project members (owner + members)
        const membersList = await db.all("SELECT user_id FROM project_members WHERE project_id = ?", [projectId]);
        const memberIds = new Set<string>();
        if (project.owner_id) memberIds.add(project.owner_id);
        membersList.forEach((m: any) => memberIds.add(m.user_id));

        const nowMs = Date.now();
        const notificationText = `${user.name} requested a quick sync check-in for project "${project.title}".`;

        // 3. Insert notifications for all members (except the sender)
        for (const recipientId of memberIds) {
            if (recipientId === user.id) continue;

            const notifId = `remind_${projectId}_${recipientId}_${nowMs}`;
            await db.run(
                `INSERT INTO notifications (id, user_id, title, text, time, isUnread, section, iconType, actionLabel, actionRoute) 
                 VALUES (?, ?, 'Meeting Sync Requested', ?, 'Just now', 1, 'Today', 'bell', 'View Project', ?)`,
                [notifId, recipientId, notificationText, `/projects/${projectId}`]
            );
        }

        // 4. Log the sync reminder activity to the logs table
        const logId = `log_${projectId}_remind_${nowMs}`;
        await db.run(
            `INSERT INTO logs (id, user_id, time, title, details, category, isCompleted) 
             VALUES (?, ?, 'Just now', ?, ?, 'System', 0)`,
            [
                logId,
                user.id,
                `Meeting Reminder Sent`,
                `Sent sync notification to project members for "${project.title}".`
            ]
        );

        return NextResponse.json({
            success: true,
            message: "Meeting reminder sent successfully to all project members."
        });

    } catch (error: any) {
        console.error("Project Remind Route Error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
