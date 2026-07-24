import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl;

    // Define protected routes prefix or exact paths
    const isProtectedRoute = 
        pathname === "/" ||
        pathname.startsWith("/chat") ||
        pathname.startsWith("/projects") ||
        pathname.startsWith("/analytics") ||
        pathname.startsWith("/weekly-data") ||
        pathname.startsWith("/profile") ||
        pathname.startsWith("/notifications") ||
        pathname.startsWith("/log-history") ||
        pathname.startsWith("/connect") ||
        pathname.startsWith("/business-brain") ||
        (pathname.startsWith("/api/") && !pathname.startsWith("/api/auth"));

    // Check for either SQLite session cookie or any Supabase Auth cookie
    const cookies = request.cookies.getAll();
    const hasSupabaseCookie = cookies.some(cookie => cookie.name.startsWith("sb-"));
    const hasLocalSession = request.cookies.has("pal_session_id");
    const isAuthenticated = hasSupabaseCookie || hasLocalSession;

    if (isProtectedRoute && !isAuthenticated) {
        // For API routes, return a 401 JSON response instead of redirecting
        if (pathname.startsWith("/api/")) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }
        // Redirect to onboarding/login screen for page routes
        const url = request.nextUrl.clone();
        url.pathname = "/onboarding";
        return NextResponse.redirect(url);
    }

    return NextResponse.next();
}

export const config = {
    matcher: [
        /*
         * Match all request paths except for the ones starting with:
         * - api/auth (authentication API routes)
         * - onboarding (onboarding page)
         * - _next/static (static compilation files)
         * - _next/image (image optimization files)
         * - assets (images, logos)
         * - favicon.ico (favicon file)
         */
        "/((?!api/auth|onboarding|_next/static|_next/image|assets|favicon.ico).*)",
    ],
};

