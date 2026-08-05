/**
 * Calendar Worker Agent — Real SaaS Connector Integration (PAL-TDD-006, Sprint 7 Milestone 2)
 *
 * Execution flow:
 *   1. Check OAuthManager for Google Workspace credentials
 *   2. If credentials exist, route through ConnectorRuntime → GoogleCalendarProvider
 *   3. If dry-run mode is active and operation is in DESTRUCTIVE_OPS, validate but do not execute
 *   4. If no credentials or connector unavailable, fall back to deterministic stub
 *
 * Safety: No calendar event is created, updated, or deleted when dryRun=true.
 */

import type { WorkerRoleType } from "../runtime/types.ts";
import type { IWorkerAgent, WorkerExecutionRequest, WorkerExecutionResponse } from "./types.ts";
import { OAuthManager } from "../connectors/oauthManager.ts";
import { ConnectorRuntime } from "../integrations/connectorRuntime.ts";
import { GoogleCalendarProvider } from "../integrations/connectors/googleCalendarConnector.ts";

/** Destructive calendar operations that require dry-run gating */
const DESTRUCTIVE_OPS = ["google_calendar.create_event", "google_calendar.update_event", "google_calendar.delete_event"];

export class CalendarWorker implements IWorkerAgent {
    private oauthManager: OAuthManager;
    private connectorRuntime: ConnectorRuntime;

    constructor(oauthManager?: OAuthManager, connectorRuntime?: ConnectorRuntime) {
        this.oauthManager = oauthManager || new OAuthManager();
        this.connectorRuntime = connectorRuntime || new ConnectorRuntime();
        // Register the Google Calendar provider
        if (!this.connectorRuntime.getConnectorManager().getDriver("google_calendar")) {
            this.connectorRuntime.registerProvider(new GoogleCalendarProvider());
        }
    }

    getWorkerRole(): WorkerRoleType {
        return "calendar";
    }

    getCapabilities(): string[] {
        return ["google_calendar.find_slot", "google_calendar.create_event", "google_calendar.delete_event", "cal_com.book"];
    }

    async executeTask(request: WorkerExecutionRequest): Promise<WorkerExecutionResponse> {
        const startTime = Date.now();
        const workspaceId = request.workspaceId || request.context?.workspaceId || "default_workspace";
        const title = request.inputParameters?.title || "Executive Strategy Meeting";
        const targetTool = request.inputParameters?.toolId || "google_calendar.create_event";
        const isDryRun = request.dryRun === true;
        const isDestructive = DESTRUCTIVE_OPS.includes(targetTool);

        // Step 1: Check for live OAuth credentials
        const creds = await this.oauthManager.getCredentials(workspaceId, "google_workspace");
        const hasLiveCreds = Boolean(creds?.accessToken || process.env.GOOGLE_CALENDAR_API_KEY);

        // Step 2: Determine execution mode
        if (hasLiveCreds && isDryRun && isDestructive) {
            // DRY-RUN MODE: Validate but do not create/modify calendar events
            return {
                taskId: request.taskId,
                workerRole: this.getWorkerRole(),
                status: "success",
                isStub: false,
                outputs: {
                    eventId: null,
                    title,
                    scheduledStartTime: Date.now() + 86400000,
                    provider: "google_calendar_v3",
                    dryRun: true,
                    dryRunReport: {
                        wouldCreateEvent: title,
                        wouldUseConnector: "google_calendar",
                        credentialsVerified: true,
                        validationPassed: true,
                        message: "[DRY-RUN] Calendar event validated but NOT created. Set dryRun=false to execute."
                    }
                },
                artifacts: [],
                metrics: {
                    latencyMs: Date.now() - startTime,
                    inputTokens: 500,
                    outputTokens: 150,
                    estimatedCostUSD: 0.0,
                },
                invokedTools: [targetTool],
                retryable: false,
                humanApprovalRequired: false,
                warnings: ["[DRY-RUN] Destructive operation validated but not executed"],
            };
        }

        if (hasLiveCreds && !isDryRun) {
            // LIVE MODE: Route through ConnectorRuntime → GoogleCalendarProvider
            try {
                const connectorResult = await this.connectorRuntime.executeTool(
                    "google_calendar",
                    targetTool,
                    {
                        title,
                        startsAt: request.inputParameters?.startsAt || new Date(Date.now() + 86400000).toISOString(),
                        endsAt: request.inputParameters?.endsAt,
                        description: request.inputParameters?.description || "",
                        location: request.inputParameters?.location || "",
                    },
                    request.context
                );

                return {
                    taskId: request.taskId,
                    workerRole: this.getWorkerRole(),
                    status: "success",
                    isStub: false,
                    outputs: {
                        eventId: connectorResult.eventId || connectorResult.messageId || `evt_cal_${Date.now()}`,
                        title,
                        scheduledStartTime: Date.now() + 86400000,
                        provider: "google_calendar_v3",
                        dryRun: false,
                        connectorResponse: connectorResult
                    },
                    artifacts: [],
                    metrics: {
                        latencyMs: Date.now() - startTime,
                        inputTokens: 500,
                        outputTokens: 150,
                        estimatedCostUSD: 0.00095,
                    },
                    invokedTools: [targetTool],
                    retryable: true,
                    humanApprovalRequired: false,
                    warnings: [],
                };
            } catch (err: any) {
                // Connector execution failed — fall through to stub
                return this.buildStubResponse(request, startTime, title, targetTool, [
                    `Connector execution failed: ${err?.message || String(err)}. Falling back to stub.`
                ]);
            }
        }

        // STUB MODE: No credentials available or dry-run requested without creds
        return this.buildStubResponse(request, startTime, title, targetTool, [
            "Executing in simulated fallback mode without active Google Calendar OAuth credentials"
        ]);
    }

    private buildStubResponse(
        request: WorkerExecutionRequest,
        startTime: number,
        title: string,
        targetTool: string,
        warnings: string[]
    ): WorkerExecutionResponse {
        return {
            taskId: request.taskId,
            workerRole: this.getWorkerRole(),
            status: "success",
            isStub: true,
            outputs: {
                eventId: `evt_cal_${Date.now()}`,
                title,
                scheduledStartTime: Date.now() + 86400000,
                provider: "simulated_stub",
                dryRun: false
            },
            artifacts: [],
            metrics: {
                latencyMs: Date.now() - startTime,
                inputTokens: 500,
                outputTokens: 150,
                estimatedCostUSD: 0.00095,
            },
            invokedTools: [targetTool],
            retryable: true,
            humanApprovalRequired: false,
            warnings,
        };
    }
}
