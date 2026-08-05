import test, { describe, it } from "node:test";
import assert from "node:assert/strict";

import { ApprovalMatrixEngine } from "../lib/strategy/approvalMatrix.ts";
import { StrategyCockpitStore } from "../lib/strategy/ui/strategyCockpitStore.ts";

describe("Sprint 6 — Milestone 6: Executive Strategy Cockpit UI & Policy Approval Matrix", () => {
    it("ApprovalMatrixEngine evaluates policy rules and routes required approver roles", () => {
        const matrixEngine = new ApprovalMatrixEngine();

        // 1. Test High Value Spend Approval (amountUSD > 5000 -> CFO)
        const req1 = matrixEngine.evaluateApprovalRequired("stripe.refund_customer", "finance", { amountUSD: 8500 });
        assert.ok(req1);
        assert.equal(req1.requiredRole, "CFO");
        assert.equal(req1.status, "pending");

        // Resolve request
        const resolved1 = matrixEngine.resolveRequest(req1.requestId, true, "CFO");
        assert.ok(resolved1);
        assert.equal(resolved1.status, "approved");

        // 2. Test High Risk Approval (riskScore > 70 -> Legal Counsel)
        const req2 = matrixEngine.evaluateApprovalRequired("general.terminate_contract", "general", { riskScore: 85 });
        assert.ok(req2);
        assert.equal(req2.requiredRole, "Legal Counsel");
        assert.equal(req2.escalationRole, "CEO");
    });

    it("StrategyCockpitStore maintains state reactivity across OKRs, simulations, and approval queues", () => {
        const store = new StrategyCockpitStore();

        let listenerCalled = false;
        const unsubscribe = store.subscribe(() => {
            listenerCalled = true;
        });

        const state1 = store.getState();
        assert.ok(state1.strategyVersion);
        assert.ok(state1.kpis.length >= 5);

        // Update OKRs
        store.setOKRs([
            {
                id: "okr_test",
                objective: "Scale Enterprise MRR to $30k",
                keyResults: ["Add 5 new accounts"],
                initiatives: ["Automate Stripe Billing"],
                lineage: {
                    originIntentId: "intent_101",
                    originPolicyIds: ["pol_101"],
                    originConstraintIds: ["const_101"],
                    strategyVersion: "v1.0_growth",
                    alignmentScore: 95
                }
            }
        ]);

        assert.equal(listenerCalled, true);
        assert.equal(store.getState().okrs.length, 1);

        unsubscribe();
    });
});
