/**
 * Workflow Validator
 *
 * PAL Milestone 5C — Workflow Automation Engine
 *
 * Validates syntax, references, action types, and circular recursion dependencies.
 */

import type { Workflow } from "./types.ts";

export interface ValidationResult {
    valid: boolean;
    errors: string[];
}

export function validateWorkflow(wf: Workflow): ValidationResult {
    const errors: string[] = [];

    if (!wf.name || !wf.name.trim()) {
        errors.push("Workflow name is required.");
    }

    if (!wf.trigger || !wf.trigger.type) {
        errors.push("Workflow trigger type is required.");
    }

    if (!wf.actions || !Array.isArray(wf.actions) || wf.actions.length === 0) {
        errors.push("Workflow must contain at least one action step.");
    } else {
        const supportedActions = new Set([
            "CREATE_PROJECT",
            "CREATE_TASK",
            "CREATE_INVOICE",
            "CREATE_CALENDAR_EVENT",
            "SAVE_DECISION",
            "UPDATE_BUSINESS_BRAIN",
            "SEND_NOTIFICATION",
            "GENERATE_DAILY_BRIEFING",
            "EXECUTE_INTEGRATION_ACTION",
            "EXECUTE_SEQUENTIAL_ACTIONS",
        ]);

        for (let i = 0; i < wf.actions.length; i++) {
            const step = wf.actions[i];
            if (!step.action) {
                errors.push(`Action step #${i + 1} is missing action target.`);
            } else if (!supportedActions.has(step.action)) {
                errors.push(`Action step #${i + 1} uses unsupported action target '${step.action}'.`);
            }
        }
    }

    // Check for circular dependency loops in dependsOn
    if (wf.actions && Array.isArray(wf.actions)) {
        const stepIds = new Set(wf.actions.map((s, idx) => s.id || `step_${idx}`));
        for (const step of wf.actions) {
            if (step.dependsOn) {
                for (const depId of step.dependsOn) {
                    if (!stepIds.has(depId)) {
                        errors.push(`Action step specifies non-existent dependency '${depId}'.`);
                    }
                    if (step.id === depId) {
                        errors.push(`Action step cannot depend on itself ('${depId}').`);
                    }
                }
            }
        }
    }

    return {
        valid: errors.length === 0,
        errors,
    };
}
