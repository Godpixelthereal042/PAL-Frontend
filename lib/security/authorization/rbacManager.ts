/**
 * PAL Role-Based Access Control (RBAC) Manager
 * 
 * Governing Spec: PAL-TDD-001 Chapter 8 & Appendix A
 * Architecture Bible: Chapter 23 (Identity & Auth)
 */

import { RoleRepository } from "../../db/repositories/roleRepository.ts";
import { PermissionRepository } from "../../db/repositories/permissionRepository.ts";
import { createLogger } from "../../core/logger.ts";

const logger = createLogger("Security:RBACManager");

export const DEFAULT_HUMAN_ROLES = {
    FOUNDER: "Founder",
    WORKSPACE_ADMIN: "Workspace Admin",
    EXECUTIVE: "Executive",
    EMPLOYEE: "Employee",
    GUEST: "Guest"
} as const;

export const DEFAULT_AI_ROLES = {
    COO: "ai_coo",
    CFO: "ai_cfo",
    OPS: "ai_ops",
    SALES: "ai_sales",
    MARKETING: "ai_marketing",
    LEGAL: "ai_legal",
    HR: "ai_hr"
} as const;

export interface ResolvedPermissions {
    roles: string[];
    permissions: string[];
    isFounder: boolean;
}

export class RBACManager {
    private roleRepo: RoleRepository;
    private permRepo: PermissionRepository;

    constructor(roleRepo?: RoleRepository, permRepo?: PermissionRepository) {
        this.roleRepo = roleRepo || new RoleRepository();
        this.permRepo = permRepo || new PermissionRepository();
    }

    public async getEffectivePermissions(userId: string): Promise<ResolvedPermissions> {
        const userRoles = await this.roleRepo.findUserRoles(userId);
        const roleNames = userRoles.map(r => r.name);
        const isFounder = roleNames.includes(DEFAULT_HUMAN_ROLES.FOUNDER);

        if (isFounder) {
            return {
                roles: roleNames,
                permissions: ["*"], // Wildcard full administrative privilege
                isFounder: true
            };
        }

        const permissions = await this.permRepo.findUserEffectivePermissions(userId);
        const permissionKeys = Array.from(new Set(permissions.map(p => p.key)));

        logger.debug("Resolved user effective permissions", { userId, roleCount: roleNames.length, permCount: permissionKeys.length });

        return {
            roles: roleNames,
            permissions: permissionKeys,
            isFounder: false
        };
    }

    public hasRole(assignedRoles: string[], targetRole: string): boolean {
        if (assignedRoles.includes(DEFAULT_HUMAN_ROLES.FOUNDER)) return true;
        return assignedRoles.includes(targetRole);
    }

    public matchPermission(grantedPermissions: string[], requiredPermission: string): boolean {
        if (grantedPermissions.includes("*") || grantedPermissions.includes(requiredPermission)) {
            return true;
        }

        // Hierarchical wildcard checks e.g. "projects:*" matches "projects:read"
        return grantedPermissions.some(perm => {
            if (perm.endsWith(":*")) {
                const prefix = perm.slice(0, -2);
                return requiredPermission.startsWith(prefix);
            }
            if (perm.endsWith(".*")) {
                const prefix = perm.slice(0, -2);
                return requiredPermission.startsWith(prefix);
            }
            return false;
        });
    }
}
