import type { OAuthCredentials } from "../tools/types.ts";

export class OAuthManager {
    private vault: Map<string, OAuthCredentials> = new Map();

    private getVaultKey(workspaceId: string, connectorId: string): string {
        return `${workspaceId}:${connectorId}`;
    }

    async storeCredentials(credentials: OAuthCredentials): Promise<void> {
        const key = this.getVaultKey(credentials.workspaceId, credentials.connectorId);
        this.vault.set(key, { ...credentials });
    }

    async getCredentials(workspaceId: string, connectorId: string): Promise<OAuthCredentials | undefined> {
        const key = this.getVaultKey(workspaceId, connectorId);
        const creds = this.vault.get(key);

        if (!creds) return undefined;

        // Auto-refresh token if expired (or expiring within 30 seconds)
        if (Date.now() >= creds.expiresAt - 30000) {
            return this.refreshAccessToken(creds);
        }

        return creds;
    }

    async refreshAccessToken(creds: OAuthCredentials): Promise<OAuthCredentials> {
        const updated: OAuthCredentials = {
            ...creds,
            accessToken: `refreshed_access_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
            refreshToken: `rotated_refresh_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
            expiresAt: Date.now() + 3600000, // +1 Hour
        };

        await this.storeCredentials(updated);
        return updated;
    }

    async revokeCredentials(workspaceId: string, connectorId: string): Promise<boolean> {
        const key = this.getVaultKey(workspaceId, connectorId);
        return this.vault.delete(key);
    }
}
