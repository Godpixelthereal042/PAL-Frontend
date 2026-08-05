import { test, describe } from "node:test";
import assert from "node:assert";
import { Argon2idPasswordHasher } from "../lib/security/auth/passwordHasher.ts";
import { JWTTokenProvider } from "../lib/security/providers/tokenProvider.ts";
import { MemoryCacheProvider, RedisCacheProvider } from "../lib/security/providers/cacheProvider.ts";
import { SessionManager } from "../lib/security/sessions/sessionManager.ts";
import { AuthService } from "../lib/security/auth/authService.ts";

describe("Milestone 2: Provider Abstractions & Authentication Engine", () => {
    test("Argon2idPasswordHasher hashes and verifies passwords securely", async () => {
        const hasher = new Argon2idPasswordHasher();
        const password = "P@ssword123!";
        const hash = await hasher.hashPassword(password);

        assert.strictEqual(typeof hash, "string");
        assert.strictEqual(hash.length > 20, true);

        const isValid = await hasher.verifyPassword(password, hash);
        assert.strictEqual(isValid, true);

        const isInvalid = await hasher.verifyPassword("WrongPassword", hash);
        assert.strictEqual(isInvalid, false);
    });

    test("JWTTokenProvider generates and verifies 15-minute access tokens", async () => {
        const tokenProvider = new JWTTokenProvider("test-secret-key-12345", 900);
        const payload = {
            sub: "user_test_jwt",
            workspaceId: "ws_test_jwt",
            email: "test@example.com",
            roles: ["Founder"],
            permissions: ["*"],
            sessionId: "sess_jwt_1",
            correlationId: "corr_jwt_1"
        };

        const token = await tokenProvider.generateAccessToken(payload);
        assert.strictEqual(typeof token, "string");

        const verified = await tokenProvider.verifyAccessToken(token);
        assert.strictEqual(verified.sub, payload.sub);
        assert.strictEqual(verified.workspaceId, payload.workspaceId);
        assert.strictEqual(verified.email, payload.email);
        assert.strictEqual(verified.roles[0], "Founder");
    });

    test("MemoryCacheProvider & RedisCacheProvider handle TTL caching", async () => {
        const memoryCache = new MemoryCacheProvider();
        await memoryCache.set("key1", { data: "test_val" }, 10);
        const val = await memoryCache.get("key1");
        assert.deepStrictEqual(val, { data: "test_val" });

        const exists = await memoryCache.has("key1");
        assert.strictEqual(exists, true);

        await memoryCache.del("key1");
        const valAfterDel = await memoryCache.get("key1");
        assert.strictEqual(valAfterDel, null);

        const redisCache = new RedisCacheProvider();
        await redisCache.set("key2", "redis_val", 5);
        const redisVal = await redisCache.get("key2");
        assert.strictEqual(redisVal, "redis_val");
    });

    test("SessionManager & Refresh Token Rotation (RTR)", async () => {
        const sessionManager = new SessionManager();
        const session = await sessionManager.createSession({
            userId: "usr_rtr_1",
            workspaceId: "ws_rtr_1",
            device: "MacBook Pro"
        });

        assert.strictEqual(session.user_id, "usr_rtr_1");
        assert.strictEqual(session.status, "active");

        // Rotate token
        const refreshResult = await sessionManager.refreshSessionToken(session.refresh_token);
        assert.strictEqual(refreshResult.userId, "usr_rtr_1");
        assert.notStrictEqual(refreshResult.newRefreshToken, session.refresh_token);

        // Verify old session status is revoked
        const oldSession = await sessionManager.validateSession(session.id).catch(err => err);
        assert.strictEqual(oldSession.name, "UnauthorizedError");
    });

    test("AuthService User Registration & Login Flow", async () => {
        const authService = new AuthService();
        const uniqueEmail = `user_${Date.now()}@example.com`;
        const registerParams = {
            email: uniqueEmail,
            password: "SecurePassword123!",
            fullName: "Alice Founder",
            workspaceName: "Acme Corp"
        };

        const regResponse = await authService.register(registerParams);
        assert.strictEqual(regResponse.user.email, uniqueEmail);
        assert.strictEqual(regResponse.user.roles[0], "Founder");
        assert.strictEqual(typeof regResponse.accessToken, "string");
        assert.strictEqual(typeof regResponse.refreshToken, "string");

        // Login with same credentials
        const loginResponse = await authService.login({
            email: uniqueEmail,
            password: "SecurePassword123!"
        });

        assert.strictEqual(loginResponse.user.email, uniqueEmail);
        assert.strictEqual(typeof loginResponse.accessToken, "string");

        // Token Refresh Flow
        const refreshed = await authService.refresh(loginResponse.refreshToken);
        assert.strictEqual(refreshed.user.email, uniqueEmail);
        assert.strictEqual(typeof refreshed.accessToken, "string");
    });
});
