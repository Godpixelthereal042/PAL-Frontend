import { NextResponse } from "next/server";
import { getDB } from "@/lib/db";
import { cookies } from "next/headers";
import { createClient } from "@/lib/supabaseServer";

export async function GET() {
    try {
        const db = await getDB();

        // 1. Try real Supabase Auth session check
        const supabaseServer = await createClient();
        if (supabaseServer) {
            const { data: { user }, error } = await supabaseServer.auth.getUser();
            if (user && !error) {
                let dbUser = null;
                try {
                    dbUser = await db.get("SELECT id, name, email, role FROM users WHERE id = ?", [user.id]);
                    
                    // Automatically sync authenticated user to SQLite if not present
                    if (!dbUser) {
                        const nowMs = Date.now();
                        const fullName = user.user_metadata?.fullName || user.user_metadata?.full_name || user.email?.split("@")[0] || "User";
                        const email = user.email || "";

                        await db.run(
                            "INSERT INTO users (id, name, email, password, role, created_at) VALUES (?, ?, ?, ?, ?, ?)",
                            [user.id, fullName, email, "", "Business Owner", nowMs]
                        );

                        const existingProfile = await db.get("SELECT id FROM profile WHERE id = ?", [user.id]);
                        if (!existingProfile) {
                            await db.run(
                                `INSERT INTO profile (id, fullName, email, companyName, targetAudience, primaryKPI, selectedPersona) 
                                 VALUES (?, ?, ?, '', '', '', 'growth')`,
                                [user.id, fullName, email]
                            );
                        }

                        await db.run(
                            `INSERT INTO profile (id, fullName, email, companyName, targetAudience, primaryKPI, selectedPersona) 
                             VALUES ('current_user', ?, ?, '', '', '', 'growth')
                             ON CONFLICT(id) DO UPDATE SET 
                             fullName = excluded.fullName,
                             email = excluded.email`,
                            [fullName, email]
                        );

                        dbUser = {
                            id: user.id,
                            name: fullName,
                            email: email,
                            role: "Business Owner"
                        };
                    }
                } catch (dbErr) {
                    console.warn("Could not sync user to database (tables might be missing):", dbErr);
                }

                return NextResponse.json({
                    authenticated: true,
                    user: {
                        id: user.id,
                        name: dbUser?.name || user.user_metadata?.fullName || user.email?.split("@")[0] || "User",
                        email: user.email || "",
                        role: dbUser?.role || user.user_metadata?.role || "Business Owner"
                    }
                });
            }
            return NextResponse.json({ authenticated: false }, { status: 401 });
        }

        // 2. Fall back to local SQLite session cookie check
        const cookieStore = await cookies();
        const sessionId = cookieStore.get("pal_session_id")?.value;

        if (!sessionId) {
            return NextResponse.json({ authenticated: false }, { status: 401 });
        }

        const session = await db.get("SELECT * FROM sessions WHERE id = ?", [sessionId]);

        if (!session) {
            return NextResponse.json({ authenticated: false }, { status: 401 });
        }

        const nowMs = Date.now();
        if (session.expires_at < nowMs) {
            // Delete expired session
            await db.run("DELETE FROM sessions WHERE id = ?", [sessionId]);
            cookieStore.delete("pal_session_id");
            return NextResponse.json({ authenticated: false, reason: "Session expired" }, { status: 401 });
        }

        const user = await db.get("SELECT id, name, email, role FROM users WHERE id = ?", [session.user_id]);
        if (!user) {
            return NextResponse.json({ authenticated: false }, { status: 401 });
        }

        return NextResponse.json({ authenticated: true, user });

    } catch (error: any) {
        console.error("Session Route GET Error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function DELETE() {
    try {
        // 1. Try real Supabase Auth signout
        const supabaseServer = await createClient();
        if (supabaseServer) {
            const { error } = await supabaseServer.auth.signOut();
            if (error) {
                return NextResponse.json({ error: error.message }, { status: 500 });
            }
            return NextResponse.json({ success: true, message: "Logged out successfully" });
        }

        // 2. Fall back to local SQLite cookie session deletion
        const cookieStore = await cookies();
        const sessionId = cookieStore.get("pal_session_id")?.value;

        if (sessionId) {
            const db = await getDB();
            await db.run("DELETE FROM sessions WHERE id = ?", [sessionId]);
            cookieStore.delete("pal_session_id");
        }

        return NextResponse.json({ success: true, message: "Logged out successfully" });
    } catch (error: any) {
        console.error("Session Route DELETE Error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

