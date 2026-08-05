import { ToolRegistry } from "./toolRegistry.ts";
import type { IExecutionSandbox, ToolExecutionRequest, ToolExecutionResult } from "./types.ts";

export class ExecutionSandbox implements IExecutionSandbox {
    private registry: ToolRegistry;

    constructor(registry?: ToolRegistry) {
        this.registry = registry || new ToolRegistry();
    }

    async executeTool(request: ToolExecutionRequest): Promise<ToolExecutionResult> {
        const startTime = Date.now();
        const contract = this.registry.getTool(request.toolId);

        if (!contract) {
            return {
                toolId: request.toolId,
                status: "failed",
                outputData: {},
                executionDurationMs: Date.now() - startTime,
                sanitizedParameters: this.redactSecrets(request.inputParameters),
                errorDetails: `Tool '${request.toolId}' not found in registry`,
            };
        }

        // 1. Validate JSON Schema parameters
        const validation = this.registry.validateParameters(contract, request.inputParameters);
        if (!validation.isValid) {
            return {
                toolId: request.toolId,
                status: "validation_failed",
                outputData: {},
                executionDurationMs: Date.now() - startTime,
                sanitizedParameters: this.redactSecrets(request.inputParameters),
                errorDetails: validation.error,
            };
        }

        // 2. Sprint 2 Permission & Quota Verification
        const grantedPerms = request.context.securityProfile.grantedPermissions || [];
        const hasPermission = contract.requiredPermissions.every((p) => grantedPerms.includes(p));

        if (!hasPermission) {
            return {
                toolId: request.toolId,
                status: "permission_denied",
                outputData: {},
                executionDurationMs: Date.now() - startTime,
                sanitizedParameters: this.redactSecrets(request.inputParameters),
                errorDetails: `Security Policy Block: Missing required permission(s) [${contract.requiredPermissions.join(", ")}]`,
            };
        }

        // Action Budget Cap Check
        if (contract.estimatedCostUSD > request.context.securityProfile.maxBudgetPerAction) {
            return {
                toolId: request.toolId,
                status: "permission_denied",
                outputData: {},
                executionDurationMs: Date.now() - startTime,
                sanitizedParameters: this.redactSecrets(request.inputParameters),
                errorDetails: `Governance Limit Block: Tool estimated cost ($${contract.estimatedCostUSD}) exceeds budget cap ($${request.context.securityProfile.maxBudgetPerAction})`,
            };
        }

        // 3. Secret Redaction on Parameters
        const sanitizedParams = this.redactSecrets(request.inputParameters);

        // 4. Dry Run Mode Handling
        if (request.isDryRun || !contract.supportsDryRun && request.isDryRun) {
            return {
                toolId: request.toolId,
                status: "dry_run_success",
                outputData: {
                    simulated: true,
                    message: `[DRY-RUN SIMULATION] Would invoke tool '${contract.name}' (${contract.connectorId}) with parameters`,
                    parameters: sanitizedParams,
                },
                executionDurationMs: Date.now() - startTime,
                sanitizedParameters: sanitizedParams,
            };
        }

        // 5. Execute Sandboxed Handler
        const handler = this.registry.getHandler(request.toolId);
        if (!handler) {
            return {
                toolId: request.toolId,
                status: "failed",
                outputData: {},
                executionDurationMs: Date.now() - startTime,
                sanitizedParameters: sanitizedParams,
                errorDetails: `Tool handler for '${request.toolId}' is missing`,
            };
        }

        try {
            const rawOutput = await handler(request.inputParameters);
            const sanitizedOutput = this.redactSecrets(rawOutput);

            return {
                toolId: request.toolId,
                status: "success",
                outputData: sanitizedOutput,
                executionDurationMs: Date.now() - startTime,
                sanitizedParameters: sanitizedParams,
            };
        } catch (err: any) {
            return {
                toolId: request.toolId,
                status: "failed",
                outputData: {},
                executionDurationMs: Date.now() - startTime,
                sanitizedParameters: sanitizedParams,
                errorDetails: err?.message || String(err),
            };
        }
    }

    private redactSecrets(obj: Record<string, any>): Record<string, any> {
        if (!obj || typeof obj !== "object") return obj;

        const secretKeys = ["password", "token", "secret", "apikey", "access_token", "refresh_token", "credit_card"];
        const sanitized: Record<string, any> = {};

        for (const [key, value] of Object.entries(obj)) {
            const lowerKey = key.toLowerCase();
            if (secretKeys.some((s) => lowerKey.includes(s))) {
                sanitized[key] = "[REDACTED_SECRET]";
            } else if (typeof value === "object" && value !== null) {
                sanitized[key] = this.redactSecrets(value);
            } else {
                sanitized[key] = value;
            }
        }

        return sanitized;
    }
}
