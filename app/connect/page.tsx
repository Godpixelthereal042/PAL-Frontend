"use client";

import React, { useState, useEffect } from "react";
import Sidebar from "@/components/executive/Sidebar";
import Header from "@/components/executive/Header";
import UniversalSearch from "@/components/executive/UniversalSearch";
import ExecutiveCard from "@/components/executive/ExecutiveCard";
import ConnectScreen from "@/components/ConnectScreen";
import { Plug, ShieldCheck, CheckCircle2, RefreshCw, Radio } from "lucide-react";

export default function ConnectPage() {
    const [searchOpen, setSearchOpen] = useState(false);
    const [connectors, setConnectors] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadConnectors();
    }, []);

    async function loadConnectors() {
        try {
            const res = await fetch("/api/connectors");
            const data = await res.json();
            if (data.success && data.connectors) {
                setConnectors(data.connectors);
            }
        } catch (err) {
            console.error("Failed to load connectors:", err);
        } finally {
            setLoading(false);
        }
    }

    async function toggleConnector(connectorId: string, currentStatus: string) {
        try {
            const endpoint = currentStatus === "connected" ? "/api/connectors/disconnect" : "/api/connectors/connect";
            await fetch(endpoint, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ connectorId }),
            });
            await loadConnectors();
        } catch (err) {
            console.error(`Failed to toggle connector ${connectorId}:`, err);
        }
    }

    return (
        <div className="min-h-screen bg-[#0B0F17] text-slate-100 flex flex-col md:flex-row antialiased font-sans">
            <Sidebar />

            <div className="flex-1 flex flex-col min-w-0">
                <Header onOpenSearch={() => setSearchOpen(true)} />

                <main className="flex-1 p-4 md:p-8 max-w-7xl w-full mx-auto space-y-6">
                    <div>
                        <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-slate-100 flex items-center gap-2.5">
                            <Plug className="w-7 h-7 text-blue-400" /> Enterprise Connectivity Center
                        </h1>
                        <p className="text-xs md:text-sm text-slate-400 mt-1">
                            Connect external business platforms (Google Workspace, Slack, GitHub, Notion, Stripe) to ingest real-time events into the Executive Event Bus.
                        </p>
                    </div>

                    {/* Active Connectors Grid */}
                    <div className="space-y-3">
                        <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                            Enterprise Connectors SDK
                        </h2>
                        {loading ? (
                            <div className="py-8 text-center text-slate-400 text-xs animate-pulse">
                                Loading registered enterprise connectors...
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {connectors.map((c) => (
                                    <ExecutiveCard key={c.id}>
                                        <div className="space-y-3">
                                            <div className="flex items-center justify-between">
                                                <div className="font-bold text-slate-100 text-sm">{c.name}</div>
                                                <span
                                                    className={`px-2 py-0.5 rounded text-[10px] uppercase font-mono font-bold ${
                                                        c.status === "connected"
                                                            ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                                                            : "bg-slate-800 text-slate-400"
                                                    }`}
                                                >
                                                    {c.status}
                                                </span>
                                            </div>

                                            <p className="text-xs text-slate-400 min-h-[36px]">{c.description}</p>

                                            <div className="p-2.5 rounded-xl bg-slate-900/60 border border-slate-800 text-[11px] space-y-1">
                                                <div className="text-slate-400 flex justify-between">
                                                    <span>Category:</span>
                                                    <span className="text-slate-200 font-semibold">{c.category}</span>
                                                </div>
                                                <div className="text-slate-400 flex justify-between">
                                                    <span>Auth Type:</span>
                                                    <span className="text-slate-200 font-semibold uppercase">{c.authType}</span>
                                                </div>
                                            </div>

                                            <button
                                                onClick={() => toggleConnector(c.id, c.status)}
                                                className={`w-full py-2 rounded-xl text-xs font-bold transition-all ${
                                                    c.status === "connected"
                                                        ? "bg-slate-800 hover:bg-rose-900/30 text-slate-300 hover:text-rose-400 border border-slate-700"
                                                        : "bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white shadow-lg shadow-blue-500/20"
                                                }`}
                                            >
                                                {c.status === "connected" ? "Disconnect Integration" : "Connect Service"}
                                            </button>
                                        </div>
                                    </ExecutiveCard>
                                ))}
                            </div>
                        )}
                    </div>
                </main>
            </div>

            <UniversalSearch isOpen={searchOpen} onClose={() => setSearchOpen(false)} />
        </div>
    );
}
