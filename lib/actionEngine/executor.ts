import type { ActionPayload, ActionResult } from "./types.ts";
import { ActionRegistry, globalActionRegistry } from "./registry.ts";
import { ActionValidator, globalActionValidator } from "./validator.ts";

export class ActionExecutor {
    private registry: ActionRegistry;
    private validator: ActionValidator;

    constructor(
        registry: ActionRegistry = globalActionRegistry,
        validator: ActionValidator = globalActionValidator
    ) {
        this.registry = registry;
        this.validator = validator;
    }

    public async execute<TResult = any>(payload: ActionPayload, db: any): Promise<ActionResult<TResult>> {
        const executedAt = Date.now();

        try {
            // 1. Validation phase
            const validation = await this.validator.validate(payload, db);
            if (!validation.valid) {
                return {
                    success: false,
                    actionType: payload.type,
                    error: {
                        code: "VALIDATION_ERROR",
                        message: "Action payload validation failed.",
                        details: validation.errors,
                    },
                    executedAt,
                };
            }

            // 2. Dispatch to Handler
            const handler = this.registry.get(payload.type);
            if (!handler) {
                return {
                    success: false,
                    actionType: payload.type,
                    error: {
                        code: "HANDLER_NOT_FOUND",
                        message: `No handler registered for action type '${payload.type}'.`,
                    },
                    executedAt,
                };
            }

            // 3. Deterministic execution
            const data = await handler.execute(payload.params, payload.userId, db);

            return {
                success: true,
                actionType: payload.type,
                data,
                executedAt,
            };
        } catch (error: any) {
            console.error(`ActionExecutor: Execution failed for action '${payload?.type}':`, error);
            return {
                success: false,
                actionType: payload?.type,
                error: {
                    code: "EXECUTION_ERROR",
                    message: error.message || "An unexpected error occurred during action execution.",
                    details: String(error),
                },
                executedAt,
            };
        }
    }
}

export const globalActionExecutor = new ActionExecutor();
