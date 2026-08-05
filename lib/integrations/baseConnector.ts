/**
 * Reusable BaseConnector Abstract Class
 *
 * PAL Milestone 4A — Integration Framework
 */

import type {
    Connector,
    ConnectorMetadata,
    AuthContext,
    HealthCheckResult,
    ExecutionRequest,
    ExecutionResponse,
    IntegrationError,
} from "./types.ts";

export abstract class BaseConnector implements Connector {
    abstract metadata: ConnectorMetadata;

    /**
     * Perform operation implementation in concrete subclass connector.
     */
    protected abstract executeOperation(request: ExecutionRequest, authContext: AuthContext): Promise<any>;

    /**
     * Default health check implementation. Subclasses can override.
     */
    async checkHealth(authContext: AuthContext): Promise<HealthCheckResult> {
        const start = Date.now();
        if (authContext.status === "disconnected" || authContext.status === "error") {
            return {
                status: "unhealthy",
                latencyMs: Date.now() - start,
                message: `Connection status is '${authContext.status}'`,
                checkedAt: start,
            };
        }

        if (authContext.tokenExpiresAt && authContext.tokenExpiresAt < start) {
            return {
                status: "degraded",
                latencyMs: Date.now() - start,
                message: "Authentication token has expired and requires refresh",
                checkedAt: start,
            };
        }

        return {
            status: "healthy",
            latencyMs: Date.now() - start,
            message: "Connector operational and authenticated",
            checkedAt: start,
        };
    }

    /**
     * Validates granted scopes against required scopes for the specified operation.
     */
    validatePermissions(operation: string, authContext: AuthContext): { valid: boolean; missingScopes: string[] } {
        const missingScopes: string[] = [];

        for (const scopeDef of this.metadata.requiredScopes) {
            const applies = !scopeDef.requiredForOperations || scopeDef.requiredForOperations.includes(operation);
            if (applies && !authContext.grantedScopes.includes(scopeDef.id)) {
                missingScopes.push(scopeDef.id);
            }
        }

        return {
            valid: missingScopes.length === 0,
            missingScopes,
        };
    }

    /**
     * Standardized execution lifecycle wrapper with error boundary management.
     */
    async execute(request: ExecutionRequest, authContext: AuthContext): Promise<ExecutionResponse> {
        const startTime = Date.now();
        const connectorId = this.metadata.id;

        // 1. Verify operation is supported
        if (!this.metadata.supportedOperations.includes(request.operation)) {
            const error: IntegrationError = {
                code: "UNSUPPORTED_OPERATION",
                message: `Operation '${request.operation}' is not supported by connector '${connectorId}'.`,
                details: { supportedOperations: this.metadata.supportedOperations },
                isRetryable: false,
            };
            return {
                success: false,
                provider: this.metadata.provider,
                connectorId,
                operation: request.operation,
                error,
                executionTimeMs: Date.now() - startTime,
                executedAt: startTime,
            };
        }

        // 2. Validate permissions & scopes
        const permCheck = this.validatePermissions(request.operation, authContext);
        if (!permCheck.valid) {
            const error: IntegrationError = {
                code: "INSUFFICIENT_PERMISSIONS",
                message: `Missing required permission scope(s): ${permCheck.missingScopes.join(", ")}`,
                details: { missingScopes: permCheck.missingScopes },
                isRetryable: false,
            };
            return {
                success: false,
                provider: this.metadata.provider,
                connectorId,
                operation: request.operation,
                error,
                executionTimeMs: Date.now() - startTime,
                executedAt: startTime,
            };
        }

        // 3. Execute operation inside try/catch error boundary
        try {
            const resultData = await this.executeOperation(request, authContext);
            return {
                success: true,
                provider: this.metadata.provider,
                connectorId,
                operation: request.operation,
                data: resultData,
                executionTimeMs: Date.now() - startTime,
                executedAt: startTime,
            };
        } catch (err: any) {
            const error: IntegrationError = {
                code: err.code || "CONNECTOR_EXECUTION_ERROR",
                message: err.message || `Error executing operation '${request.operation}'`,
                details: err.details || null,
                isRetryable: Boolean(err.isRetryable),
            };
            return {
                success: false,
                provider: this.metadata.provider,
                connectorId,
                operation: request.operation,
                error,
                executionTimeMs: Date.now() - startTime,
                executedAt: startTime,
            };
        }
    }
}
