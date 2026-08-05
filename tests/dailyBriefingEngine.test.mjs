import test from "node:test";
import assert from "node:assert/strict";

import { getDB } from "../lib/db.ts";
import { getDailyBrief, globalDailyBriefingEngine } from "../lib/briefing/dailyBriefingEngine.ts";
import { globalBriefingCache } from "../lib/briefing/briefingCache.ts";
import { calculateBusinessHealth } from "../lib/briefing/businessHealthEngine.ts";
import { analyzePriorities } from "../lib/briefing/priorityAnalyzer.ts";
import { analyzeRisks } from "../lib/briefing/riskAnalyzer.ts";
import { analyzeOpportunities } from "../lib/briefing/opportunityAnalyzer.ts";
import { generateInsights } from "../lib/briefing/insightEngine.ts";
import { generateRecommendation } from "../lib/briefing/recommendationEngine.ts";
import { createDecision } from "../lib/decisionMemory.ts";
import { upsertBusinessBrain } from "../lib/businessBrain.ts";

test("Business Health Engine - calculates score, status, trend, and factors", () => {
    const mockContext = {
        founder: { name: "Emmanuel", email: "test@pal.ai", role: "Founder", company: "PAL Labs" },
        business: { name: "PAL AI", description: "AI COO for founders", industry: "Tech", stage: "Growth", targetMarket: "Founders", priorities: "Scale ARR", goals: [], offers: [], customerSegments: [], challenges: [], notes: [] },
        projects: [
            { id: "p1", title: "Launch Marketing Campaign", type: "Marketing", description: "", date: "2026-08-01", color: "#3b82f6", goal: "", priority: "high", status: "In Progress", dueDate: "2026-08-15" },
        ],
        tasks: [
            { id: "t1", projectId: "p1", title: "Design Landing Page", priority: "high", status: "Done", dueDate: "2026-07-20" },
            { id: "t2", projectId: "p1", title: "Setup Analytics", priority: "medium", status: "In Progress", dueDate: "2026-08-05" },
        ],
        calendar: [],
        notifications: [],
        invoices: [
            { id: "inv1", client: "Acme Corp", amount: "$1500", service: "Consulting", date: "2026-07-01", status: "paid" },
        ],
        decisions: [],
        summary: { activeProjects: 1, overdueItems: 0, highPriorityItems: 1 },
    };

    const health = calculateBusinessHealth(mockContext);
    assert.ok(health.score >= 0 && health.score <= 100);
    assert.ok(["excellent", "good", "fair", "poor"].includes(health.status));
    assert.ok(["improving", "stable", "declining"].includes(health.trend));
    assert.ok(health.factors.length >= 1);
});

test("Priority Analyzer - orders priorities deterministically from highest to lowest score", () => {
    const mockContext = {
        founder: { name: "Emmanuel", email: "test@pal.ai", role: "Founder", company: "PAL" },
        business: { priorities: "Increase ARR" },
        projects: [],
        tasks: [
            { id: "t_low", title: "Minor task", priority: "low", status: "In Progress", dueDate: "2026-09-01" },
            { id: "t_urgent", title: "Urgent bug fix", priority: "high", status: "In Progress", dueDate: "2026-07-01" }, // Overdue
        ],
        calendar: [],
        notifications: [],
        invoices: [],
        decisions: [],
        summary: { activeProjects: 0, overdueItems: 1, highPriorityItems: 1 },
    };

    const priorities = analyzePriorities(mockContext);
    assert.ok(priorities.length >= 2);
    assert.equal(priorities[0].title, "Urgent bug fix");
    assert.ok(priorities[0].score > priorities[priorities.length - 1].score);
});

test("Risk Analyzer - detects financial, operational, and schedule risks", () => {
    const mockContext = {
        founder: { name: "Emmanuel", email: "test@pal.ai", role: "Founder", company: "PAL" },
        business: null,
        projects: [],
        tasks: [
            { id: "t_overdue", title: "Missed Deadline Task", priority: "high", status: "In Progress", dueDate: "2026-07-01" },
        ],
        calendar: [{}, {}, {}, {}, {}, {}], // 6 events -> heavy calendar risk
        notifications: [],
        invoices: [
            { id: "inv_overdue", client: "Beta Inc", amount: "$5000", service: "Dev", date: "2026-06-01", status: "overdue" },
        ],
        decisions: [],
        summary: { activeProjects: 0, overdueItems: 2, highPriorityItems: 1 },
    };

    const risks = analyzeRisks(mockContext);
    assert.ok(risks.length >= 3);
    const criticalRisk = risks.find((r) => r.severity === "critical");
    assert.ok(criticalRisk);
    assert.ok(criticalRisk.title.includes("Overdue Invoice"));
});

test("Opportunity Analyzer - detects focus time and momentum opportunities", () => {
    const mockContext = {
        founder: { name: "Emmanuel", email: "test@pal.ai", role: "Founder", company: "PAL" },
        business: null,
        projects: [
            { id: "p_near_done", title: "Website Redesign", status: "In Progress" },
        ],
        tasks: [
            { id: "t1", projectId: "p_near_done", status: "Done" },
            { id: "t2", projectId: "p_near_done", status: "In Progress" },
        ],
        calendar: [], // Light calendar -> Focus time opportunity
        notifications: [],
        invoices: [],
        decisions: [],
        summary: { activeProjects: 1, overdueItems: 0, highPriorityItems: 0 },
    };

    const opportunities = analyzeOpportunities(mockContext);
    assert.ok(opportunities.length >= 2);
    const focusOpp = opportunities.find((o) => o.type === "productivity");
    assert.ok(focusOpp);
});

test("Insight Engine - generates data-backed productivity & time allocation insights", () => {
    const mockContext = {
        founder: { name: "Emmanuel", email: "test@pal.ai", role: "Founder", company: "PAL" },
        business: null,
        projects: [],
        tasks: [
            { id: "t1", status: "Done" },
            { id: "t2", status: "Done" },
            { id: "t3", status: "In Progress" },
        ],
        calendar: [{ title: "Sprint Planning" }],
        notifications: [],
        invoices: [],
        decisions: [{ id: "d1", status: "active", title: "Target Enterprise Customers" }],
        summary: { activeProjects: 0, overdueItems: 0, highPriorityItems: 0 },
    };

    const insights = generateInsights(mockContext);
    assert.ok(insights.length >= 3);
    const prodInsight = insights.find((i) => i.category === "Productivity");
    assert.ok(prodInsight);
    assert.equal(prodInsight.metric, "67%");
});

test("Recommendation Engine - picks single highest impact action", () => {
    const mockContext = {
        founder: { name: "Emmanuel", email: "test@pal.ai", role: "Founder", company: "PAL" },
        business: null,
        projects: [],
        tasks: [],
        calendar: [],
        notifications: [],
        invoices: [
            { id: "inv1", client: "Unpaid Client", amount: "$10000", service: "SaaS", date: "2026-06-01", status: "overdue" },
        ],
        decisions: [],
        summary: { activeProjects: 0, overdueItems: 1, highPriorityItems: 0 },
    };

    const priorities = analyzePriorities(mockContext);
    const risks = analyzeRisks(mockContext);
    const opportunities = analyzeOpportunities(mockContext);

    const recommendation = generateRecommendation(mockContext, priorities, risks, opportunities);

    assert.ok(recommendation.title.includes("Critical Risk"));
    assert.ok(recommendation.confidence >= 80);
    assert.ok(recommendation.supportingEvidence.length >= 1);
});

test("Daily Briefing Engine - full pipeline execution & cache hit vs invalidation", async () => {
    const testUserId = `user_brief_${Date.now()}`;
    globalBriefingCache.clear();

    // 1. First call computes briefing & populates cache
    const briefing1 = await getDailyBrief(testUserId);

    assert.ok(briefing1.id.startsWith("brief_"));
    assert.ok(briefing1.businessHealth.score >= 0);
    assert.ok(briefing1.markdownSummary.includes("Good morning"));

    // 2. Second call returns cached briefing instance
    const briefing2 = await getDailyBrief(testUserId);
    assert.equal(briefing1.id, briefing2.id);

    // 3. Force refresh invalidates cache and generates new briefing
    const briefing3 = await getDailyBrief(testUserId, true);
    assert.notEqual(briefing1.id, briefing3.id);
});
