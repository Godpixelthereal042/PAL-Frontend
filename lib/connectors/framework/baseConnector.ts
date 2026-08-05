/**
 * Enterprise Base Connector
 *
 * PAL Milestone 8C — Enterprise Connectivity Framework
 */

import type {
    ConnectorMetadata,
    ConnectorHealth,
    ConnectorAuthCredentials,
    ConnectorEventPayload,
    ConnectorActionResult,
} from "./types.ts";
import { executiveEventBus } from "../../events/executiveEventBus.ts";
import type { ExecutiveEvent } from "../../events/eventTypes.ts";

export abstract class BaseConnector {
    public abstract readonly metadata: ConnectorMetadata;

    protected credentials?: ConnectorAuthCredentials;
    protected health: ConnectorHealth = {
        status: "healthy",
        errorRate: 0,
        quotaUsed: 0,
        quotaLimit: 10000,
    };

    public setCredentials(credentials: ConnectorAuthCredentials): void {
        this.credentials = credentials;
    }

    public getHealth(): ConnectorHealth {
        return this.health;
    }

    public abstract testConnection(): Promise<boolean>;

    public async publishEvent(event: ConnectorEventPayload): Promise<boolean> {
        const execEvent: ExecutiveEvent = {
            id: `evt_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
            type: event.eventType as any,
            severity: "medium",
            businessImpact: `Ingested from ${this.metadata.name}: ${event.eventType}`,
            confidence: 0.95,
            urgency: "medium",
            source: this.metadata.id,
            timestamp: event.timestamp || Date.now(),
            relatedEntities: event.relatedEntities,
            payload: event.payload,
        };

        this.health.lastSyncTimestamp = Date.now();
        this.health.quotaUsed += 1;
        return executiveEventBus.publish(execEvent);
    }

    public abstract executeAction(actionType: string, params: Record<string, any>): Promise<ConnectorActionResult>;
}
