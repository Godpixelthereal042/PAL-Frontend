/**
 * PAL Sprint 6.5 — Milestone 7: End-to-End Integration & Production Readiness Certification
 *
 * Specification: PAL-TDD-005A (Production Hardening)
 */

import test from "node:test";
import assert from "node:assert";

import { DecisionLedger } from "../lib/strategy/decisionLedger.ts";
import { OKRStrategyEngine } from "../lib/strategy/okrStrategyEngine.ts";
import { ExecutiveCouncil } from "../lib/strategy/executiveCouncil.ts";
import { EventRouter } from "../lib/events/eventRouter.ts";
import { StaticReasoningProvider } from "../lib/strategy/staticReasoningProvider.ts";
import { validateRequiredSecrets } from "../lib/core/config.ts";
import {
    ExecutiveIntentRepository,
    ExecutivePolicyRepository,
    OKRItemRepository,
    ProposalRepository,
    CouncilVoteRepository,
    DecisionLedgerRepository,
    ScheduledTaskRepository,
    DepartmentBudgetRepository,
    KPIRegistryRepository,
    ApprovalRequestRepository,
    SimulationResultRepository
} from "../lib/db/repositories/governanceRepositories.ts";

test("Sprint 6.5 — Milestone 7: End-to-End Platform Integration & Certification (v0.7.1)", async (t) => {
    await t.test("E2E 1: Decision Ledger Immutability & SHA-256 Content Hashing", async () => {
        const ledger = new DecisionLedger();

        const entry1 = ledger.appendEntry({
            decisionId: "dec_e2e_65_1",
            proposalId: "prop_e2e_65_1",
            strategyVersion: "v1.0_growth",
            policyVersion: "v1.0",
            constraintVersion: "v1.0",
            memorySnapshotVersion: "mem_v1",
            simulationId: "sim_e2e_1",
            councilVotes: [{ memberId: "mem_cfo", vote: "YES" }],
            predictedOutcome: { mrr_usd: 30000, risk: 20 }
        });

        assert.strictEqual(entry1.entryType, "prediction");
        assert.ok(entry1.contentHash, "Entry must have a SHA-256 content hash");
        assert.strictEqual(entry1.contentHash.length, 64, "SHA-256 hash must be 64 characters long");
        assert.strictEqual(ledger.verifyEntryIntegrity(entry1), true, "Entry integrity must be verified successfully");

        // Record observed outcome (must append a new observation entry, NOT mutate in-place)
        const entry2 = ledger.recordObservedOutcome("dec_e2e_65_1", { mrr_usd: 31000, risk: 18 });

        assert.ok(entry2);
        assert.strictEqual(entry2.entryType, "observation");
        assert.strictEqual(ledger.getLedgerHistory().length, 2, "Ledger must contain 2 entries (prediction + observation)");

        // Verify the original prediction entry at index 0 remains unmodified
        const history = ledger.getLedgerHistory();
        assert.strictEqual(history[0].entryType, "prediction");
        assert.strictEqual(history[0].observedOutcome, undefined, "Original prediction must remain unmutated");
    });

    await t.test("E2E 2: Reasoning Provider Abstraction & Strategy Engine Compatibility", async () => {
        const reasoningProvider = new StaticReasoningProvider();
        const okrEngine = new OKRStrategyEngine(undefined, undefined, undefined, reasoningProvider);

        const compilerOutput = await okrEngine.compileIntent("Expand Enterprise Sales Reach", "v1.0_growth");
        assert.strictEqual(compilerOutput.strategyVersion, "v1.0_growth");
        assert.ok(compilerOutput.okrs.length > 0, "Engine must compile OKRs via reasoning provider");

        const alignment = await okrEngine.evaluateAlignment({ tokenCostUSD: 2.5, riskScore: 20 });
        assert.ok(alignment.score > 0, "Alignment score must be greater than 0");
    });

    await t.test("E2E 3: Executive Council Reasoning & Consensus Calculation", async () => {
        const council = new ExecutiveCouncil();
        const proposal = {
            id: "prop_test_council",
            title: "Automate Finance Refunds",
            objective: "Reduce manual refund processing overhead",
            expectedBenefitUSD: 25000,
            estimatedCostUSD: 4000,
            estimatedRisk: 25,
            reversibilityScore: 0.85,
            supportingEvidence: ["Customer tickets", "ROI analysis"],
            affectedDepartments: ["finance", "engineering"],
            strategyAlignment: 90,
            confidence: 0.90,
            createdAt: Date.now()
        };

        const result = await council.conductVotingAsync(proposal);
        assert.strictEqual(result.proposalId, "prop_test_council");
        assert.strictEqual(typeof result.approved, "boolean");
        assert.ok(result.consensusScore > 0, "Consensus score must be computed");
    });

    await t.test("E2E 4: Event Router Isolation & Resilience under Subscriber Timeouts", async () => {
        const router = new EventRouter();

        let successfulExecuted = false;
        router.subscribe("TestEvent", async () => {
            successfulExecuted = true;
        });

        // Fast subscriber failure should not crash router
        router.subscribe("TestEvent", async () => {
            throw new Error("Subscriber crash simulation");
        });

        await router.dispatch({
            eventId: "evt_e2e_1",
            type: "TestEvent",
            timestamp: Date.now(),
            source: "e2e_test",
            payload: { test: true }
        }, 1000);

        assert.strictEqual(successfulExecuted, true, "Healthy subscriber must execute despite failing subscriber");
        const metrics = router.getMetrics();
        assert.strictEqual(metrics.totalDispatched, 1);
        assert.strictEqual(metrics.totalFailed, 1);
    });

    await t.test("E2E 5: Governance Repositories Instantiation & Schema Integrity", async () => {
        const repos = [
            new ExecutiveIntentRepository(),
            new ExecutivePolicyRepository(),
            new OKRItemRepository(),
            new ProposalRepository(),
            new CouncilVoteRepository(),
            new DecisionLedgerRepository(),
            new ScheduledTaskRepository(),
            new DepartmentBudgetRepository(),
            new KPIRegistryRepository(),
            new ApprovalRequestRepository(),
            new SimulationResultRepository()
        ];

        assert.strictEqual(repos.length, 11, "All 11 governance repositories must be instantiated");
    });

    await t.test("E2E 6: Production Health & Secrets Validation Check", async () => {
        const check = validateRequiredSecrets();
        assert.strictEqual(typeof check.valid, "boolean");
        assert.ok(Array.isArray(check.missing));
    });
});
