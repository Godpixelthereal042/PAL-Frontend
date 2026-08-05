/**
 * Workflow Automation Engine Types & Interfaces
 *
 * PAL Milestone 5C — Workflow Automation Engine
 */

export type TriggerType =
    | "meeting_started"
    | "meeting_ended"
    | "event_created"
    | "event_updated"
    | "task_created"
    | "task_completed"
    | "task_overdue"
    | "project_started"
    | "project_completed"
    | "decision_confirmed"
    | "notification_opened"
    | "integration_connected"
    | "integration_failed"
    | "schedule_daily"
    | "schedule_weekly"
    | "schedule_monthly"
    | "schedule_custom"
    | "manual_run";

export type ConditionType =
    | "business_health_score"
    | "has_active_project"
    | "calendar_availability"
    | "outstanding_invoice"
    | "current_time"
    | "day_of_week"
    | "decision_exists"
    | "integration_connected"
    | "notification_read"
    | "founder_preference";

export type WorkflowActionTarget =
    | "CREATE_PROJECT"
    | "CREATE_TASK"
    | "CREATE_INVOICE"
    | "CREATE_CALENDAR_EVENT"
    | "SAVE_DECISION"
    | "UPDATE_BUSINESS_BRAIN"
    | "SEND_NOTIFICATION"
    | "GENERATE_DAILY_BRIEFING"
    | "EXECUTE_INTEGRATION_ACTION"
    | "EXECUTE_SEQUENTIAL_ACTIONS";

export interface WorkflowTrigger {
    type: TriggerType | string;
    config?: Record<string, any>;
}

export interface WorkflowCondition {
    type: ConditionType | string;
    operator: "equals" | "not_equals" | "greater_than" | "less_than" | "contains" | "in";
    value: any;
    field?: string;
}

export interface ConditionGroup {
    logic: "AND" | "OR";
    conditions: (WorkflowCondition | ConditionGroup)[];
}

export interface WorkflowActionStep {
    id?: string;
    action: WorkflowActionTarget | string;
    payload: Record<string, any>;
    delayMs?: number;
    dependsOn?: string[];
}

export interface WorkflowSchedule {
    mode: "cron" | "interval" | "custom";
    cronExpression?: string;
    intervalMs?: number;
    timeZone?: string;
}

export interface Workflow {
    id: string;
    userId: string;
    name: string;
    description?: string | null;
    enabled: boolean;
    trigger: WorkflowTrigger;
    conditions?: ConditionGroup | WorkflowCondition[] | null;
    actions: WorkflowActionStep[];
    schedule?: WorkflowSchedule | null;
    metadata?: Record<string, any> | null;
    createdAt: number;
    updatedAt: number;
}

export type WorkflowExecutionStatus = "pending" | "planning" | "executing" | "completed" | "failed" | "retrying";
export type ExecutionStepStatus = "pending" | "executing" | "completed" | "failed" | "skipped";

export interface ExecutionStepResult {
    id: string;
    executionId: string;
    stepIndex: number;
    actionType: string;
    status: ExecutionStepStatus;
    requestPayload: Record<string, any>;
    resultPayload?: Record<string, any> | null;
    error?: string | null;
    startedAt: number;
    completedAt?: number | null;
}

export interface WorkflowExecution {
    id: string;
    workflowId: string;
    userId: string;
    triggerType: string;
    status: WorkflowExecutionStatus;
    startedAt: number;
    completedAt?: number | null;
    steps: ExecutionStepResult[];
    errors?: string[] | null;
    metadata?: Record<string, any> | null;
}

export interface ExecutionPlan {
    workflowId: string;
    triggerType: string;
    orderedSteps: WorkflowActionStep[];
    parallelGroups?: WorkflowActionStep[][];
    estimatedDurationMs?: number;
}

export interface WorkflowTemplate {
    id: string;
    name: string;
    description: string;
    category: string;
    template: Omit<Workflow, "id" | "userId" | "createdAt" | "updatedAt">;
}
