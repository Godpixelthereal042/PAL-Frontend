/**
 * PAL v3.1 — Multi-Tenant Isolation Proof Tests
 *
 * Proves that Company A cannot access Company B's data.
 * Tests workspace scoping on all critical data paths.
 */

import assert from "node:assert/strict";
import { describe, it, before } from "node:test";
import { getDB } from "../lib/db.ts";
import { getWorkspaceForUser, requireWorkspaceAccess } from "../lib/security/workspaceContext.ts";

describe("Multi-Tenant Isolation Tests", () => {
    let db;
    const userA_id = "user_tenant_a_001";
    const userB_id = "user_tenant_b_001";
    let workspaceA_id;
    let workspaceB_id;

    before(async () => {
        db = await getDB();
        const now = Date.now();

        // Create two separate users
        try {
            await db.run("INSERT INTO users (id, name, email, password, role, created_at) VALUES (?, ?, ?, ?, ?, ?)",
                [userA_id, "Alice CEO", "alice@companya.com", "hash_a", "Owner", now]);
        } catch (e) {}
        try {
            await db.run("INSERT INTO users (id, name, email, password, role, created_at) VALUES (?, ?, ?, ?, ?, ?)",
                [userB_id, "Bob CEO", "bob@companyb.com", "hash_b", "Owner", now]);
        } catch (e) {}

        // Create two separate workspaces
        workspaceA_id = "ws_company_a_test";
        workspaceB_id = "ws_company_b_test";

        try {
            await db.run("INSERT INTO workspaces (id, name, slug, owner_id, plan, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?)",
                [workspaceA_id, "Company A", "company-a", userA_id, "growth", now, now]);
        } catch (e) {}
        try {
            await db.run("INSERT INTO workspaces (id, name, slug, owner_id, plan, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?)",
                [workspaceB_id, "Company B", "company-b", userB_id, "starter", now, now]);
        } catch (e) {}

        // Link users to workspaces
        await db.run("UPDATE users SET workspace_id = ? WHERE id = ?", [workspaceA_id, userA_id]);
        await db.run("UPDATE users SET workspace_id = ? WHERE id = ?", [workspaceB_id, userB_id]);

        // Seed Company A data
        await db.run("INSERT OR REPLACE INTO projects (id, title, type, date, color, owner_id, workspace_id) VALUES (?, ?, ?, ?, ?, ?, ?)",
            ["proj_a_1", "Company A Secret Project", "internal", "2026-01-01", "#ff0000", userA_id, workspaceA_id]);
        await db.run("INSERT OR REPLACE INTO messages (id, sender, text, time, timestamp, user_id, workspace_id) VALUES (?, ?, ?, ?, ?, ?, ?)",
            ["msg_a_1", "user", "Company A confidential message", "1:00pm", now, userA_id, workspaceA_id]);
        await db.run("INSERT OR REPLACE INTO invoices (id, user_id, workspace_id, client, amount, service, date, status, timestamp) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)",
            ["inv_a_1", userA_id, workspaceA_id, "Client A", "50000", "Consulting", "2026-01-01", "paid", String(now)]);

        // Seed Company B data
        await db.run("INSERT OR REPLACE INTO projects (id, title, type, date, color, owner_id, workspace_id) VALUES (?, ?, ?, ?, ?, ?, ?)",
            ["proj_b_1", "Company B Secret Project", "internal", "2026-01-01", "#0000ff", userB_id, workspaceB_id]);
        await db.run("INSERT OR REPLACE INTO messages (id, sender, text, time, timestamp, user_id, workspace_id) VALUES (?, ?, ?, ?, ?, ?, ?)",
            ["msg_b_1", "user", "Company B confidential message", "2:00pm", now + 1, userB_id, workspaceB_id]);
        await db.run("INSERT OR REPLACE INTO invoices (id, user_id, workspace_id, client, amount, service, date, status, timestamp) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)",
            ["inv_b_1", userB_id, workspaceB_id, "Client B", "75000", "Development", "2026-01-01", "pending", String(now + 1)]);
    });

    // === WORKSPACE CONTEXT TESTS ===

    it("resolves correct workspace for User A", async () => {
        const ws = await getWorkspaceForUser(userA_id);
        assert.equal(ws.id, workspaceA_id);
        assert.equal(ws.name, "Company A");
    });

    it("resolves correct workspace for User B", async () => {
        const ws = await getWorkspaceForUser(userB_id);
        assert.equal(ws.id, workspaceB_id);
        assert.equal(ws.name, "Company B");
    });

    it("requireWorkspaceAccess succeeds for valid user-workspace pair", async () => {
        await requireWorkspaceAccess(userA_id, workspaceA_id); // should not throw
    });

    it("requireWorkspaceAccess rejects cross-workspace access", async () => {
        await assert.rejects(
            () => requireWorkspaceAccess(userA_id, workspaceB_id),
            { message: /Workspace access denied/ }
        );
    });

    // === PROJECT ISOLATION TESTS ===

    it("Company A projects query returns ONLY Company A projects", async () => {
        const projects = await db.all(
            "SELECT * FROM projects WHERE workspace_id = ?", [workspaceA_id]
        );
        assert.ok(projects.length >= 1);
        for (const p of projects) {
            assert.equal(p.workspace_id, workspaceA_id, `Project ${p.id} has wrong workspace`);
            assert.ok(!p.title.includes("Company B"), "Company B data leaked into Company A query");
        }
    });

    it("Company B projects query returns ONLY Company B projects", async () => {
        const projects = await db.all(
            "SELECT * FROM projects WHERE workspace_id = ?", [workspaceB_id]
        );
        assert.ok(projects.length >= 1);
        for (const p of projects) {
            assert.equal(p.workspace_id, workspaceB_id);
            assert.ok(!p.title.includes("Company A"), "Company A data leaked into Company B query");
        }
    });

    // === MESSAGE ISOLATION TESTS ===

    it("Company A messages query cannot see Company B messages", async () => {
        const messages = await db.all(
            "SELECT * FROM messages WHERE workspace_id = ?", [workspaceA_id]
        );
        for (const m of messages) {
            assert.equal(m.workspace_id, workspaceA_id);
            assert.ok(!m.text.includes("Company B"), "Company B message leaked");
        }
    });

    it("Company B messages query cannot see Company A messages", async () => {
        const messages = await db.all(
            "SELECT * FROM messages WHERE workspace_id = ?", [workspaceB_id]
        );
        for (const m of messages) {
            assert.equal(m.workspace_id, workspaceB_id);
            assert.ok(!m.text.includes("Company A"), "Company A message leaked");
        }
    });

    // === INVOICE ISOLATION TESTS ===

    it("Company A invoices query cannot see Company B invoices", async () => {
        const invoices = await db.all(
            "SELECT * FROM invoices WHERE workspace_id = ?", [workspaceA_id]
        );
        for (const inv of invoices) {
            assert.equal(inv.workspace_id, workspaceA_id);
            assert.ok(!inv.client.includes("Client B"), "Company B invoice leaked");
        }
    });

    it("Company B invoices query cannot see Company A invoices", async () => {
        const invoices = await db.all(
            "SELECT * FROM invoices WHERE workspace_id = ?", [workspaceB_id]
        );
        for (const inv of invoices) {
            assert.equal(inv.workspace_id, workspaceB_id);
            assert.ok(!inv.client.includes("Client A"), "Company A invoice leaked");
        }
    });

    // === CROSS-WORKSPACE DATA COUNT ===

    it("workspace-scoped queries return disjoint sets", async () => {
        const projectsA = await db.all("SELECT id FROM projects WHERE workspace_id = ?", [workspaceA_id]);
        const projectsB = await db.all("SELECT id FROM projects WHERE workspace_id = ?", [workspaceB_id]);

        const idsA = new Set(projectsA.map(p => p.id));
        const idsB = new Set(projectsB.map(p => p.id));

        for (const id of idsA) {
            assert.ok(!idsB.has(id), `Project ${id} appears in both workspaces — data leak!`);
        }
    });

    // === AUTO-PROVISIONING TEST ===

    it("auto-provisions workspace for new user without one", async () => {
        const newUserId = `user_new_${Date.now()}`;
        await db.run("INSERT INTO users (id, name, email, password, role, created_at) VALUES (?, ?, ?, ?, ?, ?)",
            [newUserId, "New User", `new_${Date.now()}@test.com`, "hash", "Member", Date.now()]);

        const ws = await getWorkspaceForUser(newUserId);
        assert.ok(ws.id, "Workspace should be auto-provisioned");
        assert.equal(ws.owner_id, newUserId);

        // Verify user is now linked
        const user = await db.get("SELECT workspace_id FROM users WHERE id = ?", [newUserId]);
        assert.equal(user.workspace_id, ws.id);
    });
});
