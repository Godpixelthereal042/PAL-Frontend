/**
 * Executive Memory Engine (PAL-TDD-004, PAL-ARCH-DOC-031)
 */

import type { IVectorMemoryProvider, MemoryEntry, MemoryLayerType, WorkerObservation } from "./memoryTypes.ts";
import { SimulatedVectorMemoryProvider } from "./vectorMemoryBridge.ts";

export class ExecutiveMemoryEngine {
    private memoryStore: Map<string, MemoryEntry> = new Map(); // key: workspaceId:layer:category:key
    private vectorProvider: IVectorMemoryProvider;

    constructor(vectorProvider?: IVectorMemoryProvider) {
        this.vectorProvider = vectorProvider || new SimulatedVectorMemoryProvider();
    }

    async ingestObservation(observation: WorkerObservation): Promise<MemoryEntry> {
        const { workspaceId, layer, category, key, value, source, importance = 5, explanation } = observation;
        const memoryKey = `${workspaceId}:${layer}:${category}:${key}`;
        const now = Date.now();

        let existing = this.memoryStore.get(memoryKey);

        if (existing) {
            existing.observationsCount += 1;
            existing.lastObservedAt = now;
            existing.updatedAt = now;

            if (!existing.sources.includes(source)) {
                existing.sources.push(source);
            }

            // Confidence grows asymptotically toward 1.0 with repeated observations
            existing.confidence = Math.min(1.0, existing.confidence + 0.05);
            existing.value = value;

            if (explanation) {
                existing.explanation = explanation;
            }
        } else {
            existing = {
                id: `mem_${now}_${Math.random().toString(36).substring(2, 6)}`,
                workspaceId,
                layer,
                category,
                key,
                value,
                confidence: 0.70,
                importance,
                observationsCount: 1,
                sources: [source],
                explanation: explanation || `Observed from ${source} by ${observation.workerRole}`,
                createdAt: now,
                updatedAt: now,
                lastObservedAt: now
            };
        }

        this.memoryStore.set(memoryKey, existing);

        // Sync vector embeddings if available
        await this.vectorProvider.upsertVector(
            existing.id,
            [existing.confidence, existing.importance, existing.observationsCount, 0.5],
            { memoryId: existing.id, key: existing.key, category: existing.category }
        );

        return existing;
    }

    getMemory(workspaceId: string, layer: MemoryLayerType, category: string, key: string): MemoryEntry | undefined {
        const memoryKey = `${workspaceId}:${layer}:${category}:${key}`;
        const entry = this.memoryStore.get(memoryKey);
        if (!entry) return undefined;

        // Apply decay factor
        return this.applyDecay(entry);
    }

    private applyDecay(entry: MemoryEntry): MemoryEntry {
        const now = Date.now();
        const ageHours = (now - entry.lastObservedAt) / (1000 * 60 * 60);

        // Half-life decay rate based on importance (higher importance = slower decay)
        const halfLifeHours = entry.importance * 48; // 5 importance = 240 hours half-life
        const decayFactor = Math.pow(0.5, ageHours / halfLifeHours);

        return {
            ...entry,
            confidence: Number((entry.confidence * decayFactor).toFixed(4)),
            decayFactor: Number(decayFactor.toFixed(4))
        };
    }

    explainMemory(workspaceId: string, memoryId: string): string | undefined {
        for (const entry of this.memoryStore.values()) {
            if (entry.workspaceId === workspaceId && entry.id === memoryId) {
                return `Memory [${entry.key}] in layer [${entry.layer}]: Confidence ${Math.round(entry.confidence * 100)}% based on ${entry.observationsCount} observations from sources [${entry.sources.join(", ")}]. Rationale: ${entry.explanation}`;
            }
        }
        return undefined;
    }

    // Specialized Search Methods
    findCustomerPreferences(workspaceId: string): MemoryEntry[] {
        return this.queryMemory(workspaceId, "semantic", "customer");
    }

    findPricingHistory(workspaceId: string): MemoryEntry[] {
        return this.queryMemory(workspaceId, "semantic", "pricing");
    }

    findSupplierHabits(workspaceId: string): MemoryEntry[] {
        return this.queryMemory(workspaceId, "business", "supplier");
    }

    findCommunicationStyle(workspaceId: string): MemoryEntry[] {
        return this.queryMemory(workspaceId, "behavioral", "style");
    }

    findRecurringFailures(workspaceId: string): MemoryEntry[] {
        return this.queryMemory(workspaceId, "business", "failures");
    }

    findPurchasingTrends(workspaceId: string): MemoryEntry[] {
        return this.queryMemory(workspaceId, "business", "purchasing");
    }

    private queryMemory(workspaceId: string, layer: MemoryLayerType, categorySubstring: string): MemoryEntry[] {
        const results: MemoryEntry[] = [];
        for (const entry of this.memoryStore.values()) {
            if (entry.workspaceId === workspaceId && entry.layer === layer && entry.category.toLowerCase().includes(categorySubstring.toLowerCase())) {
                results.push(this.applyDecay(entry));
            }
        }
        return results.sort((a, b) => b.confidence - a.confidence);
    }
}
