import { NextResponse } from "next/server";
import { getDB } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";

export async function GET(request: Request) {
    try {
        const user = await getCurrentUser();
        if (!user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const db = await getDB();
        const url = new URL(request.url);
        const projectId = url.searchParams.get("projectId");

        if (!projectId) {
            return NextResponse.json({ error: "Missing projectId parameter" }, { status: 400 });
        }

        // Check project access
        const project = await db.get("SELECT owner_id FROM projects WHERE id = ?", [projectId]);
        if (!project) {
            return NextResponse.json({ error: "Project not found" }, { status: 404 });
        }

        const isMember = project.owner_id === user.id || 
            await db.get("SELECT 1 FROM project_members WHERE project_id = ? AND user_id = ?", [projectId, user.id]);
        if (!isMember) {
            return NextResponse.json({ error: "Forbidden" }, { status: 403 });
        }

        const tasks = await db.all("SELECT * FROM tasks WHERE project_id = ? ORDER BY created_at ASC", [projectId]);
        return NextResponse.json(tasks);
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
        const { id, projectId, title, description, status, priority, due_date } = body;

        if (!projectId || !title) {
            return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
        }

        // Check project access
        const project = await db.get("SELECT owner_id FROM projects WHERE id = ?", [projectId]);
        if (!project) {
            return NextResponse.json({ error: "Project not found" }, { status: 404 });
        }

        const isMember = project.owner_id === user.id || 
            await db.get("SELECT 1 FROM project_members WHERE project_id = ? AND user_id = ?", [projectId, user.id]);
        if (!isMember) {
            return NextResponse.json({ error: "Forbidden" }, { status: 403 });
        }

        const taskId = id || String(Date.now());
        const nowMs = Date.now();

        await db.run(
            `INSERT INTO tasks (id, project_id, title, description, status, priority, due_date, created_at) 
             VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
            [
                taskId,
                projectId,
                title,
                description || "",
                status || "not_started",
                priority || "medium",
                due_date || "",
                nowMs
            ]
        );

        const newTask = await db.get("SELECT * FROM tasks WHERE id = ?", [taskId]);
        return NextResponse.json(newTask, { status: 201 });
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
        if (user.role !== "Owner" && user.role !== "Business Owner" && user.role !== "Admin" && user.role !== "Member") {
            return NextResponse.json({ error: "Forbidden" }, { status: 403 });
        }

        const db = await getDB();
        const body = await request.json();
        const { id, status, priority, title, description, due_date } = body;

        if (!id) {
            return NextResponse.json({ error: "Missing task ID" }, { status: 400 });
        }

        const task = await db.get("SELECT * FROM tasks WHERE id = ?", [id]);
        if (!task) {
            return NextResponse.json({ error: "Task not found" }, { status: 404 });
        }

        // Check project access for the project this task belongs to
        const project = await db.get("SELECT owner_id FROM projects WHERE id = ?", [task.project_id]);
        if (!project) {
            return NextResponse.json({ error: "Project not found" }, { status: 404 });
        }

        const isMember = project.owner_id === user.id || 
            await db.get("SELECT 1 FROM project_members WHERE project_id = ? AND user_id = ?", [task.project_id, user.id]);
        if (!isMember) {
            return NextResponse.json({ error: "Forbidden" }, { status: 403 });
        }

        if (status !== undefined) {
            await db.run("UPDATE tasks SET status = ? WHERE id = ?", [status, id]);
        }
        if (priority !== undefined) {
            await db.run("UPDATE tasks SET priority = ? WHERE id = ?", [priority, id]);
        }
        if (title !== undefined) {
            await db.run("UPDATE tasks SET title = ? WHERE id = ?", [title, id]);
        }
        if (description !== undefined) {
            await db.run("UPDATE tasks SET description = ? WHERE id = ?", [description, id]);
        }
        if (due_date !== undefined) {
            await db.run("UPDATE tasks SET due_date = ? WHERE id = ?", [due_date, id]);
        }

        const updatedTask = await db.get("SELECT * FROM tasks WHERE id = ?", [id]);
        return NextResponse.json(updatedTask);
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
        if (user.role !== "Owner" && user.role !== "Business Owner" && user.role !== "Admin") {
            return NextResponse.json({ error: "Forbidden" }, { status: 403 });
        }

        const db = await getDB();
        const url = new URL(request.url);
        const id = url.searchParams.get("id");

        if (!id) {
            return NextResponse.json({ error: "Missing task ID" }, { status: 400 });
        }

        const task = await db.get("SELECT * FROM tasks WHERE id = ?", [id]);
        if (!task) {
            return NextResponse.json({ error: "Task not found" }, { status: 404 });
        }

        // Check project access for the project this task belongs to
        const project = await db.get("SELECT owner_id FROM projects WHERE id = ?", [task.project_id]);
        if (!project) {
            return NextResponse.json({ error: "Project not found" }, { status: 404 });
        }

        const isMember = project.owner_id === user.id || 
            await db.get("SELECT 1 FROM project_members WHERE project_id = ? AND user_id = ?", [task.project_id, user.id]);
        if (!isMember) {
            return NextResponse.json({ error: "Forbidden" }, { status: 403 });
        }

        await db.run("DELETE FROM tasks WHERE id = ?", [id]);
        return NextResponse.json({ success: true, deletedTaskId: id });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
