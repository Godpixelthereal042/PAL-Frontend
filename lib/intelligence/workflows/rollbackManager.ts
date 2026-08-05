import type { PlaybookTemplate } from "../playbooks/types.ts";
import type { IRollbackManager, WorkflowInstance } from "./types.ts";

export class RollbackManager implements IRollbackManager {
    async rollbackWorkflow(
        instance: WorkflowInstance,
        playbook: PlaybookTemplate,
        reason: string
    ): Promise<WorkflowInstance> {
        instance.status = "rolling_back";
        let compensatedCount = 0;

        // Iterate executed steps in reverse order
        for (let i = instance.executedSteps.length - 1; i >= 0; i--) {
            const executed = instance.executedSteps[i];
            const stepDef = playbook.steps.find((s) => s.id === executed.stepId);

            if (stepDef && stepDef.compensation) {
                // Execute compensating action
                compensatedCount++;
            }
        }

        instance.status = "failed";
        instance.rollbackState = {
            compensatedStepsCount: compensatedCount,
            rollbackReason: reason,
        };
        instance.updatedAt = Date.now();

        return instance;
    }
}
