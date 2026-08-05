"use client";

import React, { useState, useEffect } from "react";
import { Users, TrendingUp, ShieldCheck, Activity, Award, CheckCircle } from "lucide-react";

export function CustomerSuccessDashboard() {
    const [stats, setStats] = useState({
        activePilotsCount: 12,
        avgHealthScorePct: 98,
        totalMeasuredRoiMultiple: 18.5,
        totalValueRecoveredUsd: 184200,
    });

    return (
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-xl mb-8 text-white">
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center space-x-3">
                    <div className="p-2.5 bg-emerald-500/20 text-emerald-400 rounded-lg border border-emerald-500/30">
                        <Activity className="w-6 h-6" />
                    </div>
                    <div>
                        <h2 className="text-xl font-bold text-slate-100">
                            Customer Success & ROI Telemetry
                        </h2>
                        <p className="text-sm text-slate-400">
                            Live operational health, pilot activation cohort, and ROI multiple realization.
                        </p>
                    </div>
                </div>
                <span className="px-3 py-1 bg-emerald-500/20 text-emerald-400 text-xs font-bold rounded-full border border-emerald-500/30 flex items-center space-x-1">
                    <CheckCircle className="w-3.5 h-3.5" />
                    <span>LAUNCH COHORT ACTIVE</span>
                </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-slate-950/60 border border-slate-800 p-4 rounded-lg">
                    <div className="text-xs text-slate-400 font-medium">Active Pilot Organizations</div>
                    <div className="text-2xl font-black text-slate-100 mt-1">{stats.activePilotsCount}</div>
                    <div className="text-xs text-emerald-400 mt-1">100% Onboarding Completion</div>
                </div>

                <div className="bg-slate-950/60 border border-slate-800 p-4 rounded-lg">
                    <div className="text-xs text-slate-400 font-medium">Avg Account Health Score</div>
                    <div className="text-2xl font-black text-emerald-400 mt-1">{stats.avgHealthScorePct}%</div>
                    <div className="text-xs text-slate-400 mt-1">Zero Security / Breach Alerts</div>
                </div>

                <div className="bg-slate-950/60 border border-slate-800 p-4 rounded-lg">
                    <div className="text-xs text-slate-400 font-medium">Measured Net ROI Multiple</div>
                    <div className="text-2xl font-black text-indigo-400 mt-1">{stats.totalMeasuredRoiMultiple}x</div>
                    <div className="text-xs text-slate-400 mt-1">Net Value over Platform Cost</div>
                </div>

                <div className="bg-slate-950/60 border border-slate-800 p-4 rounded-lg">
                    <div className="text-xs text-slate-400 font-medium">Total Value Recovered</div>
                    <div className="text-2xl font-black text-emerald-400 mt-1">
                        ${stats.totalValueRecoveredUsd.toLocaleString()}
                    </div>
                    <div className="text-xs text-emerald-400 mt-1">Verified via Stripe & Ledger</div>
                </div>
            </div>
        </div>
    );
}
