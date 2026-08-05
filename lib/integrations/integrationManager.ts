/**
 * Central Integration Manager Orchestrator Facade
 *
 * PAL Milestone 4A — Integration Framework
 *
 * Provides the unified execution entry point for all external connectors.
 * Enforces isolation, audit logging, permission checks, and error boundaries.
 */

import { ConnectorRegistry, globalConnectorRegistry } from "./registry.ts";
import { IntegrationAuthManager, globalAuthManager } from "./authManager.ts";
import { PermissionValidator, globalPermissionValidator } from "./permissionModel.ts";
import { HealthMonitor, globalHealthMonitor } from "./healthMonitor.ts";
import { IntegrationAuditLogger, globalAuditLogger } from "./auditLogger.ts";
import type {
    ExecutionRequest,
    ExecutionResponse,
    HealthCheckResult,
    ConnectorMetadata,
    AuthContext,
    IntegrationError,
} from "./types.ts";

export class IntegrationManager {
    private registry: ConnectorRegistry;
    private authManager: IntegrationAuthManager;
    private permissionValidator: PermissionValidator;
    private healthMonitor: HealthMonitor;
    private auditLogger: IntegrationAuditLogger;

    constructor(
        registry: ConnectorRegistry = globalConnectorRegistry,
        authManager: IntegrationAuthManager = globalAuthManager,
        permissionValidator: PermissionValidator = globalPermissionValidator,
        healthMonitor: HealthMonitor = globalHealthMonitor,
        auditLogger: IntegrationAuditLogger = globalAuditLogger
    ) {
        this.registry = registry;
        this.authManager = authManager;
        this.permissionValidator = permissionValidator;
        this.healthMonitor = healthMonitor;
        this.auditLogger = auditLogger;
    }

    /**
     * Executes a connector operation deterministically with authentication, permission validation,
     * error boundary wrapping, and audit logging.
     */
    async executeConnector(request: ExecutionRequest): Promise<ExecutionResponse> {
        const startTime = Date.now();
        const provider = request.provider;
        const targetConnectorId = request.connectorId || provider;
        const userId = request.userId || "current_user";

        // 1. Resolve connector from registry
        const connector = this.registry.getConnector(targetConnectorId);
        if (!connector) {
            const error: IntegrationError = {
                code: "CONNECTOR_NOT_FOUND",
                message: `No connector registered for provider/id '${targetConnectorId}'.`,
                isRetryable: false,
            };
            const response: ExecutionResponse = {
                success: false,
                provider,
                connectorId: targetConnectorId,
                operation: request.operation,
                error,
                executionTimeMs: Date.now() - startTime,
                executedAt: startTime,
            };

            await this.auditLogger.logExecution({
                provider,
                connectorId: targetConnectorId,
                userId,
                operation: request.operation,
                status: "error",
                requestPayload: JSON.stringify(request.params),
                errorMessage: error.message,
                executionTimeMs: response.executionTimeMs,
            });

            return response;
        }

        // 2. Fetch user authentication context
        const authContext = await this.authManager.getAuthContext(userId, connector.metadata.provider);

        // 3. Evaluate permission model
        const permResult = this.permissionValidator.validateOperation(connector, request.operation, authContext);
        if (!permResult.valid) {
            const error: IntegrationError = {
                code: "UNAUTHORIZED",
                message: permResult.errors.join("; "),
                details: { missingScopes: permResult.missingScopes },
                isRetryable: false,
            };
            const response: ExecutionResponse = {
                success: false,
                provider: connector.metadata.provider,
                connectorId: connector.metadata.id,
                operation: request.operation,
                error,
                executionTimeMs: Date.now() - startTime,
                executedAt: startTime,
            };

            await this.auditLogger.logExecution({
                integrationId: authContext.integrationId,
                provider: connector.metadata.provider,
                connectorId: connector.metadata.id,
                userId,
                operation: request.operation,
                status: "unauthorized",
                requestPayload: JSON.stringify(request.params),
                errorMessage: error.message,
                executionTimeMs: response.executionTimeMs,
            });

            return response;
        }

        // 4. Execute connector operation
        const response = await connector.execute(request, authContext);

        // 5. Audit log execution result
        await this.auditLogger.logExecution({
            integrationId: authContext.integrationId,
            provider: connector.metadata.provider,
            connectorId: connector.metadata.id,
            userId,
            operation: request.operation,
            status: response.success ? "success" : "error",
            requestPayload: JSON.stringify(request.params),
            responsePayload: response.data ? JSON.stringify(response.data) : undefined,
            errorMessage: response.error?.message,
            executionTimeMs: response.executionTimeMs,
        });

        return response;
    }

    /**
     * Inspect health status for a specific provider.
     */
    async getConnectorHealth(userId: string, provider: string): Promise<HealthCheckResult> {
        const connector = this.registry.getConnector(provider);
        if (!connector) {
            return {
                status: "unhealthy",
                latencyMs: 0,
                message: `No connector registered for provider '${provider}'`,
                checkedAt: Date.now(),
            };
        }

        const authContext = await this.authManager.getAuthContext(userId, connector.metadata.provider);
        return this.healthMonitor.checkHealth(connector, authContext);
    }

    /**
     * List all registered connectors.
     */
    listAvailableConnectors(): ConnectorMetadata[] {
        return this.registry.listConnectors();
    }
}

export const globalIntegrationManager = new IntegrationManager();
