import { getDB } from "../db.ts";
import { ActionType } from "./types.ts";
import type { ActionPayload, ActionResult, ValidationResult } from "./types.ts";
import { ActionRegistry, globalActionRegistry } from "./registry.ts";
import { ActionValidator, globalActionValidator } from "./validator.ts";
import { ActionExecutor, globalActionExecutor } from "./executor.ts";

export class ActionEngine {
    private registry: ActionRegistry;
    private validator: ActionValidator;
    private executor: ActionExecutor;

    constructor(
        registry: ActionRegistry = globalActionRegistry,
        validator: ActionValidator = globalActionValidator,
        executor: ActionExecutor = globalActionExecutor
    ) {
        this.registry = registry;
        this.validator = validator;
        this.executor = executor;
    }

    /**
     * Validates an action payload without mutating database state.
     */
    public async validate(payload: ActionPayload): Promise<ValidationResult> {
        const db = await getDB();
        return this.validator.validate(payload, db);
    }

    /**
     * Validates and executes an action payload deterministically against the database.
     */
    public async execute<TResult = any>(payload: ActionPayload): Promise<ActionResult<TResult>> {
        const db = await getDB();
        return this.executor.execute<TResult>(payload, db);
    }

    /**
     * List all action types currently supported and registered.
     */
    public getSupportedActionTypes(): ActionType[] {
        return this.registry.listSupportedActions();
    }
}

export const actionEngine = new ActionEngine();
export { ActionType };
export type { ActionPayload, ActionResult, ValidationResult };
