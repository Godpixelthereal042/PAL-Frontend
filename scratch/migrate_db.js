import sqlite3 from "sqlite3";
import { open } from "sqlite";
import path from "path";

async function main() {
    console.log("Starting local SQLite migration...");
    const dbPath = path.resolve(process.cwd(), "pal.db");
    const db = await open({
        filename: dbPath,
        driver: sqlite3.Database
    });

    // 1. Create project_members table
    await db.exec(`
        CREATE TABLE IF NOT EXISTS project_members (
            project_id TEXT NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
            user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
            role TEXT DEFAULT 'Member',
            PRIMARY KEY (project_id, user_id)
        );
    `);
    console.log("Checked/created project_members table.");

    // Helper function to add a column if it doesn't exist
    async function addColumnIfNeeded(table, column, typeDef) {
        try {
            // Check if column exists
            const info = await db.all(`PRAGMA table_info(${table})`);
            const exists = info.some(col => col.name === column);
            if (!exists) {
                console.log(`Adding column ${column} to table ${table}...`);
                await db.exec(`ALTER TABLE ${table} ADD COLUMN ${column} ${typeDef}`);
                console.log(`Column ${column} added.`);
            } else {
                console.log(`Column ${column} already exists in table ${table}.`);
            }
        } catch (err) {
            console.error(`Error adding column ${column} to table ${table}:`, err);
        }
    }

    // 2. Add user_id column to tables
    await addColumnIfNeeded("schedules", "user_id", "TEXT REFERENCES users(id) ON DELETE CASCADE");
    await addColumnIfNeeded("invoices", "user_id", "TEXT REFERENCES users(id) ON DELETE CASCADE");
    await addColumnIfNeeded("integrations", "user_id", "TEXT REFERENCES users(id) ON DELETE CASCADE");
    await addColumnIfNeeded("messages", "user_id", "TEXT REFERENCES users(id) ON DELETE CASCADE");
    await addColumnIfNeeded("notifications", "user_id", "TEXT REFERENCES users(id) ON DELETE CASCADE");
    await addColumnIfNeeded("logs", "user_id", "TEXT REFERENCES users(id) ON DELETE CASCADE");

    await db.close();
    console.log("SQLite database migration completed successfully!");
}

main().catch(console.error);
