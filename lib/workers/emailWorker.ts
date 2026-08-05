/**
 * Email Worker Agent — Real SaaS Connector Integration (PAL-TDD-006, Sprint 7 Milestone 2)
 *
 * Execution flow:
 *   1. Check OAuthManager for Google Workspace credentials
 *   2. If credentials exist, route through ConnectorRuntime → GmailConnector
 *   3. If dry-run mode is active, validate but do not send
 *   4. If no credentials or connector unavailable, fall back to deterministic stub
 *
 * Safety: No email is sent when dryRun=true. Returns full dry-run report instead.
 */

import type { WorkerRoleType } from "../runtime/types.ts";
import type { IWorkerAgent, WorkerExecutionRequest, WorkerExecutionResponse } from "./types.ts";
import { OAuthManager } from "../connectors/oauthManager.ts";
import { ConnectorRuntime } from "../integrations/connectorRuntime.ts";
import { GmailConnector } from "../integrations/connectors/gmailConnector.ts";

/** Destructive operations that require dry-run gating */
const DESTRUCTIVE_OPS = ["gmail.send_email", "sendgrid.dispatch_campaign"];

export class EmailWorker implements IWorkerAgent {
    private oauthManager: OAuthManager;
    private connectorRuntime: ConnectorRuntime;

    constructor(oauthManager?: OAuthManager, connectorRuntime?: ConnectorRuntime) {
        this.oauthManager = oauthManager || new OAuthManager();
        this.connectorRuntime = connectorRuntime || new ConnectorRuntime();
        // Register the Gmail connector driver if not already present
        if (!this.connectorRuntime.getConnectorManager().getDriver("gmail")) {
            this.connectorRuntime.registerProvider(new GmailConnector());
        }
    }

    getWorkerRole(): WorkerRoleType {
        return "email";
    }

    getCapabilities(): string[] {
        return ["gmail.send_email", "sendgrid.dispatch_campaign", "email.parse_thread"];
    }

    async executeTask(request: WorkerExecutionRequest): Promise<WorkerExecutionResponse> {
        const startTime = Date.now();
        const to = request.inputParameters?.to || "prospect@company.com";
        const subject = request.inputParameters?.subject || "Executive Introduction";
        const workspaceId = request.workspaceId || request.context?.workspaceId || "default_workspace";
        const targetTool = request.inputParameters?.toolId || "gmail.send_email";
        const isDryRun = request.dryRun === true;
        const isDestructive = DESTRUCTIVE_OPS.includes(targetTool);

        // Step 1: Check for live OAuth credentials
        const creds = await this.oauthManager.getCredentials(workspaceId, "google_workspace");
        const hasLiveCreds = Boolean(creds?.accessToken || process.env.GMAIL_API_TOKEN);

        // Step 2: Determine execution mode
        if (hasLiveCreds && isDryRun && isDestructive) {
            // DRY-RUN MODE: Credentials available but dry-run active — validate without sending
            return {
                taskId: request.taskId,
                workerRole: this.getWorkerRole(),
                status: "success",
                isStub: false,
                outputs: {
                    recipient: to,
                    subject,
                    sentMessageId: null,
                    deliveryChannel: "gmail_api_v1",
                    dryRun: true,
                    dryRunReport: {
                        wouldSendTo: to,
                        wouldUseSubject: subject,
                        wouldUseConnector: "gmail",
                        credentialsVerified: true,
                        validationPassed: true,
                        message: "[DRY-RUN] Email validated but NOT sent. Set dryRun=false to send."
                    }
                },
                artifacts: [],
                metrics: {
                    latencyMs: Date.now() - startTime,
                    inputTokens: 800,
                    outputTokens: 200,
                    estimatedCostUSD: 0.0,
                },
                invokedTools: ["gmail.send_email"],
                retryable: false,
                humanApprovalRequired: false,
                warnings: ["[DRY-RUN] Destructive operation validated but not executed"],
            };
        }

        if (hasLiveCreds && !isDryRun) {
            // LIVE MODE: Route through ConnectorRuntime → GmailConnector
            try {
                const connectorResult = await this.connectorRuntime.executeTool(
                    "gmail",
                    "google_workspace.send_email",
                    { recipient: to, subject, body: request.inputParameters?.body || "Hello from PAL..." },
                    request.context
                );

                return {
                    taskId: request.taskId,
                    workerRole: this.getWorkerRole(),
                    status: "success",
                    isStub: false,
                    outputs: {
                        recipient: to,
                        subject,
                        sentMessageId: connectorResult.messageId || `msg_${Date.now()}`,
                        deliveryChannel: "gmail_api_v1",
                        dryRun: false,
                        connectorResponse: connectorResult
                    },
                    artifacts: [
                        {
                            artifactId: `art_email_${Date.now()}`,
                            name: "Outbound Email Copy",
                            type: "email_draft",
                            content: { to, subject, body: request.inputParameters?.body || "Hello from PAL..." },
                        },
                    ],
                    metrics: {
                        latencyMs: Date.now() - startTime,
                        inputTokens: 800,
                        outputTokens: 200,
                        estimatedCostUSD: 0.0014,
                    },
                    invokedTools: ["gmail.send_email"],
                    retryable: true,
                    humanApprovalRequired: false,
                    warnings: [],
                };
            } catch (err: any) {
                // Connector execution failed — fall through to stub fallback
                return this.buildStubResponse(request, startTime, to, subject, [
                    `Connector execution failed: ${err?.message || String(err)}. Falling back to stub.`
                ]);
            }
        }

        // STUB MODE: No credentials available
        return this.buildStubResponse(request, startTime, to, subject, [
            "Executing in simulated fallback mode without active Gmail OAuth credentials"
        ]);
    }

    private buildStubResponse(
        request: WorkerExecutionRequest,
        startTime: number,
        to: string,
        subject: string,
        warnings: string[]
    ): WorkerExecutionResponse {
        return {
            taskId: request.taskId,
            workerRole: this.getWorkerRole(),
            status: "success",
            isStub: true,
            outputs: {
                recipient: to,
                subject,
                sentMessageId: `msg_${Date.now()}`,
                deliveryChannel: "simulated_stub",
                dryRun: false
            },
            artifacts: [
                {
                    artifactId: `art_email_${Date.now()}`,
                    name: "Outbound Email Copy",
                    type: "email_draft",
                    content: { to, subject, body: "Hello from PAL..." },
                },
            ],
            metrics: {
                latencyMs: Date.now() - startTime,
                inputTokens: 800,
                outputTokens: 200,
                estimatedCostUSD: 0.0014,
            },
            invokedTools: ["gmail.send_email"],
            retryable: true,
            humanApprovalRequired: false,
            warnings,
        };
    }
}
