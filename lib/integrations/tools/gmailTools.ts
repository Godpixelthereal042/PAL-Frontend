/**
 * Gmail Tool Contracts (PAL-TDD-004, PAL-ARCH-DOC-028)
 */

import type { ToolContract } from "../../tools/types.ts";

export const GMAIL_TOOLS: ToolContract[] = [
    {
        toolId: "google_workspace.send_email",
        name: "Send Email via Gmail",
        description: "Dispatches email message via Gmail REST API",
        connectorId: "gmail",
        category: "email",
        version: "1.0.0",
        inputSchema: { type: "object" },
        outputSchema: { type: "object" },
        requiredPermissions: ["email.send"],
        estimatedCostUSD: 0.001,
        timeoutMs: 5000,
        retryPolicy: { maxRetries: 3, backoffFactorMs: 100 },
        requiresHumanApproval: false,
        supportsDryRun: true,
        supportsIdempotency: true
    },
    {
        toolId: "google_workspace.read_messages",
        name: "Read Inbox Messages",
        description: "Fetches unread messages from Gmail inbox",
        connectorId: "gmail",
        category: "email",
        version: "1.0.0",
        inputSchema: { type: "object" },
        outputSchema: { type: "object" },
        requiredPermissions: ["email.read"],
        estimatedCostUSD: 0.0005,
        timeoutMs: 5000,
        retryPolicy: { maxRetries: 2, backoffFactorMs: 100 },
        requiresHumanApproval: false,
        supportsDryRun: true,
        supportsIdempotency: false
    }
];
