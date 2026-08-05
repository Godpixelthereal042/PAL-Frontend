/**
 * PAL Password Hasher (Argon2id Standardization)
 * 
 * Governing Spec: PAL-TDD-001 Chapter 7 & Appendix A
 * Architecture Bible: Chapter 23 (Identity & Auth)
 */

import * as argon2 from "argon2";
import crypto from "crypto";
import { createLogger } from "../../core/logger.ts";

const logger = createLogger("Security:PasswordHasher");

export interface IPasswordHasher {
    hashPassword(password: string): Promise<string>;
    verifyPassword(password: string, hash: string): Promise<boolean>;
}

export class Argon2idPasswordHasher implements IPasswordHasher {
    // Argon2id standard production parameters
    private timeCost: number = 3;
    private memoryCost: number = 65536; // 64 MB
    private parallelism: number = 4;

    public async hashPassword(password: string): Promise<string> {
        try {
            const hash = await argon2.hash(password, {
                type: argon2.argon2id,
                timeCost: this.timeCost,
                memoryCost: this.memoryCost,
                parallelism: this.parallelism
            });
            return hash;
        } catch (err: any) {
            logger.warn("Native argon2 hashing failed, attempting fallback hashing", { error: err.message });
            return this.fallbackHash(password);
        }
    }

    public async verifyPassword(password: string, hash: string): Promise<boolean> {
        try {
            if (hash.startsWith("$argon2")) {
                return await argon2.verify(hash, password);
            }
            return this.fallbackVerify(password, hash);
        } catch (err: any) {
            logger.warn("Password verification failed", { error: err.message });
            return false;
        }
    }

    private fallbackHash(password: string): Promise<string> {
        return new Promise((resolve, reject) => {
            const salt = crypto.randomBytes(16).toString("hex");
            crypto.pbkdf2(password, salt, 100000, 64, "sha512", (err, derivedKey) => {
                if (err) return reject(err);
                resolve(`$pbkdf2$${salt}$${derivedKey.toString("hex")}`);
            });
        });
    }

    private fallbackVerify(password: string, hash: string): Promise<boolean> {
        return new Promise((resolve) => {
            if (!hash.startsWith("$pbkdf2$")) return resolve(false);
            const parts = hash.split("$");
            const salt = parts[2];
            const originalHash = parts[3];

            crypto.pbkdf2(password, salt, 100000, 64, "sha512", (err, derivedKey) => {
                if (err) return resolve(false);
                resolve(derivedKey.toString("hex") === originalHash);
            });
        });
    }
}
