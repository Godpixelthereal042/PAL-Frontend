import { NextResponse } from "next/server";
import { getDB } from "@/lib/db";
import crypto from "crypto";
import { getCurrentUser } from "@/lib/auth";

export async function GET() {
    try {
        const user = await getCurrentUser();
        if (!user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const db = await getDB();
        const logs = await db.all("SELECT * FROM logs WHERE user_id = ? ORDER BY id ASC", [user.id]);
        
        // Convert isCompleted sqlite INTEGER (0/1) to boolean for the frontend
        const parsedLogs = logs.map(log => ({
            ...log,
            isCompleted: log.isCompleted === 1
        }));
        
        return NextResponse.json(parsedLogs);
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const user = await getCurrentUser();
        if (!user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const db = await getDB();
        const body = await request.json();
        const { time, title, details, category, isCompleted } = body;

        if (!title || !category) {
            return NextResponse.json({ error: "Title and Category are required" }, { status: 400 });
        }

        const id = crypto.randomUUID();
        const timeVal = time || new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        const completedVal = isCompleted ? 1 : 0;

        await db.run(
            "INSERT INTO logs (id, user_id, time, title, details, category, isCompleted) VALUES (?, ?, ?, ?, ?, ?, ?)",
            [id, user.id, timeVal, title, details || null, category, completedVal]
        );

        const newLog = await db.get("SELECT * FROM logs WHERE id = ?", [id]);
        return NextResponse.json({
            ...newLog,
            isCompleted: newLog.isCompleted === 1
        });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function PUT(request: Request) {
    try {
        const user = await getCurrentUser();
        if (!user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const db = await getDB();
        const body = await request.json();
        const { id, isCompleted } = body;

        if (!id) {
            return NextResponse.json({ error: "ID is required" }, { status: 400 });
        }

        // Verify the log belongs to this user
        const existingLog = await db.get("SELECT user_id FROM logs WHERE id = ?", [id]);
        if (!existingLog) {
            return NextResponse.json({ error: "Log not found" }, { status: 404 });
        }
        if (existingLog.user_id !== user.id) {
            return NextResponse.json({ error: "Forbidden" }, { status: 403 });
        }

        const completedVal = isCompleted ? 1 : 0;
        await db.run("UPDATE logs SET isCompleted = ? WHERE id = ? AND user_id = ?", [completedVal, id, user.id]);

        const updatedLog = await db.get("SELECT * FROM logs WHERE id = ?", [id]);
        return NextResponse.json({
            ...updatedLog,
            isCompleted: updatedLog.isCompleted === 1
        });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function DELETE(request: Request) {
    try {
        const user = await getCurrentUser();
        if (!user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const db = await getDB();
        const url = new URL(request.url);
        const id = url.searchParams.get("id");

        if (!id) {
            return NextResponse.json({ error: "ID parameter is required" }, { status: 400 });
        }

        // Verify log belongs to user
        const existingLog = await db.get("SELECT user_id FROM logs WHERE id = ?", [id]);
        if (!existingLog) {
            return NextResponse.json({ error: "Log not found" }, { status: 404 });
        }
        if (existingLog.user_id !== user.id) {
            return NextResponse.json({ error: "Forbidden" }, { status: 403 });
        }

        await db.run("DELETE FROM logs WHERE id = ? AND user_id = ?", [id, user.id]);
        return NextResponse.json({ success: true });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
