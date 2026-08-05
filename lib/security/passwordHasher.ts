/**
 * Argon2id Password Hashing & Migration Utility (PAL v3.1)
 *
 * Implements OWASP-compliant Argon2id password hashing and transparent
 * one-way migration for legacy PBKDF2 password hashes.
 */

import argon2 from "argon2";
import crypto from "crypto";

const LEGACY_SALT = process.env.AUTH_SALT || "pal_salt_key_prod_v3";

/**
 * Hash a plain password using Argon2id.
 */
export async function hashPassword(password: string): Promise<string> {
    return argon2.hash(password, {
        type: argon2.argon2id,
        memoryCost: 2 ** 16, // 64 MB
        timeCost: 3,
        parallelism: 1,
    });
}

/**
 * Verify a password against a stored hash (Argon2id or legacy PBKDF2).
 * Returns `needsRehash: true` if the password matched a legacy PBKDF2 hash
 * and should be updated to Argon2id in the database.
 */
export async function verifyPassword(
    password: string,
    storedHash: string
): Promise<{ valid: boolean; needsRehash: boolean }> {
    if (!storedHash) {
        return { valid: false, needsRehash: false };
    }

    // Argon2 hash format starts with $argon2
    if (storedHash.startsWith("$argon2")) {
        try {
            const valid = await argon2.verify(storedHash, password);
            return { valid, needsRehash: false };
        } catch (err) {
            console.error("Argon2 verification error:", err);
            return { valid: false, needsRehash: false };
        }
    }

    // Legacy PBKDF2 hash verification
    const legacyCalculated = crypto
        .pbkdf2Sync(password, LEGACY_SALT, 1000, 64, "sha512")
        .toString("hex");

    if (crypto.timingSafeEqual(Buffer.from(legacyCalculated), Buffer.from(storedHash))) {
        return { valid: true, needsRehash: true };
    }

    return { valid: false, needsRehash: false };
}
