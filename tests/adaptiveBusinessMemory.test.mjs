import test, { describe, it } from "node:test";
import assert from "node:assert/strict";

import { ExecutiveMemoryEngine } from "../lib/integrations/memory/executiveMemoryEngine.ts";
import { SimulatedVectorMemoryProvider } from "../lib/integrations/memory/vectorMemoryBridge.ts";

describe("Sprint 5 — Milestone 6: Deep Adaptive Business Memory Engine", () => {
    const workspaceId = "ws_m6_test";

    it("ExecutiveMemoryEngine ingests observations across 5 memory layers with confidence scoring", async () => {
        const engine = new ExecutiveMemoryEngine();

        // Ingest Supplier Observation in Business Layer
        const entry1 = await engine.ingestObservation({
            workspaceId,
            workerRole: "FinanceWorker",
            layer: "business",
            category: "supplier",
            key: "acme_corp_discount",
            value: { discountPct: 5, targetDays: 10 },
            source: "stripe_invoice_inv_8821",
            importance: 8,
            explanation: "Observed 5% discount terms applied for early settlement"
        });

        assert.equal(entry1.layer, "business");
        assert.equal(entry1.confidence, 0.70);
        assert.equal(entry1.observationsCount, 1);

        // Repeat observation to boost confidence
        const entry2 = await engine.ingestObservation({
            workspaceId,
            workerRole: "FinanceWorker",
            layer: "business",
            category: "supplier",
            key: "acme_corp_discount",
            value: { discountPct: 5, targetDays: 10 },
            source: "stripe_invoice_inv_9900",
            importance: 8
        });

        assert.equal(entry2.observationsCount, 2);
        assert.equal(entry2.confidence, 0.75);
        assert.ok(entry2.sources.includes("stripe_invoice_inv_9900"));
    });

    it("ExecutiveMemoryEngine supports self-explaining evidence and specialized domain searches", async () => {
        const engine = new ExecutiveMemoryEngine();

        // 1. Ingest Customer Preference Observation in Semantic Layer
        const customerMem = await engine.ingestObservation({
            workspaceId,
            workerRole: "CRMWorker",
            layer: "semantic",
            category: "customer",
            key: "enterprise_reporting_preference",
            value: "Weekly progress summaries on Mondays",
            source: "hubspot_deal_closed",
            importance: 7
        });

        // 2. Ingest Communication Style in Behavioral Layer
        await engine.ingestObservation({
            workspaceId,
            workerRole: "EmailWorker",
            layer: "behavioral",
            category: "style",
            key: "executive_brief_format",
            value: "Bulleted metrics with confidence scores",
            source: "user_approval_pattern",
            importance: 9
        });

        // Search Customer Preferences
        const prefs = engine.findCustomerPreferences(workspaceId);
        assert.equal(prefs.length, 1);
        assert.equal(prefs[0].key, "enterprise_reporting_preference");

        // Search Communication Style
        const styles = engine.findCommunicationStyle(workspaceId);
        assert.equal(styles.length, 1);
        assert.equal(styles[0].key, "executive_brief_format");

        // Verify Self-Explanation
        const explanation = engine.explainMemory(workspaceId, customerMem.id);
        assert.ok(explanation);
        assert.ok(explanation.includes("hubspot_deal_closed"));
    });

    it("VectorMemoryBridge integrates with ExecutiveMemoryEngine", async () => {
        const vectorDb = new SimulatedVectorMemoryProvider();
        const engine = new ExecutiveMemoryEngine(vectorDb);

        await engine.ingestObservation({
            workspaceId,
            workerRole: "ResearchWorker",
            layer: "strategic",
            category: "pricing",
            key: "competitor_tier_pricing",
            value: { tier1: 99, tier2: 299 },
            source: "web_scraping_agent",
            importance: 9
        });

        const searchResults = await vectorDb.searchVector([0.7, 9, 1, 0.5], 1);
        assert.equal(searchResults.length, 1);
        assert.equal(searchResults[0].payload.key, "competitor_tier_pricing");
    });
});
