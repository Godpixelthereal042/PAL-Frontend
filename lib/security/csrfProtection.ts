/**
 * CSRF Protection Utility (PAL v3.1)
 *
 * Provides double-submit cookie pattern CSRF token generation and verification
 * for all mutating HTTP requests (POST, PUT, DELETE, PATCH).
 */

import crypto from "crypto";

export interface RequestLike {
    method: string;
    headers: { get(name: string): string | null };
    cookies: { get(name: string): { value: string } | undefined };
}

export const CSRF_HEADER_NAME = "x-csrf-token";
export const CSRF_COOKIE_NAME = "pal_csrf_token";

/**
 * Generate a cryptographically secure CSRF token.
 */
export function generateCsrfToken(): string {
    return crypto.randomBytes(32).toString("hex");
}

/**
 * Verify CSRF token from request headers against cookie value.
 * Mutating requests (POST, PUT, DELETE, PATCH) must present a matching header token.
 */
export function verifyCsrfToken(request: RequestLike): { valid: boolean; error?: string } {
    const method = request.method.toUpperCase();
    
    // Read-only requests do not require CSRF token
    if (["GET", "HEAD", "OPTIONS"].includes(method)) {
        return { valid: true };
    }

    const headerToken = request.headers.get(CSRF_HEADER_NAME);
    const cookieToken = request.cookies.get(CSRF_COOKIE_NAME)?.value;

    if (!headerToken) {
        return { valid: false, error: "Missing X-CSRF-Token header" };
    }

    if (!cookieToken) {
        return { valid: false, error: "Missing pal_csrf_token cookie" };
    }

    // Timing-safe token comparison
    try {
        const headerBuf = Buffer.from(headerToken);
        const cookieBuf = Buffer.from(cookieToken);

        if (headerBuf.length !== cookieBuf.length || !crypto.timingSafeEqual(headerBuf, cookieBuf)) {
            return { valid: false, error: "CSRF token mismatch" };
        }
    } catch (e) {
        return { valid: false, error: "Invalid CSRF token format" };
    }

    return { valid: true };
}
