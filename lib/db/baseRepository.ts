/**
 * PAL Abstract Base Repository
 * 
 * Governing Bible Chapters:
 * - Chapter 4: Core Domain Model & Business Entities
 * - Chapter 28: Deployment, Infrastructure & DevOps Architecture
 * - Sprint 7 Milestone 3: Multi-Tenant Row Level Security (RLS) & Workspace Scoping
 */

import { getDB, type Database } from "../db.ts";
import { supabase } from "../supabaseClient.ts";
import { createLogger, PALLogger } from "../core/logger.ts";
import { NotFoundError, InternalServerError } from "../core/errors.ts";

export abstract class BaseRepository<T extends { id: string }> {
    protected tableName: string;
    protected logger: PALLogger;
    protected activeWorkspaceId: string = "default_workspace";

    constructor(tableName: string) {
        this.tableName = tableName;
        this.logger = createLogger(`Repo:${tableName}`);
    }

    public setWorkspaceContext(workspaceId: string): this {
        this.activeWorkspaceId = workspaceId;
        return this;
    }

    public getWorkspaceContext(): string {
        return this.activeWorkspaceId;
    }

    protected isSupabaseEnabled(): boolean {
        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
        const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
        return Boolean(
            supabaseUrl &&
            supabaseAnonKey &&
            !supabaseUrl.includes("dummy-url") &&
            !supabaseAnonKey.includes("dummy-key")
        );
    }

    protected async db(): Promise<Database> {
        const database = await getDB();
        // Set PostgreSQL RLS session variable if using Postgres
        try {
            if (this.activeWorkspaceId && typeof database.run === "function") {
                await database.run(`SET LOCAL app.current_workspace_id = ?`, [this.activeWorkspaceId]).catch(() => {
                    // Ignored on SQLite or databases without app.current_workspace_id parameter support
                });
            }
        } catch {
            // Non-blocking fallback for databases that don't support SET LOCAL
        }
        return database;
    }

    public async findById(id: string): Promise<T | null> {
        try {
            if (this.isSupabaseEnabled()) {
                let query = supabase.from(this.tableName).select("*").eq("id", id);
                if (this.activeWorkspaceId && this.activeWorkspaceId !== "default_workspace") {
                    query = query.eq("workspace_id", this.activeWorkspaceId);
                }
                const { data, error } = await query.maybeSingle();
                if (error) throw error;
                return data ? (data as T) : null;
            }

            const database = await this.db();
            const sql = `SELECT * FROM ${this.tableName} WHERE id = ?`;
            const row = await database.get(sql, [id]);

            if (!row) {
                return null;
            }

            // Enforce multi-tenant isolation if a specific workspace context is set
            if (
                this.activeWorkspaceId &&
                this.activeWorkspaceId !== "default_workspace" &&
                (row as any).workspace_id &&
                (row as any).workspace_id !== this.activeWorkspaceId
            ) {
                return null;
            }

            return row as T;
        } catch (err: any) {
            this.logger.error(`Failed to findById on ${this.tableName}`, { id }, err);
            throw new InternalServerError(`Database query error on ${this.tableName}`, { details: { id, message: err.message } });
        }
    }

    public async findByIdOrThrow(id: string): Promise<T> {
        const entity = await this.findById(id);
        if (!entity) {
            throw new NotFoundError(`Entity of type ${this.tableName} with ID ${id} not found`, { details: { id, tableName: this.tableName } });
        }
        return entity;
    }

    public async findAll(whereClause: string = "", params: any[] = []): Promise<T[]> {
        try {
            const isSpecificTenant = this.activeWorkspaceId && this.activeWorkspaceId !== "default_workspace";

            if (this.isSupabaseEnabled()) {
                let query = supabase.from(this.tableName).select("*");
                if (isSpecificTenant) {
                    query = query.eq("workspace_id", this.activeWorkspaceId);
                }
                if (whereClause) {
                    const cleanWhere = whereClause.trim();
                    const simpleEq = cleanWhere.match(/^(\w+)\s*=\s*\?$/i);
                    if (simpleEq && params.length === 1) {
                        query = query.eq(simpleEq[1], params[0]);
                    } else {
                        const database = await this.db();
                        let sql = `SELECT * FROM ${this.tableName} WHERE ${whereClause}`;
                        let queryParams = [...params];
                        if (isSpecificTenant) {
                            sql = `SELECT * FROM ${this.tableName} WHERE (${whereClause}) AND workspace_id = ?`;
                            queryParams.push(this.activeWorkspaceId);
                        }
                        const rows = await database.all(sql, queryParams);
                        return (rows || []) as T[];
                    }
                }
                const { data, error } = await query;
                if (error) throw error;
                return (data || []) as T[];
            }

            const database = await this.db();
            let sql = `SELECT * FROM ${this.tableName}`;
            let sqlParams: any[] = [];

            if (whereClause && isSpecificTenant) {
                sql = `SELECT * FROM ${this.tableName} WHERE (${whereClause}) AND workspace_id = ?`;
                sqlParams = [...params, this.activeWorkspaceId];
            } else if (whereClause) {
                sql = `SELECT * FROM ${this.tableName} WHERE ${whereClause}`;
                sqlParams = [...params];
            } else if (isSpecificTenant) {
                sql = `SELECT * FROM ${this.tableName} WHERE workspace_id = ?`;
                sqlParams = [this.activeWorkspaceId];
            }

            const rows = await database.all(sql, sqlParams);
            return (rows || []) as T[];
        } catch (err: any) {
            this.logger.error(`Failed to findAll on ${this.tableName}`, { whereClause, params }, err);
            throw new InternalServerError(`Database query error on ${this.tableName}`, { details: { message: err.message } });
        }
    }

    public async deleteById(id: string): Promise<boolean> {
        try {
            const isSpecificTenant = this.activeWorkspaceId && this.activeWorkspaceId !== "default_workspace";

            if (this.isSupabaseEnabled()) {
                let query = supabase.from(this.tableName).delete({ count: 'exact' }).eq("id", id);
                if (isSpecificTenant) {
                    query = query.eq("workspace_id", this.activeWorkspaceId);
                }
                const { error, count } = await query;
                if (error) throw error;
                return (count || 0) > 0;
            }

            // In local SQLite, check if entity exists and belongs to active workspace before deleting
            const existing = await this.findById(id);
            if (!existing) {
                return false;
            }

            const database = await this.db();
            const sql = `DELETE FROM ${this.tableName} WHERE id = ?`;
            const res = await database.run(sql, [id]);
            return (res.changes || 0) > 0;
        } catch (err: any) {
            this.logger.error(`Failed to deleteById on ${this.tableName}`, { id }, err);
            throw new InternalServerError(`Database delete error on ${this.tableName}`, { details: { id, message: err.message } });
        }
    }

    public async insertEntity(entity: Record<string, any>): Promise<T> {
        try {
            const payload = { workspace_id: entity.workspace_id || this.activeWorkspaceId, ...entity };
            if (this.isSupabaseEnabled()) {
                const { data, error } = await supabase.from(this.tableName).insert(payload).select().single();
                if (error) throw error;
                return data as T;
            }
            const database = await this.db();
            const keys = Object.keys(payload);
            const placeholders = keys.map(() => "?").join(", ");
            const values = Object.values(payload);
            const sql = `INSERT INTO ${this.tableName} (${keys.join(", ")}) VALUES (${placeholders})`;
            await database.run(sql, values);
            return payload as unknown as T;
        } catch (err: any) {
            this.logger.error(`Failed to insertEntity on ${this.tableName}`, { entity }, err);
            throw new InternalServerError(`Database insert error on ${this.tableName}`, { details: { message: err.message } });
        }
    }

    public async upsertEntity(entity: Record<string, any>, onConflictCols: string[] = ["id"]): Promise<T> {
        try {
            const payload = { workspace_id: entity.workspace_id || this.activeWorkspaceId, ...entity };
            if (this.isSupabaseEnabled()) {
                const { data, error } = await supabase.from(this.tableName).upsert(payload, { onConflict: onConflictCols.join(",") }).select().single();
                if (error) throw error;
                return data as T;
            }
            const database = await this.db();
            const keys = Object.keys(payload);
            const placeholders = keys.map(() => "?").join(", ");
            const values = Object.values(payload);
            const sql = `INSERT OR REPLACE INTO ${this.tableName} (${keys.join(", ")}) VALUES (${placeholders})`;
            await database.run(sql, values);
            return payload as unknown as T;
        } catch (err: any) {
            this.logger.error(`Failed to upsertEntity on ${this.tableName}`, { entity }, err);
            throw new InternalServerError(`Database upsert error on ${this.tableName}`, { details: { message: err.message } });
        }
    }
}
