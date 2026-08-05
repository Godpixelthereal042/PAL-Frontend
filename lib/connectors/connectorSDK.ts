import type { IConnectorDriver, OAuthCredentials, ToolContract } from "../tools/types.ts";

export class GoogleWorkspaceConnector implements IConnectorDriver {
    getConnectorId(): string {
        return "google_workspace";
    }

    getName(): string {
        return "Google Workspace Connector";
    }

    getSupportedTools(): ToolContract[] {
        return [
            {
                toolId: "google_workspace.send_email",
                name: "Send Email",
                description: "Sends an outbound email via Gmail REST API",
                connectorId: this.getConnectorId(),
                category: "email",
                version: "1.0.0",
                inputSchema: {
                    type: "object",
                    required: ["to", "subject", "body"],
                    properties: {
                        to: { type: "string" },
                        subject: { type: "string" },
                        body: { type: "string" },
                    },
                },
                outputSchema: { type: "object" },
                requiredPermissions: ["email.send"],
                estimatedCostUSD: 0.001,
                timeoutMs: 5000,
                retryPolicy: { maxRetries: 3, backoffFactorMs: 1000 },
                requiresHumanApproval: false,
                supportsDryRun: true,
                supportsIdempotency: true,
            },
            {
                toolId: "google_workspace.create_calendar_event",
                name: "Create Calendar Event",
                description: "Creates a scheduled meeting event in Google Calendar",
                connectorId: this.getConnectorId(),
                category: "calendar",
                version: "1.0.0",
                inputSchema: {
                    type: "object",
                    required: ["title", "startTime", "endTime"],
                    properties: {
                        title: { type: "string" },
                        startTime: { type: "string" },
                        endTime: { type: "string" },
                    },
                },
                outputSchema: { type: "object" },
                requiredPermissions: ["calendar.create"],
                estimatedCostUSD: 0.001,
                timeoutMs: 5000,
                retryPolicy: { maxRetries: 3, backoffFactorMs: 1000 },
                requiresHumanApproval: false,
                supportsDryRun: true,
                supportsIdempotency: true,
            },
        ];
    }

    async executeAction(toolId: string, params: Record<string, any>, creds: OAuthCredentials): Promise<Record<string, any>> {
        return {
            status: "success",
            provider: "Google Workspace API",
            executedTool: toolId,
            result: { messageId: `msg_${Date.now()}`, recipient: params.to || params.title },
        };
    }
}

export class StripeConnector implements IConnectorDriver {
    getConnectorId(): string {
        return "stripe";
    }

    getName(): string {
        return "Stripe Financial Connector";
    }

    getSupportedTools(): ToolContract[] {
        return [
            {
                toolId: "stripe.refund_payment",
                name: "Refund Customer Payment",
                description: "Refunds a specific transaction charge via Stripe API",
                connectorId: this.getConnectorId(),
                category: "finance",
                version: "1.0.0",
                inputSchema: {
                    type: "object",
                    required: ["chargeId", "amountUSD"],
                    properties: {
                        chargeId: { type: "string" },
                        amountUSD: { type: "number" },
                        reason: { type: "string" },
                    },
                },
                outputSchema: { type: "object" },
                requiredPermissions: ["finance.refund"],
                estimatedCostUSD: 0.05,
                timeoutMs: 5000,
                retryPolicy: { maxRetries: 2, backoffFactorMs: 2000 },
                requiresHumanApproval: true,
                supportsDryRun: true,
                supportsIdempotency: true,
            },
        ];
    }

    async executeAction(toolId: string, params: Record<string, any>, creds: OAuthCredentials): Promise<Record<string, any>> {
        return {
            status: "success",
            provider: "Stripe API",
            executedTool: toolId,
            refundData: { refundId: `re_${Date.now()}`, chargeId: params.chargeId, amount: params.amountUSD },
        };
    }
}

export class ConnectorSDK {
    private drivers: Map<string, IConnectorDriver> = new Map();

    constructor() {
        this.registerDriver(new GoogleWorkspaceConnector());
        this.registerDriver(new StripeConnector());
    }

    registerDriver(driver: IConnectorDriver): void {
        this.drivers.set(driver.getConnectorId(), driver);
    }

    getDriver(connectorId: string): IConnectorDriver | undefined {
        return this.drivers.get(connectorId);
    }

    getAllSupportedTools(): ToolContract[] {
        const tools: ToolContract[] = [];
        for (const driver of this.drivers.values()) {
            tools.push(...driver.getSupportedTools());
        }
        return tools;
    }
}
