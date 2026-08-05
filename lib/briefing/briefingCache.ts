/**
 * Daily Briefing Cache
 *
 * PAL Milestone 5A — Daily Briefing Engine
 *
 * Lightweight caching layer avoiding recomputation unless:
 * 1. Business data changes
 * 2. New calendar day begins
 * 3. Founder explicitly requests a force refresh
 */

import type { BusinessContext } from "../contextEngine.ts";
import type { DailyBriefing } from "./types.ts";

interface CacheEntry {
    briefing: DailyBriefing;
    cachedAt: number;
    dateStr: string;
    contextHash: string;
}

export class BriefingCache {
    private cache: Map<string, CacheEntry> = new Map();

    /**
     * Compute lightweight hash representing business data state.
     */
    computeContextHash(context: BusinessContext): string {
        const pCount = context.projects.length;
        const tCount = context.tasks.length;
        const iCount = context.invoices.length;
        const cCount = context.calendar.length;
        const dCount = (context.decisions || []).length;
        const sSummary = JSON.stringify(context.summary);

        return `${pCount}:${tCount}:${iCount}:${cCount}:${dCount}:${sSummary}`;
    }

    /**
     * Retrieve cached briefing if valid, otherwise return null.
     */
    get(userId: string, context: BusinessContext, forceRefresh: boolean = false): DailyBriefing | null {
        if (forceRefresh) return null;

        const effectiveUserId = userId || "current_user";
        const entry = this.cache.get(effectiveUserId);
        if (!entry) return null;

        const todayStr = new Date().toISOString().split("T")[0];

        // 1. Invalidate on new day
        if (entry.dateStr !== todayStr) {
            this.cache.delete(effectiveUserId);
            return null;
        }

        // 2. Invalidate on business data change
        const currentHash = this.computeContextHash(context);
        if (entry.contextHash !== currentHash) {
            this.cache.delete(effectiveUserId);
            return null;
        }

        return entry.briefing;
    }

    /**
     * Store briefing in cache.
     */
    set(userId: string, context: BusinessContext, briefing: DailyBriefing): void {
        const effectiveUserId = userId || "current_user";
        const todayStr = new Date().toISOString().split("T")[0];
        const contextHash = this.computeContextHash(context);

        this.cache.set(effectiveUserId, {
            briefing,
            cachedAt: Date.now(),
            dateStr: todayStr,
            contextHash,
        });
    }

    /**
     * Clear cache for testing isolation.
     */
    clear(): void {
        this.cache.clear();
    }
}

export const globalBriefingCache = new BriefingCache();
