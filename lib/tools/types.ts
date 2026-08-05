/**
 * PAL Universal Tool & Connector Framework Types (PAL-TDD-003, PAL-ARCH-DOC-019, PAL-ARCH-DOC-020, PAL-ARCH-DOC-025)
 */

import type { ExecutionContext } from "../runtime/types.ts";

export type ToolCategory =
    | "research"
    | "email"
    | "calendar"
    | "crm"
    | "finance"
    | "engineering"
    | "social"
    | "document"
    | "automation";

export interface RetryPolicy {
    maxRetries: number;
    backoffFactorMs: number;
}

export interface ToolContract {
    toolId: string;
    name: string;
    description: string;
    connectorId: string; // e.g. "google_workspace", "stripe"
    category: ToolCategory;
    version: string;
    inputSchema: Record<string, any>; // JSON Schema
    outputSchema: Record<string, any>; // JSON Schema
    requiredPermissions: string[];
    estimatedCostUSD: number;
    timeoutMs: number;
    retryPolicy: RetryPolicy;
    requiresHumanApproval: boolean;
    supportsDryRun: boolean;
    supportsIdempotency: boolean;
}

export interface ToolExecutionRequest {
    toolId: string;
    inputParameters: Record<string, any>;
    context: ExecutionContext;
    isDryRun?: boolean;
    idempotencyKey?: string;
}

export interface ToolExecutionResult {
    toolId: string;
    status: "success" | "dry_run_success" | "permission_denied" | "validation_failed" | "failed";
    outputData: Record<string, any>;
    executionDurationMs: number;
    sanitizedParameters: Record<string, any>;
    errorDetails?: string;
}

export interface IToolRegistry {
    registerTool(contract: ToolContract, handler: (params: Record<string, any>) => Promise<Record<string, any>>): void;
    getTool(toolId: string): ToolContract | undefined;
    listToolsByConnector(connectorId: string): ToolContract[];
    listToolsByCapability(category: ToolCategory, grantedPermissions?: string[]): ToolContract[];
}

export interface IExecutionSandbox {
    executeTool(request: ToolExecutionRequest): Promise<ToolExecutionResult>;
}

export interface OAuthCredentials {
    workspaceId: string;
    connectorId: string;
    accessToken: string;
    refreshToken: string;
    expiresAt: number;
    tokenType: string;
    scope: string;
}

export interface IConnectorDriver {
    getConnectorId(): string;
    getName(): string;
    getSupportedTools(): ToolContract[];
    executeAction(toolId: string, params: Record<string, any>, creds: OAuthCredentials): Promise<Record<string, any>>;
}
