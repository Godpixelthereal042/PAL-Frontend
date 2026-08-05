/**
 * Observability & AI Evaluation Telemetry (PAL-TDD-006, PAL-ARCH-DOC-043)
 *
 * Features:
 *   - LLMReasoningTrace interface with cost, latency, token usage, correlation IDs, and quality metrics
 *   - LLMTraceRepository extending BaseRepository for RLS-ready persistence in database
 *   - LLMTelemetryRecorder with real-time metrics aggregation, cost calculation, and telemetry summary
 */

import { BaseRepository } from "../db/baseRepository.ts";

export interface LLMReasoningTrace {
    traceId: string;
    workspaceId: string;
    correlationId?: string;
    promptName: string;
    promptVersion: string;
    model: string;
    inputTokens: number;
    outputTokens: number;
    estimatedCostUSD: number;
    latencyMs: number;
    success: boolean;
    retryCount: number;
    schemaValid: boolean;
    confidenceScore?: number;
    fallbackTriggered?: boolean;
    errorMessage?: string;
    createdAt: number;
}

export interface TelemetrySummary {
    totalRequests: number;
    successfulRequests: number;
    failedRequests: number;
    fallbackRequests: number;
    totalInputTokens: number;
    totalOutputTokens: number;
    totalCostUSD: number;
    avgLatencyMs: number;
    schemaValidationPassRate: number;
}

export class LLMTraceRepository extends BaseRepository<any> {
    constructor() {
        super("llm_reasoning_traces");
    }
}

export class LLMTelemetryRecorder {
    private repo: LLMTraceRepository = new LLMTraceRepository();
    private inMemoryTraces: LLMReasoningTrace[] = [];

    async recordTrace(trace: Omit<LLMReasoningTrace, "traceId" | "createdAt">): Promise<LLMReasoningTrace> {
        const traceId = `tr_llm_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
        const fullTrace: LLMReasoningTrace = {
            ...trace,
            traceId,
            createdAt: Date.now()
        };

        this.inMemoryTraces.push(fullTrace);

        this.repo.setWorkspaceContext(trace.workspaceId || "default_workspace");
        this.repo.insertEntity({
            id: traceId,
            workspace_id: trace.workspaceId || "default_workspace",
            prompt_name: trace.promptName,
            prompt_version: trace.promptVersion,
            model: trace.model,
            input_tokens: trace.inputTokens,
            output_tokens: trace.outputTokens,
            estimated_cost_usd: trace.estimatedCostUSD,
            latency_ms: trace.latencyMs,
            success: trace.success ? 1 : 0,
            retry_count: trace.retryCount,
            schema_valid: trace.schemaValid ? 1 : 0,
            error_message: trace.errorMessage || null,
            created_at: fullTrace.createdAt
        }).catch(err => console.error("Failed to persist LLM trace", err));

        return fullTrace;
    }

    async getTraces(workspaceId: string = "default_workspace"): Promise<LLMReasoningTrace[]> {
        return this.inMemoryTraces.filter(t => t.workspaceId === workspaceId);
    }

    calculateTotalCostUSD(workspaceId: string = "default_workspace"): number {
        const traces = this.inMemoryTraces.filter(t => t.workspaceId === workspaceId);
        const total = traces.reduce((acc, t) => acc + t.estimatedCostUSD, 0);
        return Number(total.toFixed(6));
    }

    getTelemetrySummary(workspaceId: string = "default_workspace"): TelemetrySummary {
        const traces = this.inMemoryTraces.filter(t => t.workspaceId === workspaceId);
        const totalRequests = traces.length;

        if (totalRequests === 0) {
            return {
                totalRequests: 0,
                successfulRequests: 0,
                failedRequests: 0,
                fallbackRequests: 0,
                totalInputTokens: 0,
                totalOutputTokens: 0,
                totalCostUSD: 0,
                avgLatencyMs: 0,
                schemaValidationPassRate: 100.0
            };
        }

        const successfulRequests = traces.filter(t => t.success).length;
        const failedRequests = traces.filter(t => !t.success).length;
        const fallbackRequests = traces.filter(t => t.fallbackTriggered || t.model === "static_fallback").length;
        const totalInputTokens = traces.reduce((acc, t) => acc + (t.inputTokens || 0), 0);
        const totalOutputTokens = traces.reduce((acc, t) => acc + (t.outputTokens || 0), 0);
        const totalCostUSD = this.calculateTotalCostUSD(workspaceId);
        const totalLatency = traces.reduce((acc, t) => acc + t.latencyMs, 0);
        const avgLatencyMs = Math.round(totalLatency / totalRequests);
        const schemaValidCount = traces.filter(t => t.schemaValid).length;
        const schemaValidationPassRate = Number(((schemaValidCount / totalRequests) * 100).toFixed(2));

        return {
            totalRequests,
            successfulRequests,
            failedRequests,
            fallbackRequests,
            totalInputTokens,
            totalOutputTokens,
            totalCostUSD,
            avgLatencyMs,
            schemaValidationPassRate
        };
    }
}
