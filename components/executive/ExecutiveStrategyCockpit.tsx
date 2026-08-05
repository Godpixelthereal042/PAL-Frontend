"use client";

/**
 * Executive Strategy Cockpit Dashboard Component (PAL-TDD-005, PAL-ARCH-DOC-037)
 */

import React, { useState } from "react";
import type { CockpitState } from "../../lib/strategy/ui/strategyCockpitStore";

interface ExecutiveStrategyCockpitProps {
    initialState: CockpitState;
    onRunSimulation?: (mode: string) => void;
    onResolveApproval?: (requestId: string, approved: boolean) => void;
}

export function ExecutiveStrategyCockpit({ initialState, onRunSimulation, onResolveApproval }: ExecutiveStrategyCockpitProps) {
    const [state, setState] = useState<CockpitState>(initialState);
    const [selectedMode, setSelectedMode] = useState<string>("monte_carlo");

    return (
        <div className="p-6 bg-slate-900 text-slate-100 min-h-screen font-sans space-y-6">
            {/* Header / Strategy Banner */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center bg-slate-800 p-6 rounded-xl border border-slate-700 shadow-lg">
                <div>
                    <h1 className="text-2xl font-bold text-emerald-400 tracking-tight">PAL Executive Strategy Cockpit</h1>
                    <p className="text-sm text-slate-400 mt-1">
                        Active Strategy Version: <span className="text-white font-mono bg-slate-700 px-2 py-0.5 rounded">{state.strategyVersion}</span>
                    </p>
                </div>
                <div className="mt-4 md:mt-0 flex items-center gap-3">
                    <span className="text-xs uppercase tracking-wider text-slate-400 font-semibold">North Star Intent:</span>
                    <span className="text-sm font-semibold bg-emerald-950 text-emerald-300 border border-emerald-700 px-3 py-1 rounded-full">
                        {state.activeIntentTitle}
                    </span>
                </div>
            </div>

            {/* 5 Executive Steering Panels Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

                {/* Panel 1: Where Are We Going? (Intent & OKRs) */}
                <div className="bg-slate-800 p-5 rounded-xl border border-slate-700 shadow space-y-4">
                    <h2 className="text-lg font-semibold text-sky-400 flex items-center gap-2">
                        🎯 1. Where Are We Going? (OKRs & Directives)
                    </h2>
                    <div className="space-y-3">
                        {state.okrs.length === 0 ? (
                            <div className="p-4 bg-slate-900/50 rounded-lg text-sm text-slate-400 border border-slate-800">
                                OKRs compiled for {state.strategyVersion}. Objectives active: MRR Scale & 100% SOP Compliance.
                            </div>
                        ) : (
                            state.okrs.map((okr) => (
                                <div key={okr.id} className="p-4 bg-slate-900/70 rounded-lg border border-slate-700 space-y-2">
                                    <div className="text-sm font-medium text-slate-200">{okr.objective}</div>
                                    <div className="text-xs text-slate-400 space-y-1">
                                        {okr.keyResults.map((kr, idx) => (
                                            <div key={idx} className="flex items-center gap-2">
                                                <span className="text-emerald-400">✓</span> {kr}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>

                {/* Panel 2: Are We Healthy? (KPI Trends & Cash Runway) */}
                <div className="bg-slate-800 p-5 rounded-xl border border-slate-700 shadow space-y-4">
                    <h2 className="text-lg font-semibold text-emerald-400 flex items-center gap-2">
                        📊 2. Are We Healthy? (KPI Metrics & Runway)
                    </h2>
                    <div className="grid grid-cols-2 gap-3">
                        {state.kpis.map((kpi) => (
                            <div key={kpi.key} className="p-3 bg-slate-900/80 rounded-lg border border-slate-700/60">
                                <div className="text-xs font-semibold text-slate-400">{kpi.name}</div>
                                <div className="text-lg font-bold text-white mt-1">
                                    {kpi.unit === "USD" ? `$${kpi.value.toLocaleString()}` : `${kpi.value} ${kpi.unit}`}
                                </div>
                                {kpi.targetValue && (
                                    <div className="text-[10px] text-slate-400 mt-1">
                                        Target: {kpi.unit === "USD" ? `$${kpi.targetValue.toLocaleString()}` : kpi.targetValue}
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>

                {/* Panel 3: What Needs Approval? (Human Approval Matrix Queue) */}
                <div className="bg-slate-800 p-5 rounded-xl border border-slate-700 shadow space-y-4">
                    <h2 className="text-lg font-semibold text-amber-400 flex items-center gap-2">
                        ⚡ 3. What Needs Approval? (Policy Matrix)
                    </h2>
                    {state.pendingApprovals.length === 0 ? (
                        <div className="p-4 bg-slate-900/50 rounded-lg text-sm text-slate-400 border border-slate-800">
                            No pending policy approval requests. All worker actions within automated policy caps.
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {state.pendingApprovals.map((req) => (
                                <div key={req.requestId} className="p-3 bg-slate-900 rounded-lg border border-amber-900/50 flex justify-between items-center">
                                    <div>
                                        <div className="text-sm font-semibold text-amber-300">{req.actionName}</div>
                                        <div className="text-xs text-slate-400 mt-0.5">{req.justification}</div>
                                        <div className="text-[10px] text-slate-500 mt-1">Role Required: <span className="text-amber-400 font-semibold">{req.requiredRole}</span></div>
                                    </div>
                                    <div className="flex gap-2">
                                        <button
                                            onClick={() => onResolveApproval?.(req.requestId, true)}
                                            className="px-3 py-1 bg-emerald-600 hover:bg-emerald-500 text-xs font-bold rounded text-white"
                                        >
                                            Approve
                                        </button>
                                        <button
                                            onClick={() => onResolveApproval?.(req.requestId, false)}
                                            className="px-3 py-1 bg-rose-700 hover:bg-rose-600 text-xs font-bold rounded text-white"
                                        >
                                            Reject
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Panel 4: What Have We Learned? (Decision Ledger & Outcome Flywheel) */}
                <div className="bg-slate-800 p-5 rounded-xl border border-slate-700 shadow space-y-4">
                    <h2 className="text-lg font-semibold text-purple-400 flex items-center gap-2">
                        🧠 4. What Have We Learned? (Outcome Flywheel)
                    </h2>
                    {state.recentLearningUpdates.length === 0 ? (
                        <div className="p-4 bg-slate-900/50 rounded-lg text-sm text-slate-400 border border-slate-800">
                            Closed-loop outcome feedback active. Ledger records updated upon decision outcome observation.
                        </div>
                    ) : (
                        <div className="space-y-2">
                            {state.recentLearningUpdates.map((update, idx) => (
                                <div key={idx} className="p-3 bg-slate-900 rounded-lg border border-purple-900/40 text-xs space-y-1">
                                    <div className="font-semibold text-purple-300">Decision ID: {update.decisionId}</div>
                                    <div className="text-slate-300">Confidence Adjustment: <span className="font-mono text-emerald-400">{update.confidenceAdjustment > 0 ? `+${update.confidenceAdjustment}` : update.confidenceAdjustment}</span></div>
                                    {update.policyRecommendation && <div className="text-amber-300 font-medium">{update.policyRecommendation}</div>}
                                </div>
                            ))}
                        </div>
                    )}
                </div>

            </div>

            {/* Panel 5: What Happens If...? (Interactive Simulation Launcher) */}
            <div className="bg-slate-800 p-6 rounded-xl border border-slate-700 shadow space-y-4">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                    <h2 className="text-lg font-semibold text-indigo-400 flex items-center gap-2">
                        🔮 5. What Happens If...? (Multi-Mode Scenario Simulation Launcher)
                    </h2>
                    <div className="flex items-center gap-3">
                        <select
                            value={selectedMode}
                            onChange={(e) => setSelectedMode(e.target.value)}
                            className="bg-slate-900 border border-slate-700 text-xs font-semibold text-slate-200 px-3 py-1.5 rounded-lg"
                        >
                            <option value="monte_carlo">Monte Carlo Distribution (1,000 runs)</option>
                            <option value="sensitivity_analysis">Sensitivity Analysis (-20% Revenue)</option>
                            <option value="worst_case">Worst Case (-30% Revenue)</option>
                            <option value="stress_test">Stress Test Liquidity Shock (-40%)</option>
                            <option value="best_case">Best Case (+30% Revenue)</option>
                        </select>
                        <button
                            onClick={() => onRunSimulation?.(selectedMode)}
                            className="px-4 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-xs font-bold rounded-lg text-white shadow"
                        >
                            Launch Simulation
                        </button>
                    </div>
                </div>

                {state.recentSimulations.length > 0 && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                        {state.recentSimulations.map((sim) => (
                            <div key={sim.simulationId} className="p-4 bg-slate-900 rounded-xl border border-indigo-950 space-y-2">
                                <div className="flex justify-between items-center">
                                    <span className="text-xs font-mono text-indigo-300">Mode: {sim.mode}</span>
                                    <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded ${sim.recommendation === "proceed" ? "bg-emerald-950 text-emerald-400 border border-emerald-700" : "bg-amber-950 text-amber-400 border border-amber-700"}`}>
                                        {sim.recommendation}
                                    </span>
                                </div>
                                <div className="text-xs text-slate-300">
                                    Composite Risk Score: <span className="font-bold text-white">{sim.riskBreakdown.compositeRiskScore}/100</span>
                                </div>
                                {sim.forecasts.map((f) => (
                                    <div key={f.metricKey} className="text-xs text-slate-400 bg-slate-950 p-2 rounded border border-slate-800">
                                        <div className="font-semibold text-slate-200">{f.metricName} Range (95% CI):</div>
                                        <div>Min: ${f.min.toLocaleString()} | Median: ${f.median.toLocaleString()} | Max: ${f.max.toLocaleString()}</div>
                                    </div>
                                ))}
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
