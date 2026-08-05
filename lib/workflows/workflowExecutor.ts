/**
 * Workflow Executor
 *
 * PAL Milestone 5C — Workflow Automation Engine
 *
 * Executes planned workflow steps by delegating to Action Engine, Notification Engine,
 * Daily Briefing Engine, or Integration Framework.
 */

import { getDB } from "../db.ts";
import { actionEngine } from "../actionEngine/engine.ts";
import { getDailyBrief } from "../briefing/dailyBriefingEngine.ts";
import { processNotifications } from "../notifications/notificationEngine.ts";
import { saveNotification } from "../notifications/notificationHistory.ts";
import { globalIntegrationManager } from "../integrations/integrationManager.ts";
import type { ExecutionPlan, ExecutionStepResult, WorkflowActionStep } from "./types.ts";

export function interpolatePayload(payload: Record<string, any>, contextData: Record<string, any>): Record<string, any> {
    const jsonStr = JSON.stringify(payload);
    const interpolated = jsonStr.replace(/\{\{\s*([a-zA-Z0-9_.]+)\s*\}\}/g, (_, path) => {
        const parts = path.split(".");
        let val: any = contextData;
        for (const p of parts) {
            if (val && typeof val === "object" && p in val) {
                val = val[p];
            } else {
                return `{{${path}}}`;
            }
        }
        return String(val);
    });

    try {
        return JSON.parse(interpolated);
    } catch {
        return payload;
    }
}

export async function executeStep(
    step: WorkflowActionStep,
    stepIndex: number,
    executionId: string,
    userId: string,
    triggerPayload: Record<string, any> = {}
): Promise<ExecutionStepResult> {
    const startedAt = Date.now();
    const actionType = step.action;
    const requestPayload = interpolatePayload(step.payload || {}, { trigger: triggerPayload });

    let status: "completed" | "failed" = "completed";
    let resultPayload: Record<string, any> | null = null;
    let error: string | null = null;

    try {
        // Optional delay before execution
        if (step.delayMs && step.delayMs > 0) {
            await new Promise((resolve) => setTimeout(resolve, Math.min(1000, step.delayMs!)));
        }

        switch (actionType) {
            case "CREATE_PROJECT":
            case "CREATE_TASK":
            case "CREATE_INVOICE":
            case "CREATE_CALENDAR_EVENT":
            case "SAVE_DECISION":
            case "UPDATE_BUSINESS_BRAIN": {
                if (actionType === "CREATE_TASK" && !requestPayload.projectId) {
                    const db = await getDB();
                    const existingProj = await db.get("SELECT id FROM projects LIMIT 1");
                    if (existingProj) {
                        requestPayload.projectId = existingProj.id;
                    } else {
                        const fallbackProjId = "proj_default_workflow";
                        await db.run(
                            "INSERT OR IGNORE INTO projects (id, title, type, date, color, status, priority) VALUES (?, ?, ?, ?, ?, ?, ?)",
                            [fallbackProjId, "General Operations", "General", new Date().toISOString().split("T")[0], "#3b82f6", "active", "medium"]
                        );
                        requestPayload.projectId = fallbackProjId;
                    }
                }

                const actionResult = await actionEngine.execute({
                    type: actionType as any,
                    userId,
                    params: requestPayload,
                });

                if (actionResult.success) {
                    resultPayload = actionResult.data || { success: true };
                } else {
                    status = "failed";
                    error = actionResult.error?.message || "Action Engine execution failed";
                }
                break;
            }

            case "GENERATE_DAILY_BRIEFING": {
                const briefing = await getDailyBrief(userId, true);
                resultPayload = { briefingId: briefing.id, healthScore: briefing.businessHealth.score };
                break;
            }

            case "SEND_NOTIFICATION": {
                const notifId = `notif_wf_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;
                const notifObj: any = {
                    id: notifId,
                    userId,
                    category: requestPayload.category || "executive",
                    type: requestPayload.type || "workflow_notification",
                    title: requestPayload.title || "Workflow Automated Alert",
                    message: requestPayload.message || "Automated workflow action completed.",
                    priority: requestPayload.priority || "medium",
                    severity: requestPayload.severity || "medium",
                    actionLabel: requestPayload.actionLabel || "View Dashboard",
                    actionUrl: requestPayload.actionUrl || "/dashboard",
                    channel: "dashboard",
                    status: "delivered",
                    scheduledFor: Date.now(),
                    createdAt: Date.now(),
                };

                await saveNotification(notifObj);
                resultPayload = { notificationId: notifId, status: "delivered" };
                break;
            }

            case "EXECUTE_INTEGRATION_ACTION": {
                const { provider, operation, params } = requestPayload;
                const integResult = await globalIntegrationManager.executeConnector({
                    provider,
                    userId,
                    operation,
                    params: params || {},
                });

                if (integResult.success) {
                    resultPayload = integResult.data || { success: true };
                } else {
                    status = "failed";
                    error = integResult.error?.message || "Integration action failed";
                }
                break;
            }

            case "EXECUTE_SEQUENTIAL_ACTIONS": {
                const subActions = requestPayload.actions || [];
                const subResults = [];
                for (let i = 0; i < subActions.length; i++) {
                    const subStep = subActions[i];
                    const subRes = await executeStep(subStep, i, executionId, userId, triggerPayload);
                    subResults.push(subRes);
                    if (subRes.status === "failed") {
                        status = "failed";
                        error = `Sub-action #${i + 1} (${subStep.action}) failed: ${subRes.error}`;
                        break;
                    }
                }
                resultPayload = { subResults };
                break;
            }

            default: {
                status = "failed";
                error = `Unsupported action target '${actionType}'`;
            }
        }
    } catch (e: any) {
        status = "failed";
        error = e.message || "Unexpected exception during workflow step execution";
    }

    return {
        id: `step_res_${startedAt}_${stepIndex}`,
        executionId,
        stepIndex,
        actionType,
        status,
        requestPayload,
        resultPayload,
        error,
        startedAt,
        completedAt: Date.now(),
    };
}
