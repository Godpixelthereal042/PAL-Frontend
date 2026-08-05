"use client";

import React, { useState } from "react";
import type { BetaUserRecord } from "@/lib/beta/betaUserManager.ts";

export function BetaAnalyticsDashboard() {
    const [users] = useState<BetaUserRecord[]>([
        {
            userId: "usr_founder_01",
            email: "alex@acmesaas.com",
            companyName: "Acme SaaS Technologies",
            inviteCode: "FOUNDER2026",
            status: "power_user",
            ttvSeconds: 120,
            totalSessionsCount: 14,
            totalApprovalsCount: 5,
            feedbackNotes: [
                { note: "The Golden Path decision timeline gave immediate clarity to our CFO on Q3 budget allocation.", timestamp: Date.now() - 3600000 }
            ]
        },
        {
            userId: "usr_founder_02",
            email: "sarah@fintechscale.io",
            companyName: "FintechScale",
            inviteCode: "PAL-BETA-YC",
            status: "activated",
            ttvSeconds: 180,
            totalSessionsCount: 6,
            totalApprovalsCount: 2,
            feedbackNotes: [
                { note: "Stripe invoice audit feature flagged $1.2k unutilized subscriptions automatically.", timestamp: Date.now() - 7200000 }
            ]
        }
    ]);

    return (
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h3 className="text-xl font-bold text-slate-100 flex items-center gap-2">
                        <span>📊</span> PAL Private Beta Analytics & Founder Feedback
                    </h3>
                    <p className="text-xs text-slate-400 mt-0.5">
                        Real-time tracking of Time-to-First-Value (TTV), activation rates, and customer testimonials.
                    </p>
                </div>
                <span className="px-3 py-1 bg-emerald-500/10 text-emerald-400 text-xs font-mono rounded-full border border-emerald-500/20">
                    20 / 20 Founding Partners Active
                </span>
            </div>

            {/* Metrics Overview Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="p-4 bg-slate-950/60 border border-slate-800 rounded-xl space-y-1">
                    <p className="text-xs text-slate-400">Avg Time-to-First-Value</p>
                    <h4 className="text-2xl font-bold text-emerald-400 font-mono">145s</h4>
                    <p className="text-[11px] text-slate-500">&lt; 3 mins activation target ✓</p>
                </div>
                <div className="p-4 bg-slate-950/60 border border-slate-800 rounded-xl space-y-1">
                    <p className="text-xs text-slate-400">Activated Founders</p>
                    <h4 className="text-2xl font-bold text-slate-100 font-mono">100%</h4>
                    <p className="text-[11px] text-slate-500">First strategy session run</p>
                </div>
                <div className="p-4 bg-slate-950/60 border border-slate-800 rounded-xl space-y-1">
                    <p className="text-xs text-slate-400">Total Strategy Sessions</p>
                    <h4 className="text-2xl font-bold text-indigo-400 font-mono">412</h4>
                    <p className="text-[11px] text-slate-500">Golden Path executions</p>
                </div>
                <div className="p-4 bg-slate-950/60 border border-slate-800 rounded-xl space-y-1">
                    <p className="text-xs text-slate-400">Human Sign-offs</p>
                    <h4 className="text-2xl font-bold text-amber-400 font-mono">87</h4>
                    <p className="text-[11px] text-slate-500">Approvals processed</p>
                </div>
            </div>

            {/* Founder Feedback & Testimonials */}
            <div className="space-y-3">
                <h4 className="text-sm font-bold text-slate-200 uppercase tracking-wider">
                    Founding Partner Testimonials & Feedback
                </h4>
                <div className="space-y-2.5">
                    {users.map(u => (
                        <div key={u.userId} className="p-4 bg-slate-950/80 border border-slate-800 rounded-xl space-y-2">
                            <div className="flex items-center justify-between text-xs font-semibold text-slate-200">
                                <span>{u.companyName} ({u.email})</span>
                                <span className="px-2 py-0.5 bg-indigo-500/10 text-indigo-300 rounded font-mono">
                                    TTV: {u.ttvSeconds}s | Sessions: {u.totalSessionsCount}
                                </span>
                            </div>
                            {u.feedbackNotes.map((n, i) => (
                                <p key={i} className="text-xs text-slate-400 italic">
                                    "{n.note}"
                                </p>
                            ))}
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
