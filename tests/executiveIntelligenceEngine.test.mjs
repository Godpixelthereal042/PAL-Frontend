import test from "node:test";
import assert from "node:assert/strict";
import { executiveIntelligenceEngine } from "../lib/intelligence/intelligenceEngine.ts";
import { riskEngine } from "../lib/intelligence/riskEngine.ts";
import { opportunityEngine } from "../lib/intelligence/opportunityEngine.ts";
import { trendEngine } from "../lib/intelligence/trendEngine.ts";
import { forecastEngine } from "../lib/intelligence/forecastEngine.ts";
import { insightPrioritizer } from "../lib/intelligence/insightPrioritizer.ts";
import { recommendationEngine } from "../lib/intelligence/recommendationEngine.ts";

test("Executive Intelligence Engine - Risk Engine detects operational & financial risks", () => {
    const mockContext = {
        founder: { id: "f1", name: "Emmanuel", email: "test@pal.ai", role: "Founder", persona: "growth", company: "PAL OS" },
        tasks: [
            { id: "t1", title: "Past Due Task", dueDate: "2026-01-01", status: "pending", priority: "high" },
            { id: "t2", title: "Another Overdue Task", dueDate: "2026-01-02", status: "pending", priority: "high" },
            { id: "t3", title: "Third Overdue Task", dueDate: "2026-01-03", status: "pending", priority: "high" },
        ],
        invoices: [
            { id: "inv1", client: "Acme Corp", amount: 15000, status: "past_due", service: "Development" },
        ],
        relationships: {
            people: [
                { id: "p1", name: "Sarah Jenkins", relationshipType: "Investor", score: 60, status: "at_risk" },
            ],
            insights: [
                { id: "ins1", personId: "p1", personName: "Sarah Jenkins", relationshipType: "Investor", category: "investor_attention", title: "Investor Follow-up Overdue", description: "Overdue 35 days", supportingData: [], severity: "critical" },
            ],
            totalPeople: 1,
            atRiskCount: 1,
            overdueFollowUpCount: 1,
        },
        decisions: [
            { id: "d1", title: "Pricing Tier Upgrade", status: "pending_confirmation" },
        ],
    };

    const risks = riskEngine.analyzeRisks(mockContext);
    assert.ok(risks.length >= 3, "Should detect multiple risk categories");

    const taskRisk = risks.find((r) => r.category === "operational");
    assert.ok(taskRisk, "Should detect task risk");
    assert.equal(taskRisk.severity, "critical", "3+ overdue tasks should be critical severity");

    const invRisk = risks.find((r) => r.category === "financial");
    assert.ok(invRisk, "Should detect financial invoice risk");
    assert.equal(invRisk.severity, "critical", "$15,000 past due invoice should be critical");
});

test("Executive Intelligence Engine - Opportunity Engine identifies growth & investor momentum", () => {
    const mockContext = {
        relationships: {
            people: [
                { id: "inv1", name: "Sarah Jenkins", relationshipType: "Investor", score: 85 },
                { id: "c1", name: "Apex Cybernetics", relationshipType: "Client", score: 88 },
            ],
            insights: [],
            totalPeople: 2,
            atRiskCount: 0,
            overdueFollowUpCount: 0,
        },
        tasks: [
            { status: "completed" }, { status: "completed" }, { status: "completed" },
        ],
        projects: [
            { title: "Series A Pitch Deck", status: "active" },
        ],
    };

    const opportunities = opportunityEngine.analyzeOpportunities(mockContext);
    assert.ok(opportunities.length >= 2, "Should detect investor and client opportunities");

    const investorOpp = opportunities.find((o) => o.category === "investor");
    assert.ok(investorOpp, "Should identify investor momentum opportunity");
    assert.ok(investorOpp.confidence >= 0.85, "Should have high confidence");
});

test("Executive Intelligence Engine - Trend Engine calculates historical trends", () => {
    const mockContext = {
        decisions: [{ status: "active" }],
        relationships: { people: [{ score: 85 }], insights: [], totalPeople: 1, atRiskCount: 0, overdueFollowUpCount: 0 },
        tasks: [{ status: "completed" }, { status: "completed" }, { status: "pending" }],
    };

    const trends7d = trendEngine.analyzeTrends(mockContext, "7d");
    const trends30d = trendEngine.analyzeTrends(mockContext, "30d");

    assert.ok(trends7d.length >= 3, "Should generate trends for 7d window");
    assert.ok(trends30d.length >= 3, "Should generate trends for 30d window");
    assert.equal(trends30d[0].metric, "Decision Velocity");
});

test("Executive Intelligence Engine - Forecast Engine produces evidence-based predictions", () => {
    const mockContext = {
        projects: [{ title: "Product MVP Launch", status: "in_progress" }],
        invoices: [],
        relationships: { people: [], insights: [], totalPeople: 0, atRiskCount: 0, overdueFollowUpCount: 0 },
    };

    const forecasts = forecastEngine.generateForecasts(mockContext);
    assert.ok(forecasts.length >= 2, "Should generate project and health forecasts");
    assert.ok(forecasts[0].confidence > 0.80, "Forecast confidence should be above 80%");
    assert.ok(forecasts[0].assumptions.length > 0, "Forecast should contain explicit assumptions");
});

test("Executive Intelligence Engine - Insight Prioritizer ranks insights deterministically", () => {
    const risks = [
        { id: "r1", title: "Critical Overdue Invoice", severity: "critical", confidence: 0.95, description: "Test", recommendedAction: "Action", impact: "High", category: "financial" },
    ];
    const opportunities = [
        { id: "o1", title: "Investor Opportunity", category: "investor", confidence: 0.90, reason: "Test", potentialValue: "High", suggestedNextAction: "Action" },
    ];

    const prioritized = insightPrioritizer.prioritize(risks, opportunities, [], []);
    assert.ok(prioritized.length === 2, "Should prioritize both items");
    assert.equal(prioritized[0].id, "r1", "Critical risk should rank #1 ahead of opportunity");
});

test("Executive Intelligence Engine - Recommendation Engine generates actionable guidance", () => {
    const risks = [
        { id: "r1", title: "Overdue Invoice", severity: "critical", confidence: 0.95, description: "Test", recommendedAction: "Call client", impact: "Cash flow delay", category: "financial" },
    ];
    const opportunities = [
        { id: "o1", title: "Investor Meeting", category: "investor", confidence: 0.90, reason: "Test", potentialValue: "Funding", suggestedNextAction: "Send update" },
    ];

    const recs = recommendationEngine.generateRecommendations(risks, opportunities);
    assert.ok(recs.length >= 2, "Should generate recommendations for top risk and opportunity");
    assert.equal(recs[0].priority, "critical");
    assert.ok(recs[0].actionUrl, "Recommendation should include actionable route link");
});

test("Executive Intelligence Engine - Facade aggregates snapshot and caches result", async () => {
    executiveIntelligenceEngine.clearCache("user_test");
    const intel1 = await executiveIntelligenceEngine.getExecutiveIntelligence("user_test");
    assert.ok(intel1, "Should generate executive intelligence payload");
    assert.ok(intel1.snapshot, "Should contain snapshot");
    assert.ok(intel1.risks, "Should contain risks");

    // Second call should return cached payload
    const intel2 = await executiveIntelligenceEngine.getExecutiveIntelligence("user_test");
    assert.equal(intel1.timestamp, intel2.timestamp, "Cache hit should return identical timestamp");
});
