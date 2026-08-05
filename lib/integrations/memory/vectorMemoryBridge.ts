/**
 * Vector Memory Provider Abstraction (PAL-TDD-004, PAL-ARCH-DOC-031)
 */

import type { IVectorMemoryProvider } from "./memoryTypes.ts";

export class SimulatedVectorMemoryProvider implements IVectorMemoryProvider {
    name = "SimulatedInMemoryVectorDB";
    private vectors: Map<string, { vector: number[]; payload: Record<string, any> }> = new Map();

    async upsertVector(id: string, vector: number[], payload: Record<string, any>): Promise<void> {
        this.vectors.set(id, { vector, payload });
    }

    async searchVector(queryVector: number[], topK: number): Promise<{ id: string; score: number; payload: Record<string, any> }[]> {
        const results: { id: string; score: number; payload: Record<string, any> }[] = [];

        for (const [id, item] of this.vectors.entries()) {
            const score = this.cosineSimilarity(queryVector, item.vector);
            results.push({ id, score, payload: item.payload });
        }

        return results.sort((a, b) => b.score - a.score).slice(0, topK);
    }

    private cosineSimilarity(a: number[], b: number[]): number {
        if (a.length !== b.length || a.length === 0) return 0;
        let dot = 0;
        let normA = 0;
        let normB = 0;
        for (let i = 0; i < a.length; i++) {
            dot += a[i] * b[i];
            normA += a[i] * a[i];
            normB += b[i] * b[i];
        }
        if (normA === 0 || normB === 0) return 0;
        return dot / (Math.sqrt(normA) * Math.sqrt(normB));
    }
}
