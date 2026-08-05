"use client";

import React, { useState, useEffect } from "react";
import Sidebar from "@/components/executive/Sidebar";
import Header from "@/components/executive/Header";
import UniversalSearch from "@/components/executive/UniversalSearch";
import ExecutiveCard from "@/components/executive/ExecutiveCard";
import { Puzzle, Sparkles, ShieldCheck, Download, Trash2, CheckCircle2, Zap } from "lucide-react";

export default function PluginsPage() {
    const [searchOpen, setSearchOpen] = useState(false);
    const [installed, setInstalled] = useState<any[]>([]);
    const [catalog, setCatalog] = useState<any[]>([]);
    const [skills, setSkills] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadData();
    }, []);

    async function loadData() {
        try {
            const [pluginRes, regRes] = await Promise.all([
                fetch("/api/plugins"),
                fetch("/api/plugins/registry")
            ]);
            const pData = await pluginRes.json();
            const rData = await regRes.json();

            if (pData.success) {
                setInstalled(pData.installed || []);
                setCatalog(pData.marketplaceCatalog || []);
            }
            if (rData.success) {
                setSkills(rData.skills || []);
            }
        } catch (err) {
            console.error("Failed to load plugins page data:", err);
        } finally {
            setLoading(false);
        }
    }

    async function installFromCatalog(manifest: any) {
        try {
            await fetch("/api/plugins/install", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ manifest }),
            });
            await loadData();
        } catch (err) {
            console.error("Failed to install plugin:", err);
        }
    }

    async function togglePluginStatus(pluginId: string, currentStatus: string) {
        try {
            const nextStatus = currentStatus === "enabled" ? "disabled" : "enabled";
            await fetch("/api/plugins/update", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ pluginId, status: nextStatus }),
            });
            await loadData();
        } catch (err) {
            console.error("Failed to update plugin status:", err);
        }
    }

    return (
        <div className="min-h-screen bg-[#0B0F17] text-slate-100 flex flex-col md:flex-row antialiased font-sans">
            <Sidebar />

            <div className="flex-1 flex flex-col min-w-0">
                <Header onOpenSearch={() => setSearchOpen(true)} />

                <main className="flex-1 p-4 md:p-8 max-w-7xl w-full mx-auto space-y-8">
                    {/* Header */}
                    <div>
                        <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-slate-100 flex items-center gap-2.5">
                            <Puzzle className="w-7 h-7 text-purple-400" /> Executive Plugins & Skills Platform
                        </h1>
                        <p className="text-xs md:text-sm text-slate-400 mt-1">
                            Extend PAL with sandboxed executive skills, custom agents, connectors, and playbooks.
                        </p>
                    </div>

                    {/* Active Skills Framework */}
                    <div className="space-y-3">
                        <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                            Available Executive Skills Framework
                        </h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                            {skills.map((skill) => (
                                <ExecutiveCard key={skill.id}>
                                    <div className="space-y-2">
                                        <div className="flex items-center gap-2">
                                            <Zap className="w-4 h-4 text-purple-400" />
                                            <div className="font-bold text-slate-100 text-xs truncate">{skill.name}</div>
                                        </div>
                                        <p className="text-[11px] text-slate-400 min-h-[32px]">{skill.description}</p>
                                        <div className="pt-1 flex flex-wrap gap-1">
                                            {skill.requiredPermissions?.map((perm: string) => (
                                                <span key={perm} className="px-1.5 py-0.5 rounded text-[9px] bg-purple-950/40 text-purple-300 font-mono">
                                                    {perm}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                </ExecutiveCard>
                            ))}
                        </div>
                    </div>

                    {/* Installed Plugins */}
                    <div className="space-y-3">
                        <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                            Installed Sandboxed Plugins
                        </h2>
                        {loading ? (
                            <div className="py-6 text-center text-slate-400 text-xs animate-pulse">
                                Loading active plugin runtime...
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {installed.map((p) => (
                                    <ExecutiveCard key={p.id}>
                                        <div className="space-y-3">
                                            <div className="flex items-center justify-between">
                                                <div className="font-bold text-slate-100 text-sm">{p.name}</div>
                                                <span className="px-2 py-0.5 rounded text-[10px] uppercase font-mono font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                                                    {p.status}
                                                </span>
                                            </div>

                                            <p className="text-xs text-slate-400 min-h-[36px]">{p.description}</p>

                                            <div className="p-2 rounded-xl bg-slate-900/60 border border-slate-800 text-[10px] text-slate-400 space-y-1">
                                                <div>Author: <span className="text-slate-200 font-semibold">{p.author}</span></div>
                                                <div>Permissions: <span className="text-purple-300">{p.manifest?.permissions?.join(", ") || "None"}</span></div>
                                            </div>

                                            <button
                                                onClick={() => togglePluginStatus(p.id, p.status)}
                                                className="w-full py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold transition-all"
                                            >
                                                {p.status === "enabled" ? "Disable Plugin" : "Enable Plugin"}
                                            </button>
                                        </div>
                                    </ExecutiveCard>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Plugin Marketplace Catalog */}
                    <div className="space-y-3">
                        <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                            Plugin Marketplace Catalog
                        </h2>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            {catalog.map((cat) => (
                                <ExecutiveCard key={cat.id}>
                                    <div className="space-y-3">
                                        <div className="font-bold text-slate-100 text-sm">{cat.name}</div>
                                        <p className="text-xs text-slate-400 min-h-[36px]">{cat.description}</p>
                                        <button
                                            onClick={() => installFromCatalog(cat)}
                                            className="w-full py-2 rounded-xl bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white text-xs font-bold shadow-lg shadow-purple-500/20 transition-all flex items-center justify-center gap-1.5"
                                        >
                                            <Download className="w-3.5 h-3.5" /> Install Plugin
                                        </button>
                                    </div>
                                </ExecutiveCard>
                            ))}
                        </div>
                    </div>
                </main>
            </div>

            <UniversalSearch isOpen={searchOpen} onClose={() => setSearchOpen(false)} />
        </div>
    );
}
