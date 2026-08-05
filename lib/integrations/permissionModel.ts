/**
 * Permission Model & Scope Validator
 *
 * PAL Milestone 4A — Integration Framework
 */

import type { Connector, AuthContext } from "./types.ts";

export class PermissionValidator {
    /**
     * Validates if an operation is permitted under the provided authentication context.
     */
    validateOperation(
        connector: Connector,
        operation: string,
        authContext: AuthContext
    ): { valid: boolean; errors: string[]; missingScopes: string[] } {
        const errors: string[] = [];

        // 1. Connection status check
        if (authContext.status === "disconnected") {
            return {
                valid: false,
                errors: [`Integration '${connector.metadata.provider}' is disconnected for user '${authContext.userId}'.`],
                missingScopes: [],
            };
        }

        // 2. Check operation existence
        if (!connector.metadata.supportedOperations.includes(operation)) {
            return {
                valid: false,
                errors: [`Operation '${operation}' is not supported by connector '${connector.metadata.id}'.`],
                missingScopes: [],
            };
        }

        // 3. Check scope compliance
        const scopeResult = connector.validatePermissions(operation, authContext);
        if (!scopeResult.valid) {
            errors.push(`Missing required permission scope(s): ${scopeResult.missingScopes.join(", ")}`);
        }

        return {
            valid: errors.length === 0,
            errors,
            missingScopes: scopeResult.missingScopes,
        };
    }
}

export const globalPermissionValidator = new PermissionValidator();
