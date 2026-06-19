import { NextResponse } from "next/server";
import { getDB } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";

export async function GET(request: Request) {
    try {
        const user = await getCurrentUser();
        const userId = user ? user.id : "current_user";

        const url = new URL(request.url);
        const code = url.searchParams.get("code");

        if (!code) {
            return NextResponse.redirect(`${url.origin}/connect/google?error=missing_code`);
        }

        const db = await getDB();
        const nowMs = Date.now();

        const clientId = process.env.GOOGLE_CLIENT_ID;
        const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
        const redirectUri = process.env.GOOGLE_REDIRECT_URI || `${url.origin}/api/connect/google/callback`;

        const isMock = code === "mock_code" || !clientId || !clientSecret || clientId.includes("dummy");

        if (isMock) {
            console.log("[OAUTH] Syncing Google integration with mock credentials for user:", userId);
            
            // Check if integrations record exists
            const existing = await db.get("SELECT * FROM integrations WHERE id = 'google' AND user_id = ?", [userId]);
            if (existing) {
                await db.run(
                    "UPDATE integrations SET isSynced = 1, isAutoSync = 1, access_token = ?, refresh_token = ?, token_expires_at = ? WHERE id = 'google' AND user_id = ?",
                    ["mock_access_token", "mock_refresh_token", nowMs + 3600 * 1000, userId]
                );
            } else {
                await db.run(
                    "INSERT INTO integrations (id, user_id, isSynced, isAutoSync, access_token, refresh_token, token_expires_at) VALUES (?, ?, 1, 1, ?, ?, ?)",
                    ["google", userId, "mock_access_token", "mock_refresh_token", nowMs + 3600 * 1000]
                );
            }

            return NextResponse.redirect(`${url.origin}/connect/google?success=true`);
        }

        // Exchange authorization code for tokens
        const tokenRes = await fetch("https://oauth2.googleapis.com/token", {
            method: "POST",
            headers: { "Content-Type": "application/x-www-form-urlencoded" },
            body: new URLSearchParams({
                code,
                client_id: clientId,
                client_secret: clientSecret,
                redirect_uri: redirectUri,
                grant_type: "authorization_code"
            })
        });

        if (!tokenRes.ok) {
            const errText = await tokenRes.text();
            console.error("[OAUTH] Google token exchange failed:", errText);
            return NextResponse.redirect(`${url.origin}/connect/google?error=token_exchange_failed`);
        }

        const tokenData = await tokenRes.json();
        const accessToken = tokenData.access_token;
        const refreshToken = tokenData.refresh_token;
        const expiresAt = nowMs + (tokenData.expires_in || 3600) * 1000;

        const existing = await db.get("SELECT * FROM integrations WHERE id = 'google' AND user_id = ?", [userId]);
        if (existing) {
            const finalRefreshToken = refreshToken || existing.refresh_token;
            await db.run(
                "UPDATE integrations SET isSynced = 1, isAutoSync = 1, access_token = ?, refresh_token = ?, token_expires_at = ? WHERE id = 'google' AND user_id = ?",
                [accessToken, finalRefreshToken, expiresAt, userId]
            );
        } else {
            await db.run(
                "INSERT INTO integrations (id, user_id, isSynced, isAutoSync, access_token, refresh_token, token_expires_at) VALUES (?, ?, 1, 1, ?, ?, ?)",
                ["google", userId, accessToken, refreshToken || "", expiresAt]
            );
        }

        return NextResponse.redirect(`${url.origin}/connect/google?success=true`);
    } catch (error: any) {
        console.error("[OAUTH] Google Callback Error:", error);
        const origin = new URL(request.url).origin;
        return NextResponse.redirect(`${origin}/connect/google?error=internal_error`);
    }
}
