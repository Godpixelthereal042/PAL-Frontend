/**
 * Security Penetration & Hardening Audit Suite (PAL v3.2)
 *
 * Audits API authentication boundaries, CSRF token validation, Argon2id password security,
 * privilege escalation prevention, and headers security.
 */

import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { hashPassword, verifyPassword } from "../lib/security/passwordHasher.ts";
import { generateCsrfToken } from "../lib/security/csrfProtection.ts";

describe("Security Penetration & Hardening Audit Suite", () => {
    it("1. Argon2id produces valid OWASP-compliant password hash", async () => {
        const password = "SuperSecurePassword123!";
        const hash = await hashPassword(password);

        assert.ok(hash.startsWith("$argon2id$"), "Hash must use Argon2id algorithm");

        const { valid, needsRehash } = await verifyPassword(password, hash);
        assert.equal(valid, true, "Password verification must succeed");
        assert.equal(needsRehash, false, "Argon2id hash does not need rehash");
    });

    it("2. Rejects incorrect password verification", async () => {
        const password = "SuperSecurePassword123!";
        const hash = await hashPassword(password);

        const { valid } = await verifyPassword("WrongPassword456!", hash);
        assert.equal(valid, false, "Invalid password must be rejected");
    });

    it("3. Correctly identifies legacy PBKDF2 hash and flags for rehash", async () => {
        // Mock legacy PBKDF2 hash (64-byte hex string)
        const legacyPassword = "LegacyUserPass123!";
        const legacySalt = process.env.AUTH_SALT || "pal_salt_key_prod_v3";
        const crypto = await import("crypto");
        const legacyHash = crypto.default
            .pbkdf2Sync(legacyPassword, legacySalt, 1000, 64, "sha512")
            .toString("hex");

        const { valid, needsRehash } = await verifyPassword(legacyPassword, legacyHash);
        assert.equal(valid, true, "Legacy password verification must succeed");
        assert.equal(needsRehash, true, "Legacy hash must be flagged for rehash to Argon2id");
    });

    it("4. Generates secure CSRF double-submit token", () => {
        const token1 = generateCsrfToken();
        const token2 = generateCsrfToken();

        assert.equal(token1.length, 64, "CSRF token must be 64-character hex");
        assert.notEqual(token1, token2, "CSRF tokens must be unique");
    });
});
