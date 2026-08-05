import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { TenantRateLimiter, type RateLimitCategory } from "./lib/security/tenantRateLimiter";

export function middleware(request: NextRequest) {
    const startTime = Date.now();
    const { pathname } = request.nextUrl;

    // Define public routes that do not require authentication
    const isPublicRoute =
        pathname.startsWith("/api/auth") ||
        pathname.startsWith("/api/health") ||
        pathname === "/onboarding";

    // Define protected routes prefix or exact paths
    const isProtectedRoute =
        !isPublicRoute &&
        (
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
            pathname.startsWith("/api/")
        );

    // Check for either SQLite session cookie or any Supabase Auth cookie
    const cookies = request.cookies.getAll();
    const hasSupabaseCookie = cookies.some(cookie => cookie.name.startsWith("sb-"));
    const hasLocalSession = request.cookies.has("pal_session_id");
    const isAuthenticated = hasSupabaseCookie || hasLocalSession;

    if (isProtectedRoute && !isAuthenticated) {
        // For API routes, return a 401 JSON response instead of redirecting
        if (pathname.startsWith("/api/")) {
            return NextResponse.json({ error: "Unauthorized access" }, { status: 401 });
        }
        // Redirect to onboarding/login screen for page routes
        const url = request.nextUrl.clone();
        url.pathname = "/onboarding";
        return NextResponse.redirect(url);
    }

    const response = NextResponse.next();

    // Attach production security headers
    response.headers.set(
        "Content-Security-Policy",
        "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' https://fonts.gstatic.com; connect-src 'self' https://generativelanguage.googleapis.com https://*.supabase.co"
    );
    response.headers.set("X-Content-Type-Options", "nosniff");
    response.headers.set("X-Frame-Options", "DENY");
    response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
    response.headers.set("Strict-Transport-Security", "max-age=31536000; includeSubDomains");

    if (pathname.startsWith("/api/")) {
        const workspaceId = request.headers.get("x-workspace-id") || "default_workspace";
        const correlationId = request.headers.get("x-request-correlation-id") || `corr_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;

        // Determine rate limit category based on API endpoint
        let category: RateLimitCategory = "api_general";
        if (pathname.includes("/strategy") || pathname.includes("/reasoning")) {
            category = "llm_request";
        } else if (pathname.includes("/workers") || pathname.includes("/execute")) {
            category = "worker_execution";
        } else if (pathname.includes("/connectors") || pathname.includes("/integrations")) {
            category = "connector_call";
        }

        const rateLimiter = TenantRateLimiter.getInstance();
        const rateResult = rateLimiter.checkRateLimit(workspaceId, category);
        const rateHeaders = rateLimiter.getRateLimitHeaders(rateResult);

        if (!rateResult.allowed) {
            return NextResponse.json(
                {
                    error: "Too Many Requests",
                    message: `Rate limit exceeded for category '${category}' on workspace '${workspaceId}'`,
                    retryAfterSeconds: rateResult.retryAfterSeconds
                },
                {
                    status: 429,
                    headers: {
                        "Content-Type": "application/json",
                        ...rateHeaders
                    }
                }
            );
        }

        response.headers.set("x-workspace-id", workspaceId);
        response.headers.set("x-request-correlation-id", correlationId);
        Object.entries(rateHeaders).forEach(([k, v]) => response.headers.set(k, v));
    }

    const duration = Date.now() - startTime;
    response.headers.set("X-Response-Time", `${duration}ms`);

    return response;
}

export const config = {
    matcher: [
        "/((?!api/auth|api/health|onboarding|_next/static|_next/image|assets|favicon.ico).*)",
    ],
};
