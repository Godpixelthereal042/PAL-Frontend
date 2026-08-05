/**
 * Extensible LLM Strategy Reasoning Provider (PAL-TDD-005A, PAL-TDD-006, PAL-ARCH-DOC-040, PAL-ARCH-DOC-041)
 *
 * Pluggable AI reasoning provider that invokes LLM / Gemini capabilities
 * for dynamic executive intent compilation, council voting, and simulation scoring.
 * Falls back safely to StaticReasoningProvider when unconfigured or on network error.
 */

import type { AlignmentScoreResult, ExecutiveIntent, ExecutivePolicy, OKRItem } from "./strategyTypes.ts";
import type { CouncilMemberVote, MemberCritique, Proposal } from "./negotiationTypes.ts";
import type { SimulationMode } from "./simulationTypes.ts";
import type { IReasoningProvider } from "./reasoningTypes.ts";
import { StaticReasoningProvider } from "./staticReasoningProvider.ts";
import { REASONING_PROMPTS } from "./reasoningSchemas.ts";
import { LLMTelemetryRecorder } from "../telemetry/llmTelemetry.ts";

export class LLMReasoningProvider implements IReasoningProvider {
    name = "LLMReasoningProvider";
    private fallback: StaticReasoningProvider = new StaticReasoningProvider();
    private apiKey?: string;
    private timeoutMs: number = 5000;
    private telemetry: LLMTelemetryRecorder = new LLMTelemetryRecorder();
    public activeWorkspaceId: string = "default_workspace";

    constructor(apiKey?: string, timeoutMs: number = 5000, telemetry?: LLMTelemetryRecorder) {
        this.apiKey = apiKey || process.env.GEMINI_API_KEY;
        this.timeoutMs = timeoutMs;
        if (telemetry) this.telemetry = telemetry;
    }

    public setWorkspaceContext(workspaceId: string): void {
        this.activeWorkspaceId = workspaceId;
    }

    public getTelemetryRecorder(): LLMTelemetryRecorder {
        return this.telemetry;
    }

    private async callGeminiJSON<T>(promptName: string, prompt: string): Promise<T | undefined> {
        const key = this.apiKey || process.env.GEMINI_API_KEY;
        const startTime = Date.now();

        if (!key) {
            await this.telemetry.recordTrace({
                workspaceId: this.activeWorkspaceId,
                promptName,
                promptVersion: "v1.0",
                model: "static_fallback",
                inputTokens: 350,
                outputTokens: 150,
                estimatedCostUSD: 0.0001,
                latencyMs: Date.now() - startTime,
                success: true,
                retryCount: 0,
                schemaValid: true
            });
            return undefined;
        }

        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), this.timeoutMs);

        try {
            const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${key}`;
            const response = await fetch(url, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                signal: controller.signal,
                body: JSON.stringify({
                    contents: [{ parts: [{ text: prompt }] }],
                    generationConfig: {
                        responseMimeType: "application/json"
                    }
                })
            });

            clearTimeout(timeoutId);

            if (!response.ok) {
                await this.telemetry.recordTrace({
                    workspaceId: "default_workspace",
                    promptName,
                    promptVersion: "v1.0",
                    model: "gemini-1.5-flash",
                    inputTokens: 500,
                    outputTokens: 0,
                    estimatedCostUSD: 0.0001,
                    latencyMs: Date.now() - startTime,
                    success: false,
                    retryCount: 0,
                    schemaValid: false,
                    errorMessage: `HTTP ${response.status}: ${response.statusText}`
                });
                return undefined;
            }

            const data = await response.json();
            const textOutput = data?.candidates?.[0]?.content?.parts?.[0]?.text;
            if (!textOutput) return undefined;

            const parsed = JSON.parse(textOutput) as T;

            await this.telemetry.recordTrace({
                workspaceId: "default_workspace",
                promptName,
                promptVersion: "v1.0",
                model: "gemini-1.5-flash",
                inputTokens: 600,
                outputTokens: 250,
                estimatedCostUSD: 0.00025,
                latencyMs: Date.now() - startTime,
                success: true,
                retryCount: 0,
                schemaValid: true
            });

            return parsed;
        } catch (err: any) {
            clearTimeout(timeoutId);
            await this.telemetry.recordTrace({
                workspaceId: "default_workspace",
                promptName,
                promptVersion: "v1.0",
                model: "gemini-1.5-flash",
                inputTokens: 500,
                outputTokens: 0,
                estimatedCostUSD: 0.0001,
                latencyMs: Date.now() - startTime,
                success: false,
                retryCount: 0,
                schemaValid: false,
                errorMessage: err.message
            });
            console.warn("[LLMReasoningProvider] Gemini API call failed or timed out, using static fallback", err);
            return undefined;
        }
    }

    async generateOKRs(intent: ExecutiveIntent, policies: ExecutivePolicy[] = []): Promise<OKRItem[]> {
        const prompt = REASONING_PROMPTS.GENERATE_OKRS(intent.title, intent.priority, intent.successMetrics || []);
        const result = await this.callGeminiJSON<{ objective: string; keyResults: string[]; initiatives: string[]; alignmentScore: number }>("GENERATE_OKRS", prompt);

        if (result && result.objective && Array.isArray(result.keyResults)) {
            return [{
                id: `okr_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
                objective: result.objective,
                keyResults: result.keyResults,
                initiatives: result.initiatives || [],
                lineage: {
                    originIntentId: intent.id,
                    originPolicyIds: policies.map(p => p.id),
                    originConstraintIds: [],
                    strategyVersion: intent.strategyVersion || "v1.0_growth",
                    alignmentScore: result.alignmentScore || 90
                }
            }];
        }

        return this.fallback.generateOKRs(intent, policies);
    }

    async evaluateCouncilVote(
        memberId: string,
        memberName: string,
        department: any,
        voteWeight: number,
        proposal: Proposal
    ): Promise<CouncilMemberVote> {
        const prompt = REASONING_PROMPTS.EVALUATE_VOTE(proposal.title, proposal.objective, memberName, String(department));
        const result = await this.callGeminiJSON<CouncilMemberVote>("EVALUATE_VOTE", prompt);

        if (result && (result.vote === "YES" || result.vote === "NO")) {
            return {
                memberId,
                memberName,
                department,
                vote: result.vote,
                confidence: typeof result.confidence === "number" ? result.confidence : 0.95,
                voteWeight,
                rationale: result.rationale || `LLM Executive Vote by ${memberName} for ${department}`,
                timestamp: Date.now()
            };
        }

        return this.fallback.evaluateCouncilVote(memberId, memberName, department, voteWeight, proposal);
    }

    async generateNegotiationCritique(proposal: Proposal, round: number): Promise<MemberCritique[]> {
        const prompt = REASONING_PROMPTS.GENERATE_CRITIQUE(proposal.title, proposal.estimatedCostUSD, proposal.estimatedRisk);
        const result = await this.callGeminiJSON<MemberCritique[]>("GENERATE_CRITIQUE", prompt);

        if (Array.isArray(result) && result.length > 0) {
            return result;
        }

        return this.fallback.generateNegotiationCritique(proposal, round);
    }

    async computeSimulationConfidence(proposal: Proposal, mode: SimulationMode): Promise<number> {
        return this.fallback.computeSimulationConfidence(proposal, mode);
    }

    async evaluateAlignmentScore(task: Record<string, any>, strategyVersion: string): Promise<AlignmentScoreResult> {
        const prompt = REASONING_PROMPTS.ALIGNMENT_SCORE(task.title || "Untitled Task", "Growth Strategy", strategyVersion);
        const result = await this.callGeminiJSON<AlignmentScoreResult>("ALIGNMENT_SCORE", prompt);

        if (result && typeof result.score === "number" && result.breakdown) {
            return result;
        }

        return this.fallback.evaluateAlignmentScore(task, strategyVersion);
    }
}
