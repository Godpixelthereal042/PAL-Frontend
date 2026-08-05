/**
 * Connector Registry Subsystem
 *
 * PAL Milestone 4A — Integration Framework
 */

import type { Connector, ConnectorMetadata } from "./types.ts";
import { googleCalendarConnectorInstance } from "./connectors/googleCalendarConnector.ts";

export class ConnectorRegistry {
    private connectors: Map<string, Connector> = new Map();

    /**
     * Register a connector instance.
     */
    registerConnector(connector: Connector): void {
        const id = connector.metadata.id;
        const provider = connector.metadata.provider;

        this.connectors.set(id, connector);
        this.connectors.set(provider, connector);
    }

    /**
     * Retrieve a registered connector by connector ID or provider name.
     */
    getConnector(providerOrId: string): Connector | undefined {
        return this.connectors.get(providerOrId);
    }

    /**
     * Returns true if a connector is registered for the provider or ID.
     */
    hasConnector(providerOrId: string): boolean {
        return this.connectors.has(providerOrId);
    }

    /**
     * List metadata of all registered connectors.
     */
    listConnectors(): ConnectorMetadata[] {
        const unique = new Set<Connector>();
        for (const conn of this.connectors.values()) {
            unique.add(conn);
        }
        return Array.from(unique).map((conn) => conn.metadata);
    }

    /**
     * Clear registered connectors (useful for test isolation).
     */
    clear(): void {
        this.connectors.clear();
    }
}

export const globalConnectorRegistry = new ConnectorRegistry();
globalConnectorRegistry.registerConnector(googleCalendarConnectorInstance);
