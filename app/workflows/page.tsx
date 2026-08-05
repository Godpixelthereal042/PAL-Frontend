"use client";

import React, { useState, useEffect } from "react";
import Sidebar from "@/components/executive/Sidebar";
import Header from "@/components/executive/Header";
import UniversalSearch from "@/components/executive/UniversalSearch";
import ExecutiveCard from "@/components/executive/ExecutiveCard";
import StatusBadge from "@/components/executive/StatusBadge";
import { GitBranch, Play, CheckCircle2, AlertCircle, Plus, Layers } from "lucide-react";

export default function WorkflowsPage() {
    const [searchOpen, setSearchOpen] = useState(false);
    const [workflows, setWorkflows] = useState<any[]>([]);
    const [templates, setTemplates] = useState<any[]>([]);
    const [selectedWorkflow, setSelectedWorkflow] = useState<any>(null);
    const [executions, setExecutions] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function loadData() {
            try {
                const res = await fetch("/api/workflows");
                const data = await res.json();
                if (data.success) {
                    setWorkflows(data.workflows || []);
                    setTemplates(data.starterTemplates || []);
                    if (data.workflows?.length > 0) {
                        loadWorkflowDetails(data.workflows[0].id);
                    }
                }
            } catch (err) {
                console.error("Failed to load workflows:", err);
            } finally {
                setLoading(false);
            }
        }
        loadData();
    }, []);

    async function loadWorkflowDetails(id: string) {
        try {
            const res = await fetch(`/api/workflows/${id}`);
            const data = await res.json();
            if (data.success) {
                setSelectedWorkflow(data.workflow);
                setExecutions(data.executions || []);
            }
        } catch (err) {
            console.error("Failed to load workflow details:", err);
        }
    }

    async function runWorkflow(id: string) {
        try {
            await fetch(`/api/workflows/${id}/run`, { method: "POST" });
            loadWorkflowDetails(id);
        } catch (err) {
            console.error("Failed to run workflow:", err);
        }
    }

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
                                <GitBranch className="w-7 h-7 text-emerald-400" /> Workflow Automation Engine
                            </h1>
                            <p className="text-xs md:text-sm text-slate-400 mt-1">
                                Deterministic event-driven orchestration coordinating Action Engine, Notifications, and Integrations.
                            </p>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        {/* Workflows List & Templates */}
                        <div className="lg:col-span-1 space-y-6">
                            <ExecutiveCard title="Active Workflows" subtitle={`${workflows.length} active pipelines`}>
                                <div className="space-y-2 mt-2">
                                    {workflows.map((wf) => (
                                        <div
                                            key={wf.id}
                                            onClick={() => loadWorkflowDetails(wf.id)}
                                            className={`
                                                p-3.5 rounded-xl border cursor-pointer transition-all flex items-center justify-between gap-3
                                                ${
                                                    selectedWorkflow?.id === wf.id
                                                        ? "bg-emerald-600/15 border-emerald-500/40"
                                                        : "bg-slate-900/60 border-slate-800 hover:border-slate-700"
                                                }
                                            `}
                                        >
                                            <div className="min-w-0">
                                                <h4 className="text-sm font-semibold text-slate-200 truncate">{wf.name}</h4>
                                                <p className="text-xs text-slate-400 truncate">Trigger: {wf.trigger}</p>
                                            </div>
                                            <StatusBadge label={wf.enabled ? "Active" : "Disabled"} variant={wf.enabled ? "success" : "inactive"} />
                                        </div>
                                    ))}
                                </div>
                            </ExecutiveCard>
                        </div>

                        {/* Workflow Execution Inspector & Visual Builder Placeholder */}
                        <div className="lg:col-span-2 space-y-6">
                            {selectedWorkflow ? (
                                <>
                                    <ExecutiveCard
                                        title={selectedWorkflow.name}
                                        subtitle={selectedWorkflow.description || `Trigger: ${selectedWorkflow.trigger}`}
                                        action={
                                            <button
                                                onClick={() => runWorkflow(selectedWorkflow.id)}
                                                className="px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center gap-1.5 shadow-md transition-all"
                                            >
                                                <Play className="w-3.5 h-3.5" /> Run Manually
                                            </button>
                                        }
                                    >
                                        <div className="space-y-4 pt-2">
                                            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                                                Execution Step Blueprint
                                            </h4>
                                            <div className="space-y-2">
                                                {selectedWorkflow.actions?.map((step: any, idx: number) => (
                                                    <div key={idx} className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 text-xs flex items-center gap-3">
                                                        <span className="w-6 h-6 rounded-lg bg-emerald-600/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center font-bold">
                                                            #{idx + 1}
                                                        </span>
                                                        <span className="font-semibold text-slate-200">{step.action}</span>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    </ExecutiveCard>

                                    {/* Visual Builder Placeholder */}
                                    <ExecutiveCard title="Visual Workflow Builder Canvas" subtitle="Drag-and-drop orchestration node editor">
                                        <div className="py-12 px-4 text-center border-2 border-dashed border-slate-800 rounded-xl bg-slate-900/30">
                                            <Layers className="w-8 h-8 text-slate-600 mx-auto mb-2" />
                                            <h4 className="text-sm font-semibold text-slate-300">Visual Builder Placeholder</h4>
                                            <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1">
                                                Canvas editor initialized. Drag-and-drop node graph editing will unlock in Sprint 7.
                                            </p>
                                        </div>
                                    </ExecutiveCard>
                                </>
                            ) : (
                                <ExecutiveCard>
                                    <div className="py-12 text-center text-slate-500 text-sm">
                                        Select a workflow to inspect execution steps and run history.
                                    </div>
                                </ExecutiveCard>
                            )}
                        </div>
                    </div>
                </main>
            </div>

            <UniversalSearch isOpen={searchOpen} onClose={() => setSearchOpen(false)} />
        </div>
    );
}
