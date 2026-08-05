import type { ExecutionContext, SpawnAgentRequest } from "./types.ts";

export class ContextHydrator {
    hydrateContext(instanceId: string, request: SpawnAgentRequest): ExecutionContext {
        const now = Date.now();

        return {
            instanceId,
            workspaceId: request.workspaceId,
            correlationId: request.correlationId || `corr_runtime_${now}`,
            agentId: `agent_${request.workerRole}_${now}`,
            workerRole: request.workerRole,
            tenantIsolationToken: `tenant_token_${request.workspaceId}_${Math.random().toString(36).substring(2, 8)}`,
            securityProfile: {
                userId: request.userId,
                roles: ["worker_agent", `${request.workerRole}_operator`],
                grantedPermissions: request.grantedPermissions || [
                    `${request.workerRole}.execute`,
                    `${request.workerRole}.read`,
                ],
                maxBudgetPerAction: request.maxBudgetPerAction ?? 50,
                isHighRiskAllowed: false,
            },
            tokenBudget: {
                maxInputTokens: request.maxTokens ? Math.floor(request.maxTokens * 0.75) : 8000,
                maxOutputTokens: request.maxTokens ? Math.floor(request.maxTokens * 0.25) : 2000,
                consumedInputTokens: 0,
                consumedOutputTokens: 0,
            },
            environmentVariables: {
                NODE_ENV: "production",
                WORKSPACE_ID: request.workspaceId,
            },
            createdAt: now,
        };
    }
}
