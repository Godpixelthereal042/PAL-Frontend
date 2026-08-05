/**
 * PAL Permission Repository
 * 
 * Governing Spec: PAL-TDD-001 Chapter 9 & Appendix A
 * Architecture Bible: Chapter 23 (Identity & Auth)
 */

import { BaseRepository } from "../baseRepository.ts";
import { InternalServerError } from "../../core/errors.ts";

export interface PermissionEntity {
    id: string;
    key: string;
    description?: string;
    category: string;
    created_at: number;
}

export class PermissionRepository extends BaseRepository<PermissionEntity> {
    constructor() {
        super("permissions");
    }

    public async findByKey(key: string): Promise<PermissionEntity | null> {
        try {
            const db = await this.db();
            const row = await db.get(`SELECT * FROM ${this.tableName} WHERE key = ?`, [key]);
            return row ? (row as PermissionEntity) : null;
        } catch (err: any) {
            this.logger.error("Failed to findByKey", { key }, err);
            throw new InternalServerError("Database query error on permissions", { details: { message: err.message } });
        }
    }

    public async createPermission(permission: PermissionEntity): Promise<PermissionEntity> {
        try {
            const db = await this.db();
            await db.run(
                `INSERT INTO ${this.tableName} (id, key, description, category, created_at)
                 VALUES (?, ?, ?, ?, ?)`,
                [permission.id, permission.key, permission.description || null, permission.category, permission.created_at]
            );
            return permission;
        } catch (err: any) {
            this.logger.error("Failed to createPermission", { key: permission.key }, err);
            throw new InternalServerError("Database insert error on permissions", { details: { message: err.message } });
        }
    }

    public async attachPermissionToRole(roleId: string, permissionId: string): Promise<boolean> {
        try {
            const db = await this.db();
            await db.run(
                `INSERT INTO role_permissions (role_id, permission_id) VALUES (?, ?)`,
                [roleId, permissionId]
            );
            return true;
        } catch (err: any) {
            this.logger.error("Failed to attachPermissionToRole", { roleId, permissionId }, err);
            throw new InternalServerError("Database insert error on role_permissions", { details: { message: err.message } });
        }
    }

    public async findRolePermissions(roleId: string): Promise<PermissionEntity[]> {
        try {
            const db = await this.db();
            const rows = await db.all(
                `SELECT p.* FROM permissions p
                 JOIN role_permissions rp ON p.id = rp.permission_id
                 WHERE rp.role_id = ?`,
                [roleId]
            );
            return (rows || []) as PermissionEntity[];
        } catch (err: any) {
            this.logger.error("Failed to findRolePermissions", { roleId }, err);
            throw new InternalServerError("Database query error on role_permissions", { details: { message: err.message } });
        }
    }

    public async findUserEffectivePermissions(userId: string): Promise<PermissionEntity[]> {
        try {
            const db = await this.db();
            const rows = await db.all(
                `SELECT DISTINCT p.* FROM permissions p
                 JOIN role_permissions rp ON p.id = rp.permission_id
                 JOIN user_roles ur ON rp.role_id = ur.role_id
                 WHERE ur.user_id = ?`,
                [userId]
            );
            return (rows || []) as PermissionEntity[];
        } catch (err: any) {
            this.logger.error("Failed to findUserEffectivePermissions", { userId }, err);
            throw new InternalServerError("Database query error on user effective permissions", { details: { message: err.message } });
        }
    }
}
