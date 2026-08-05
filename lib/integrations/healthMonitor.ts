/**
 * Integration Health Monitor
 *
 * PAL Milestone 4A — Integration Framework
 */

import type { Connector, AuthContext, HealthCheckResult } from "./types.ts";

export class HealthMonitor {
    /**
     * Executes a health check against a connector using the supplied authentication context.
     */
    async checkHealth(connector: Connector, authContext: AuthContext): Promise<HealthCheckResult> {
        try {
            return await connector.checkHealth(authContext);
        } catch (err: any) {
            return {
                status: "unhealthy",
                latencyMs: 0,
                message: `Health check exception: ${err.message || "Unknown error"}`,
                checkedAt: Date.now(),
            };
        }
    }
}

export const globalHealthMonitor = new HealthMonitor();
