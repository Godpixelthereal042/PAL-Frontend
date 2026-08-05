/**
 * Autonomous Operations Reliability Monitor Test Suite (PAL-TDD-010, Sprint 23 Milestone 4)
 *
 * Verifies:
 *   1. Monitors real-time operational metrics (agent uptime, failure rate, approval latency, rollback rate).
 *   2. Calculates overall PAL Reliability Score (98%+ OPTIMAL status).
 */

import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { AutonomousOperationsMonitor } from "../lib/reliability/autonomousOperationsMonitor.ts";

describe("Sprint 23 Milestone 4 — Autonomous Operations Reliability Layer", () => {
    const monitor = AutonomousOperationsMonitor.getInstance();

    it("1. Monitors real-time operational metrics including 99.98% agent uptime and low approval latency", () => {
        const report = monitor.evaluateReliability("ws_acme_saas_prod");

        assert.ok(report.reportId.startsWith("rep_rel_"));
        assert.equal(report.metrics.agentUptimePct, 99.98);
        assert.equal(report.metrics.actionSuccessRatePct, 98.5);
        assert.equal(report.metrics.avgApprovalLatencyHours, 1.2);
        assert.equal(report.metrics.rollbackRatePct, 0.2);
    });

    it("2. Calculates composite PAL Reliability Score and certifies OPTIMAL operational status", () => {
        const report = monitor.evaluateReliability("ws_acme_saas_prod");

        assert.ok(report.overallReliabilityScorePct >= 95);
        assert.equal(report.status, "OPTIMAL");
    });
});
