"use client";

import React, { useState, useEffect } from "react";
import Sidebar from "@/components/executive/Sidebar";
import Header from "@/components/executive/Header";
import UniversalSearch from "@/components/executive/UniversalSearch";
import ExecutiveCard from "@/components/executive/ExecutiveCard";
import StatusBadge from "@/components/executive/StatusBadge";
import HealthScoreRing from "@/components/executive/HealthScoreRing";
import LoadingCard from "@/components/executive/LoadingCard";
import { FileText, AlertTriangle, Sparkles, TrendingUp, ArrowRight, Download } from "lucide-react";
import Link from "next/link";

export default function BriefingPage() {
    const [searchOpen, setSearchOpen] = useState(false);
    const [briefing, setBriefing] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function loadBriefing() {
            try {
                const res = await fetch("/api/briefing");
                const data = await res.json();
                if (data.success && data.briefing) {
                    setBriefing(data.briefing);
                }
            } catch (err) {
                console.error("Failed to load Daily Briefing:", err);
            } finally {
                setLoading(false);
            }
        }
        loadBriefing();
    }, []);

    return (
        <div className="min-h-screen bg-[#0B0F17] text-slate-100 flex flex-col md:flex-row antialiased font-sans">
            <Sidebar />

            <div className="flex-1 flex flex-col min-w-0">
                <Header onOpenSearch={() => setSearchOpen(true)} />

                <main className="flex-1 p-4 md:p-8 space-y-6 max-w-7xl w-full mx-auto">
                    {/* Header */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div>
                            <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-slate-100 flex items-center gap-2.5">
                                <FileText className="w-7 h-7 text-blue-400" /> Executive Daily Briefing
                            </h1>
                            <p className="text-xs md:text-sm text-slate-400 mt-1">
                                Event-driven morning intelligence report analyzing priorities, risks, and strategic recommendations.
                            </p>
                        </div>

                        <button
                            onClick={() => alert("Export PDF feature queued for future release.")}
                            className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs font-semibold text-slate-300 hover:text-white transition-all shrink-0"
                        >
                            <Download className="w-4 h-4 text-blue-400" /> Export PDF
                        </button>
                    </div>

                    {loading ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <LoadingCard className="h-64" />
                            <LoadingCard className="h-64" />
                        </div>
                    ) : (
                        <div className="space-y-6">
                            {/* Top Summary Card */}
                            <ExecutiveCard title="Executive Operating Summary" subtitle={`Generated for ${briefing?.date || "Today"}`}>
                                <div className="flex flex-col md:flex-row items-center gap-6 pt-2">
                                    <HealthScoreRing score={briefing?.businessHealth?.score || 78} label="Score" size={110} />
                                    <div className="flex-1 space-y-2 text-sm text-slate-300 leading-relaxed">
                                        <p>
                                            {briefing?.summary ||
                                                "Your business is operating at a Healthy status (78/100). Focus areas for today include closing 2 overdue invoices and sending the Q3 investor update to Sarah Jenkins."}
                                        </p>
                                        <div className="flex items-center gap-2 pt-2">
                                            <StatusBadge label={briefing?.businessHealth?.status || "Healthy"} variant="healthy" />
                                            <span className="text-xs font-semibold text-emerald-400 flex items-center gap-0.5">
                                                <TrendingUp className="w-3.5 h-3.5" /> +4% Trend
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </ExecutiveCard>

                            {/* 2-Column Risks & Opportunities */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {/* Operational Risks */}
                                <ExecutiveCard title="Detected Operating Risks" subtitle="Urgent threats requiring founder attention">
                                    <div className="space-y-3 mt-2">
                                        {briefing?.risks?.map((r: any) => (
                                            <div key={r.id} className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 text-xs space-y-1">
                                                <div className="flex items-center justify-between">
                                                    <span className="font-semibold text-slate-200">{r.title}</span>
                                                    <StatusBadge label={r.severity} variant={r.severity === "critical" ? "danger" : "warning"} />
                                                </div>
                                                <p className="text-slate-400">{r.impact}</p>
                                                {r.mitigation && <p className="text-blue-400 text-[11px]">Mitigation: {r.mitigation}</p>}
                                            </div>
                                        ))}
                                    </div>
                                </ExecutiveCard>

                                {/* Strategic Opportunities */}
                                <ExecutiveCard title="Growth & Focus Opportunities" subtitle="Leverage momentum and deep work windows">
                                    <div className="space-y-3 mt-2">
                                        {briefing?.opportunities?.map((o: any) => (
                                            <div key={o.id} className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 text-xs space-y-1">
                                                <div className="font-semibold text-slate-200 flex items-center gap-1.5">
                                                    <Sparkles className="w-3.5 h-3.5 text-purple-400" /> {o.title}
                                                </div>
                                                <p className="text-slate-400">{o.description}</p>
                                            </div>
                                        ))}
                                    </div>
                                </ExecutiveCard>
                            </div>
                        </div>
                    )}
                </main>
            </div>

            <UniversalSearch isOpen={searchOpen} onClose={() => setSearchOpen(false)} />
        </div>
    );
}
