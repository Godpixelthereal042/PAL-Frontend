import type { IToolRegistry, ToolCategory, ToolContract } from "./types.ts";

export class ToolRegistry implements IToolRegistry {
    private contracts: Map<string, ToolContract> = new Map();
    private handlers: Map<string, (params: Record<string, any>) => Promise<Record<string, any>>> = new Map();

    registerTool(
        contract: ToolContract,
        handler: (params: Record<string, any>) => Promise<Record<string, any>>
    ): void {
        this.contracts.set(contract.toolId, contract);
        this.handlers.set(contract.toolId, handler);
    }

    getTool(toolId: string): ToolContract | undefined {
        return this.contracts.get(toolId);
    }

    getHandler(toolId: string): ((params: Record<string, any>) => Promise<Record<string, any>>) | undefined {
        return this.handlers.get(toolId);
    }

    listToolsByConnector(connectorId: string): ToolContract[] {
        return Array.from(this.contracts.values()).filter((c) => c.connectorId === connectorId);
    }

    listToolsByCapability(category: ToolCategory, grantedPermissions?: string[]): ToolContract[] {
        return Array.from(this.contracts.values()).filter((c) => {
            if (c.category !== category) return false;
            if (!grantedPermissions) return true;
            return c.requiredPermissions.every((perm) => grantedPermissions.includes(perm));
        });
    }

    validateParameters(contract: ToolContract, params: Record<string, any>): { isValid: boolean; error?: string } {
        if (!contract.inputSchema || !contract.inputSchema.required) {
            return { isValid: true };
        }

        const requiredFields = contract.inputSchema.required as string[];
        for (const field of requiredFields) {
            if (params[field] === undefined || params[field] === null || params[field] === "") {
                return { isValid: false, error: `Missing required parameter '${field}'` };
            }
        }

        return { isValid: true };
    }
}
