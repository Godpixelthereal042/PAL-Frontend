/**
 * HubSpot Tool Contracts (PAL-TDD-004, PAL-ARCH-DOC-028)
 */

import type { ToolContract } from "../../tools/types.ts";

export const HUBSPOT_TOOLS: ToolContract[] = [
    {
        toolId: "hubspot.create_lead",
        name: "Create CRM Lead",
        description: "Creates new lead contact in HubSpot CRM",
        connectorId: "hubspot",
        category: "crm",
        version: "1.0.0",
        inputSchema: { type: "object" },
        outputSchema: { type: "object" },
        requiredPermissions: ["crm:write"],
        estimatedCostUSD: 0.001,
        timeoutMs: 5000,
        retryPolicy: { maxRetries: 2, backoffFactorMs: 100 },
        requiresHumanApproval: false,
        supportsDryRun: true,
        supportsIdempotency: true
    }
];
