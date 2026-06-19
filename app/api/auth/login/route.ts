import { NextResponse } from "next/server";
import { getDB } from "@/lib/db";
import { cookies } from "next/headers";
import crypto from "crypto";
import { createClient } from "@/lib/supabaseServer";

function hashPassword(password: string): string {
    const salt = process.env.AUTH_SALT || "pal_salt_key";
    return crypto.pbkdf2Sync(password, salt, 1000, 64, "sha512").toString("hex");
}

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
                // If user exists in Supabase Auth but not custom users table (e.g. from OAuth), sync it
                const fullName = data.user.user_metadata?.fullName || "Google User";
                const role = data.user.user_metadata?.role || "Business Owner";
                await db.run(
                    "INSERT INTO users (id, name, email, password, role, created_at) VALUES (?, ?, ?, ?, ?, ?)",
                    [userId, fullName, normalizedEmail, "", role, nowMs]
                );
                user = await db.get("SELECT * FROM users WHERE id = ?", [userId]);
            }

            // Sync/update profile table
            await db.run(
                `INSERT INTO profile (id, fullName, email, companyName, targetAudience, primaryKPI, selectedPersona) 
                 VALUES (?, ?, ?, ?, ?, ?, ?) 
                 ON CONFLICT(id) DO UPDATE SET 
                 fullName = excluded.fullName, 
                 email = excluded.email, 
                 selectedPersona = excluded.selectedPersona`,
                [
                    userId,
                    user.name,
                    normalizedEmail,
                    "Pal AI",
                    "Startups & Creatives",
                    "Customer Engagement Rate",
                    "growth"
                ]
            );

            // Also update the global fallback "current_user"
            await db.run(
                `INSERT INTO profile (id, fullName, email, companyName, targetAudience, primaryKPI, selectedPersona) 
                 VALUES (?, ?, ?, ?, ?, ?, ?) 
                 ON CONFLICT(id) DO UPDATE SET 
                 fullName = excluded.fullName, 
                 email = excluded.email, 
                 selectedPersona = excluded.selectedPersona`,
                [
                    "current_user",
                    user.name,
                    normalizedEmail,
                    "Pal AI",
                    "Startups & Creatives",
                    "Customer Engagement Rate",
                    "growth"
                ]
            );

            return NextResponse.json({
                user: { id: user.id, name: user.name, email: user.email, role: user.role }
            });
        } else {
            // 2. Fall back to local SQLite credentials verification
            const user = await db.get("SELECT * FROM users WHERE email = ?", [normalizedEmail]);

            if (!user) {
                return NextResponse.json({ error: "Invalid email or password" }, { status: 401 });
            }

            const hashedPassword = hashPassword(password);
            if (user.password !== hashedPassword) {
                return NextResponse.json({ error: "Invalid email or password" }, { status: 401 });
            }

            const sessionId = crypto.randomBytes(32).toString("hex");
            const expiresAt = nowMs + 1000 * 60 * 60 * 24 * 30; // 30 days

            await db.run(
                "INSERT INTO sessions (id, user_id, expires_at) VALUES (?, ?, ?)",
                [sessionId, user.id, expiresAt]
            );

            // Update profile table
            await db.run(
                `INSERT INTO profile (id, fullName, email, companyName, targetAudience, primaryKPI, selectedPersona) 
                 VALUES (?, ?, ?, ?, ?, ?, ?) 
                 ON CONFLICT(id) DO UPDATE SET 
                 fullName = excluded.fullName, 
                 email = excluded.email, 
                 selectedPersona = excluded.selectedPersona`,
                [
                    user.id,
                    user.name,
                    normalizedEmail,
                    "Pal AI",
                    "Startups & Creatives",
                    "Customer Engagement Rate",
                    "growth"
                ]
            );

            // Also update the global fallback "current_user"
            await db.run(
                `INSERT INTO profile (id, fullName, email, companyName, targetAudience, primaryKPI, selectedPersona) 
                 VALUES (?, ?, ?, ?, ?, ?, ?) 
                 ON CONFLICT(id) DO UPDATE SET 
                 fullName = excluded.fullName, 
                 email = excluded.email, 
                 selectedPersona = excluded.selectedPersona`,
                [
                    "current_user",
                    user.name,
                    normalizedEmail,
                    "Pal AI",
                    "Startups & Creatives",
                    "Customer Engagement Rate",
                    "growth"
                ]
            );

            // Set session cookie
            const cookieStore = await cookies();
            cookieStore.set("pal_session_id", sessionId, {
                httpOnly: true,
                secure: process.env.NODE_ENV === "production",
                maxAge: 60 * 60 * 24 * 30, // 30 days
                path: "/"
            });

            return NextResponse.json({
                user: { id: user.id, name: user.name, email: user.email, role: user.role }
            });
        }

    } catch (error: any) {
        console.error("Login Route Error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

