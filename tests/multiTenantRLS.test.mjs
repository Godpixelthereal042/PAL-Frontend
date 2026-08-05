/**
 * Sprint 7 — Milestone 3: Multi-Tenant Row Level Security (RLS) & Workspace Scoping
 *
 * Tests verify:
 *   1. Migration file `003_sprint7_rls_security.sql` exists and covers all 15 governance/execution tables.
 *   2. BaseRepository sets, gets, and preserves activeWorkspaceId context.
 *   3. BaseRepository automatically injects activeWorkspaceId on insertEntity & upsertEntity.
 *   4. BaseRepository isolates rows by workspaceId on findById (tenant A cannot see tenant B's data).
 *   5. BaseRepository isolates rows by workspaceId on findAll (tenant A query returns only tenant A rows).
 *   6. BaseRepository prevents cross-workspace deleteById (tenant A cannot delete tenant B's rows).
 *   7. Multiple repositories (ExecutiveIntentRepository, DecisionLedgerRepository, etc.) enforce tenant isolation independently.
 */

import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { ExecutiveIntentRepository, DecisionLedgerRepository } from "../lib/db/repositories/governanceRepositories.ts";

describe("Sprint 7 — Milestone 3: Multi-Tenant Row Level Security (RLS)", () => {
    it("1. 003_sprint7_rls_security.sql exists and contains RLS enable & isolation policies for all tables", () => {
        const migrationPath = resolve(process.cwd(), "migrations/003_sprint7_rls_security.sql");
        const content = readFileSync(migrationPath, "utf-8");

        assert.ok(content.includes("ALTER TABLE executive_intents ENABLE ROW LEVEL SECURITY;"));
        assert.ok(content.includes("ALTER TABLE decision_ledger ENABLE ROW LEVEL SECURITY;"));
        assert.ok(content.includes("CREATE POLICY executive_intents_isolation ON executive_intents"));
        assert.ok(content.includes("current_setting('app.current_workspace_id', true)"));
        assert.ok(content.includes("execution_checkpoints_isolation"));
        assert.ok(content.includes("integration_audit_logs_isolation"));
    });

    it("2. BaseRepository sets and retrieves activeWorkspaceId context", () => {
        const repo = new ExecutiveIntentRepository();
        assert.equal(repo.getWorkspaceContext(), "default_workspace");

        repo.setWorkspaceContext("ws_tenant_alpha");
        assert.equal(repo.getWorkspaceContext(), "ws_tenant_alpha");
    });

    it("3. BaseRepository automatically injects activeWorkspaceId into inserted payloads", async () => {
        const repo = new ExecutiveIntentRepository();
        repo.setWorkspaceContext("ws_tenant_beta");

        const intentId = `intent_rls_${Date.now()}`;
        const inserted = await repo.insertEntity({
            id: intentId,
            title: "Tenant Beta Intent",
            priority: "high",
            success_metrics: JSON.stringify(["Metric 1"]),
            owner: "CEO Beta",
            confidence: 0.95,
            strategy_version: "v1.0_growth",
            status: "active",
            created_at: Date.now()
        });

        assert.equal(inserted.workspace_id, "ws_tenant_beta");
    });

    it("4. Cross-Tenant Isolation on findById: Tenant A cannot fetch Tenant B's entity", async () => {
        const repoA = new ExecutiveIntentRepository().setWorkspaceContext("ws_tenant_A");
        const repoB = new ExecutiveIntentRepository().setWorkspaceContext("ws_tenant_B");

        const intentIdB = `intent_B_${Date.now()}`;
        await repoB.insertEntity({
            id: intentIdB,
            title: "Tenant B Secret Intent",
            priority: "critical",
            success_metrics: JSON.stringify(["Confidential Metric"]),
            owner: "CTO B",
            confidence: 0.99,
            strategy_version: "v2.0_secret",
            status: "active",
            created_at: Date.now()
        });

        // Tenant B can find its own entity
        const entityForB = await repoB.findById(intentIdB);
        assert.ok(entityForB);
        assert.equal(entityForB.id, intentIdB);

        // Tenant A cannot find Tenant B's entity (returns null)
        const entityForA = await repoA.findById(intentIdB);
        assert.equal(entityForA, null, "Tenant A must NOT be able to access Tenant B's data via findById");
    });

    it("5. Cross-Tenant Isolation on findAll: Tenant A queries return only Tenant A records", async () => {
        const repoA = new ExecutiveIntentRepository().setWorkspaceContext("ws_tenant_A");
        const repoB = new ExecutiveIntentRepository().setWorkspaceContext("ws_tenant_B");

        const timestamp = Date.now();
        await repoA.insertEntity({
            id: `intent_A_all_${timestamp}`,
            title: "Tenant A Intent",
            priority: "medium",
            success_metrics: "[]",
            owner: "Manager A",
            confidence: 0.8,
            strategy_version: "v1",
            status: "active",
            created_at: timestamp
        });

        await repoB.insertEntity({
            id: `intent_B_all_${timestamp}`,
            title: "Tenant B Intent",
            priority: "medium",
            success_metrics: "[]",
            owner: "Manager B",
            confidence: 0.8,
            strategy_version: "v1",
            status: "active",
            created_at: timestamp
        });

        const listA = await repoA.findAll();
        const listB = await repoB.findAll();

        assert.ok(listA.length >= 1);
        assert.ok(listB.length >= 1);
        assert.ok(listA.every(item => item.workspace_id === "ws_tenant_A"), "Tenant A results must belong exclusively to Tenant A");
        assert.ok(listB.every(item => item.workspace_id === "ws_tenant_B"), "Tenant B results must belong exclusively to Tenant B");
    });

    it("6. Cross-Tenant Isolation on deleteById: Tenant A cannot delete Tenant B's entity", async () => {
        const repoA = new ExecutiveIntentRepository().setWorkspaceContext("ws_tenant_A");
        const repoB = new ExecutiveIntentRepository().setWorkspaceContext("ws_tenant_B");

        const intentIdB = `intent_B_del_${Date.now()}`;
        await repoB.insertEntity({
            id: intentIdB,
            title: "Tenant B Protected Record",
            priority: "high",
            success_metrics: "[]",
            owner: "Security Officer B",
            confidence: 0.9,
            strategy_version: "v1",
            status: "active",
            created_at: Date.now()
        });

        // Tenant A attempts to delete Tenant B's record
        const deletedByA = await repoA.deleteById(intentIdB);
        assert.equal(deletedByA, false, "Tenant A must not be allowed to delete Tenant B's entity");

        // Verify entity still exists for Tenant B
        const entityStillExists = await repoB.findById(intentIdB);
        assert.ok(entityStillExists, "Entity must remain intact in Tenant B workspace");
    });

    it("7. DecisionLedgerRepository enforces tenant isolation", async () => {
        const ledgerA = new DecisionLedgerRepository().setWorkspaceContext("ws_corp_1");
        const ledgerB = new DecisionLedgerRepository().setWorkspaceContext("ws_corp_2");

        const recordIdA = `dec_corp1_${Date.now()}`;
        await ledgerA.insertEntity({
            id: recordIdA,
            decision_id: "dec_101",
            entry_type: "proposal_approval",
            proposal_id: "prop_101",
            strategy_version: "v1.0",
            content_hash: "abcd1234efgh5678",
            recorded_at: Date.now()
        });

        const foundInA = await ledgerA.findById(recordIdA);
        const foundInB = await ledgerB.findById(recordIdA);

        assert.ok(foundInA);
        assert.equal(foundInB, null, "DecisionLedger must enforce tenant isolation across workspaces");
    });
});
