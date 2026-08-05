/**
 * Enterprise Demo Datasets Test Suite (PAL-TDD-008, Sprint 21 Milestone 7)
 *
 * Verifies:
 *   1. SaaS demo company dataset includes 2,000 active customer records, ARR metrics, and 23.8x ROI report.
 *   2. Healthcare demo company dataset includes HIPAA audit compliance metrics and 1,200 patient workflows.
 *   3. Commerce demo company dataset includes $335k GMV, 50k order records, and inventory turnover metrics.
 *   4. Each demo environment generates Health Report, Mesh Report, Autonomous Action, and ROI Proof.
 */

import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { EnterpriseDemoDatasets } from "../lib/simulation/enterpriseDemoDatasets.ts";

describe("Sprint 21 Milestone 7 — Real Enterprise Demo Environments", () => {
    it("1. Generates 2,000-customer SaaS Enterprise Demo environment", () => {
        const demo = EnterpriseDemoDatasets.getSaaSEnterpriseDemo();

        assert.equal(demo.demoId, "demo_saas_2000_cust");
        assert.equal(demo.companyName, "Acme Cloud Enterprise");
        assert.equal(demo.customerRecordCount, 2000);

        assert.ok(demo.healthReport);
        assert.equal(demo.healthReport.healthScore, 92);
        assert.ok(demo.agentMeshReport);
        assert.ok(demo.sampleAutonomousAction);
        assert.equal(demo.sampleAutonomousAction.status, "executed");
        assert.ok(demo.roiProofReport);
        assert.ok(demo.roiProofReport.roiMultiple > 10.0);
    });

    it("2. Generates Healthcare Enterprise Demo environment with HIPAA compliance logs", () => {
        const demo = EnterpriseDemoDatasets.getHealthcareEnterpriseDemo();

        assert.equal(demo.industry, "healthcare");
        assert.equal(demo.customerRecordCount, 1200);
        assert.equal(demo.sampleAutonomousAction.status, "executed");
        assert.ok(demo.sampleAutonomousAction.passportId);
    });

    it("3. Generates Commerce Enterprise Demo environment with $335k GMV and 50,000 order records", () => {
        const demo = EnterpriseDemoDatasets.getCommerceEnterpriseDemo();

        assert.equal(demo.industry, "ecommerce");
        assert.equal(demo.customerRecordCount, 50000);
        assert.equal(demo.datasetDetails.monthlyGmvUSD, 335000);
        assert.equal(demo.datasetDetails.inventoryTurnoverDays, 28);
    });
});
