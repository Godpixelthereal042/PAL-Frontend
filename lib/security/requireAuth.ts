/**
 * Authentication Guard — requireAuth() helper (PAL v3.1)
 *
 * Centralized auth check for all protected API routes.
 * Returns the authenticated user session or throws with proper HTTP status.
 */

import { getCurrentUser, type UserSession } from "../auth";

export class AuthError extends Error {
    public statusCode: number;
    constructor(message: string, statusCode: number = 401) {
        super(message);
        this.name = "AuthError";
        this.statusCode = statusCode;
    }
}

/**
 * Require an authenticated user. Throws AuthError if not authenticated.
 * Use in API routes:
 *
 *   const user = await requireAuth();
 *   const workspace = await getWorkspaceForUser(user.id);
 */
export async function requireAuth(): Promise<UserSession> {
    const user = await getCurrentUser();
    if (!user) {
        throw new AuthError("Unauthorized — valid session required", 401);
    }
    return user;
}

/**
 * Require an authenticated user with a specific role.
 */
export async function requireRole(roles: string[]): Promise<UserSession> {
    const user = await requireAuth();
    if (!roles.includes(user.role)) {
        throw new AuthError(`Forbidden — requires role: ${roles.join(" or ")}`, 403);
    }
    return user;
}
