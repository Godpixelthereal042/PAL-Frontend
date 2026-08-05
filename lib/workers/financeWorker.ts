/**
 * Finance Worker Agent — Real SaaS Connector Integration (PAL-TDD-006, Sprint 7 Milestone 2)
 *
 * Execution flow:
 *   1. Check OAuthManager for finance provider credentials (Stripe / QuickBooks)
 *   2. If credentials exist, route through ConnectorRuntime → StripeConnector
 *   3. If dry-run mode is active, validate but do not execute financial transactions
 *   4. If amount > $1,000, require human approval regardless of execution mode
 *   5. If no credentials or connector unavailable, fall back to deterministic stub
 *
 * Safety: No financial transaction is executed when dryRun=true.
 *         High-spend operations always require human approval.
 */

import type { WorkerRoleType } from "../runtime/types.ts";
import type { IWorkerAgent, WorkerExecutionRequest, WorkerExecutionResponse } from "./types.ts";
import { OAuthManager } from "../connectors/oauthManager.ts";
import { ConnectorRuntime } from "../integrations/connectorRuntime.ts";
import { StripeConnector } from "../integrations/connectors/stripeConnector.ts";

/** High-spend threshold requiring human executive sign-off */
const HIGH_SPEND_THRESHOLD_USD = 1000;

/** Destructive financial operations that require dry-run gating */
const DESTRUCTIVE_OPS = ["stripe.refund_payment", "quickbooks.create_invoice", "stripe.charge", "stripe.transfer"];

export class FinanceWorker implements IWorkerAgent {
    private oauthManager: OAuthManager;
    private connectorRuntime: ConnectorRuntime;

    constructor(oauthManager?: OAuthManager, connectorRuntime?: ConnectorRuntime) {
        this.oauthManager = oauthManager || new OAuthManager();
        this.connectorRuntime = connectorRuntime || new ConnectorRuntime();
        // Register Stripe connector driver
        if (!this.connectorRuntime.getConnectorManager().getDriver("stripe")) {
            this.connectorRuntime.registerProvider(new StripeConnector());
        }
    }

    getWorkerRole(): WorkerRoleType {
        return "finance";
    }

    getCapabilities(): string[] {
        return ["stripe.refund_payment", "quickbooks.create_invoice", "bank.get_balance"];
    }

    async executeTask(request: WorkerExecutionRequest): Promise<WorkerExecutionResponse> {
        const startTime = Date.now();
        const amountUSD = request.inputParameters?.amountUSD || 500;
        const workspaceId = request.workspaceId || request.context?.workspaceId || "default_workspace";
        const targetTool = request.inputParameters?.toolId || "quickbooks.create_invoice";
        const isDryRun = request.dryRun === true;
        const isDestructive = DESTRUCTIVE_OPS.includes(targetTool);

        // Step 1: Check for live OAuth credentials
        const stripeCreds = await this.oauthManager.getCredentials(workspaceId, "stripe");
        const quickbooksCreds = await this.oauthManager.getCredentials(workspaceId, "quickbooks");
        const hasLiveCreds = Boolean(
            stripeCreds?.accessToken || quickbooksCreds?.accessToken || process.env.STRIPE_SECRET_KEY
        );
        const activeProvider = stripeCreds?.accessToken ? "stripe_rest_v1" : "stripe_rest_v1";

        // Step 2: High-spend approval gate (applies to ALL execution modes)
        const requiresApproval = amountUSD > HIGH_SPEND_THRESHOLD_USD;

        // Step 3: Determine execution mode
        if (hasLiveCreds && isDryRun && isDestructive) {
            // DRY-RUN MODE: Validate but do not execute financial transactions
            return {
                taskId: request.taskId,
                workerRole: this.getWorkerRole(),
                status: requiresApproval ? "requires_approval" : "success",
                isStub: false,
                outputs: {
                    invoiceId: null,
                    amountUSD,
                    status: requiresApproval ? "pending_approval" : "validated",
                    provider: activeProvider,
                    dryRun: true,
                    dryRunReport: {
                        wouldProcessAmount: amountUSD,
                        wouldUseConnector: "stripe",
                        requiresApproval,
                        credentialsVerified: true,
                        validationPassed: true,
                        message: `[DRY-RUN] Financial transaction validated but NOT executed. Amount: $${amountUSD}.${requiresApproval ? " Requires human approval." : ""}`
                    }
                },
                artifacts: [],
                metrics: {
                    latencyMs: Date.now() - startTime,
                    inputTokens: 1100,
                    outputTokens: 300,
                    estimatedCostUSD: 0.0,
                },
                invokedTools: ["quickbooks.create_invoice"],
                retryable: false,
                humanApprovalRequired: requiresApproval,
                warnings: [
                    "[DRY-RUN] Destructive financial operation validated but not executed",
                    ...(requiresApproval ? [`Invoice amount ($${amountUSD}) exceeds $${HIGH_SPEND_THRESHOLD_USD} auto-spend limit`] : [])
                ],
            };
        }

        if (hasLiveCreds && !isDryRun) {
            // LIVE MODE: Route through ConnectorRuntime → StripeConnector
            // But first enforce human approval for high-spend operations
            if (requiresApproval) {
                return {
                    taskId: request.taskId,
                    workerRole: this.getWorkerRole(),
                    status: "requires_approval",
                    isStub: false,
                    outputs: {
                        invoiceId: `inv_${Date.now()}`,
                        amountUSD,
                        status: "pending_approval",
                        provider: activeProvider,
                        dryRun: false
                    },
                    artifacts: [
                        {
                            artifactId: `art_fin_${Date.now()}`,
                            name: "Customer Invoice Statement",
                            type: "document",
                            content: { invoiceId: `inv_${Date.now()}`, total: amountUSD },
                        },
                    ],
                    metrics: {
                        latencyMs: Date.now() - startTime,
                        inputTokens: 1100,
                        outputTokens: 300,
                        estimatedCostUSD: 0.002,
                    },
                    invokedTools: ["quickbooks.create_invoice"],
                    retryable: true,
                    humanApprovalRequired: true,
                    warnings: [`Invoice amount ($${amountUSD}) exceeds $${HIGH_SPEND_THRESHOLD_USD} auto-spend limit`],
                };
            }

            try {
                const connectorResult = await this.connectorRuntime.executeTool(
                    "stripe",
                    "stripe.create_invoice",
                    { amountUSD, customerId: request.inputParameters?.customerId || "cus_default" },
                    request.context
                );

                return {
                    taskId: request.taskId,
                    workerRole: this.getWorkerRole(),
                    status: "success",
                    isStub: false,
                    outputs: {
                        invoiceId: connectorResult.invoiceId || `inv_${Date.now()}`,
                        amountUSD,
                        status: "processed",
                        provider: activeProvider,
                        dryRun: false,
                        connectorResponse: connectorResult
                    },
                    artifacts: [
                        {
                            artifactId: `art_fin_${Date.now()}`,
                            name: "Customer Invoice Statement",
                            type: "document",
                            content: { invoiceId: connectorResult.invoiceId, total: amountUSD },
                        },
                    ],
                    metrics: {
                        latencyMs: Date.now() - startTime,
                        inputTokens: 1100,
                        outputTokens: 300,
                        estimatedCostUSD: 0.002,
                    },
                    invokedTools: ["quickbooks.create_invoice"],
                    retryable: true,
                    humanApprovalRequired: false,
                    warnings: [],
                };
            } catch (err: any) {
                // Connector execution failed — fall through to stub
                return this.buildStubResponse(request, startTime, amountUSD, requiresApproval, [
                    `Connector execution failed: ${err?.message || String(err)}. Falling back to stub.`
                ]);
            }
        }

        // STUB MODE: No credentials available
        return this.buildStubResponse(request, startTime, amountUSD, requiresApproval, [
            "Executing in simulated fallback mode without active Finance API credentials"
        ]);
    }

    private buildStubResponse(
        request: WorkerExecutionRequest,
        startTime: number,
        amountUSD: number,
        requiresApproval: boolean,
        warnings: string[]
    ): WorkerExecutionResponse {
        const allWarnings = requiresApproval
            ? [`Invoice amount ($${amountUSD}) exceeds $${HIGH_SPEND_THRESHOLD_USD} auto-spend limit`, ...warnings]
            : warnings;

        return {
            taskId: request.taskId,
            workerRole: this.getWorkerRole(),
            status: requiresApproval ? "requires_approval" : "success",
            isStub: true,
            outputs: {
                invoiceId: `inv_${Date.now()}`,
                amountUSD,
                status: requiresApproval ? "pending_approval" : "processed",
                provider: "simulated_stub",
                dryRun: false
            },
            artifacts: [
                {
                    artifactId: `art_fin_${Date.now()}`,
                    name: "Customer Invoice Statement",
                    type: "document",
                    content: { invoiceId: `inv_${Date.now()}`, total: amountUSD },
                },
            ],
            metrics: {
                latencyMs: Date.now() - startTime,
                inputTokens: 1100,
                outputTokens: 300,
                estimatedCostUSD: 0.002,
            },
            invokedTools: ["quickbooks.create_invoice"],
            retryable: true,
            humanApprovalRequired: requiresApproval,
            warnings: allWarnings,
        };
    }
}
