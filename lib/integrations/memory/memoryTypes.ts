/**
 * Executive Memory Engine Types (PAL-TDD-004, PAL-ARCH-DOC-031)
 */

export type MemoryLayerType = "working" | "semantic" | "behavioral" | "strategic" | "business";

export interface MemoryEntry {
    id: string;
    workspaceId: string;
    layer: MemoryLayerType;
    category: string;
    key: string;
    value: any;
    confidence: number; // 0.0 - 1.0
    importance: number; // 1 - 10
    observationsCount: number;
    sources: string[];
    explanation: string;
    createdAt: number;
    updatedAt: number;
    lastObservedAt: number;
    decayFactor?: number;
}

export interface WorkerObservation {
    workspaceId: string;
    workerRole: string;
    layer: MemoryLayerType;
    category: string;
    key: string;
    value: any;
    source: string;
    importance?: number;
    explanation?: string;
}

export interface IVectorMemoryProvider {
    name: string;
    upsertVector(id: string, vector: number[], payload: Record<string, any>): Promise<void>;
    searchVector(vector: number[], topK: number): Promise<{ id: string; score: number; payload: Record<string, any> }[]>;
}
