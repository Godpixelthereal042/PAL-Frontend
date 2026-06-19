import { NextResponse } from "next/server";
import { getDB } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";

export async function GET() {
    try {
        const user = await getCurrentUser();
        if (!user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }
        const db = await getDB();
        const projects = await db.all(
            `SELECT * FROM projects 
             WHERE owner_id = ? 
                OR id IN (SELECT project_id FROM project_members WHERE user_id = ?)`,
            [user.id, user.id]
        );
        return NextResponse.json(projects);
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
        if (user.role !== "Owner" && user.role !== "Business Owner" && user.role !== "Admin") {
            return NextResponse.json({ error: "Forbidden" }, { status: 403 });
        }

        const db = await getDB();
        const body = await request.json();
        const { id, title, type, description, date, color, goal, priority, status, due_date } = body;

        if (!title || !type || !date || !color) {
            return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
        }

        const projectID = id || String(Date.now());
        const projectOwnerId = user.id;

        await db.run(
            `INSERT INTO projects (id, title, type, description, date, color, goal, priority, status, due_date, owner_id) 
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
                projectID, 
                title, 
                type, 
                description || "", 
                date, 
                color, 
                goal || "", 
                priority || "medium", 
                status || "Planning", 
                due_date || "", 
                projectOwnerId
            ]
        );

        // Automatically add the creator as Owner in project_members
        await db.run(
            `INSERT OR IGNORE INTO project_members (project_id, user_id, role) 
             VALUES (?, ?, 'Owner')`,
            [projectID, projectOwnerId]
        );

        const newProject = await db.get("SELECT * FROM projects WHERE id = ?", [projectID]);
        return NextResponse.json(newProject, { status: 201 });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
