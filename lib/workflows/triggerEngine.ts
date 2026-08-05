/**
 * Trigger Engine
 *
 * PAL Milestone 5C — Workflow Automation Engine
 *
 * Detects trigger events and matches active user workflows.
 */

import type { Workflow, WorkflowTrigger } from "./types.ts";

export function matchesTrigger(incoming: WorkflowTrigger, target: WorkflowTrigger): boolean {
    if (target.type === "*" || target.type === "all") return true;
    if (incoming.type !== target.type) return false;

    // Check specific configuration filters if specified
    if (target.config && incoming.config) {
        for (const [key, val] of Object.entries(target.config)) {
            if (incoming.config[key] !== undefined && incoming.config[key] !== val) {
                return false;
            }
        }
    }

    return true;
}

export function findMatchingWorkflows(trigger: WorkflowTrigger, userWorkflows: Workflow[]): Workflow[] {
    return userWorkflows.filter((wf) => wf.enabled && matchesTrigger(trigger, wf.trigger));
}
