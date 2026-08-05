/**
 * Enterprise Connector Health Monitor
 *
 * PAL Milestone 8C — Enterprise Connectivity Framework
 */

import type { ConnectorHealth } from "./types.ts";

export class ConnectorHealthMonitor {
    private healthMap: Map<string, ConnectorHealth> = new Map();

    public updateHealth(connectorId: string, health: ConnectorHealth): void {
        this.healthMap.set(connectorId, health);
    }

    public getHealth(connectorId: string): ConnectorHealth {
        return (
            this.healthMap.get(connectorId) || {
                status: "healthy",
                errorRate: 0,
                quotaUsed: 0,
                quotaLimit: 10000,
            }
        );
    }

    public getAllHealth(): Record<string, ConnectorHealth> {
        const result: Record<string, ConnectorHealth> = {};
        for (const [id, health] of this.healthMap.entries()) {
            result[id] = health;
        }
        return result;
    }
}

export const connectorHealthMonitor = new ConnectorHealthMonitor();
