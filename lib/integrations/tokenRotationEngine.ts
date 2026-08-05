/**
 * OAuth 2.0 PKCE & Refresh Token Rotation (RTR) Engine (PAL-TDD-004, PAL-ARCH-DOC-027)
 */

import crypto from "crypto";

export interface PKCEPair {
    codeVerifier: string;
    codeChallenge: string;
    challengeMethod: "S256";
}

export interface OAuthTokenFamily {
    familyId: string;
    workspaceId: string;
    connectorId: string;
    currentTokenId: string;
    revoked: boolean;
    createdAt: number;
}

export interface OAuthTokenPair {
    tokenId: string;
    familyId: string;
    accessToken: string;
    refreshToken: string;
    expiresInSeconds: number;
    obtainedAt: number;
    scopes: string[];
}

export class TokenRotationEngine {
    private tokenFamilies: Map<string, OAuthTokenFamily> = new Map();
    private activeTokens: Map<string, OAuthTokenPair> = new Map();

    generatePKCE(): PKCEPair {
        const codeVerifier = crypto.randomBytes(32).toString("base64url");
        const codeChallenge = crypto.createHash("sha256").update(codeVerifier).digest("base64url");
        return {
            codeVerifier,
            codeChallenge,
            challengeMethod: "S256"
        };
    }

    issueInitialToken(workspaceId: string, connectorId: string, scopes: string[]): OAuthTokenPair {
        const familyId = `fam_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
        const tokenId = `tok_${Date.now()}_1`;
        const accessToken = `access_${crypto.randomBytes(24).toString("hex")}`;
        const refreshToken = `ref_${crypto.randomBytes(24).toString("hex")}`;

        const tokenPair: OAuthTokenPair = {
            tokenId,
            familyId,
            accessToken,
            refreshToken,
            expiresInSeconds: 3600,
            obtainedAt: Date.now(),
            scopes
        };

        const family: OAuthTokenFamily = {
            familyId,
            workspaceId,
            connectorId,
            currentTokenId: tokenId,
            revoked: false,
            createdAt: Date.now()
        };

        this.tokenFamilies.set(familyId, family);
        this.activeTokens.set(tokenId, tokenPair);
        return tokenPair;
    }

    rotateRefreshToken(currentRefreshToken: string): OAuthTokenPair {
        let existingPair: OAuthTokenPair | undefined;
        for (const pair of this.activeTokens.values()) {
            if (pair.refreshToken === currentRefreshToken) {
                existingPair = pair;
                break;
            }
        }

        if (!existingPair) {
            throw new Error("Invalid or expired refresh token");
        }

        const family = this.tokenFamilies.get(existingPair.familyId);
        if (!family || family.revoked) {
            throw new Error("Token family has been revoked due to security violation");
        }

        // Detect Reuse Attack (If presented token is not the latest active token in the family)
        if (family.currentTokenId !== existingPair.tokenId) {
            family.revoked = true;
            throw new Error("Security Alert: Refresh Token reuse detected! Token family revoked immediately.");
        }

        // Issue new token pair in family
        const newTokId = `tok_${Date.now()}_${Math.random().toString(36).substring(2, 5)}`;
        const newAccessToken = `access_${crypto.randomBytes(24).toString("hex")}`;
        const newRefreshToken = `ref_${crypto.randomBytes(24).toString("hex")}`;

        const newTokenPair: OAuthTokenPair = {
            tokenId: newTokId,
            familyId: family.familyId,
            accessToken: newAccessToken,
            refreshToken: newRefreshToken,
            expiresInSeconds: 3600,
            obtainedAt: Date.now(),
            scopes: existingPair.scopes
        };

        family.currentTokenId = newTokId;
        this.activeTokens.set(newTokId, newTokenPair);
        return newTokenPair;
    }

    revokeFamily(familyId: string): void {
        const family = this.tokenFamilies.get(familyId);
        if (family) {
            family.revoked = true;
        }
    }
}
