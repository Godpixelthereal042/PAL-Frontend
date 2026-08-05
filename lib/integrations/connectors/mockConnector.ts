/**
 * Mock Connector for Framework Validation
 *
 * PAL Milestone 4A — Integration Framework
 */

import { BaseConnector } from "../baseConnector.ts";
import type { ConnectorMetadata, ExecutionRequest, AuthContext } from "../types.ts";

export class MockConnector extends BaseConnector {
    metadata: ConnectorMetadata = {
        id: "mock_connector",
        provider: "mock",
        name: "Mock Validation Connector",
        version: "1.0.0",
        description: "Placeholder connector for validating Integration Framework infrastructure",
        supportedOperations: ["ping", "echo", "simulate_error"],
        requiredScopes: [
            {
                id: "read:mock",
                name: "Read Mock Data",
                description: "Permission to perform read operations",
                requiredForOperations: ["ping", "echo"],
            },
            {
                id: "write:mock",
                name: "Write Mock Data",
                description: "Permission to perform write operations",
                requiredForOperations: ["simulate_error"],
            },
        ],
    };

    protected async executeOperation(request: ExecutionRequest, authContext: AuthContext): Promise<any> {
        switch (request.operation) {
            case "ping":
                return {
                    pong: true,
                    timestamp: Date.now(),
                    provider: this.metadata.provider,
                    userId: authContext.userId,
                };

            case "echo":
                return {
                    echo: request.params,
                    userId: authContext.userId,
                    receivedAt: Date.now(),
                };

            case "simulate_error":
                throw new Error("Simulated connector exception for testing error boundary handling.");

            default:
                throw new Error(`Unhandled mock operation '${request.operation}'.`);
        }
    }
}

export const mockConnectorInstance = new MockConnector();
