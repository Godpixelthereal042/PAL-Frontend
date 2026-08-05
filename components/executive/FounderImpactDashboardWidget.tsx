"use client";

import React, { useState } from "react";

export function FounderImpactDashboardWidget() {
    const [briefingOpen, setBriefingOpen] = useState(false);

    return (
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h3 className="text-xl font-bold text-slate-100 flex items-center gap-2">
                        <span>🚀</span> Founder Business Impact & ROI Dashboard
                    </h3>
                    <p className="text-xs text-slate-400 mt-0.5">
                        Measured operational time saved, cost reductions, and growth opportunities delivered by PAL.
                    </p>
                </div>
                <button
                    onClick={() => setBriefingOpen(!briefingOpen)}
                    className="px-3.5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-xl transition-all shadow-md shadow-indigo-600/20"
                >
                    {briefingOpen ? "Hide Monday Brief ✕" : "Run Monday Executive Brief ⚡"}
                </button>
            </div>

            {/* Impact Metric Grid */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="p-4 bg-slate-950/70 border border-slate-800 rounded-xl space-y-1">
                    <p className="text-xs text-slate-400">Monthly Time Saved</p>
                    <h4 className="text-2xl font-bold text-emerald-400 font-mono">18 Hours</h4>
                    <p className="text-[11px] text-slate-500">65% faster weekly review prep</p>
                </div>
                <div className="p-4 bg-slate-950/70 border border-slate-800 rounded-xl space-y-1">
                    <p className="text-xs text-slate-400">Decisions Automated</p>
                    <h4 className="text-2xl font-bold text-slate-100 font-mono">14 Actions</h4>
                    <p className="text-[11px] text-slate-500">Dry-run safety certified</p>
                </div>
                <div className="p-4 bg-slate-950/70 border border-slate-800 rounded-xl space-y-1">
                    <p className="text-xs text-slate-400">MRR Growth Unlocked</p>
                    <h4 className="text-2xl font-bold text-indigo-400 font-mono">+$14,500</h4>
                    <p className="text-[11px] text-slate-500">Trial churn re-engagement</p>
                </div>
                <div className="p-4 bg-slate-950/70 border border-slate-800 rounded-xl space-y-1">
                    <p className="text-xs text-slate-400">Monthly Cost Optimization</p>
                    <h4 className="text-2xl font-bold text-amber-400 font-mono">+$3,200</h4>
                    <p className="text-[11px] text-slate-500">14 SaaS expense audits</p>
                </div>
            </div>

            {/* Monday Executive Briefing Modal View */}
            {briefingOpen && (
                <div className="p-5 bg-slate-950/90 border border-indigo-500/30 rounded-xl space-y-4">
                    <div className="flex items-center justify-between">
                        <h4 className="text-sm font-bold text-indigo-300 font-mono flex items-center gap-2">
                            <span>📅</span> Monday Morning Executive Meeting Brief
                        </h4>
                        <span className="text-[11px] text-slate-400 font-mono">Health Score: 92/100</span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                        <div className="p-3 bg-slate-900 border border-slate-800 rounded-lg space-y-1">
                            <span className="font-bold text-slate-200">👑 CEO Strategy Overview</span>
                            <p className="text-slate-400">Trial churn risk concentrated in inactive cohort (&gt;45 days). Q3 expansion target set for +20% MRR.</p>
                        </div>
                        <div className="p-3 bg-slate-900 border border-slate-800 rounded-lg space-y-1">
                            <span className="font-bold text-slate-200">💳 CFO Financial Health</span>
                            <p className="text-slate-400">MRR: $24,500 (+18.4% MoM). Monthly Expenses: $12,100. Cash Runway: 18 months.</p>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
