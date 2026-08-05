import { PlaybookRegistry } from "../playbooks/playbookRegistry.ts";
import { RollbackManager } from "./rollbackManager.ts";
import type { IWorkflowEngine, WorkflowInstance } from "./types.ts";

export class WorkflowEngine implements IWorkflowEngine {
    private registry: PlaybookRegistry;
    private rollbackManager: RollbackManager;
    private instances: Map<string, WorkflowInstance> = new Map();

    constructor(registry?: PlaybookRegistry, rollbackManager?: RollbackManager) {
        this.registry = registry || new PlaybookRegistry();
        this.rollbackManager = rollbackManager || new RollbackManager();
    }

    async startWorkflow(
        workspaceId: string,
        correlationId: string,
        playbookId: string,
        initialInputs: Record<string, any>
    ): Promise<WorkflowInstance> {
        const playbook = this.registry.getPlaybook(playbookId);
        if (!playbook) {
            throw new Error(`Playbook '${playbookId}' not found in registry`);
        }

        const instanceId = `wf_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
        const now = Date.now();

        const instance: WorkflowInstance = {
            instanceId,
            workspaceId,
            correlationId,
            playbookId,
            currentStepIndex: 0,
            status: "executing",
            executedSteps: [],
            createdAt: now,
            updatedAt: now,
        };

        this.instances.set(instanceId, instance);
        return this.executeNextSteps(instanceId);
    }

    async approveWorkflowStep(instanceId: string, approverId: string): Promise<WorkflowInstance> {
        const instance = this.instances.get(instanceId);
        if (!instance) {
            throw new Error(`Workflow instance '${instanceId}' not found`);
        }

        if (instance.status !== "paused_for_approval") {
            throw new Error(`Workflow instance '${instanceId}' is not currently paused for approval`);
        }

        const playbook = this.registry.getPlaybook(instance.playbookId)!;
        const currentStep = playbook.steps[instance.currentStepIndex];

        // Record approval
        instance.approvalState = {
            requiredAction: currentStep.actionName,
            requestedAt: instance.approvalState?.requestedAt || Date.now(),
            approvedBy: approverId,
            approvedAt: Date.now(),
        };

        // Record step execution
        instance.executedSteps.push({
            stepId: currentStep.id,
            actionName: currentStep.actionName,
            executedAt: Date.now(),
            output: { approvedBy: approverId, status: "approved" },
        });

        instance.currentStepIndex++;
        instance.status = "executing";
        instance.updatedAt = Date.now();

        return this.executeNextSteps(instanceId);
    }

    getWorkflowInstance(instanceId: string): WorkflowInstance | undefined {
        return this.instances.get(instanceId);
    }

    private async executeNextSteps(instanceId: string): Promise<WorkflowInstance> {
        const instance = this.instances.get(instanceId)!;
        const playbook = this.registry.getPlaybook(instance.playbookId)!;

        while (instance.currentStepIndex < playbook.steps.length && instance.status === "executing") {
            const step = playbook.steps[instance.currentStepIndex];

            if (step.actionType === "human_approval") {
                instance.status = "paused_for_approval";
                instance.approvalState = {
                    requiredAction: step.actionName,
                    requestedAt: Date.now(),
                };
                instance.updatedAt = Date.now();
                return instance;
            }

            // Simulate step execution
            instance.executedSteps.push({
                stepId: step.id,
                actionName: step.actionName,
                executedAt: Date.now(),
                output: { success: true, stepTitle: step.title },
            });

            instance.currentStepIndex++;
        }

        if (instance.currentStepIndex >= playbook.steps.length) {
            instance.status = "completed";
        }

        instance.updatedAt = Date.now();
        return instance;
    }
}
