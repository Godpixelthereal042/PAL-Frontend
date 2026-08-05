/**
 * Production Database Engine Test Suite (PAL-TDD-009, Sprint 22 Milestone 1)
 *
 * Verifies:
 *   1. Reports PostgreSQL database cluster status, connection pool size, and multi-region replicas.
 *   2. Tracks schema migration history through version 22.
 *   3. Executes new schema migrations monotonically.
 */

import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { ProductionDatabaseEngine } from "../lib/infrastructure/productionDatabaseEngine.ts";

describe("Sprint 22 Milestone 1 — Production Database Infrastructure", () => {
    const dbEngine = ProductionDatabaseEngine.getInstance();

    it("1. Reports healthy PostgreSQL cluster status and multi-region read replica status", () => {
        const status = dbEngine.getClusterStatus();

        assert.equal(status.clusterId, "pg_cluster_prod_primary");
        assert.equal(status.primaryRegion, "us-east-1");
        assert.deepEqual(status.readReplicas, ["eu-west-1", "ap-southeast-1"]);
        assert.equal(status.connectionPoolSize, 50);
        assert.equal(status.backupStatus, "healthy");
        assert.equal(status.isMultiRegionReplicationActive, true);
    });

    it("2. Returns complete schema migration history up through v22", () => {
        const history = dbEngine.getMigrationHistory();

        assert.ok(history.length >= 4);
        const v22 = history.find(m => m.version === 22);

        assert.ok(v22);
        assert.equal(v22.name, "sprint_22_enterprise_reality_tables");
    });

    it("3. Executes new schema migration and appends to migration history", () => {
        const migration = dbEngine.executeMigration(23, "sprint_23_future_enhancements");

        assert.equal(migration.version, 23);
        assert.equal(migration.name, "sprint_23_future_enhancements");
        assert.ok(migration.checksum.startsWith("sha256_v23_"));

        const history = dbEngine.getMigrationHistory();
        assert.ok(history.some(m => m.version === 23));
    });
});
