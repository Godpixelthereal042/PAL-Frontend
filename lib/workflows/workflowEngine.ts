/**
 * Central Workflow Automation Engine Orchestrator
 *
 * PAL Milestone 5C — Workflow Automation Engine
 *
 * Orchestrates business operations based on events, schedules, conditions,
 * and founder-defined workflows through PAL's Action Engine & Integration Framework.
 */

import { buildBusinessContext } from "../contextEngine.ts";
import { getWorkflows, saveWorkflow, getWorkflowById, deleteWorkflow, toggleWorkflow } from "./workflowRegistry.ts";
import { findMatchingWorkflows } from "./triggerEngine.ts";
import { evaluateConditions } from "./conditionEngine.ts";
import { validateWorkflow } from "./workflowValidator.ts";
import { createExecutionPlan } from "./workflowPlanner.ts";
import { executeStep } from "./workflowExecutor.ts";
import { createWorkflowExecution, updateWorkflowExecution, saveExecutionStep, getWorkflowExecutions as historyGetExecutions } from "./executionHistory.ts";
import { STARTER_TEMPLATES } from "./workflowTemplates.ts";
import type { Workflow, WorkflowTrigger, WorkflowExecution, ExecutionStepResult } from "./types.ts";

export class WorkflowAutomationEngine {
    /**
     * Trigger workflows matching incoming event.
     */
    async triggerEvent(
        trigger: WorkflowTrigger,
        triggerPayload: Record<string, any> = {},
        userId: string = "current_user"
    ): Promise<WorkflowExecution[]> {
        const effectiveUserId = userId || "current_user";
        const allWorkflows = await getWorkflows(effectiveUserId);
        const matchingWorkflows = findMatchingWorkflows(trigger, allWorkflows);

        const executions: WorkflowExecution[] = [];
        for (const wf of matchingWorkflows) {
            const exec = await this.runWorkflow(wf.id, effectiveUserId, triggerPayload, trigger.type);
            executions.push(exec);
        }

        return executions;
    }

    /**
     * Execute a specific workflow instance.
     */
    async runWorkflow(
        workflowId: string,
        userId: string = "current_user",
        triggerPayload: Record<string, any> = {},
        overrideTriggerType?: string
    ): Promise<WorkflowExecution> {
        const effectiveUserId = userId || "current_user";
        const wf = await getWorkflowById(workflowId, effectiveUserId);

        if (!wf) {
            throw new Error(`Workflow '${workflowId}' not found`);
        }

        const now = Date.now();
        const execId = `wf_exec_${now}_${Math.random().toString(36).slice(2, 7)}`;
        const triggerType = overrideTriggerType || wf.trigger.type || "manual_run";

        let execution: WorkflowExecution = {
            id: execId,
            workflowId: wf.id,
            userId: effectiveUserId,
            triggerType,
            status: "planning",
            startedAt: now,
            steps: [],
            errors: [],
        };

        await createWorkflowExecution(execution);

        try {
            // 1. Evaluate Conditions
            const context = await buildBusinessContext(effectiveUserId);
            const conditionsPassed = evaluateConditions(wf.conditions, context);

            if (!conditionsPassed) {
                execution.status = "failed";
                execution.completedAt = Date.now();
                execution.errors = ["Workflow conditions not met."];
                await updateWorkflowExecution(execution);
                return execution;
            }

            // 2. Validate Workflow Syntax & Recursion Safety
            const validation = validateWorkflow(wf);
            if (!validation.valid) {
                execution.status = "failed";
                execution.completedAt = Date.now();
                execution.errors = validation.errors;
                await updateWorkflowExecution(execution);
                return execution;
            }

            // 3. Create Execution Plan
            const plan = createExecutionPlan(wf, triggerType);
            execution.status = "executing";

            // 4. Execute Planned Steps Sequentially
            const stepResults: ExecutionStepResult[] = [];
            let hasFailure = false;

            for (let i = 0; i < plan.orderedSteps.length; i++) {
                const step = plan.orderedSteps[i];
                const res = await executeStep(step, i, execId, effectiveUserId, triggerPayload);
                stepResults.push(res);
                await saveExecutionStep(res);

                if (res.status === "failed") {
                    hasFailure = true;
                    if (!execution.errors) execution.errors = [];
                    execution.errors.push(`Step #${i + 1} (${step.action}) failed: ${res.error}`);
                    break;
                }
            }

            execution.steps = stepResults;
            execution.status = hasFailure ? "failed" : "completed";
            execution.completedAt = Date.now();
            await updateWorkflowExecution(execution);
        } catch (e: any) {
            execution.status = "failed";
            execution.completedAt = Date.now();
            execution.errors = [e.message || "Workflow execution error"];
            await updateWorkflowExecution(execution);
        }

        return execution;
    }
}

export const globalWorkflowEngine = new WorkflowAutomationEngine();

/**
 * Public Dashboard Entry Points
 */

export async function triggerWorkflowEvent(
    trigger: WorkflowTrigger,
    payload: Record<string, any> = {},
    userId: string = "current_user"
): Promise<WorkflowExecution[]> {
    return globalWorkflowEngine.triggerEvent(trigger, payload, userId);
}

export async function runWorkflow(
    workflowId: string,
    userId: string = "current_user",
    triggerPayload: Record<string, any> = {}
): Promise<WorkflowExecution> {
    return globalWorkflowEngine.runWorkflow(workflowId, userId, triggerPayload);
}

export async function createWorkflow(
    wfData: Partial<Workflow> & { name: string; trigger: WorkflowTrigger; actions: any[] },
    userId: string = "current_user"
): Promise<Workflow> {
    const effectiveUserId = userId || "current_user";
    const now = Date.now();
    const id = wfData.id || `wf_${now}_${Math.random().toString(36).slice(2, 7)}`;

    const newWf: Workflow = {
        id,
        userId: effectiveUserId,
        name: wfData.name,
        description: wfData.description || null,
        enabled: wfData.enabled !== undefined ? wfData.enabled : true,
        trigger: wfData.trigger,
        conditions: wfData.conditions || null,
        actions: wfData.actions,
        schedule: wfData.schedule || null,
        metadata: wfData.metadata || null,
        createdAt: now,
        updatedAt: now,
    };

    return saveWorkflow(newWf);
}

export {
    getWorkflows,
    getWorkflowById,
    deleteWorkflow,
    toggleWorkflow,
    historyGetExecutions as getWorkflowExecutions,
    STARTER_TEMPLATES,
};
