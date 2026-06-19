import { cookies } from "next/headers";
import { createClient } from "./supabaseServer";
import { getDB } from "./db";

export interface UserSession {
    id: string;
    name: string;
    email: string;
    role: string;
}

export async function getCurrentUser(): Promise<UserSession | null> {
    try {
        // 1. Try to verify session with real Supabase Auth
        const supabaseServer = await createClient();
        if (supabaseServer) {
            const { data: { user }, error } = await supabaseServer.auth.getUser();
            if (user && !error) {
                // Fetch extra info (role, name) from users table
                const db = await getDB();
                const dbUser = await db.get("SELECT id, name, email, role FROM users WHERE id = ?", [user.id]);
                return {
                    id: user.id,
                    name: dbUser?.name || user.user_metadata?.fullName || "User",
                    email: user.email || "",
                    role: dbUser?.role || user.user_metadata?.role || "Member"
                };
            }
        }

        // 2. Fall back to local SQLite session cookie verification
        const cookieStore = await cookies();
        const sessionId = cookieStore.get("pal_session_id")?.value;

        if (!sessionId) {
            return null;
        }

        const db = await getDB();
        const session = await db.get("SELECT * FROM sessions WHERE id = ?", [sessionId]);

        if (!session) {
            return null;
        }

        const nowMs = Date.now();
        const expiresAtNum = Number(session.expires_at);
        if (expiresAtNum < nowMs) {
            // Delete expired session
            await db.run("DELETE FROM sessions WHERE id = ?", [sessionId]);
            cookieStore.delete("pal_session_id");
            return null;
        }

        const user = await db.get("SELECT id, name, email, role FROM users WHERE id = ?", [session.user_id]);
        if (!user) {
            return null;
        }

        return {
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role || "Member"
        };
    } catch (err) {
        console.error("Error verifying current user session:", err);
        return null;
    }
}


