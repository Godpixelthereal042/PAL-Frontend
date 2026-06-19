import { NextResponse } from "next/server";
import { getDB } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";

export async function GET(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const user = await getCurrentUser();
        if (!user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }
        const { id } = await params;
        const db = await getDB();

        const project = await db.get("SELECT * FROM projects WHERE id = ?", [id]);
        if (!project) {
            return NextResponse.json({ error: "Project not found" }, { status: 404 });
        }

        const isMember = project.owner_id === user.id || 
            await db.get("SELECT 1 FROM project_members WHERE project_id = ? AND user_id = ?", [id, user.id]);
        if (!isMember) {
            return NextResponse.json({ error: "Forbidden" }, { status: 403 });
        }

        const milestones = await db.all("SELECT * FROM milestones WHERE project_id = ?", [id]);
        return NextResponse.json({ project, milestones });
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
        if (!user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }
        if (user.role !== "Owner" && user.role !== "Business Owner" && user.role !== "Admin") {
            return NextResponse.json({ error: "Forbidden" }, { status: 403 });
        }

        const { id: projectId } = await params;
        const db = await getDB();

        const project = await db.get("SELECT * FROM projects WHERE id = ?", [projectId]);
        if (!project) {
            return NextResponse.json({ error: "Project not found" }, { status: 404 });
        }

        const isMember = project.owner_id === user.id || 
            await db.get("SELECT 1 FROM project_members WHERE project_id = ? AND user_id = ?", [projectId, user.id]);
        if (!isMember) {
            return NextResponse.json({ error: "Forbidden" }, { status: 403 });
        }

        const body = await request.json();
        const { text, completed } = body;

        if (!text) {
            return NextResponse.json({ error: "Milestone text is required" }, { status: 400 });
        }

        const milestoneId = String(Date.now());
        await db.run(
            "INSERT INTO milestones (id, project_id, text, completed) VALUES (?, ?, ?, ?)",
            [milestoneId, projectId, text, completed ? 1 : 0]
        );

        const newMilestone = await db.get("SELECT * FROM milestones WHERE id = ?", [milestoneId]);
        return NextResponse.json(newMilestone, { status: 201 });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function PUT(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const user = await getCurrentUser();
        if (!user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }
        if (user.role !== "Owner" && user.role !== "Business Owner" && user.role !== "Admin") {
            return NextResponse.json({ error: "Forbidden" }, { status: 403 });
        }

        const { id: projectId } = await params;
        const db = await getDB();

        const project = await db.get("SELECT * FROM projects WHERE id = ?", [projectId]);
        if (!project) {
            return NextResponse.json({ error: "Project not found" }, { status: 404 });
        }

        const isMember = project.owner_id === user.id || 
            await db.get("SELECT 1 FROM project_members WHERE project_id = ? AND user_id = ?", [projectId, user.id]);
        if (!isMember) {
            return NextResponse.json({ error: "Forbidden" }, { status: 403 });
        }

        const body = await request.json();
        
        // If milestoneId is provided, we update that milestone
        if (body.milestoneId) {
            const { milestoneId, completed, text } = body;
            
            if (completed !== undefined) {
                await db.run(
                    "UPDATE milestones SET completed = ? WHERE id = ? AND project_id = ?",
                    [completed ? 1 : 0, milestoneId, projectId]
                );
            }
            
            if (text !== undefined) {
                await db.run(
                    "UPDATE milestones SET text = ? WHERE id = ? AND project_id = ?",
                    [text, milestoneId, projectId]
                );
            }

            const updatedMilestone = await db.get("SELECT * FROM milestones WHERE id = ?", [milestoneId]);
            return NextResponse.json(updatedMilestone);
        } else {
            // Otherwise, update the project details
            const { title, type, description, date, color, goal, priority, status, due_date, owner_id } = body;

            const finalTitle = title !== undefined ? title : project.title;
            const finalType = type !== undefined ? type : project.type;
            const finalDescription = description !== undefined ? description : project.description;
            const finalDate = date !== undefined ? date : project.date;
            const finalColor = color !== undefined ? color : project.color;
            const finalGoal = goal !== undefined ? goal : project.goal;
            const finalPriority = priority !== undefined ? priority : project.priority;
            const finalStatus = status !== undefined ? status : project.status;
            const finalDueDate = due_date !== undefined ? due_date : project.due_date;
            const finalOwnerId = owner_id !== undefined ? owner_id : project.owner_id;

            await db.run(
                `UPDATE projects SET title = ?, type = ?, description = ?, date = ?, color = ?, 
                 goal = ?, priority = ?, status = ?, due_date = ?, owner_id = ? WHERE id = ?`,
                [
                    finalTitle, 
                    finalType, 
                    finalDescription, 
                    finalDate, 
                    finalColor, 
                    finalGoal, 
                    finalPriority, 
                    finalStatus, 
                    finalDueDate, 
                    finalOwnerId, 
                    projectId
                ]
            );
            const updatedProject = await db.get("SELECT * FROM projects WHERE id = ?", [projectId]);
            return NextResponse.json(updatedProject);
        }
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
        if (!user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { id: projectId } = await params;
        const db = await getDB();

        const project = await db.get("SELECT * FROM projects WHERE id = ?", [projectId]);
        if (!project) {
            return NextResponse.json({ error: "Project not found" }, { status: 404 });
        }

        const isMember = project.owner_id === user.id || 
            await db.get("SELECT 1 FROM project_members WHERE project_id = ? AND user_id = ?", [projectId, user.id]);
        if (!isMember) {
            return NextResponse.json({ error: "Forbidden" }, { status: 403 });
        }

        const url = new URL(request.url);
        const milestoneId = url.searchParams.get("milestoneId");

        if (milestoneId) {
            if (user.role !== "Owner" && user.role !== "Business Owner" && user.role !== "Admin") {
                return NextResponse.json({ error: "Forbidden" }, { status: 403 });
            }
            await db.run("DELETE FROM milestones WHERE id = ? AND project_id = ?", [milestoneId, projectId]);
            return NextResponse.json({ success: true, deletedMilestoneId: milestoneId });
        } else {
            if (user.role !== "Owner" && user.role !== "Business Owner") {
                return NextResponse.json({ error: "Forbidden" }, { status: 403 });
            }
            await db.run("DELETE FROM projects WHERE id = ?", [projectId]);
            await db.run("DELETE FROM milestones WHERE project_id = ?", [projectId]);
            return NextResponse.json({ success: true, deletedProjectId: projectId });
        }
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
