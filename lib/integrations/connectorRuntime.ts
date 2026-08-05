/**
 * Enterprise Connector Runtime Engine (PAL-TDD-004, PAL-ARCH-DOC-026)
 */

import { ConnectorHealthMonitor } from "./connectorHealth.ts";
import { ConnectorManager } from "./connectorManager.ts";
import type {
    ConnectionState,
    ConnectorConnectionConfig,
    ConnectorHealthStatus,
    IConnectorProvider,
    TokenRefreshResult
} from "./connectorTypes.ts";
import type { ExecutionContext } from "../runtime/types.ts";
import type { ToolContract } from "../tools/types.ts";

export class ConnectorRuntime {
    private manager: ConnectorManager;
    private healthMonitor: ConnectorHealthMonitor;

    constructor(manager?: ConnectorManager, healthMonitor?: ConnectorHealthMonitor) {
        this.manager = manager || new ConnectorManager();
        this.healthMonitor = healthMonitor || new ConnectorHealthMonitor();
    }

    registerProvider(provider: IConnectorProvider): void {
        this.manager.registerDriver(provider);
    }

    getConnectorManager(): ConnectorManager {
        return this.manager;
    }

    getHealthMonitor(): ConnectorHealthMonitor {
        return this.healthMonitor;
    }

    async connect(config: ConnectorConnectionConfig): Promise<ConnectionState> {
        return this.manager.connectConnector(config);
    }

    async disconnect(workspaceId: string, connectorId: string): Promise<void> {
        return this.manager.disconnectConnector(workspaceId, connectorId);
    }

    async executeTool(
        connectorId: string,
        toolId: string,
        params: Record<string, any>,
        context: ExecutionContext
    ): Promise<Record<string, any>> {
        const provider = this.manager.getDriver(connectorId);
        if (!provider) {
            throw new Error(`Connector '${connectorId}' is not registered in ConnectorRuntime`);
        }

        return provider.executeTool(toolId, params, context);
    }

    async checkHealth(connectorId: string): Promise<ConnectorHealthStatus> {
        const provider = this.manager.getDriver(connectorId);
        if (!provider) {
            return {
                connectorId,
                status: "disconnected",
                latencyMs: 0,
                consecutiveFailures: 0,
                lastCheckedAt: Date.now()
            };
        }

        return this.healthMonitor.checkHealth(provider);
    }

    async autoReconnect(workspaceId: string, connectorId: string): Promise<TokenRefreshResult> {
        const provider = this.manager.getDriver(connectorId);
        if (!provider) {
            return { success: false, errorDetails: `Provider '${connectorId}' not found` };
        }

        const refreshResult = await provider.refresh();
        if (refreshResult.success) {
            const existingState = this.manager.getConnectionState(workspaceId, connectorId);
            if (existingState) {
                existingState.status = "connected";
                existingState.lastPingAt = Date.now();
            }
        }
        return refreshResult;
    }

    discoverTools(): ToolContract[] {
        return this.manager.discoverAllTools();
    }
}
