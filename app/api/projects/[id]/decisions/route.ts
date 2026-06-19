import { NextResponse } from "next/server";
import { getDB } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";

export async function GET(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const user = await getCurrentUser();
        const userId = user ? user.id : "current_user";

        const resolvedParams = await params;
        const projectId = resolvedParams.id;

        const db = await getDB();
        const decisions = await db.all(
            "SELECT * FROM decisions WHERE project_id = ? ORDER BY created_at DESC",
            [projectId]
        );

        return NextResponse.json(decisions);
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function POST(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const user = await getCurrentUser();
        const userId = user ? user.id : "current_user";

        const resolvedParams = await params;
        const projectId = resolvedParams.id;

        const db = await getDB();
        const body = await request.json();
        const { title, description } = body;

        if (!title) {
            return NextResponse.json({ error: "Title is required" }, { status: 400 });
        }

        const id = String(Date.now());
        const createdAt = Date.now();

        await db.run(
            `INSERT INTO decisions (id, project_id, user_id, title, description, status, created_at) 
             VALUES (?, ?, ?, ?, ?, ?, ?)`,
            [id, projectId, userId, title, description || "", "decided", createdAt]
        );

        const newDecision = await db.get("SELECT * FROM decisions WHERE id = ?", [id]);
        return NextResponse.json(newDecision, { status: 201 });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function DELETE(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const user = await getCurrentUser();
        if (!user && process.env.NODE_ENV === "production") {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const url = new URL(request.url);
        const decisionId = url.searchParams.get("id");

        if (!decisionId) {
            return NextResponse.json({ error: "Decision ID parameter is required" }, { status: 400 });
        }

        const db = await getDB();
        await db.run("DELETE FROM decisions WHERE id = ?", [decisionId]);

        return NextResponse.json({ success: true });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
