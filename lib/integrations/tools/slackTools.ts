/**
 * Slack Tool Contracts (PAL-TDD-004, PAL-ARCH-DOC-028)
 */

import type { ToolContract } from "../../tools/types.ts";

export const SLACK_TOOLS: ToolContract[] = [
    {
        toolId: "slack.post_message",
        name: "Post Message to Slack Channel",
        description: "Dispatches message payload to Slack channel",
        connectorId: "slack",
        category: "social",
        version: "1.0.0",
        inputSchema: { type: "object" },
        outputSchema: { type: "object" },
        requiredPermissions: ["slack:write"],
        estimatedCostUSD: 0.0005,
        timeoutMs: 5000,
        retryPolicy: { maxRetries: 2, backoffFactorMs: 100 },
        requiresHumanApproval: false,
        supportsDryRun: true,
        supportsIdempotency: false
    }
];
