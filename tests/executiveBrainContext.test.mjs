import test, { describe, it } from "node:test";
import assert from "node:assert/strict";
import { ExecutiveBrain } from "../lib/intelligence/brain/executiveBrain.ts";
import { WorldModel } from "../lib/intelligence/brain/worldModel.ts";
import { KnowledgeGraph } from "../lib/intelligence/brain/knowledgeGraph.ts";
import { ObjectivesRegistry } from "../lib/intelligence/brain/objectivesRegistry.ts";
import { LearningEngine } from "../lib/intelligence/brain/learningEngine.ts";
import { ContextEngine } from "../lib/intelligence/context/contextEngine.ts";
import { MemoryCacheProvider } from "../lib/security/providers/cacheProvider.ts";

describe("Milestone 1: Executive Brain & Context Subsystem", () => {
    const workspaceId = "ws_test_m1";

    it("WorldModel synthesizes observed, inferred, and predicted state accurately", async () => {
        const wm = new WorldModel();
        const initial = await wm.getSnapshot(workspaceId);

        assert.equal(initial.workspaceId, workspaceId);
        assert.equal(initial.observed.financialRunwayMonths, 14.5);
        assert.equal(initial.inferred.burnRateRisk, "low");
        assert.ok(initial.predicted.projectedARR30Days > initial.observed.currentARR);

        // Update observed state (low runway alert)
        const updated = await wm.updateObservedState(workspaceId, { financialRunwayMonths: 5.5 });
        assert.equal(updated.observed.financialRunwayMonths, 5.5);
        assert.equal(updated.inferred.burnRateRisk, "critical");
    });

    it("KnowledgeGraph maps enterprise entities and node-edge relationships", () => {
        const kg = new KnowledgeGraph();
        kg.addNode({ id: "proj_sprint3", type: "project", label: "Sprint 3 Executive Intelligence", attributes: {} });
        kg.addNode({ id: "user_coo", type: "ai_agent", label: "AI COO", attributes: {} });

        kg.addEdge({ sourceId: "user_coo", targetId: "proj_sprint3", relation: "OWNS" });

        const related = kg.getRelatedEntities("user_coo", "OWNS");
        assert.equal(related.length, 1);
        assert.equal(related[0].id, "proj_sprint3");
    });

    it("ObjectivesRegistry manages OKRs, KPIs, and North Star metrics", async () => {
        const reg = new ObjectivesRegistry();
        const objs = await reg.getObjectives(workspaceId);

        assert.ok(objs.length >= 3);
        const northStar = objs.find((o) => o.type === "north_star");
        assert.ok(northStar);
        assert.equal(northStar.targetMetric, "ARR");

        // Update an objective
        await reg.setObjective({
            ...northStar,
            currentValue: 1500000,
        });

        const updatedObjs = await reg.getObjectives(workspaceId);
        const updatedNorthStar = updatedObjs.find((o) => o.id === northStar.id);
        assert.equal(updatedNorthStar?.currentValue, 1500000);
    });

    it("LearningEngine records outcomes and computes confidence deltas", async () => {
        const le = new LearningEngine();
        const insight = await le.recordOutcome(workspaceId, "sales_discount_approval", 85, 80, ["ref_deal_123"]);

        assert.equal(insight.workspaceId, workspaceId);
        assert.equal(insight.delta, 5);
        assert.equal(insight.validationStatus, "confirmed");
        assert.ok(insight.confidenceScore >= 0.9);

        const insights = await le.getInsights(workspaceId);
        assert.equal(insights.length, 1);
    });

    it("ContextEngine hydrates 5-layer context with token budgeting and decision caching", async () => {
        const brain = new ExecutiveBrain();
        const cache = new MemoryCacheProvider();
        const ce = new ContextEngine(brain, cache);

        const ctx = await ce.getUnifiedContext(workspaceId, "financial", 4000);

        assert.equal(ctx.workspaceId, workspaceId);
        assert.ok(ctx.persistent);
        assert.ok(ctx.operational);
        assert.ok(ctx.conversational);
        assert.ok(ctx.environmental);
        assert.ok(ctx.external);

        assert.equal(ctx.persistent.freshness.stalenessIndicator, "fresh");
        assert.equal(ctx.operational.worldModelSummary.runwayMonths, 14.5);
        assert.ok(ctx.tokenBudgetUsage.totalTokensUsed <= 4000);

        // Verify decision cache hit on second invocation
        const cachedCtx = await ce.getUnifiedContext(workspaceId, "financial", 4000);
        assert.deepEqual(cachedCtx, ctx);
    });
});
