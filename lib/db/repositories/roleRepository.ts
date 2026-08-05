/**
 * PAL Role Repository
 * 
 * Governing Spec: PAL-TDD-001 Chapter 9 & Appendix A
 * Architecture Bible: Chapter 23 (Identity & Auth)
 */

import { BaseRepository } from "../baseRepository.ts";
import { InternalServerError } from "../../core/errors.ts";

export interface RoleEntity {
    id: string;
    workspace_id: string;
    name: string;
    description?: string;
    system_role: number; // 0 or 1
    created_at: number;
}

export interface UserRoleEntity {
    user_id: string;
    role_id: string;
    assigned_by: string;
    assigned_at: number;
}

export class RoleRepository extends BaseRepository<RoleEntity> {
    constructor() {
        super("roles");
    }

    public async findByWorkspace(workspaceId: string): Promise<RoleEntity[]> {
        return this.findAll("workspace_id = ?", [workspaceId]);
    }

    public async findByName(workspaceId: string, name: string): Promise<RoleEntity | null> {
        try {
            const db = await this.db();
            const row = await db.get(`SELECT * FROM ${this.tableName} WHERE workspace_id = ? AND name = ?`, [workspaceId, name]);
            return row ? (row as RoleEntity) : null;
        } catch (err: any) {
            this.logger.error("Failed to findByName", { workspaceId, name }, err);
            throw new InternalServerError("Database query error on roles", { details: { message: err.message } });
        }
    }

    public async createRole(role: RoleEntity): Promise<RoleEntity> {
        try {
            const db = await this.db();
            await db.run(
                `INSERT INTO ${this.tableName} (id, workspace_id, name, description, system_role, created_at)
                 VALUES (?, ?, ?, ?, ?, ?)`,
                [role.id, role.workspace_id, role.name, role.description || null, role.system_role, role.created_at]
            );
            return role;
        } catch (err: any) {
            this.logger.error("Failed to createRole", { roleId: role.id }, err);
            throw new InternalServerError("Database insert error on roles", { details: { message: err.message } });
        }
    }

    public async assignRoleToUser(userRole: UserRoleEntity): Promise<boolean> {
        try {
            const db = await this.db();
            await db.run(
                `INSERT INTO user_roles (user_id, role_id, assigned_by, assigned_at)
                 VALUES (?, ?, ?, ?)`,
                [userRole.user_id, userRole.role_id, userRole.assigned_by, userRole.assigned_at]
            );
            return true;
        } catch (err: any) {
            this.logger.error("Failed to assignRoleToUser", { userId: userRole.user_id, roleId: userRole.role_id }, err);
            throw new InternalServerError("Database insert error on user_roles", { details: { message: err.message } });
        }
    }

    public async findUserRoles(userId: string): Promise<RoleEntity[]> {
        try {
            const db = await this.db();
            const rows = await db.all(
                `SELECT r.* FROM roles r
                 JOIN user_roles ur ON r.id = ur.role_id
                 WHERE ur.user_id = ?`,
                [userId]
            );
            return (rows || []) as RoleEntity[];
        } catch (err: any) {
            this.logger.error("Failed to findUserRoles", { userId }, err);
            throw new InternalServerError("Database query error on user_roles", { details: { message: err.message } });
        }
    }

    public async removeRoleFromUser(userId: string, roleId: string): Promise<boolean> {
        try {
            const db = await this.db();
            const res = await db.run(`DELETE FROM user_roles WHERE user_id = ? AND role_id = ?`, [userId, roleId]);
            return (res.changes || 0) > 0;
        } catch (err: any) {
            this.logger.error("Failed to removeRoleFromUser", { userId, roleId }, err);
            throw new InternalServerError("Database delete error on user_roles", { details: { message: err.message } });
        }
    }
}
