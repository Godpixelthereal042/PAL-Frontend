import { ActionType } from "./types.ts";
import type { ActionHandler } from "./types.ts";
import { createProjectHandler } from "./actions/createProject.ts";
import { createTaskHandler } from "./actions/createTask.ts";
import { createInvoiceHandler } from "./actions/createInvoice.ts";
import { createCalendarEventHandler } from "./actions/createCalendarEvent.ts";
import { saveDecisionHandler } from "./actions/saveDecision.ts";
import { updateBusinessBrainHandler } from "./actions/updateBusinessBrain.ts";

export class ActionRegistry {
    private handlers: Map<ActionType, ActionHandler> = new Map();

    constructor() {
        this.register(createProjectHandler);
        this.register(createTaskHandler);
        this.register(createInvoiceHandler);
        this.register(createCalendarEventHandler);
        this.register(saveDecisionHandler);
        this.register(updateBusinessBrainHandler);
    }

    public register(handler: ActionHandler): void {
        this.handlers.set(handler.type, handler);
    }

    public get(type: ActionType): ActionHandler | undefined {
        return this.handlers.get(type);
    }

    public has(type: ActionType): boolean {
        return this.handlers.has(type);
    }

    public listSupportedActions(): ActionType[] {
        return Array.from(this.handlers.keys());
    }
}

export const globalActionRegistry = new ActionRegistry();
