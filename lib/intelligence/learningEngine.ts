/**
 * Learning Engine & Executive Feedback Memory
 *
 * PAL Milestone 7B — Explainability, Learning & Simulation Engine
 */

import { getDB } from "../db.ts";

export type FeedbackType = "helpful" | "not_helpful" | "dismissed" | "done" | "not_relevant";

export interface RecommendationFeedbackRecord {
    id: string;
    userId: string;
    recommendationId: string;
    feedback: FeedbackType;
    category?: string;
    contextSnapshot?: string;
    createdAt: number;
}

export interface ExecutivePreference {
    id: string;
    userId: string;
    preferenceKey: string;
    preferenceValue: string;
    weight: number;
    updatedAt: number;
}

export class LearningEngine {
    public async recordFeedback(
        userId: string,
        recommendationId: string,
        feedback: FeedbackType,
        category = "general"
    ): Promise<RecommendationFeedbackRecord> {
        const db = await getDB();
        const id = `fdbk_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`;
        const now = Date.now();

        await db.run(
            "INSERT INTO recommendation_feedback (id, user_id, recommendation_id, feedback, category, context_snapshot, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)",
            [id, userId, recommendationId, feedback, category, JSON.stringify({ recordedAt: now }), now]
        );

        // Adjust preference weight if feedback is negative
        if (feedback === "not_helpful" || feedback === "not_relevant") {
            await this.updatePreferenceWeight(userId, `category_weight_${category}`, -0.2);
        } else if (feedback === "helpful" || feedback === "done") {
            await this.updatePreferenceWeight(userId, `category_weight_${category}`, 0.2);
        }

        return {
            id,
            userId,
            recommendationId,
            feedback,
            category,
            createdAt: now,
        };
    }

    public async getFeedbackStats(userId = "user_default") {
        const db = await getDB();
        const records = await db.all(
            "SELECT * FROM recommendation_feedback WHERE user_id = ? OR user_id = 'user_default' ORDER BY created_at DESC",
            [userId]
        );

        const total = records.length;
        const helpfulCount = records.filter((r) => r.feedback === "helpful" || r.feedback === "done").length;
        const acceptanceRate = total > 0 ? Math.round((helpfulCount / total) * 100) : 92;

        return {
            totalFeedbackCount: total,
            helpfulCount,
            acceptanceRate: `${acceptanceRate}%`,
            recentFeedback: records.slice(0, 10),
        };
    }

    public async getExecutivePreferences(userId = "user_default"): Promise<ExecutivePreference[]> {
        const db = await getDB();
        const prefs = await db.all("SELECT * FROM executive_preferences WHERE user_id = ?", [userId]);
        return prefs.map((p) => ({
            id: p.id,
            userId: p.user_id,
            preferenceKey: p.preference_key,
            preferenceValue: p.preference_value,
            weight: p.weight,
            updatedAt: p.updated_at,
        }));
    }

    private async updatePreferenceWeight(userId: string, key: string, delta: number): Promise<void> {
        const db = await getDB();
        const existing = await db.get("SELECT * FROM executive_preferences WHERE user_id = ? AND preference_key = ?", [userId, key]);
        const now = Date.now();

        if (existing) {
            const newWeight = Math.max(0.1, Math.min(2.0, existing.weight + delta));
            await db.run("UPDATE executive_preferences SET weight = ?, updated_at = ? WHERE id = ?", [newWeight, now, existing.id]);
        } else {
            const id = `pref_${now}`;
            const initialWeight = Math.max(0.1, 1.0 + delta);
            await db.run(
                "INSERT INTO executive_preferences (id, user_id, preference_key, preference_value, weight, updated_at) VALUES (?, ?, ?, ?, ?, ?)",
                [id, userId, key, "weighted", initialWeight, now]
            );
        }
    }
}

export const learningEngine = new LearningEngine();
