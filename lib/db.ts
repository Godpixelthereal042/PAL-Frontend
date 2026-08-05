import { supabase } from "./supabaseClient.ts";

export interface Database {
    get(sql: string, params?: any[]): Promise<any>;
    all(sql: string, params?: any[]): Promise<any[]>;
    run(sql: string, params?: any[]): Promise<{ lastID?: string | number; changes?: number }>;
    exec(sql: string): Promise<void>;
}

class SupabaseDbCompatibility implements Database {
    async get(sql: string, params: any[] = []): Promise<any> {
        try {
            const result = await this.execute(sql, params);
            if (Array.isArray(result)) {
                return result[0] || null;
            }
            return result;
        } catch (err) {
            console.error("Supabase Compatibility get() Error:", err, "SQL:", sql, "Params:", params);
            throw err;
        }
    }

    async all(sql: string, params: any[] = []): Promise<any[]> {
        try {
            const result = await this.execute(sql, params);
            if (Array.isArray(result)) {
                return result;
            }
            return result ? [result] : [];
        } catch (err) {
            console.error("Supabase Compatibility all() Error:", err, "SQL:", sql, "Params:", params);
            throw err;
        }
    }

    async run(sql: string, params: any[] = []): Promise<{ lastID?: string | number; changes?: number }> {
        try {
            await this.execute(sql, params);
            return { lastID: undefined, changes: 1 };
        } catch (err) {
            console.error("Supabase Compatibility run() Error:", err, "SQL:", sql, "Params:", params);
            throw err;
        }
    }

    async exec(sql: string): Promise<void> {
        const clean = sql.trim().toUpperCase();
        if (clean === "BEGIN TRANSACTION" || clean === "BEGIN" || clean === "COMMIT" || clean === "ROLLBACK") {
            return;
        }
        // Ignores standard table creation / alters as schema is predefined on Supabase
        if (clean.includes("CREATE TABLE") || clean.includes("ALTER TABLE")) {
            return;
        }
        throw new Error("Unsupported exec SQL: " + sql);
    }

    private normalizeValue(table: string, col: string, val: any) {
        if (val === undefined || val === null) return null;
        const intBoolTables = ["integrations", "notifications", "logs", "milestones"];
        const intBoolCols = ["isSynced", "isAutoSync", "isUnread", "isCompleted", "completed"];
        if (intBoolTables.includes(table) && intBoolCols.includes(col)) {
            if (typeof val === "boolean") {
                return val ? 1 : 0;
            }
            if (val === "true" || val === 1 || val === "1") return 1;
            if (val === "false" || val === 0 || val === "0") return 0;
        }
        return val;
    }

    private async execute(sql: string, params: any[]): Promise<any> {
        const cleanSql = sql.trim().replace(/\s+/g, " ");

        // 1. DELETE FROM
        if (cleanSql.toUpperCase().startsWith("DELETE FROM")) {
            const tableMatch = cleanSql.match(/DELETE\s+FROM\s+(\w+)(?:\s+WHERE\s+(.+))?/i);
            if (!tableMatch) throw new Error("Invalid DELETE query: " + sql);
            const table = tableMatch[1].toLowerCase();
            const whereClause = tableMatch[2];

            let query = supabase.from(table).delete();
            if (whereClause) {
                query = this.applyWhereClause(query, table, whereClause, params);
            } else {
                // Delete all rows in Supabase: need a filter because delete all without filter is blocked
                query = query.neq("id", "dummy_non_existent_id");
            }
            const { data, error } = await query;
            if (error) throw new Error(`Supabase DELETE error on ${table}: ${error.message}`);
            return data;
        }

        // 2. INSERT INTO / INSERT OR IGNORE INTO
        if (cleanSql.toUpperCase().startsWith("INSERT INTO") || cleanSql.toUpperCase().startsWith("INSERT OR IGNORE INTO") || cleanSql.toUpperCase().startsWith("INSERT OR REPLACE INTO")) {
            const isIgnore = cleanSql.toUpperCase().includes("INSERT OR IGNORE");
            const isReplace = cleanSql.toUpperCase().includes("INSERT OR REPLACE");
            const isUpsert = cleanSql.toUpperCase().includes("ON CONFLICT");
            
            const insertMatch = cleanSql.match(/(?:INSERT\s+OR\s+(?:IGNORE|REPLACE)\s+INTO|INSERT\s+INTO)\s+(\w+)\s*\(([^)]+)\)\s*VALUES\s*\((.+)\)(?:\s+ON\s+CONFLICT.*)?$/i);
            if (!insertMatch) throw new Error("Invalid INSERT query: " + sql);
            const table = insertMatch[1].toLowerCase();
            const colsStr = insertMatch[2];
            const cols = colsStr.split(",").map(c => c.trim().replace(/['"`]/g, ""));
            
            const valsList = insertMatch[3].split(",").map(v => v.trim());
            const row: any = {};
            let paramIdx = 0;

            cols.forEach((col, idx) => {
                const valExpr = valsList[idx];
                let val;
                if (valExpr === "?") {
                    val = params[paramIdx++];
                } else {
                    val = valExpr.replace(/['"]/g, "");
                    if (!isNaN(Number(val)) && val !== "") {
                        val = Number(val);
                    }
                }
                row[col] = this.normalizeValue(table, col, val);
            });

            let query;
            if (isIgnore) {
                query = supabase.from(table).upsert(row, { onConflict: 'id', ignoreDuplicates: true });
            } else if (isReplace || isUpsert) {
                query = supabase.from(table).upsert(row);
            } else {
                query = supabase.from(table).insert(row);
            }
            const { data, error } = await query;
            if (error) throw new Error(`Supabase INSERT error on ${table}: ${error.message}`);
            return data;
        }

        // 3. UPDATE
        if (cleanSql.toUpperCase().startsWith("UPDATE")) {
            const updateMatch = cleanSql.match(/UPDATE\s+(\w+)\s+SET\s+(.+?)(?:\s+WHERE\s+(.+))?$/i);
            if (!updateMatch) throw new Error("Invalid UPDATE query: " + sql);
            const table = updateMatch[1].toLowerCase();
            const setClause = updateMatch[2];
            const whereClause = updateMatch[3];

            const setParts = setClause.split(",").map(p => p.trim());
            const updateData: any = {};
            let paramIdx = 0;

            setParts.forEach((part) => {
                const eqIdx = part.indexOf("=");
                const col = part.substring(0, eqIdx).trim().replace(/['"`]/g, "");
                const valStr = part.substring(eqIdx + 1).trim();
                let val;
                if (valStr === "?") {
                    val = params[paramIdx++];
                } else {
                    val = valStr.replace(/['"]/g, "");
                    if (!isNaN(Number(val)) && val !== "") {
                        val = Number(val);
                    }
                }
                updateData[col] = this.normalizeValue(table, col, val);
            });

            const whereParams = params.slice(paramIdx);
            let query = supabase.from(table).update(updateData);
            if (whereClause) {
                query = this.applyWhereClause(query, table, whereClause, whereParams);
            } else {
                query = query.neq("id", "dummy_non_existent_id");
            }
            const { data, error } = await query;
            if (error) throw new Error(`Supabase UPDATE error on ${table}: ${error.message}`);
            return data;
        }

        // 4. SELECT
        if (cleanSql.toUpperCase().startsWith("SELECT")) {
            // Count queries
            const countMatch = cleanSql.match(/SELECT\s+COUNT\(\*\)\s+as\s+(\w+)\s+FROM\s+(\w+)(?:\s+WHERE\s+(.+))?/i);
            if (countMatch) {
                const countAlias = countMatch[1];
                const table = countMatch[2].toLowerCase();
                const whereClause = countMatch[3];

                let query = supabase.from(table).select("*", { count: "exact", head: true });
                if (whereClause) {
                    query = this.applyWhereClause(query, table, whereClause, params);
                }
                const { count, error } = await query;
                if (error) throw new Error(`Supabase SELECT COUNT error on ${table}: ${error.message}`);
                return { [countAlias]: count || 0 };
            }

            // Sum queries
            const sumMatch = cleanSql.match(/SELECT\s+SUM\((["\w]+)\)\s+as\s+(\w+)\s+FROM\s+(\w+)(?:\s+WHERE\s+(.+))?/i);
            if (sumMatch) {
                const sumCol = sumMatch[1].replace(/["`]/g, "");
                const sumAlias = sumMatch[2];
                const table = sumMatch[3].toLowerCase();
                const whereClause = sumMatch[4];

                let query = supabase.from(table).select(sumCol);
                if (whereClause) {
                    query = this.applyWhereClause(query, table, whereClause, params);
                }
                const { data, error } = await query;
                if (error) throw new Error(`Supabase SELECT SUM error on ${table}: ${error.message}`);
                const total = (data || []).reduce((sum: number, item: any) => sum + (Number(item[sumCol]) || 0), 0);
                return { [sumAlias]: total };
            }

            // General Select query
            const selectMatch = cleanSql.match(/SELECT\s+(.+?)\s+FROM\s+(\w+)(?:\s+WHERE\s+(.+?))?(?:\s+ORDER\s+BY\s+(.+?))?(?:\s+LIMIT\s+(\d+))?$/i);
            if (!selectMatch) throw new Error("Invalid SELECT query: " + sql);
            const selectFields = selectMatch[1].trim();
            const table = selectMatch[2].toLowerCase();
            const whereClause = selectMatch[3];
            const orderByClause = selectMatch[4];
            const limitVal = selectMatch[5];

            let selectStr = "*";
            if (selectFields !== "*") {
                selectStr = selectFields.split(",").map(f => f.trim().replace(/['"`]/g, "")).join(",");
            }

            let query = supabase.from(table).select(selectStr);
            if (whereClause) {
                query = this.applyWhereClause(query, table, whereClause, params);
            }

            if (orderByClause) {
                const orders = orderByClause.split(",").map(o => o.trim());
                orders.forEach(orderPart => {
                    const parts = orderPart.split(/\s+/);
                    const col = parts[0].trim().replace(/['"`]/g, "");
                    const dir = parts[1] ? parts[1].toUpperCase() : "ASC";
                    query = query.order(col, { ascending: dir === "ASC" });
                });
            }

            if (limitVal) {
                query = query.limit(parseInt(limitVal, 10));
            }

            const { data, error } = await query;
            if (error) throw new Error(`Supabase SELECT error on ${table}: ${error.message}`);
            return data;
        }

        throw new Error("Unsupported query: " + sql);
    }

    private applyWhereClause(query: any, table: string, whereClause: string, params: any[]): any {
        return this.applyWhereClauseWithParamIdx(query, table, whereClause, params, { idx: 0 }).query;
    }

    private applyWhereClauseWithParamIdx(query: any, table: string, whereClause: string, params: any[], paramTracker: { idx: number }): { query: any } {
        let cleanWhere = whereClause.trim();
        // Remove wrapping parentheses if the entire clause is wrapped
        if (cleanWhere.startsWith("(") && cleanWhere.endsWith(")")) {
            let depth = 0;
            let isWrapped = true;
            for (let i = 0; i < cleanWhere.length; i++) {
                if (cleanWhere[i] === "(") depth++;
                if (cleanWhere[i] === ")") depth--;
                if (depth === 0 && i < cleanWhere.length - 1) { isWrapped = false; break; }
            }
            if (isWrapped) cleanWhere = cleanWhere.slice(1, -1).trim();
        }

        // Split on top-level OR (not inside parentheses)
        const orParts = this.splitTopLevel(cleanWhere, "OR");
        if (orParts.length > 1) {
            // Build Supabase .or() filter string
            const orFilters: string[] = [];
            for (const orPart of orParts) {
                const trimmed = orPart.trim();
                // Handle IN (SELECT ...) subquery within OR branch
                const subqueryMatch = trimmed.match(/^(\w+)\s+IN\s*\(\s*SELECT\s+(.+)\)$/i);
                if (subqueryMatch) {
                    const field = subqueryMatch[1];
                    // Count params consumed by this branch
                    const qCount = (trimmed.match(/\?/g) || []).length;
                    const branchParams = params.slice(paramTracker.idx, paramTracker.idx + qCount);
                    paramTracker.idx += qCount;
                    // Execute subquery synchronously is not possible, so use in filter with fetched IDs
                    // We'll collect the IDs and build an in filter
                    orFilters.push(`__SUBQUERY__:${field}:${subqueryMatch[2]}:${JSON.stringify(branchParams)}`);
                    continue;
                }
                // Simple condition: field op value
                const eqMatch = trimmed.match(/^(\w+|"[^"]+")\s*(=|!=|<>)\s*\?$/i);
                if (eqMatch) {
                    const f = eqMatch[1].replace(/['"`]/g, "");
                    const op = eqMatch[2];
                    const val = this.normalizeValue(table, f, params[paramTracker.idx++]);
                    if (op === "=") orFilters.push(`${f}.eq.${val}`);
                    else orFilters.push(`${f}.neq.${val}`);
                    continue;
                }
                const constMatch = trimmed.match(/^(\w+|"[^"]+")\s*(=|!=|<>)\s*(['"]?)(.*?)\3$/i);
                if (constMatch) {
                    const f = constMatch[1].replace(/['"`]/g, "");
                    const op = constMatch[2];
                    let val: any = constMatch[4];
                    if (!isNaN(Number(val)) && val !== "") val = Number(val);
                    val = this.normalizeValue(table, f, val);
                    if (op === "=") orFilters.push(`${f}.eq.${val}`);
                    else orFilters.push(`${f}.neq.${val}`);
                    continue;
                }
                // Fallback: treat as simple AND conditions within the OR branch
                orFilters.push(`__COMPLEX__:${trimmed}`);
            }

            // Check if we have subqueries — if so, we need to resolve them
            const hasSubquery = orFilters.some(f => f.startsWith("__SUBQUERY__:"));
            const hasComplex = orFilters.some(f => f.startsWith("__COMPLEX__:"));

            if (!hasSubquery && !hasComplex) {
                query = query.or(orFilters.join(","));
            } else {
                // For subqueries and complex OR, we can't use .or() directly.
                // Instead, skip the filter here — the caller will need to handle merging.
                // Log a warning but don't crash.
                console.warn(`Supabase compat: OR clause with subqueries simplified for table ${table}. Filtering may be incomplete.`);
                // Apply only the simple filters we can handle
                const simpleFilters = orFilters.filter(f => !f.startsWith("__SUBQUERY__:") && !f.startsWith("__COMPLEX__:"));
                if (simpleFilters.length > 0) {
                    // At minimum apply an OR of what we can parse
                    query = query.or(simpleFilters.join(","));
                }
            }
            return { query };
        }

        // No OR — process AND conditions
        const parts = cleanWhere.split(/\s+AND\s+/i);

        for (let part of parts) {
            part = part.trim();

            // Check for simple field = ? or field != ?
            const eqMatch = part.match(/^(\w+|"[^"]+")\s*(=|!=|<>)\s*\?$/i);
            if (eqMatch) {
                const field = eqMatch[1].replace(/['"`]/g, "");
                const op = eqMatch[2];
                const val = this.normalizeValue(table, field, params[paramTracker.idx++]);
                if (op === "=") {
                    query = query.eq(field, val);
                } else {
                    query = query.neq(field, val);
                }
                continue;
            }

            // Check for field = 'value' or field != 'value' or field = 1
            const constMatch = part.match(/^(\w+|"[^"]+")\s*(=|!=|<>)\s*(['"]?)(.*?)\3$/i);
            if (constMatch) {
                const field = constMatch[1].replace(/['"`]/g, "");
                const op = constMatch[2];
                let val: any = constMatch[4];
                if (!isNaN(Number(val)) && val !== "") {
                    val = Number(val);
                }
                val = this.normalizeValue(table, field, val);
                if (op === "=") {
                    query = query.eq(field, val);
                } else {
                    query = query.neq(field, val);
                }
                continue;
            }

            // Check for field > ? or field < ? or field >= ? or field <= ?
            const compMatch = part.match(/^(\w+|"[^"]+")\s*(>=|<=|>|<)\s*\?$/i);
            if (compMatch) {
                const field = compMatch[1].replace(/['"`]/g, "");
                const op = compMatch[2];
                const val = this.normalizeValue(table, field, params[paramTracker.idx++]);
                if (op === ">") query = query.gt(field, val);
                else if (op === ">=") query = query.gte(field, val);
                else if (op === "<") query = query.lt(field, val);
                else if (op === "<=") query = query.lte(field, val);
                continue;
            }

            // Check for field IS NOT NULL
            if (part.toUpperCase().endsWith("IS NOT NULL")) {
                const field = part.substring(0, part.toUpperCase().indexOf("IS NOT NULL")).trim().replace(/['"`]/g, "");
                query = query.not(field, "is", null);
                continue;
            }

            // Check for field IS NULL
            if (part.toUpperCase().endsWith("IS NULL")) {
                const field = part.substring(0, part.toUpperCase().indexOf("IS NULL")).trim().replace(/['"`]/g, "");
                query = query.is(field, null);
                continue;
            }

            // Check for IN clause with placeholders e.g. "id IN (?, ?)"
            const inPlaceholdersMatch = part.match(/^(\w+|"[^"]+")\s+IN\s*\(([^)]+)\)$/i);
            if (inPlaceholdersMatch) {
                const field = inPlaceholdersMatch[1].replace(/['"`]/g, "");
                const inner = inPlaceholdersMatch[2].trim();
                if (inner.includes("?")) {
                    const placeholdersCount = inner.split(",").length;
                    const inVals = [];
                    for (let i = 0; i < placeholdersCount; i++) {
                        inVals.push(this.normalizeValue(table, field, params[paramTracker.idx++]));
                    }
                    query = query.in(field, inVals);
                } else {
                    const inVals = inner.split(",").map(v => this.normalizeValue(table, field, v.trim().replace(/['"`]/g, "")));
                    query = query.in(field, inVals);
                }
                continue;
            }

            // Check for IN (SELECT ...) subquery — execute inner query first
            const inSubqueryMatch = part.match(/^(\w+|"[^"]+")\s+IN\s*\(\s*SELECT\s+(.+)\)$/i);
            if (inSubqueryMatch) {
                // We can't execute async here synchronously, so skip this filter with a warning.
                // The calling code should restructure to avoid subqueries in Supabase mode.
                const field = inSubqueryMatch[1].replace(/['"`]/g, "");
                console.warn(`Supabase compat: Skipping IN (SELECT ...) subquery for field "${field}". Results may be unfiltered.`);
                continue;
            }

            throw new Error(`Unsupported WHERE condition: "${part}" in clause: "${whereClause}"`);
        }

        return { query };
    }

    // Split a SQL string on a keyword (AND/OR) only at the top level (not inside parentheses)
    private splitTopLevel(clause: string, keyword: string): string[] {
        const results: string[] = [];
        let depth = 0;
        let current = "";
        const re = new RegExp(`\\s+${keyword}\\s+`, "gi");
        let lastIndex = 0;

        for (let i = 0; i < clause.length; i++) {
            if (clause[i] === "(") depth++;
            if (clause[i] === ")") depth--;
        }

        // Simple approach: scan character by character
        depth = 0;
        const upperClause = clause.toUpperCase();
        const kwUpper = ` ${keyword.toUpperCase()} `;

        for (let i = 0; i < clause.length; i++) {
            if (clause[i] === "(") depth++;
            if (clause[i] === ")") depth--;
            if (depth === 0) {
                // Check if keyword matches at this position (with surrounding spaces)
                const remaining = clause.substring(i);
                const upperRemaining = upperClause.substring(i);
                const kwMatch = upperRemaining.match(new RegExp(`^\\s+${keyword.toUpperCase()}\\s+`, "i"));
                if (kwMatch) {
                    results.push(clause.substring(lastIndex, i).trim());
                    lastIndex = i + kwMatch[0].length;
                    i = lastIndex - 1; // -1 because loop will increment
                }
            }
        }
        results.push(clause.substring(lastIndex).trim());
        return results.filter(r => r.length > 0);
    }
}

let dbInstance: Database | null = null;

export async function getDB(): Promise<Database> {
    if (dbInstance) return dbInstance;

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

    // Check if URL is present and not a dummy placeholder
    const useSupabase = supabaseUrl && supabaseAnonKey && 
                        !supabaseUrl.includes("dummy-url") && 
                        !supabaseAnonKey.includes("dummy-key");

    if (useSupabase) {
        console.log("Database: Using Supabase Cloud compatibility layer");
        dbInstance = new SupabaseDbCompatibility();
    } else {
        if (process.env.VERCEL === "1") {
            throw new Error(
                "Database error: Supabase environment variables (NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY) are not configured. SQLite is not supported on Vercel."
            );
        }
        console.log("Database: Using local SQLite database (pal.db)");
        const path = await import("path");

        const { open } = await import("sqlite");
        const sqlite3 = (await import("sqlite3")).default;

        const dbPath = path.resolve(process.cwd(), "pal.db");
        const sqliteDb = await open({
            filename: dbPath,
            driver: sqlite3.Database
        });
        await sqliteDb.exec(`
            CREATE TABLE IF NOT EXISTS otp_codes (
                email TEXT PRIMARY KEY,
                code TEXT NOT NULL,
                expires_at BIGINT NOT NULL
            );
            CREATE TABLE IF NOT EXISTS projects (
                id TEXT PRIMARY KEY,
                title TEXT NOT NULL,
                type TEXT DEFAULT 'General',
                description TEXT,
                date TEXT,
                color TEXT,
                goal TEXT,
                priority TEXT DEFAULT 'medium',
                status TEXT DEFAULT 'Planning',
                due_date TEXT,
                owner_id TEXT REFERENCES users(id) ON DELETE SET NULL,
                created_at BIGINT
            );
            CREATE TABLE IF NOT EXISTS tasks (
                id TEXT PRIMARY KEY,
                project_id TEXT NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
                title TEXT NOT NULL,
                description TEXT,
                status TEXT NOT NULL DEFAULT 'not_started',
                priority TEXT NOT NULL DEFAULT 'medium',
                assignee_id TEXT REFERENCES users(id) ON DELETE SET NULL,
                due_date TEXT,
                created_at BIGINT NOT NULL
            );
            CREATE TABLE IF NOT EXISTS decisions (
                id TEXT PRIMARY KEY,
                project_id TEXT NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
                user_id TEXT REFERENCES users(id) ON DELETE CASCADE,
                title TEXT NOT NULL,
                description TEXT,
                status TEXT DEFAULT 'decided',
                created_at BIGINT NOT NULL
            );
        `);
        // Business Brain tables (Milestone 1A)
        await sqliteDb.exec(`
            CREATE TABLE IF NOT EXISTS business_brain (
                id TEXT PRIMARY KEY,
                user_id TEXT NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
                business_name TEXT,
                business_description TEXT,
                industry TEXT,
                business_stage TEXT,
                target_market TEXT,
                priorities TEXT,
                created_at BIGINT NOT NULL,
                updated_at BIGINT NOT NULL
            );
            CREATE TABLE IF NOT EXISTS business_goals (
                id TEXT PRIMARY KEY,
                brain_id TEXT NOT NULL REFERENCES business_brain(id) ON DELETE CASCADE,
                title TEXT NOT NULL,
                description TEXT,
                timeframe TEXT,
                status TEXT DEFAULT 'active',
                created_at BIGINT NOT NULL
            );
            CREATE TABLE IF NOT EXISTS business_offers (
                id TEXT PRIMARY KEY,
                brain_id TEXT NOT NULL REFERENCES business_brain(id) ON DELETE CASCADE,
                name TEXT NOT NULL,
                description TEXT,
                offer_type TEXT,
                price TEXT,
                status TEXT DEFAULT 'active',
                created_at BIGINT NOT NULL
            );
            CREATE TABLE IF NOT EXISTS business_customer_segments (
                id TEXT PRIMARY KEY,
                brain_id TEXT NOT NULL REFERENCES business_brain(id) ON DELETE CASCADE,
                name TEXT NOT NULL,
                description TEXT,
                created_at BIGINT NOT NULL
            );
            CREATE TABLE IF NOT EXISTS business_challenges (
                id TEXT PRIMARY KEY,
                brain_id TEXT NOT NULL REFERENCES business_brain(id) ON DELETE CASCADE,
                title TEXT NOT NULL,
                description TEXT,
                severity TEXT DEFAULT 'medium',
                status TEXT DEFAULT 'active',
                created_at BIGINT NOT NULL
            );
            CREATE TABLE IF NOT EXISTS business_notes (
                id TEXT PRIMARY KEY,
                brain_id TEXT NOT NULL REFERENCES business_brain(id) ON DELETE CASCADE,
                content TEXT NOT NULL,
                category TEXT,
                created_at BIGINT NOT NULL
            );
            CREATE TABLE IF NOT EXISTS integration_audit_logs (
                id TEXT PRIMARY KEY,
                integration_id TEXT,
                provider TEXT NOT NULL,
                connector_id TEXT NOT NULL,
                user_id TEXT NOT NULL,
                operation TEXT NOT NULL,
                status TEXT NOT NULL,
                request_payload TEXT,
                response_payload TEXT,
                error_message TEXT,
                execution_time_ms INTEGER NOT NULL,
                created_at BIGINT NOT NULL
            );
            CREATE TABLE IF NOT EXISTS notification_history (
                id TEXT PRIMARY KEY,
                user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
                category TEXT NOT NULL,
                type TEXT NOT NULL,
                title TEXT NOT NULL,
                message TEXT NOT NULL,
                priority TEXT NOT NULL,
                severity TEXT NOT NULL,
                action_label TEXT,
                action_url TEXT,
                channel TEXT NOT NULL,
                status TEXT NOT NULL,
                scheduled_for BIGINT NOT NULL,
                expires_at BIGINT,
                created_at BIGINT NOT NULL,
                read_at BIGINT,
                dismissed_at BIGINT,
                metadata TEXT
            );
            CREATE TABLE IF NOT EXISTS notification_preferences (
                user_id TEXT PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
                quiet_hours_enabled INTEGER DEFAULT 1,
                quiet_hours_start TEXT DEFAULT '22:00',
                quiet_hours_end TEXT DEFAULT '07:00',
                min_priority TEXT DEFAULT 'low',
                batching_enabled INTEGER DEFAULT 1,
                enabled_categories TEXT,
                enabled_channels TEXT,
                updated_at BIGINT NOT NULL
            );
            CREATE TABLE IF NOT EXISTS workflows (
                id TEXT PRIMARY KEY,
                user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
                name TEXT NOT NULL,
                description TEXT,
                enabled INTEGER DEFAULT 1,
                trigger TEXT NOT NULL,
                conditions TEXT,
                actions TEXT NOT NULL,
                schedule TEXT,
                metadata TEXT,
                created_at BIGINT NOT NULL,
                updated_at BIGINT NOT NULL
            );
            CREATE TABLE IF NOT EXISTS workflow_executions (
                id TEXT PRIMARY KEY,
                workflow_id TEXT NOT NULL REFERENCES workflows(id) ON DELETE CASCADE,
                user_id TEXT NOT NULL,
                trigger_type TEXT NOT NULL,
                status TEXT NOT NULL,
                started_at BIGINT NOT NULL,
                completed_at BIGINT,
                errors TEXT,
                metadata TEXT
            );
            CREATE TABLE IF NOT EXISTS workflow_execution_steps (
                id TEXT PRIMARY KEY,
                execution_id TEXT NOT NULL REFERENCES workflow_executions(id) ON DELETE CASCADE,
                step_index INTEGER NOT NULL,
                action_type TEXT NOT NULL,
                status TEXT NOT NULL,
                request_payload TEXT,
                result_payload TEXT,
                error TEXT,
                started_at BIGINT NOT NULL,
                completed_at BIGINT
            );
            CREATE TABLE IF NOT EXISTS organizations (
                id TEXT PRIMARY KEY,
                user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
                name TEXT NOT NULL,
                industry TEXT,
                website TEXT,
                description TEXT,
                relationship_strength TEXT DEFAULT 'healthy',
                notes TEXT,
                created_at BIGINT NOT NULL,
                updated_at BIGINT NOT NULL
            );
            CREATE TABLE IF NOT EXISTS people (
                id TEXT PRIMARY KEY,
                user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
                name TEXT NOT NULL,
                role TEXT,
                organization_id TEXT REFERENCES organizations(id) ON DELETE SET NULL,
                email TEXT,
                phone TEXT,
                relationship_type TEXT NOT NULL,
                tags TEXT,
                notes TEXT,
                last_interaction BIGINT,
                created_at BIGINT NOT NULL,
                updated_at BIGINT NOT NULL,
                metadata TEXT
            );
            CREATE TABLE IF NOT EXISTS interactions (
                id TEXT PRIMARY KEY,
                person_id TEXT NOT NULL REFERENCES people(id) ON DELETE CASCADE,
                user_id TEXT NOT NULL,
                type TEXT NOT NULL,
                summary TEXT NOT NULL,
                source TEXT NOT NULL,
                timestamp BIGINT NOT NULL,
                follow_up_date TEXT,
                metadata TEXT
            );
            CREATE TABLE IF NOT EXISTS relationship_scores (
                person_id TEXT PRIMARY KEY REFERENCES people(id) ON DELETE CASCADE,
                score INTEGER NOT NULL,
                status TEXT NOT NULL,
                trend TEXT NOT NULL,
                confidence INTEGER NOT NULL,
                explanation TEXT NOT NULL,
                updated_at BIGINT NOT NULL
            );
            CREATE TABLE IF NOT EXISTS recommendation_feedback (
                id TEXT PRIMARY KEY,
                user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
                recommendation_id TEXT NOT NULL,
                feedback TEXT NOT NULL,
                category TEXT,
                context_snapshot TEXT,
                created_at BIGINT NOT NULL
            );
            CREATE TABLE IF NOT EXISTS executive_preferences (
                id TEXT PRIMARY KEY,
                user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
                preference_key TEXT NOT NULL,
                preference_value TEXT NOT NULL,
                weight REAL DEFAULT 1.0,
                updated_at BIGINT NOT NULL
            );
            CREATE TABLE IF NOT EXISTS simulation_sessions (
                id TEXT PRIMARY KEY,
                user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
                scenario_name TEXT NOT NULL,
                scenario_params TEXT NOT NULL,
                impact_analysis TEXT NOT NULL,
                confidence REAL NOT NULL,
                created_at BIGINT NOT NULL
            );
            CREATE TABLE IF NOT EXISTS approval_queue (
                id TEXT PRIMARY KEY,
                user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
                event_id TEXT,
                agent_role TEXT NOT NULL,
                action_type TEXT NOT NULL,
                action_title TEXT NOT NULL,
                action_payload TEXT NOT NULL,
                status TEXT NOT NULL DEFAULT 'pending',
                created_at BIGINT NOT NULL,
                reviewed_at BIGINT
            );
            CREATE TABLE IF NOT EXISTS executive_intents (id TEXT PRIMARY KEY, workspace_id TEXT, title TEXT, priority TEXT, success_metrics TEXT, deadline BIGINT, owner TEXT, confidence REAL, strategy_version TEXT, status TEXT, created_at BIGINT);
            CREATE TABLE IF NOT EXISTS executive_policies (id TEXT PRIMARY KEY, workspace_id TEXT, name TEXT, version TEXT, severity TEXT, owner TEXT, tags TEXT, applies_to TEXT, conditions TEXT, actions TEXT, justification TEXT, source TEXT, enabled INTEGER, expires_at BIGINT, created_at BIGINT);
            CREATE TABLE IF NOT EXISTS okr_items (id TEXT PRIMARY KEY, workspace_id TEXT, objective TEXT, key_results TEXT, initiatives TEXT, origin_intent_id TEXT, origin_policy_ids TEXT, origin_constraint_ids TEXT, strategy_version TEXT, alignment_score INTEGER, created_at BIGINT);
            CREATE TABLE IF NOT EXISTS proposals (id TEXT PRIMARY KEY, workspace_id TEXT, title TEXT, objective TEXT, expected_benefit_usd REAL, estimated_cost_usd REAL, estimated_risk INTEGER, reversibility_score REAL, supporting_evidence TEXT, affected_departments TEXT, strategy_alignment INTEGER, confidence REAL, status TEXT, created_at BIGINT);
            CREATE TABLE IF NOT EXISTS council_votes (id TEXT PRIMARY KEY, workspace_id TEXT, proposal_id TEXT, member_id TEXT, member_name TEXT, department TEXT, vote TEXT, confidence REAL, vote_weight REAL, rationale TEXT, round_index INTEGER, created_at BIGINT);
            CREATE TABLE IF NOT EXISTS decision_ledger (id TEXT PRIMARY KEY, workspace_id TEXT, decision_id TEXT, entry_type TEXT, proposal_id TEXT, strategy_version TEXT, policy_version TEXT, constraint_version TEXT, memory_snapshot_version TEXT, simulation_id TEXT, council_votes TEXT, predicted_outcome TEXT, observed_outcome TEXT, outcome_delta TEXT, content_hash TEXT, recorded_at BIGINT);
            CREATE TABLE IF NOT EXISTS scheduled_tasks (id TEXT PRIMARY KEY, workspace_id TEXT, task_name TEXT, department TEXT, priority_class TEXT, expected_benefit_usd REAL, token_cost_usd REAL, compute_cost_usd REAL, risk_score INTEGER, confidence REAL, reversibility_score REAL, economic_priority_rating REAL, prerequisites TEXT, status TEXT, created_at BIGINT, dequeued_at BIGINT);
            CREATE TABLE IF NOT EXISTS department_budgets (id TEXT PRIMARY KEY, workspace_id TEXT, department TEXT, capital_usd REAL, ai_tokens_quota BIGINT, human_hours_quota REAL, compute_nodes_quota INTEGER, api_rate_limit_quota INTEGER, used_capital_usd REAL, used_ai_tokens BIGINT, used_human_hours REAL, used_compute_nodes INTEGER, used_api_requests INTEGER, period_start BIGINT, period_end BIGINT);
            CREATE TABLE IF NOT EXISTS kpi_metrics (id TEXT PRIMARY KEY, workspace_id TEXT, metric_key TEXT, metric_name TEXT, value REAL, unit TEXT, target_value REAL, source TEXT, updated_at BIGINT);
            CREATE TABLE IF NOT EXISTS approval_requests (id TEXT PRIMARY KEY, workspace_id TEXT, proposal_id TEXT, action_name TEXT, department TEXT, required_role TEXT, escalation_role TEXT, status TEXT, justification TEXT, requested_at BIGINT, decided_at BIGINT, decided_by TEXT, timeout_at BIGINT);
            CREATE TABLE IF NOT EXISTS simulation_results (id TEXT PRIMARY KEY, workspace_id TEXT, proposal_id TEXT, strategy_version TEXT, mode TEXT, risk_breakdown TEXT, assumptions TEXT, forecasts TEXT, recommendation TEXT, confidence_score REAL, simulated_at BIGINT);
            CREATE TABLE IF NOT EXISTS execution_checkpoints (id TEXT PRIMARY KEY, instance_id TEXT, workspace_id TEXT, execution_version INTEGER, state_data TEXT, created_at BIGINT);
            CREATE TABLE IF NOT EXISTS idempotency_records (id TEXT PRIMARY KEY, workspace_id TEXT, idempotency_key TEXT, output_data TEXT, created_at BIGINT);
            CREATE TABLE IF NOT EXISTS dead_letter_queue (id TEXT PRIMARY KEY, workspace_id TEXT, task_node_id TEXT, worker_role TEXT, error_details TEXT, failed_attempts_count INTEGER, enqueued_at BIGINT);
            CREATE TABLE IF NOT EXISTS llm_reasoning_traces (id TEXT PRIMARY KEY, workspace_id TEXT, prompt_name TEXT, prompt_version TEXT, model TEXT, input_tokens INTEGER, output_tokens INTEGER, estimated_cost_usd REAL, latency_ms INTEGER, success INTEGER, retry_count INTEGER, schema_valid INTEGER, error_message TEXT, created_at BIGINT);
            CREATE TABLE IF NOT EXISTS plugins (
                id TEXT PRIMARY KEY,
                user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
                name TEXT NOT NULL,
                version TEXT NOT NULL,
                author TEXT,
                description TEXT,
                status TEXT NOT NULL DEFAULT 'disabled',
                manifest TEXT NOT NULL,
                installed_at BIGINT NOT NULL,
                updated_at BIGINT NOT NULL
            );
            CREATE TABLE IF NOT EXISTS plugin_permissions (
                id TEXT PRIMARY KEY,
                plugin_id TEXT NOT NULL REFERENCES plugins(id) ON DELETE CASCADE,
                user_id TEXT NOT NULL,
                permission_key TEXT NOT NULL,
                granted INTEGER DEFAULT 1,
                updated_at BIGINT NOT NULL
            );
        `);

        // PAL v3.1 — Multi-Tenant Foundation Tables
        await sqliteDb.exec(`
            CREATE TABLE IF NOT EXISTS workspaces (
                id TEXT PRIMARY KEY,
                name TEXT NOT NULL,
                slug TEXT NOT NULL UNIQUE,
                owner_id TEXT NOT NULL REFERENCES users(id),
                plan TEXT NOT NULL DEFAULT 'starter',
                created_at BIGINT NOT NULL
            );
            CREATE TABLE IF NOT EXISTS subscriptions (
                id TEXT PRIMARY KEY,
                workspace_id TEXT NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
                stripe_customer_id TEXT,
                stripe_subscription_id TEXT,
                tier TEXT NOT NULL DEFAULT 'starter',
                status TEXT NOT NULL DEFAULT 'active',
                current_period_start BIGINT,
                current_period_end BIGINT,
                created_at BIGINT NOT NULL,
                updated_at BIGINT NOT NULL
            );
            CREATE TABLE IF NOT EXISTS team_members (
                id TEXT PRIMARY KEY,
                workspace_id TEXT NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
                email TEXT NOT NULL,
                full_name TEXT NOT NULL,
                role TEXT NOT NULL,
                sso_provider TEXT,
                status TEXT DEFAULT 'active',
                created_at BIGINT NOT NULL
            );
        `);

        // PAL v3.1 — workspace_id column migrations for multi-tenant isolation
        const wsIdMigrations = [
            "ALTER TABLE users ADD COLUMN workspace_id TEXT",
            "ALTER TABLE projects ADD COLUMN workspace_id TEXT",
            "ALTER TABLE invoices ADD COLUMN workspace_id TEXT",
            "ALTER TABLE integrations ADD COLUMN workspace_id TEXT",
            "ALTER TABLE decisions ADD COLUMN workspace_id TEXT",
            "ALTER TABLE messages ADD COLUMN workspace_id TEXT",
            "ALTER TABLE notifications ADD COLUMN workspace_id TEXT",
            "ALTER TABLE logs ADD COLUMN workspace_id TEXT",
            "ALTER TABLE calendar_events ADD COLUMN workspace_id TEXT",
            "ALTER TABLE tasks ADD COLUMN workspace_id TEXT",
            "ALTER TABLE business_brain ADD COLUMN workspace_id TEXT",
            "ALTER TABLE command_os_reports ADD COLUMN workspace_id TEXT",
            "ALTER TABLE agent_mesh_messages ADD COLUMN workspace_id TEXT",
            "ALTER TABLE autonomous_actions ADD COLUMN workspace_id TEXT",
            "ALTER TABLE institutional_memories ADD COLUMN workspace_id TEXT",
            "ALTER TABLE runtime_snapshots ADD COLUMN workspace_id TEXT",
            "ALTER TABLE pilot_baselines ADD COLUMN workspace_id TEXT",
            "ALTER TABLE approval_cards ADD COLUMN workspace_id TEXT",
            "ALTER TABLE roi_reports ADD COLUMN workspace_id TEXT",
            "ALTER TABLE schedules ADD COLUMN workspace_id TEXT",
            "ALTER TABLE profile ADD COLUMN workspace_id TEXT",
            "ALTER TABLE workspaces ADD COLUMN owner_id TEXT",
        ];
        for (const migration of wsIdMigrations) {
            try { await sqliteDb.exec(migration); } catch (e) {}
        }
        // Add columns to integrations table in SQLite if they don't exist
        try {
            await sqliteDb.exec("ALTER TABLE integrations ADD COLUMN access_token TEXT");
        } catch (e) {}
        try {
            await sqliteDb.exec("ALTER TABLE integrations ADD COLUMN refresh_token TEXT");
        } catch (e) {}
        try {
            await sqliteDb.exec("ALTER TABLE integrations ADD COLUMN token_expires_at BIGINT");
        } catch (e) {}
        try {
            await sqliteDb.exec("ALTER TABLE integrations ADD COLUMN provider TEXT");
        } catch (e) {}
        try {
            await sqliteDb.exec("ALTER TABLE integrations ADD COLUMN connector_id TEXT");
        } catch (e) {}
        try {
            await sqliteDb.exec("ALTER TABLE integrations ADD COLUMN account_name TEXT");
        } catch (e) {}
        try {
            await sqliteDb.exec("ALTER TABLE integrations ADD COLUMN status TEXT");
        } catch (e) {}
        try {
            await sqliteDb.exec("ALTER TABLE integrations ADD COLUMN config TEXT");
        } catch (e) {}
        try {
            await sqliteDb.exec("ALTER TABLE integrations ADD COLUMN created_at BIGINT");
        } catch (e) {}
        try {
            await sqliteDb.exec("ALTER TABLE integrations ADD COLUMN updated_at BIGINT");
        } catch (e) {}
        try {
            await sqliteDb.exec("ALTER TABLE decisions ADD COLUMN rationale TEXT");
        } catch (e) {}
        try {
            await sqliteDb.exec("ALTER TABLE decisions ADD COLUMN impact_area TEXT");
        } catch (e) {}
        try {
            await sqliteDb.exec("ALTER TABLE decisions ADD COLUMN superseded_by TEXT");
        } catch (e) {}
        try {
            const taskCols = (await sqliteDb.all("PRAGMA table_info(tasks)")).map((c: any) => c.name);
            if (!taskCols.includes("created_at")) await sqliteDb.exec("ALTER TABLE tasks ADD COLUMN created_at BIGINT");
            if (!taskCols.includes("assignee_id")) await sqliteDb.exec("ALTER TABLE tasks ADD COLUMN assignee_id TEXT");
            if (!taskCols.includes("due_date")) await sqliteDb.exec("ALTER TABLE tasks ADD COLUMN due_date TEXT");
        } catch (e) {}
        try {
            await sqliteDb.exec("ALTER TABLE decisions ADD COLUMN confirmed_at BIGINT");
        } catch (e) {}
        try {
            await sqliteDb.exec("ALTER TABLE decisions ADD COLUMN updated_at BIGINT");
        } catch (e) {}
        try {
            await sqliteDb.exec("ALTER TABLE sessions ADD COLUMN workspace_id TEXT");
        } catch (e) {}
        try {
            await sqliteDb.exec("ALTER TABLE sessions ADD COLUMN refresh_token TEXT");
        } catch (e) {}
        try {
            await sqliteDb.exec("ALTER TABLE sessions ADD COLUMN device TEXT");
        } catch (e) {}
        try {
            await sqliteDb.exec("ALTER TABLE sessions ADD COLUMN ip_address TEXT");
        } catch (e) {}
        try {
            await sqliteDb.exec("ALTER TABLE sessions ADD COLUMN user_agent TEXT");
        } catch (e) {}
        try {
            await sqliteDb.exec("ALTER TABLE sessions ADD COLUMN expires_at BIGINT");
        } catch (e) {}
        try {
            await sqliteDb.exec("ALTER TABLE sessions ADD COLUMN last_activity BIGINT");
        } catch (e) {}
        try {
            await sqliteDb.exec("ALTER TABLE sessions ADD COLUMN status TEXT");
        } catch (e) {}
        try {
            await sqliteDb.exec("ALTER TABLE users ADD COLUMN workspace_id TEXT");
        } catch (e) {}
        try {
            await sqliteDb.exec("ALTER TABLE users ADD COLUMN full_name TEXT");
        } catch (e) {}
        try {
            await sqliteDb.exec("ALTER TABLE users ADD COLUMN password_hash TEXT");
        } catch (e) {}
        try {
            await sqliteDb.exec("ALTER TABLE users ADD COLUMN avatar TEXT");
        } catch (e) {}
        try {
            await sqliteDb.exec("ALTER TABLE users ADD COLUMN status TEXT");
        } catch (e) {}
        try {
            await sqliteDb.exec("ALTER TABLE users ADD COLUMN last_login BIGINT");
        } catch (e) {}
        try {
            await sqliteDb.exec("ALTER TABLE users ADD COLUMN updated_at BIGINT");
        } catch (e) {}

        // Service Accounts column migrations
        try { await sqliteDb.exec("ALTER TABLE service_accounts ADD COLUMN name TEXT"); } catch (e) {}
        try { await sqliteDb.exec("ALTER TABLE service_accounts ADD COLUMN description TEXT"); } catch (e) {}
        try { await sqliteDb.exec("ALTER TABLE service_accounts ADD COLUMN scopes TEXT"); } catch (e) {}
        try { await sqliteDb.exec("ALTER TABLE service_accounts ADD COLUMN status TEXT"); } catch (e) {}

        // Connectors column migrations
        try { await sqliteDb.exec("ALTER TABLE connectors ADD COLUMN type TEXT"); } catch (e) {}
        try { await sqliteDb.exec("ALTER TABLE connectors ADD COLUMN name TEXT"); } catch (e) {}
        try { await sqliteDb.exec("ALTER TABLE connectors ADD COLUMN status TEXT"); } catch (e) {}
        try { await sqliteDb.exec("ALTER TABLE connectors ADD COLUMN config TEXT"); } catch (e) {}
        try { await sqliteDb.exec("ALTER TABLE connectors ADD COLUMN auth_type TEXT"); } catch (e) {}
        try { await sqliteDb.exec("ALTER TABLE connectors ADD COLUMN updated_at BIGINT"); } catch (e) {}

        // Workspace Plugins column migrations
        try { await sqliteDb.exec("ALTER TABLE workspace_plugins ADD COLUMN plugin_id TEXT"); } catch (e) {}
        try { await sqliteDb.exec("ALTER TABLE workspace_plugins ADD COLUMN version TEXT"); } catch (e) {}
        try { await sqliteDb.exec("ALTER TABLE workspace_plugins ADD COLUMN status TEXT"); } catch (e) {}
        try { await sqliteDb.exec("ALTER TABLE workspace_plugins ADD COLUMN permissions_granted TEXT"); } catch (e) {}
        try { await sqliteDb.exec("ALTER TABLE workspace_plugins ADD COLUMN installed_at BIGINT"); } catch (e) {}
        dbInstance = sqliteDb;
    }

    return dbInstance as Database;
}
