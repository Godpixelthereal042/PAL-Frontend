import { supabase } from "./supabaseClient";

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
        dbInstance = sqliteDb;
    }

    return dbInstance as Database;
}
