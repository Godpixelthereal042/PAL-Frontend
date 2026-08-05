/**
 * Pilot Customer Feedback Submission Route (PAL v3.3)
 */

import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { getWorkspaceForUser } from "@/lib/security/workspaceContext";
import { getDB } from "@/lib/db";

export async function POST(req: NextRequest) {
    try {
        const user = await getCurrentUser();
        if (!user) {
            return NextResponse.json({ error: "Unauthorized access" }, { status: 401 });
        }

        const workspace = await getWorkspaceForUser(user.id);
        const body = await req.json();
        const { rating, feedbackText, category = "GENERAL" } = body;

        if (!rating || !feedbackText) {
            return NextResponse.json({ error: "Rating and feedbackText are required" }, { status: 400 });
        }

        const db = await getDB();
        const now = Date.now();
        const feedbackId = `fb_${now}_${Math.random().toString(36).substring(2, 6)}`;

        await db.run(
            `INSERT INTO pilot_feedback (id, workspace_id, user_id, rating, feedback_text, category, created_at)
             VALUES (?, ?, ?, ?, ?, ?, ?)`,
            [feedbackId, workspace.id, user.id, Number(rating), feedbackText, category, now]
        );

        return NextResponse.json({ success: true, feedbackId });
    } catch (err: any) {
        console.error("Pilot Feedback Route Error:", err);
        return NextResponse.json({ error: err.message || "Failed to save feedback" }, { status: 500 });
    }
}
