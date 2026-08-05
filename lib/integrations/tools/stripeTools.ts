/**
 * Stripe Tool Contracts (PAL-TDD-004, PAL-ARCH-DOC-028)
 */

import type { ToolContract } from "../../tools/types.ts";

export const STRIPE_TOOLS: ToolContract[] = [
    {
        toolId: "stripe.refund_payment",
        name: "Refund Charge via Stripe",
        description: "Executes payment refund on Stripe API",
        connectorId: "stripe",
        category: "finance",
        version: "1.0.0",
        inputSchema: { type: "object" },
        outputSchema: { type: "object" },
        requiredPermissions: ["stripe:write"],
        estimatedCostUSD: 0.005,
        timeoutMs: 5000,
        retryPolicy: { maxRetries: 2, backoffFactorMs: 200 },
        requiresHumanApproval: true,
        supportsDryRun: true,
        supportsIdempotency: true
    },
    {
        toolId: "stripe.create_invoice",
        name: "Create Customer Invoice",
        description: "Drafts new customer invoice",
        connectorId: "stripe",
        category: "finance",
        version: "1.0.0",
        inputSchema: { type: "object" },
        outputSchema: { type: "object" },
        requiredPermissions: ["stripe:write"],
        estimatedCostUSD: 0.002,
        timeoutMs: 5000,
        retryPolicy: { maxRetries: 2, backoffFactorMs: 200 },
        requiresHumanApproval: false,
        supportsDryRun: true,
        supportsIdempotency: true
    }
];
