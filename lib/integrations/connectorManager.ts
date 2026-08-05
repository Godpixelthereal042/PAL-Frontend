/**
 * Enterprise Connector Manager & Driver Registry (PAL-TDD-004, PAL-ARCH-DOC-026)
 */

import type { ConnectionState, ConnectorConnectionConfig, IConnectorProvider } from "./connectorTypes.ts";
import type { ToolContract } from "../tools/types.ts";

export class ConnectorManager {
    private drivers: Map<string, IConnectorProvider> = new Map();
    private activeConnections: Map<string, ConnectionState> = new Map();

    registerDriver(driver: IConnectorProvider): void {
        this.drivers.set(driver.getConnectorId(), driver);
    }

    getDriver(connectorId: string): IConnectorProvider | undefined {
        return this.drivers.get(connectorId);
    }

    listDrivers(): IConnectorProvider[] {
        return Array.from(this.drivers.values());
    }

    async connectConnector(config: ConnectorConnectionConfig): Promise<ConnectionState> {
        const driver = this.drivers.get(config.connectorId);
        if (!driver) {
            throw new Error(`Connector driver '${config.connectorId}' is not registered`);
        }

        const state = await driver.connect(config);
        const connectionKey = `${config.workspaceId}:${config.connectorId}`;
        this.activeConnections.set(connectionKey, state);
        return state;
    }

    async disconnectConnector(workspaceId: string, connectorId: string): Promise<void> {
        const driver = this.drivers.get(connectorId);
        if (driver) {
            await driver.disconnect();
        }
        const connectionKey = `${workspaceId}:${connectorId}`;
        this.activeConnections.delete(connectionKey);
    }

    getConnectionState(workspaceId: string, connectorId: string): ConnectionState | undefined {
        return this.activeConnections.get(`${workspaceId}:${connectorId}`);
    }

    discoverAllTools(): ToolContract[] {
        const tools: ToolContract[] = [];
        for (const driver of this.drivers.values()) {
            tools.push(...driver.discoverTools());
        }
        return tools;
    }
}
