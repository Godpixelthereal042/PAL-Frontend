"use client";

import React from "react";
import type { GoldenPathExecutionResult } from "@/lib/workflows/goldenPathWorkflow.ts";

interface DecisionTimelineProps {
    result?: GoldenPathExecutionResult | null;
    isLoading?: boolean;
}

export function DecisionTimeline({ result, isLoading }: DecisionTimelineProps) {
    if (isLoading) {
        return (
            <div className="p-6 bg-slate-900/80 border border-slate-800 rounded-xl animate-pulse space-y-4">
                <div className="h-4 bg-slate-800 rounded w-1/3"></div>
                <div className="h-20 bg-slate-800/60 rounded"></div>
                <div className="h-20 bg-slate-800/60 rounded"></div>
            </div>
        );
    }

    if (!result) {
        return (
            <div className="p-8 text-center bg-slate-900/40 border border-slate-800/60 rounded-xl text-slate-400">
                <p className="text-sm">No active Golden Path execution. Submit an intent above or select a demo scenario.</p>
            </div>
        );
    }

    const steps = [
        {
            title: "1. Intent & OKR Strategy",
            status: "complete",
            detail: `Intent: "${result.intent.title}"`,
            badges: result.intent.okrs.map(o => o.objective)
        },
        {
            title: "2. Executive Council Debate & Voting",
            status: result.councilReview.approved ? "complete" : "warning",
            detail: `Consensus Score: ${Math.round(result.councilReview.consensusScore * 100)}% | Aggregate Confidence: ${Math.round(result.councilReview.aggregateConfidence * 100)}%`,
            votes: result.councilReview.votes
        },
        {
            title: "3. Strategic Scenario Simulation",
            status: "complete",
            detail: `Risk Score: ${result.simulation.score} | Risk Level: ${result.simulation.riskLevel.toUpperCase()} | Projected ROI: ${result.simulation.projectedROI}`
        },
        {
            title: "4. Governance & Approval Matrix",
            status: result.governance.requiresHumanApproval ? "requires_approval" : "complete",
            detail: result.governance.reason || (result.governance.requiresHumanApproval ? "Enqueued for human sign-off" : "Approved within policy limits")
        },
        {
            title: "5. Domain Worker & Connector Execution",
            status: "complete",
            outputs: result.workerOutputs
        },
        {
            title: "6. Decision Ledger SHA-256 Hash Chain",
            status: "complete",
            detail: `Record ID: ${result.decisionLedger.recordId}`,
            hash: result.decisionLedger.contentHash
        },
        {
            title: "7. Telemetry & Observability Accounting",
            status: "complete",
            detail: `Trace ID: ${result.telemetry.traceId} | Latency: ${result.telemetry.latencyMs}ms | Tokens: ${result.telemetry.totalTokens} | Cost: $${result.telemetry.estimatedCostUSD.toFixed(5)}`
        }
    ];

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-slate-100 flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
                    PAL Reasoning Timeline
                </h3>
                <span className={`px-2.5 py-1 rounded-full text-xs font-mono font-medium ${
                    result.status === "success" ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" :
                    result.status === "requires_approval" ? "bg-amber-500/10 text-amber-400 border border-amber-500/20" :
                    "bg-red-500/10 text-red-400 border border-red-500/20"
                }`}>
                    {result.status.toUpperCase()}
                </span>
            </div>

            <div className="relative border-l-2 border-slate-800 ml-4 space-y-6 pl-6 py-2">
                {steps.map((step, idx) => (
                    <div key={idx} className="relative group">
                        <div className="absolute -left-[31px] top-1.5 w-4 h-4 rounded-full bg-slate-900 border-2 border-indigo-500 flex items-center justify-center text-[10px] font-mono text-indigo-400">
                            {idx + 1}
                        </div>
                        <div className="bg-slate-900/60 border border-slate-800 hover:border-slate-700 transition-colors p-4 rounded-xl space-y-2">
                            <div className="flex items-center justify-between">
                                <h4 className="text-sm font-medium text-slate-200">{step.title}</h4>
                                {step.status === "complete" && <span className="text-xs text-emerald-400">Verified ✓</span>}
                                {step.status === "requires_approval" && <span className="text-xs text-amber-400 font-mono">Sign-off Required ⏳</span>}
                            </div>
                            
                            {step.detail && <p className="text-xs text-slate-400 font-mono">{step.detail}</p>}
                            
                            {step.badges && (
                                <div className="flex flex-wrap gap-1.5 pt-1">
                                    {step.badges.map((b, i) => (
                                        <span key={i} className="px-2 py-0.5 bg-indigo-500/10 text-indigo-300 text-[11px] rounded border border-indigo-500/20">
                                            {b}
                                        </span>
                                    ))}
                                </div>
                            )}

                            {step.votes && (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 pt-2">
                                    {step.votes.map((v, i) => (
                                        <div key={i} className="p-2 bg-slate-950/60 border border-slate-800/80 rounded text-xs">
                                            <div className="flex items-center justify-between text-slate-300">
                                                <span className="font-semibold">{v.memberId.toUpperCase()} ({v.department})</span>
                                                <span className={v.vote === "YES" ? "text-emerald-400 font-bold" : "text-amber-400 font-bold"}>{v.vote}</span>
                                            </div>
                                            <p className="text-[11px] text-slate-400 italic mt-0.5">"{v.rationale}"</p>
                                        </div>
                                    ))}
                                </div>
                            )}

                            {step.outputs && (
                                <div className="space-y-1.5 pt-1">
                                    {step.outputs.map((w, i) => (
                                        <div key={i} className="flex items-center justify-between text-xs bg-slate-950/40 p-2 rounded border border-slate-800/60">
                                            <span className="font-mono text-slate-300">Worker: {w.workerRole.toUpperCase()}</span>
                                            <span className="text-slate-400 font-mono">{w.dryRun ? "[DRY-RUN SAFE]" : "[LIVE MUTATED]"}</span>
                                        </div>
                                    ))}
                                </div>
                            )}

                            {step.hash && (
                                <div className="p-2 bg-slate-950 rounded border border-slate-800/80 text-[11px] font-mono text-slate-400 break-all">
                                    SHA-256: <span className="text-indigo-400">{step.hash}</span>
                                </div>
                            )}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
