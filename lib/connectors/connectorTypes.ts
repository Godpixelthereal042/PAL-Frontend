/**
 * Client-safe Connector Data Types (PAL v3.3)
 */

export type ConnectorProvider = "Stripe" | "Google_Workspace" | "Slack" | "GitHub";
export type SyncStatus = "CONNECTED" | "SYNCING" | "ERROR" | "DISCONNECTED";

export interface LiveConnectorStatus {
    provider: ConnectorProvider;
    status: SyncStatus;
    lastSyncedTimestamp: number;
    recordsProcessedCount: number;
    healthScorePct: number;
    errorMessage?: string;
    accountName?: string;
}
