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
        const { fullName, email, password, role, industry, country, language } = body;

        if (!fullName || !email || !password) {
            return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
        }

        const normalizedEmail = email.toLowerCase().trim();

        // Check if user already exists
        const existingUser = await db.get("SELECT * FROM users WHERE email = ?", [normalizedEmail]);
        if (existingUser) {
            return NextResponse.json({ error: "User with this email already exists" }, { status: 400 });
        }

        const nowMs = Date.now();
        let userId = "";

        // 1. Try to register using real Supabase Auth
        const supabaseServer = await createClient();
        if (supabaseServer) {
            const { data, error } = await supabaseServer.auth.signUp({
                email: normalizedEmail,
                password: password,
                options: {
                    data: {
                        fullName,
                        role: role || "Business Owner"
                    }
                }
            });

            if (error) {
                return NextResponse.json({ error: error.message }, { status: 400 });
            }

            if (!data.user) {
                return NextResponse.json({ error: "Registration failed" }, { status: 400 });
            }

            userId = data.user.id;

            // Insert user into custom users table (password empty because handled securely by Supabase)
            await db.run(
                "INSERT INTO users (id, name, email, password, role, created_at) VALUES (?, ?, ?, ?, ?, ?)",
                [userId, fullName, normalizedEmail, "", role || "Business Owner", nowMs]
            );
        } else {
            // 2. Fall back to local SQLite credentials creation
            userId = String(Date.now());
            const hashedPassword = hashPassword(password);

            // Insert user
            await db.run(
                "INSERT INTO users (id, name, email, password, role, created_at) VALUES (?, ?, ?, ?, ?, ?)",
                [userId, fullName, normalizedEmail, hashedPassword, role || "Business Owner", nowMs]
            );

            // Generate a random 5-digit verification code
            const otpCode = Math.floor(10000 + Math.random() * 90000).toString();
            const otpExpiresAt = nowMs + 10 * 60 * 1000; // 10 minutes

            await db.run(
                "INSERT OR REPLACE INTO otp_codes (email, code, expires_at) VALUES (?, ?, ?)",
                [normalizedEmail, otpCode, otpExpiresAt]
            );

            console.log("\n==================================================");
            console.log(`[AUTH] Local verification code for ${normalizedEmail} is: ${otpCode}`);
            console.log("==================================================\n");
        }

        // Update profile table
        await db.run(
            `INSERT INTO profile (id, fullName, email, companyName, targetAudience, primaryKPI, selectedPersona) 
             VALUES (?, ?, ?, ?, ?, ?, ?) 
             ON CONFLICT(id) DO UPDATE SET 
             fullName = excluded.fullName, 
             email = excluded.email, 
             selectedPersona = excluded.selectedPersona`,
            [
                userId,
                fullName,
                normalizedEmail,
                "",
                "",
                "",
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
                fullName,
                normalizedEmail,
                "",
                "",
                "",
                "growth"
            ]
        );

        return NextResponse.json({
            user: { id: userId, name: fullName, email: normalizedEmail, role: role || "Business Owner" }
        }, { status: 201 });

    } catch (error: any) {
        console.error("Signup Route Error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

