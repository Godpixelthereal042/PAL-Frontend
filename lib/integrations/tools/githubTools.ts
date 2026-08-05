/**
 * GitHub Tool Contracts (PAL-TDD-004, PAL-ARCH-DOC-028)
 */

import type { ToolContract } from "../../tools/types.ts";

export const GITHUB_TOOLS: ToolContract[] = [
    {
        toolId: "github.create_issue",
        name: "Create GitHub Issue",
        description: "Opens a new issue in a GitHub repository",
        connectorId: "github",
        category: "engineering",
        version: "1.0.0",
        inputSchema: { type: "object" },
        outputSchema: { type: "object" },
        requiredPermissions: ["github:write"],
        estimatedCostUSD: 0.001,
        timeoutMs: 5000,
        retryPolicy: { maxRetries: 3, backoffFactorMs: 150 },
        requiresHumanApproval: false,
        supportsDryRun: true,
        supportsIdempotency: false
    },
    {
        toolId: "github.create_pr",
        name: "Open Pull Request",
        description: "Creates pull request across branches",
        connectorId: "github",
        category: "engineering",
        version: "1.0.0",
        inputSchema: { type: "object" },
        outputSchema: { type: "object" },
        requiredPermissions: ["github:write"],
        estimatedCostUSD: 0.001,
        timeoutMs: 5000,
        retryPolicy: { maxRetries: 3, backoffFactorMs: 150 },
        requiresHumanApproval: false,
        supportsDryRun: true,
        supportsIdempotency: false
    }
];
