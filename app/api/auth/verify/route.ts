import { NextResponse } from "next/server";
import { getDB } from "@/lib/db";
import { cookies } from "next/headers";
import crypto from "crypto";

export async function POST(request: Request) {
    try {
        const db = await getDB();
        const body = await request.json();
        const { email, code } = body;

        if (!email || !code) {
            return NextResponse.json({ error: "Email and code are required" }, { status: 400 });
        }

        const normalizedEmail = email.toLowerCase().trim();
        const nowMs = Date.now();

        // 1. Verify OTP code against SQLite database
        const otpRecord = await db.get(
            "SELECT * FROM otp_codes WHERE email = ? AND code = ?",
            [normalizedEmail, code.trim()]
        );

        if (!otpRecord) {
            return NextResponse.json({ error: "Wrong code, please try again" }, { status: 400 });
        }

        if (Number(otpRecord.expires_at) < nowMs) {
            // Clean up expired code
            await db.run("DELETE FROM otp_codes WHERE email = ?", [normalizedEmail]);
            return NextResponse.json({ error: "Code has expired, please request a new one" }, { status: 400 });
        }

        // OTP is valid! Delete it immediately to prevent reuse
        await db.run("DELETE FROM otp_codes WHERE email = ?", [normalizedEmail]);

        // 2. Fetch user details
        const user = await db.get("SELECT id, name, email, role FROM users WHERE email = ?", [normalizedEmail]);
        if (!user) {
            return NextResponse.json({ error: "User not found" }, { status: 404 });
        }

        // 3. Generate session ID and expiration (30 days)
        const sessionId = crypto.randomBytes(32).toString("hex");
        const expiresAt = nowMs + 1000 * 60 * 60 * 24 * 30; // 30 days

        await db.run(
            "INSERT INTO sessions (id, user_id, expires_at) VALUES (?, ?, ?)",
            [sessionId, user.id, expiresAt]
        );

        // 4. Set session cookie for local authentication
        const cookieStore = await cookies();
        cookieStore.set("pal_session_id", sessionId, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            maxAge: 60 * 60 * 24 * 30, // 30 days
            path: "/"
        });

        return NextResponse.json({
            success: true,
            user: { id: user.id, name: user.name, email: user.email, role: user.role }
        });

    } catch (error: any) {
        console.error("Verification Route Error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
