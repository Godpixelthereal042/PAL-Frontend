/**
 * Insight Prioritizer Engine
 *
 * PAL Milestone 7A — Executive Intelligence Engine
 */

import type { RiskInsight, OpportunityInsight, TrendInsight, ForecastInsight } from "./types.ts";

export interface PrioritizedItem {
    id: string;
    type: "risk" | "opportunity" | "trend" | "forecast";
    score: number; // 0 - 100
    title: string;
    summary: string;
    original: RiskInsight | OpportunityInsight | TrendInsight | ForecastInsight;
}

export class InsightPrioritizer {
    public prioritize(
        risks: RiskInsight[],
        opportunities: OpportunityInsight[],
        trends: TrendInsight[],
        forecasts: ForecastInsight[]
    ): PrioritizedItem[] {
        const items: PrioritizedItem[] = [];

        // 1. Score Risks
        for (const r of risks) {
            let score = 50; // base score
            if (r.severity === "critical") score += 45;
            else if (r.severity === "high") score += 30;
            else if (r.severity === "medium") score += 15;

            score += Math.round((r.confidence || 0.8) * 10);

            items.push({
                id: r.id,
                type: "risk",
                score: Math.min(100, score),
                title: r.title,
                summary: `${r.description} Recommended action: ${r.recommendedAction}`,
                original: r,
            });
        }

        // 2. Score Opportunities
        for (const o of opportunities) {
            let score = 40;
            if (o.category === "investor") score += 35;
            else if (o.category === "client") score += 25;
            else score += 15;

            score += Math.round((o.confidence || 0.8) * 15);

            items.push({
                id: o.id,
                type: "opportunity",
                score: Math.min(100, score),
                title: o.title,
                summary: `${o.reason} Suggested action: ${o.suggestedNextAction}`,
                original: o,
            });
        }

        // 3. Score Trends
        for (const t of trends) {
            let score = 30;
            if (t.direction === "declining") score += 25; // declining trends require attention
            else score += 15;

            items.push({
                id: t.id,
                type: "trend",
                score: Math.min(100, score),
                title: `${t.metric} (${t.direction})`,
                summary: t.description,
                original: t,
            });
        }

        // 4. Score Forecasts
        for (const f of forecasts) {
            let score = 35 + Math.round((f.confidence || 0.8) * 15);
            items.push({
                id: f.id,
                type: "forecast",
                score: Math.min(100, score),
                title: "Forecast Insight",
                summary: f.prediction,
                original: f,
            });
        }

        // Sort descending by score
        return items.sort((a, b) => b.score - a.score);
    }
}

export const insightPrioritizer = new InsightPrioritizer();
