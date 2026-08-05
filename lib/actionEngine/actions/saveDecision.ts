import { ActionType } from "../types.ts";
import type { ActionHandler, SaveDecisionParams, ValidationResult } from "../types.ts";
import { createDecision, type DecisionStatus } from "../../decisionMemory.ts";

export const saveDecisionHandler: ActionHandler<SaveDecisionParams> = {
    type: ActionType.SAVE_DECISION,

    async validate(params: SaveDecisionParams, _userId: string, db: any): Promise<ValidationResult> {
        const errors: string[] = [];

        if (!params || typeof params !== "object") {
            return { valid: false, errors: ["Missing or invalid payload parameters"] };
        }

        if (!params.projectId || typeof params.projectId !== "string") {
            errors.push("Target project ID is required");
        } else if (db) {
            const project = await db.get("SELECT id FROM projects WHERE id = ?", [params.projectId]);
            if (!project) {
                errors.push(`Referenced project ID '${params.projectId}' does not exist`);
            }
        }

        if (!params.title || typeof params.title !== "string" || !params.title.trim()) {
            errors.push("Decision title is required");
        }

        return {
            valid: errors.length === 0,
            errors,
        };
    },

    async execute(params: SaveDecisionParams, userId: string, _db: any) {
        const effectiveUserId = userId || "current_user";
        const status: DecisionStatus = (params.status as DecisionStatus) || "active";

        const decisionRecord = await createDecision(effectiveUserId, {
            projectId: params.projectId,
            title: params.title.trim(),
            description: params.description || null,
            status,
            autoConfirm: status === "active" || status === "decided" as any,
        });

        return {
            decision: decisionRecord,
            cardToken: `[DECISION_CARD:{"project_id":"${params.projectId}","title":"${params.title.trim()}","description":"${params.description || ""}","id":"${decisionRecord.id}"}]`,
            message: `Decision "${params.title}" recorded for project ${params.projectId}.`,
        };
    },
};
