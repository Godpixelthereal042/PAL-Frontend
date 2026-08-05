/**
 * Enterprise Connector Health Monitor (PAL-TDD-004, PAL-ARCH-DOC-026)
 */

import type { ConnectorHealthStatus, ConnectorStatus, IConnectorProvider } from "./connectorTypes.ts";

export class ConnectorHealthMonitor {
    private healthCache: Map<string, ConnectorHealthStatus> = new Map();

    async checkHealth(provider: IConnectorProvider): Promise<ConnectorHealthStatus> {
        const startTime = performance.now();
        const connectorId = provider.getConnectorId();

        try {
            const healthStatus = await provider.health();
            const latencyMs = Math.round(performance.now() - startTime);

            const updatedStatus: ConnectorHealthStatus = {
                ...healthStatus,
                latencyMs: healthStatus.latencyMs || latencyMs,
                lastCheckedAt: Date.now()
            };

            this.healthCache.set(connectorId, updatedStatus);
            return updatedStatus;
        } catch (err: any) {
            const latencyMs = Math.round(performance.now() - startTime);
            const prev = this.healthCache.get(connectorId);
            const consecutiveFailures = (prev?.consecutiveFailures || 0) + 1;

            const failedStatus: ConnectorHealthStatus = {
                connectorId,
                status: consecutiveFailures >= 3 ? "error" : "degraded",
                latencyMs,
                consecutiveFailures,
                lastCheckedAt: Date.now()
            };

            this.healthCache.set(connectorId, failedStatus);
            return failedStatus;
        }
    }

    getHealthStatus(connectorId: string): ConnectorHealthStatus | undefined {
        return this.healthCache.get(connectorId);
    }
}
