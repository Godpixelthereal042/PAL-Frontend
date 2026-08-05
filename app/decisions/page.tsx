"use client";

import React, { useState, useEffect } from "react";
import Sidebar from "@/components/executive/Sidebar";
import Header from "@/components/executive/Header";
import UniversalSearch from "@/components/executive/UniversalSearch";
import ExecutiveCard from "@/components/executive/ExecutiveCard";
import StatusBadge from "@/components/executive/StatusBadge";
import { Scale, CheckCircle2, Archive, GitCommit, Plus } from "lucide-react";

export default function DecisionsPage() {
    const [searchOpen, setSearchOpen] = useState(false);
    const [decisions, setDecisions] = useState<any[]>([]);
    const [activeFilter, setActiveFilter] = useState<"all" | "active" | "pending_confirmation" | "archived">("all");
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function loadDecisions() {
            try {
                const res = await fetch("/api/decisions");
                const data = await res.json();
                if (data.success && data.decisions) {
                    setDecisions(data.decisions);
                }
            } catch (err) {
                console.error("Failed to load decision memory:", err);
            } finally {
                setLoading(false);
            }
        }
        loadDecisions();
    }, []);

    async function confirmDecision(id: string) {
        try {
            await fetch(`/api/decisions?id=${id}&action=confirm`, { method: "POST" });
            const res = await fetch("/api/decisions");
            const data = await res.json();
            if (data.success) setDecisions(data.decisions);
        } catch (err) {
            console.error("Failed to confirm decision:", err);
        }
    }

    const filtered =
        activeFilter === "all" ? decisions : decisions.filter((d) => d.status === activeFilter);

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
                                <Scale className="w-7 h-7 text-purple-400" /> Decision Memory System
                            </h1>
                            <p className="text-xs md:text-sm text-slate-400 mt-1">
                                Standalone strategic decision log maintaining confirmed choices, rationale, and supersede chains.
                            </p>
                        </div>
                    </div>

                    {/* Filter Tabs */}
                    <div className="flex items-center gap-2 border-b border-[#1E293B] pb-3 overflow-x-auto">
                        <button
                            onClick={() => setActiveFilter("all")}
                            className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
                                activeFilter === "all"
                                    ? "bg-purple-600/20 text-purple-400 border border-purple-500/30"
                                    : "text-slate-400 hover:text-slate-200"
                            }`}
                        >
                            All Decisions ({decisions.length})
                        </button>
                        <button
                            onClick={() => setActiveFilter("active")}
                            className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
                                activeFilter === "active"
                                    ? "bg-emerald-600/20 text-emerald-400 border border-emerald-500/30"
                                    : "text-slate-400 hover:text-slate-200"
                            }`}
                        >
                            Active Context ({decisions.filter((d) => d.status === "active").length})
                        </button>
                        <button
                            onClick={() => setActiveFilter("pending_confirmation")}
                            className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
                                activeFilter === "pending_confirmation"
                                    ? "bg-amber-600/20 text-amber-400 border border-amber-500/30"
                                    : "text-slate-400 hover:text-slate-200"
                            }`}
                        >
                            Pending Confirmation ({decisions.filter((d) => d.status === "pending_confirmation").length})
                        </button>
                    </div>

                    {/* Decision Log List */}
                    <div className="space-y-4">
                        {filtered.length === 0 ? (
                            <ExecutiveCard>
                                <div className="py-12 text-center text-slate-500 text-sm">
                                    No decisions found matching current filter.
                                </div>
                            </ExecutiveCard>
                        ) : (
                            filtered.map((d) => (
                                <ExecutiveCard key={d.id}>
                                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                                        <div className="space-y-1.5 flex-1 min-w-0">
                                            <div className="flex items-center gap-3">
                                                <h3 className="text-base font-semibold text-slate-100 truncate">
                                                    {d.title}
                                                </h3>
                                                <StatusBadge
                                                    label={d.status}
                                                    variant={d.status === "active" ? "healthy" : "warning"}
                                                />
                                            </div>
                                            {d.description && <p className="text-xs text-slate-400">{d.description}</p>}
                                            {d.rationale && (
                                                <p className="text-xs text-purple-400 font-medium pt-1">
                                                    Rationale: {d.rationale}
                                                </p>
                                            )}
                                        </div>

                                        {d.status === "pending_confirmation" && (
                                            <button
                                                onClick={() => confirmDecision(d.id)}
                                                className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold shadow-md transition-all shrink-0 flex items-center gap-1.5"
                                            >
                                                <CheckCircle2 className="w-4 h-4" /> Confirm Decision
                                            </button>
                                        )}
                                    </div>
                                </ExecutiveCard>
                            ))
                        )}
                    </div>
                </main>
            </div>

            <UniversalSearch isOpen={searchOpen} onClose={() => setSearchOpen(false)} />
        </div>
    );
}
