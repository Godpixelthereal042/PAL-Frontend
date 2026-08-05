/**
 * PAL Action Engine - Standard Types & Interfaces
 *
 * Sprint 3A — Action Engine Architecture
 */

export const ActionType = {
    CREATE_PROJECT: "CREATE_PROJECT",
    CREATE_TASK: "CREATE_TASK",
    CREATE_INVOICE: "CREATE_INVOICE",
    CREATE_CALENDAR_EVENT: "CREATE_CALENDAR_EVENT",
    SAVE_DECISION: "SAVE_DECISION",
    UPDATE_BUSINESS_BRAIN: "UPDATE_BUSINESS_BRAIN",
} as const;

export type ActionType = typeof ActionType[keyof typeof ActionType];

export interface ActionPayload<T = Record<string, any>> {
    type: ActionType;
    userId: string;
    params: T;
    metadata?: Record<string, any>;
}

export interface ValidationResult {
    valid: boolean;
    errors: string[];
}

export interface ActionResult<T = any> {
    success: boolean;
    actionType: ActionType;
    data?: T;
    error?: {
        code: string;
        message: string;
        details?: any;
    };
    executedAt: number;
}

export interface ActionHandler<TParams = any, TResult = any> {
    type: ActionType;
    validate(params: TParams, userId: string, db: any): Promise<ValidationResult> | ValidationResult;
    execute(params: TParams, userId: string, db: any): Promise<TResult>;
}

// ---------------------------------------------------------------------------
// Action Parameter Schemas
// ---------------------------------------------------------------------------

export interface CreateProjectParams {
    title: string;
    description?: string;
    goal?: string;
    priority?: "High" | "Medium" | "Low" | "high" | "medium" | "low";
    dueDate?: string;
    type?: string;
    color?: string;
    tasks?: Array<{
        title: string;
        description?: string;
        priority?: string;
        dueDate?: string;
    }>;
}

export interface CreateTaskParams {
    projectId: string;
    title: string;
    description?: string;
    status?: "not_started" | "next_action" | "blocked" | "done" | "in_progress";
    priority?: "high" | "medium" | "low";
    dueDate?: string;
}

export interface CreateInvoiceParams {
    client: string;
    amount: string | number;
    service: string;
    date?: string;
    status?: "pending" | "paid" | "overdue" | "draft";
}

export interface CreateCalendarEventParams {
    title: string;
    startsAt: string;
    endsAt: string;
    status?: string;
}

export interface SaveDecisionParams {
    projectId: string;
    title: string;
    description?: string;
    status?: string;
}

export interface UpdateBusinessBrainParams {
    businessName?: string;
    businessDescription?: string;
    industry?: string;
    businessStage?: "idea" | "pre-launch" | "launched" | "scaling";
    targetMarket?: string;
    priorities?: string;
    goals?: Array<{
        title: string;
        description?: string;
        timeframe?: string;
        status?: string;
    }>;
    offers?: Array<{
        name: string;
        description?: string;
        offerType?: string;
        price?: string;
        status?: string;
    }>;
    customerSegments?: Array<{
        name: string;
        description?: string;
    }>;
    challenges?: Array<{
        title: string;
        description?: string;
        severity?: "high" | "medium" | "low";
        status?: string;
    }>;
    notes?: Array<{
        content: string;
        category?: string;
    }>;
}
