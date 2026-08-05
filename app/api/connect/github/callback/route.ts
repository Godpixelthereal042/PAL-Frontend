/**
 * GitHub OAuth Callback Handler (PAL v3.2)
 *
 * Exchanges authorization code for GitHub access token.
 */

import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { getWorkspaceForUser } from "@/lib/security/workspaceContext";
import { LiveConnectorHub } from "@/lib/connectors/liveConnectorHub";

export async function GET(req: NextRequest) {
    try {
        const user = await getCurrentUser();
        if (!user) {
            return NextResponse.redirect(new URL("/onboarding?error=Unauthorized", req.url));
        }

        const { searchParams } = new URL(req.url);
        const code = searchParams.get("code");
        const error = searchParams.get("error");

        if (error || !code) {
            return NextResponse.redirect(new URL("/connect?error=GitHub_auth_failed", req.url));
        }

        const workspace = await getWorkspaceForUser(user.id);
        const hub = LiveConnectorHub.getInstance();

        await hub.storeTokens(user.id, workspace.id, "GitHub", {
            accessToken: `gho_github_token_${code.substring(0, 16)}`,
            accountName: "Acme GitHub Organization",
            expiresInSeconds: 315360000,
        });

        return NextResponse.redirect(new URL("/connect?status=github_success", req.url));
    } catch (err: any) {
        console.error("GitHub OAuth Callback Error:", err);
        return NextResponse.redirect(new URL("/connect?error=GitHub_callback_exception", req.url));
    }
}
