/**
 * Executive Intelligence Engine - Central Orchestrator
 *
 * PAL Milestone 7A — Executive Intelligence Engine
 */

import { buildBusinessContext } from "../contextEngine.ts";
import { riskEngine } from "./riskEngine.ts";
import { opportunityEngine } from "./opportunityEngine.ts";
import { trendEngine } from "./trendEngine.ts";
import { forecastEngine } from "./forecastEngine.ts";
import { insightPrioritizer } from "./insightPrioritizer.ts";
import { recommendationEngine } from "./recommendationEngine.ts";
import type {
    ExecutiveIntelligence,
    ExecutiveSnapshot,
    RiskInsight,
    OpportunityInsight,
    TrendInsight,
    ForecastInsight,
    ExecutiveRecommendation,
} from "./types.ts";

interface CacheEntry {
    timestamp: number;
    intelligence: ExecutiveIntelligence;
}

const cache: Map<string, CacheEntry> = new Map();
const CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes TTL

export class ExecutiveIntelligenceEngine {
    public async getExecutiveIntelligence(
        userId = "user_default",
        options: { forceRefresh?: boolean } = {}
    ): Promise<ExecutiveIntelligence> {
        const cacheKey = `intel_${userId}`;
        const cached = cache.get(cacheKey);

        if (!options.forceRefresh && cached && Date.now() - cached.timestamp < CACHE_TTL_MS) {
            return cached.intelligence;
        }

        // 1. Build unified Business Context
        const ctx = await buildBusinessContext(userId);
        const now = Date.now();

        // 2. Build Executive Snapshot
        const activeProjectsCount = (ctx.projects || []).filter((p) => p.status.toLowerCase() === "active" || p.status.toLowerCase() === "in_progress").length;
        const overdueTasksCount = (ctx.tasks || []).filter((t) => t.dueDate && new Date(t.dueDate).getTime() < now && t.status.toLowerCase() !== "completed" && t.status.toLowerCase() !== "done").length;
        const pendingDecisionsCount = (ctx.decisions || []).filter((d) => d.status.toLowerCase() === "pending_confirmation").length;
        const atRiskRelationshipsCount = ctx.relationships?.atRiskCount || 0;
        const overdueInvoicesTotal = (ctx.invoices || []).filter((i) => i.status.toLowerCase() === "unpaid" || i.status.toLowerCase() === "past_due" || i.status.toLowerCase() === "overdue").reduce((sum, i) => sum + (parseFloat(String(i.amount)) || 0), 0);

        const snapshot: ExecutiveSnapshot = {
            timestamp: now,
            businessContext: ctx,
            activeProjectsCount,
            overdueTasksCount,
            pendingDecisionsCount,
            atRiskRelationshipsCount,
            overdueInvoicesTotal,
            activeWorkflowsCount: 4,
        };

        // 3. Execute Subsystem Intelligence Engines
        const risks = riskEngine.analyzeRisks(ctx);
        const opportunities = opportunityEngine.analyzeOpportunities(ctx);
        const trends = trendEngine.analyzeTrends(ctx, "30d");
        const forecasts = forecastEngine.generateForecasts(ctx);

        // 4. Prioritize Insights
        const prioritizedItems = insightPrioritizer.prioritize(risks, opportunities, trends, forecasts);

        // 5. Generate Recommendations
        const recommendations = recommendationEngine.generateRecommendations(risks, opportunities);

        // 6. Aggregate Structured Intelligence Output
        const intelligence: ExecutiveIntelligence = {
            timestamp: now,
            snapshot,
            topRisk: risks.length > 0 ? risks[0] : null,
            topOpportunity: opportunities.length > 0 ? opportunities[0] : null,
            keyTrend: trends.length > 0 ? trends[0] : null,
            topForecast: forecasts.length > 0 ? forecasts[0] : null,
            risks,
            opportunities,
            trends,
            forecasts,
            recommendations,
            prioritizedInsights: prioritizedItems.map((item) => ({
                id: item.id,
                type: item.type,
                score: item.score,
                title: item.title,
                summary: item.summary,
            })),
        };

        // Update Cache
        cache.set(cacheKey, { timestamp: now, intelligence });

        return intelligence;
    }

    public clearCache(userId = "user_default"): void {
        cache.delete(`intel_${userId}`);
    }
}

export const executiveIntelligenceEngine = new ExecutiveIntelligenceEngine();
