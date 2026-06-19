import sqlite3 from "sqlite3";
import { open } from "sqlite";

async function main() {
    const db = await open({
        filename: "pal.db",
        driver: sqlite3.Database
    });

    const tables = await db.all("SELECT name FROM sqlite_master WHERE type='table'");
    console.log("Tables in pal.db:", tables.map(t => t.name));

    for (const table of tables) {
        const count = await db.get(`SELECT COUNT(*) as count FROM ${table.name}`);
        console.log(`Table ${table.name} has ${count.count} rows`);
    }

    await db.close();
}

main().catch(console.error);
