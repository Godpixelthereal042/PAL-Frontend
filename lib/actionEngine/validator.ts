import type { ActionPayload, ValidationResult } from "./types.ts";
import { ActionRegistry, globalActionRegistry } from "./registry.ts";

export class ActionValidator {
    private registry: ActionRegistry;

    constructor(registry: ActionRegistry = globalActionRegistry) {
        this.registry = registry;
    }

    public async validate(payload: ActionPayload, db: any): Promise<ValidationResult> {
        if (!payload || typeof payload !== "object") {
            return { valid: false, errors: ["Action payload must be a non-null object."] };
        }

        if (!payload.type) {
            return { valid: false, errors: ["Action type is required."] };
        }

        const handler = this.registry.get(payload.type);
        if (!handler) {
            return {
                valid: false,
                errors: [`Unsupported or unregistered action type '${payload.type}'. Supported types: ${this.registry.listSupportedActions().join(", ")}`],
            };
        }

        if (!payload.userId || typeof payload.userId !== "string") {
            return { valid: false, errors: ["userId is required in action payload."] };
        }

        // Delegate to specific handler validation rules
        return await handler.validate(payload.params, payload.userId, db);
    }
}

export const globalActionValidator = new ActionValidator();
