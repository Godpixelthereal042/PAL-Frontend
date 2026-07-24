import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";
import { getDB } from "@/lib/db";
import { hasCompletedBusinessBrain } from "@/lib/businessBrain";

export async function GET(request: Request) {
    try {
        const { searchParams, origin } = new URL(request.url);
        const code = searchParams.get("code");
        const next = searchParams.get("next") ?? "/";

        if (code) {
            const cookieStore = await cookies();
            const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
            const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
            
            const useSupabase = supabaseUrl && supabaseAnonKey && 
                                !supabaseUrl.includes("dummy-url") && 
                                !supabaseAnonKey.includes("dummy-key");

            if (useSupabase) {
                let redirectTarget = `${origin}${next}`;

                const supabaseServer = createServerClient(supabaseUrl, supabaseAnonKey, {
                    cookies: {
                        getAll() {
                            return cookieStore.getAll();
                        },
                        setAll(cookiesToSet) {
                            cookiesToSet.forEach(({ name, value, options }) => {
                                try {
                                    cookieStore.set(name, value, options);
                                } catch (e) {
                                    // Ignored
                                }
                            });
                        },
                    },
                });

                const { error } = await supabaseServer.auth.exchangeCodeForSession(code);
                if (!error) {
                    // Sync the authenticated user to local SQLite users & profile tables
                    try {
                        const { data: { user } } = await supabaseServer.auth.getUser();
                        if (user) {
                            const db = await getDB();
                            const nowMs = Date.now();
                            const fullName = user.user_metadata?.fullName || user.user_metadata?.full_name || user.email?.split("@")[0] || "User";
                            const email = user.email || "";

                            // Ensure user exists in users table
                            const existingUser = await db.get("SELECT id FROM users WHERE id = ?", [user.id]);
                            if (!existingUser) {
                                await db.run(
                                    "INSERT INTO users (id, name, email, password, role, created_at) VALUES (?, ?, ?, ?, ?, ?)",
                                    [user.id, fullName, email, "", "Business Owner", nowMs]
                                );
                            }

                            // Ensure profile exists
                            const existingProfile = await db.get("SELECT id FROM profile WHERE id = ?", [user.id]);
                            if (!existingProfile) {
                                await db.run(
                                    `INSERT INTO profile (id, fullName, email, companyName, targetAudience, primaryKPI, selectedPersona) 
                                     VALUES (?, ?, ?, '', '', '', 'growth')`,
                                    [user.id, fullName, email]
                                );
                            }

                            // Update fallback current_user profile
                            await db.run(
                                `INSERT INTO profile (id, fullName, email, companyName, targetAudience, primaryKPI, selectedPersona) 
                                 VALUES ('current_user', ?, ?, '', '', '', 'growth')
                                 ON CONFLICT(id) DO UPDATE SET 
                                 fullName = excluded.fullName,
                                 email = excluded.email`,
                                [fullName, email]
                            );

                            const hasBrain = await hasCompletedBusinessBrain(user.id);
                            if (!hasBrain) {
                                redirectTarget = `${origin}/business-brain`;
                            }
                        }
                    } catch (syncErr) {
                        console.error("Local SQLite OAuth sync error:", syncErr);
                    }
                    return NextResponse.redirect(redirectTarget);
                }
                console.error("OAuth Exchange Code error:", error.message);
            }
        }

        return NextResponse.redirect(`${origin}/onboarding?error=oauth_failed`);
    } catch (err: any) {
        console.error("OAuth Callback Route error:", err.message);
        return NextResponse.redirect(`${origin}/onboarding?error=oauth_failed`);
    }
}

