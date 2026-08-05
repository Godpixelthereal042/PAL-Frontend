/**
 * Workflow Planner
 *
 * PAL Milestone 5C — Workflow Automation Engine
 *
 * Generates an ExecutionPlan before runtime execution.
 */

import type { Workflow, ExecutionPlan, WorkflowActionStep } from "./types.ts";

export function createExecutionPlan(wf: Workflow, triggerType: string): ExecutionPlan {
    const orderedSteps: WorkflowActionStep[] = [];
    const rawSteps = wf.actions || [];

    // Topological sort or simple order resolution based on dependsOn
    const stepMap = new Map<string, WorkflowActionStep>();
    rawSteps.forEach((step, idx) => {
        const id = step.id || `step_${idx}`;
        stepMap.set(id, { ...step, id });
    });

    const visited = new Set<string>();
    function visit(id: string) {
        if (visited.has(id)) return;
        visited.add(id);

        const step = stepMap.get(id);
        if (step) {
            if (step.dependsOn) {
                for (const depId of step.dependsOn) {
                    visit(depId);
                }
            }
            orderedSteps.push(step);
        }
    }

    for (const id of stepMap.keys()) {
        visit(id);
    }

    const estimatedDurationMs = orderedSteps.reduce((sum, step) => sum + (step.delayMs || 50), 0);

    return {
        workflowId: wf.id,
        triggerType,
        orderedSteps,
        estimatedDurationMs,
    };
}
