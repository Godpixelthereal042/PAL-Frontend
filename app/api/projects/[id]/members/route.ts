import { NextResponse } from "next/server";
import { getDB } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import crypto from "crypto";

export async function GET(
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

        const members = await db.all(
            `SELECT pm.user_id as id, u.name, u.email, pm.role 
             FROM project_members pm
             JOIN users u ON pm.user_id = u.id
             WHERE pm.project_id = ?`,
            [projectId]
        );

        return NextResponse.json(members);
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

        const { id: projectId } = await params;
        const db = await getDB();

        // Check project access and permission
        const project = await db.get("SELECT owner_id FROM projects WHERE id = ?", [projectId]);
        if (!project) {
            return NextResponse.json({ error: "Project not found" }, { status: 404 });
        }

        const isMember = project.owner_id === user.id || 
            await db.get("SELECT 1 FROM project_members WHERE project_id = ? AND user_id = ?", [projectId, user.id]);
        if (!isMember) {
            return NextResponse.json({ error: "Forbidden" }, { status: 403 });
        }

        const body = await request.json();
        const { email, role } = body;

        if (!email) {
            return NextResponse.json({ error: "Email is required" }, { status: 400 });
        }

        const normalizedEmail = email.toLowerCase().trim();

        // 1. Look up user in local users table
        let targetUser = await db.get("SELECT id, name, email FROM users WHERE email = ?", [normalizedEmail]);

        if (!targetUser) {
            // Create a placeholder user to make collaboration smooth during testing/use
            const userId = crypto.randomUUID();
            const namePrefix = normalizedEmail.split("@")[0];
            const userName = namePrefix.charAt(0).toUpperCase() + namePrefix.slice(1);
            const nowMs = Date.now();

            await db.run(
                "INSERT INTO users (id, name, email, password, role, created_at) VALUES (?, ?, ?, ?, ?, ?)",
                [userId, userName, normalizedEmail, "", "Member", nowMs]
            );

            // Also create a profile record
            await db.run(
                `INSERT INTO profile (id, fullName, email, companyName, targetAudience, primaryKPI, selectedPersona) 
                 VALUES (?, ?, ?, ?, ?, ?, ?)`,
                [userId, userName, normalizedEmail, "", "", "", "growth"]
            );

            targetUser = { id: userId, name: userName, email: normalizedEmail };
        }

        // Check if user is already a member
        const existingMember = await db.get(
            "SELECT 1 FROM project_members WHERE project_id = ? AND user_id = ?",
            [projectId, targetUser.id]
        );

        if (existingMember) {
            return NextResponse.json({ error: "User is already a member of this project" }, { status: 400 });
        }

        // Insert into project_members
        const memberRole = role || "Member";
        await db.run(
            "INSERT INTO project_members (project_id, user_id, role) VALUES (?, ?, ?)",
            [projectId, targetUser.id, memberRole]
        );

        const newMember = {
            id: targetUser.id,
            name: targetUser.name,
            email: targetUser.email,
            role: memberRole
        };

        return NextResponse.json(newMember, { status: 201 });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
