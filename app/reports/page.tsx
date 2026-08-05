"use client";

import React, { useState } from "react";
import Sidebar from "@/components/executive/Sidebar";
import Header from "@/components/executive/Header";
import UniversalSearch from "@/components/executive/UniversalSearch";
import ExecutiveCard from "@/components/executive/ExecutiveCard";
import SimulationModal from "@/components/executive/SimulationModal";
import { BarChart3, TrendingUp, FolderKanban, GitBranch, Users, Scale, Sparkles, CheckCircle2, Play } from "lucide-react";

export default function ReportsPage() {
    const [searchOpen, setSearchOpen] = useState(false);
    const [simOpen, setSimOpen] = useState(false);

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
                                <BarChart3 className="w-7 h-7 text-blue-400" /> Executive Analytics & Strategic Reports
                            </h1>
                            <p className="text-xs md:text-sm text-slate-400 mt-1">
                                High-level executive reporting on recommendation accuracy, founder feedback trends, and strategic simulation modeling.
                            </p>
                        </div>

                        <button
                            onClick={() => setSimOpen(true)}
                            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white text-xs font-bold shadow-lg shadow-blue-500/20 transition-all shrink-0"
                        >
                            <Play className="w-4 h-4" /> Run Strategic Simulation
                        </button>
                    </div>

                    {/* Analytics Metric Cards Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        <ExecutiveCard>
                            <div className="flex items-center justify-between">
                                <span className="text-xs font-semibold text-slate-400">Business Health</span>
                                <TrendingUp className="w-4 h-4 text-emerald-400" />
                            </div>
                            <div className="text-2xl font-bold text-slate-100 mt-2">78 / 100</div>
                            <p className="text-xs text-emerald-400 mt-1">+4% from last week</p>
                        </ExecutiveCard>

                        <ExecutiveCard>
                            <div className="flex items-center justify-between">
                                <span className="text-xs font-semibold text-slate-400">Recommendation Acceptance</span>
                                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                            </div>
                            <div className="text-2xl font-bold text-slate-100 mt-2">92%</div>
                            <p className="text-xs text-slate-400 mt-1">Founder agreement rating</p>
                        </ExecutiveCard>

                        <ExecutiveCard>
                            <div className="flex items-center justify-between">
                                <span className="text-xs font-semibold text-slate-400">Project Velocity</span>
                                <FolderKanban className="w-4 h-4 text-blue-400" />
                            </div>
                            <div className="text-2xl font-bold text-slate-100 mt-2">82%</div>
                            <p className="text-xs text-slate-400 mt-1">Milestones completed on schedule</p>
                        </ExecutiveCard>

                        <ExecutiveCard>
                            <div className="flex items-center justify-between">
                                <span className="text-xs font-semibold text-slate-400">Stakeholder Reach</span>
                                <Users className="w-4 h-4 text-purple-400" />
                            </div>
                            <div className="text-2xl font-bold text-slate-100 mt-2">12 Active</div>
                            <p className="text-xs text-slate-400 mt-1">Investors, Clients & Partners</p>
                        </ExecutiveCard>
                    </div>

                    {/* Detailed Visual Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <ExecutiveCard title="Business Health Score Trend" subtitle="Weekly composite health score trajectory">
                            <div className="h-48 flex items-end justify-between gap-2 pt-6 px-4">
                                {[62, 65, 70, 74, 78].map((score, idx) => (
                                    <div key={idx} className="flex-1 flex flex-col items-center gap-2">
                                        <span className="text-xs font-bold text-blue-400">{score}</span>
                                        <div
                                            className="w-full bg-blue-600/30 border border-blue-500/50 rounded-t-lg transition-all"
                                            style={{ height: `${score * 1.5}px` }}
                                        />
                                        <span className="text-[10px] text-slate-500 font-mono">Wk {idx + 1}</span>
                                    </div>
                                ))}
                            </div>
                        </ExecutiveCard>

                        <ExecutiveCard title="Recommendation Accuracy & Learning" subtitle="Founder feedback distribution">
                            <div className="space-y-4 pt-2">
                                <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 text-xs flex justify-between items-center">
                                    <div>
                                        <div className="font-semibold text-slate-200">Helpful / Accepted Ratio</div>
                                        <div className="text-slate-400">92% of recommendations marked helpful</div>
                                    </div>
                                    <span className="text-emerald-400 font-bold">92%</span>
                                </div>
                                <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 text-xs flex justify-between items-center">
                                    <div>
                                        <div className="font-semibold text-slate-200">Average Confidence Score</div>
                                        <div className="text-slate-400">88% average evidence confidence rating</div>
                                    </div>
                                    <span className="text-blue-400 font-bold">High</span>
                                </div>
                            </div>
                        </ExecutiveCard>
                    </div>
                </main>
            </div>

            <UniversalSearch isOpen={searchOpen} onClose={() => setSearchOpen(false)} />
            <SimulationModal isOpen={simOpen} onClose={() => setSimOpen(false)} />
        </div>
    );
}
