/**
 * Central Daily Briefing Engine Orchestrator v2
 *
 * PAL Milestone 5A & 7A — Executive Intelligence Engine Upgrade
 */

import { buildBusinessContext } from "../contextEngine.ts";
import { calculateBusinessHealth } from "./businessHealthEngine.ts";
import { analyzePriorities } from "./priorityAnalyzer.ts";
import { analyzeRisks } from "./riskAnalyzer.ts";
import { analyzeOpportunities } from "./opportunityAnalyzer.ts";
import { generateInsights } from "./insightEngine.ts";
import { generateRecommendation } from "./recommendationEngine.ts";
import { composeBriefing } from "./briefingComposer.ts";
import { BriefingCache, globalBriefingCache } from "./briefingCache.ts";
import { executiveIntelligenceEngine } from "../intelligence/intelligenceEngine.ts";
import type { DailyBriefing } from "./types.ts";

export class DailyBriefingEngine {
    private cache: BriefingCache;

    constructor(cache: BriefingCache = globalBriefingCache) {
        this.cache = cache;
    }

    /**
     * Executes the proactive Daily Briefing pipeline for a user.
     * Integrates Executive Intelligence v2 engine (Top Risk, Top Opportunity, Key Trend, Forecast).
     */
    async getDailyBriefing(userId: string, forceRefresh: boolean = false): Promise<DailyBriefing> {
        const effectiveUserId = userId || "current_user";

        // 1. Load Business Context
        const context = await buildBusinessContext(effectiveUserId);

        // 2. Check Briefing Cache
        const cached = this.cache.get(effectiveUserId, context, forceRefresh);
        if (cached) {
            return cached;
        }

        // 3. Execute Executive Intelligence Engine v2
        const intelligence = await executiveIntelligenceEngine.getExecutiveIntelligence(effectiveUserId, { forceRefresh });

        // 4. Execute Read-Only Analytical Pipeline
        const health = calculateBusinessHealth(context);
        const priorities = analyzePriorities(context);
        const risks = analyzeRisks(context);
        const opportunities = analyzeOpportunities(context);
        const insights = generateInsights(context);

        // 5. Generate Executive Recommendation & Compose Briefing
        const recommendation = generateRecommendation(context, priorities, risks, opportunities);
        const briefing = composeBriefing(context, health, priorities, risks, opportunities, insights, recommendation);

        // Attach Executive Intelligence v2 Metadata
        (briefing as any).executiveIntelligence = {
            topRisk: intelligence.topRisk,
            topOpportunity: intelligence.topOpportunity,
            keyTrend: intelligence.keyTrend,
            topForecast: intelligence.topForecast,
        };

        // 6. Store in Cache
        this.cache.set(effectiveUserId, context, briefing);

        return briefing;
    }
}

export const globalDailyBriefingEngine = new DailyBriefingEngine();

export async function getDailyBrief(userId: string, forceRefresh: boolean = false): Promise<DailyBriefing> {
    return globalDailyBriefingEngine.getDailyBriefing(userId, forceRefresh);
}
