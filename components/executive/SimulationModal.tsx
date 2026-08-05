"use client";

import React, { useState } from "react";
import { Scale, X, Play, ArrowRight, CheckCircle2, TrendingUp, AlertTriangle } from "lucide-react";
import type { ScenarioType } from "@/lib/intelligence/simulationEngine";

interface SimulationModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export default function SimulationModal({ isOpen, onClose }: SimulationModalProps) {
    const [scenarioType, setScenarioType] = useState<ScenarioType>("delay_launch");
    const [weeks, setWeeks] = useState(2);
    const [role, setRole] = useState("Senior Designer");
    const [loading, setLoading] = useState(false);
    const [simulationResult, setSimulationResult] = useState<any>(null);

    if (!isOpen) return null;

    async function runSimulation() {
        setLoading(true);
        try {
            const params = scenarioType === "delay_launch" ? { weeks } : scenarioType === "hire_role" ? { role } : {};
            const res = await fetch("/api/intelligence/simulate", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ scenarioType, params }),
            });
            const data = await res.json();
            if (data.success && data.simulation) {
                setSimulationResult(data.simulation);
            }
        } catch (err) {
            console.error("Simulation failed:", err);
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-[#131B2E] border border-[#1E293B] rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[85vh] animate-in fade-in zoom-in-95 duration-150">
                {/* Header */}
                <div className="p-4 border-b border-[#1E293B] flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <Scale className="w-5 h-5 text-blue-400" />
                        <h3 className="text-base font-bold text-slate-100">Strategic Decision Simulator (&quot;What If?&quot;)</h3>
                    </div>
                    <button onClick={onClose} className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Body */}
                <div className="p-5 flex-1 overflow-y-auto space-y-6">
                    {/* Scenario Select */}
                    <div className="space-y-3">
                        <label className="text-xs font-bold uppercase tracking-wider text-slate-400">
                            Select Strategic Scenario to Model
                        </label>
                        <select
                            value={scenarioType}
                            onChange={(e) => setScenarioType(e.target.value as ScenarioType)}
                            className="w-full bg-[#0F172A] border border-[#334155] rounded-xl px-3.5 py-2.5 text-sm text-slate-100 focus:outline-none focus:border-blue-500"
                        >
                            <option value="delay_launch">What happens if I delay launch date?</option>
                            <option value="hire_role">What if I hire a new team member?</option>
                            <option value="pause_project">What if I pause a secondary project?</option>
                            <option value="reschedule_meeting">What if I reschedule an investor meeting?</option>
                            <option value="increase_marketing">What if I increase marketing spend?</option>
                        </select>
                    </div>

                    {/* Parameters Input */}
                    {scenarioType === "delay_launch" && (
                        <div className="space-y-2">
                            <label className="text-xs font-semibold text-slate-300">Delay Period (Weeks)</label>
                            <input
                                type="number"
                                min={1}
                                max={8}
                                value={weeks}
                                onChange={(e) => setWeeks(parseInt(e.target.value, 10) || 1)}
                                className="w-full bg-[#0F172A] border border-[#334155] rounded-xl px-3.5 py-2 text-sm text-slate-100"
                            />
                        </div>
                    )}

                    {scenarioType === "hire_role" && (
                        <div className="space-y-2">
                            <label className="text-xs font-semibold text-slate-300">Role Title</label>
                            <input
                                type="text"
                                value={role}
                                onChange={(e) => setRole(e.target.value)}
                                className="w-full bg-[#0F172A] border border-[#334155] rounded-xl px-3.5 py-2 text-sm text-slate-100"
                            />
                        </div>
                    )}

                    <button
                        onClick={runSimulation}
                        disabled={loading}
                        className="w-full py-3 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white text-xs font-bold shadow-lg shadow-blue-500/20 transition-all flex items-center justify-center gap-2"
                    >
                        <Play className="w-4 h-4" /> Run Strategic Simulation
                    </button>

                    {/* Simulation Output */}
                    {loading ? (
                        <div className="py-8 text-center text-slate-400 text-sm animate-pulse">
                            Modeling operational dependencies & financial burn impact...
                        </div>
                    ) : simulationResult ? (
                        <div className="space-y-4 pt-2 border-t border-[#1E293B]">
                            {/* Health Impact Badge */}
                            <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 flex items-center justify-between">
                                <div>
                                    <div className="text-xs font-bold text-slate-400 uppercase">Projected Business Health</div>
                                    <div className="text-xl font-bold text-slate-100 mt-0.5">
                                        {simulationResult.projectedHealthScore} / 100
                                    </div>
                                </div>
                                <span
                                    className={`text-sm font-bold flex items-center gap-1 ${
                                        simulationResult.healthScoreShift >= 0 ? "text-emerald-400" : "text-rose-400"
                                    }`}
                                >
                                    {simulationResult.healthScoreShift >= 0 ? `+${simulationResult.healthScoreShift}` : simulationResult.healthScoreShift} pts
                                </span>
                            </div>

                            {/* Summary */}
                            <p className="text-xs text-slate-300 leading-relaxed font-medium">{simulationResult.summary}</p>

                            {/* Financial Impact */}
                            <div className="p-3.5 rounded-xl bg-blue-950/20 border border-blue-500/30 text-xs">
                                <div className="font-bold text-blue-400">Financial Burn & Revenue Impact</div>
                                <div className="text-slate-200 mt-1">{simulationResult.financialImpact}</div>
                            </div>

                            {/* Affected Projects & Stakeholders */}
                            <div className="grid grid-cols-2 gap-3 text-xs">
                                <div className="p-3 rounded-xl bg-slate-900/40 border border-slate-800">
                                    <div className="font-semibold text-slate-400 uppercase text-[10px]">Affected Projects</div>
                                    <div className="text-slate-200 font-medium mt-1">{simulationResult.affectedProjects.join(", ") || "None"}</div>
                                </div>
                                <div className="p-3 rounded-xl bg-slate-900/40 border border-slate-800">
                                    <div className="font-semibold text-slate-400 uppercase text-[10px]">Affected Relationships</div>
                                    <div className="text-slate-200 font-medium mt-1">{simulationResult.affectedRelationships.join(", ") || "None"}</div>
                                </div>
                            </div>
                        </div>
                    ) : null}
                </div>
            </div>
        </div>
    );
}
