import { NextResponse } from "next/server";
import { getDB } from "@/lib/db";
import { cookies } from "next/headers";
import crypto from "crypto";
import { createClient } from "@/lib/supabaseServer";
import { hasCompletedBusinessBrain } from "@/lib/businessBrain";
import { verifyPassword, hashPassword } from "@/lib/security/passwordHasher";
import { getWorkspaceForUser } from "@/lib/security/workspaceContext";

export async function POST(request: Request) {
    try {
        const db = await getDB();
        const body = await request.json();
        const { email, password } = body;

        if (!email || !password) {
            return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
        }

        const normalizedEmail = email.toLowerCase().trim();
        const nowMs = Date.now();

        // 1. Try to login using real Supabase Auth
        const supabaseServer = await createClient();
        if (supabaseServer) {
            const { data, error } = await supabaseServer.auth.signInWithPassword({
                email: normalizedEmail,
                password: password
            });

            if (error) {
                return NextResponse.json({ error: error.message }, { status: 401 });
            }

            if (!data.user) {
                return NextResponse.json({ error: "Invalid email or password" }, { status: 401 });
            }

            const userId = data.user.id;
            let user = await db.get("SELECT * FROM users WHERE id = ?", [userId]);

            if (!user) {
                const fullName = data.user.user_metadata?.fullName || "User";
                const role = data.user.user_metadata?.role || "Business Owner";
                await db.run(
                    "INSERT INTO users (id, name, email, password, role, created_at) VALUES (?, ?, ?, ?, ?, ?)",
                    [userId, fullName, normalizedEmail, "", role, nowMs]
                );
                user = await db.get("SELECT * FROM users WHERE id = ?", [userId]);
            }

            const workspace = await getWorkspaceForUser(userId);

            const hasBrain = await hasCompletedBusinessBrain(user.id);
            return NextResponse.json({
                user: { id: user.id, name: user.name, email: user.email, role: user.role, workspaceId: workspace.id },
                hasCompletedBusinessBrain: hasBrain
            });
        } else {
            // 2. Fall back to local SQLite credentials verification
            const user = await db.get("SELECT * FROM users WHERE email = ?", [normalizedEmail]);

            if (!user) {
                return NextResponse.json({ error: "Invalid email or password" }, { status: 401 });
            }

            const { valid, needsRehash } = await verifyPassword(password, user.password);
            if (!valid) {
                return NextResponse.json({ error: "Invalid email or password" }, { status: 401 });
            }

            // Transparent migration to Argon2id if user had legacy PBKDF2 hash
            if (needsRehash) {
                const argonHash = await hashPassword(password);
                await db.run("UPDATE users SET password = ? WHERE id = ?", [argonHash, user.id]);
            }

            const workspace = await getWorkspaceForUser(user.id);
            const sessionId = crypto.randomBytes(32).toString("hex");
            const expiresAt = nowMs + 1000 * 60 * 60 * 24 * 30; // 30 days

            await db.run(
                "INSERT INTO sessions (id, user_id, workspace_id, expires_at) VALUES (?, ?, ?, ?)",
                [sessionId, user.id, workspace.id, expiresAt]
            );

            // Set secure session cookie
            const cookieStore = await cookies();
            cookieStore.set("pal_session_id", sessionId, {
                httpOnly: true,
                sameSite: "lax",
                secure: process.env.NODE_ENV === "production",
                maxAge: 60 * 60 * 24 * 30, // 30 days
                path: "/"
            });

            const hasBrain = await hasCompletedBusinessBrain(user.id);
            return NextResponse.json({
                user: { id: user.id, name: user.name, email: user.email, role: user.role, workspaceId: workspace.id },
                hasCompletedBusinessBrain: hasBrain
            });
        }
    } catch (error: any) {
        console.error("Login Route Error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

