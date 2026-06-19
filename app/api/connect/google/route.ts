import { NextResponse } from "next/server";

export async function GET(request: Request) {
    const clientId = process.env.GOOGLE_CLIENT_ID;
    const origin = new URL(request.url).origin;
    const redirectUri = process.env.GOOGLE_REDIRECT_URI || `${origin}/api/connect/google/callback`;

    const isMock = !clientId || clientId.includes("dummy") || clientId.trim() === "";

    if (isMock) {
        console.log("[OAUTH] Google Client ID not set or is placeholder, redirecting to callback with mock code");
        return NextResponse.redirect(`${origin}/api/connect/google/callback?code=mock_code`);
    }

    const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&response_type=code&scope=https://www.googleapis.com/auth/calendar.readonly&access_type=offline&prompt=consent`;

    return NextResponse.redirect(authUrl);
}
