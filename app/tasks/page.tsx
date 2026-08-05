"use client";

import React, { useState } from "react";
import Sidebar from "@/components/executive/Sidebar";
import Header from "@/components/executive/Header";
import UniversalSearch from "@/components/executive/UniversalSearch";
import ExecutiveCard from "@/components/executive/ExecutiveCard";
import StatusBadge from "@/components/executive/StatusBadge";
import { CheckSquare, AlertTriangle, Sparkles, Clock, ArrowRight, UserPlus, Calendar, GitBranch } from "lucide-react";
import Link from "next/link";

export default function TasksPage() {
    const [searchOpen, setSearchOpen] = useState(false);
    const [activeTab, setActiveTab] = useState<"all" | "suggested" | "overdue" | "matrix">("all");

    const tasks = [
        {
            id: "t1",
            title: "Send Q3 Investor Update to Sarah Jenkins",
            dueDate: "2026-07-22",
            priority: "high",
            status: "overdue",
            project: "Series A Fundraising",
            matrixCategory: "urgent_important",
        },
        {
            id: "t2",
            title: "Follow up on Outstanding Invoice #104 ($8,500)",
            dueDate: "2026-07-24",
            priority: "high",
            status: "overdue",
            project: "Finance & Operations",
            matrixCategory: "urgent_important",
        },
        {
            id: "t3",
            title: "Review Engineering Architecture Proposal",
            dueDate: "2026-07-28",
            priority: "medium",
            status: "pending",
            project: "Product Infrastructure",
            matrixCategory: "important_not_urgent",
        },
        {
            id: "t4",
            title: "Delegate Vendor Contract Renewal",
            dueDate: "2026-07-30",
            priority: "low",
            status: "pending",
            project: "Operations",
            matrixCategory: "urgent_not_important",
        },
    ];

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
                                <CheckSquare className="w-7 h-7 text-blue-400" /> Executive Task Execution
                            </h1>
                            <p className="text-xs md:text-sm text-slate-400 mt-1">
                                Prioritize, delegate, and convert business operations into automated workflows.
                            </p>
                        </div>
                    </div>

                    {/* Filter Tabs */}
                    <div className="flex items-center gap-2 border-b border-[#1E293B] pb-3 overflow-x-auto">
                        <button
                            onClick={() => setActiveTab("all")}
                            className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
                                activeTab === "all"
                                    ? "bg-blue-600/20 text-blue-400 border border-blue-500/30"
                                    : "text-slate-400 hover:text-slate-200"
                            }`}
                        >
                            My Tasks ({tasks.length})
                        </button>
                        <button
                            onClick={() => setActiveTab("suggested")}
                            className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5 ${
                                activeTab === "suggested"
                                    ? "bg-purple-600/20 text-purple-400 border border-purple-500/30"
                                    : "text-slate-400 hover:text-slate-200"
                            }`}
                        >
                            <Sparkles className="w-3.5 h-3.5" /> AI Suggested Tasks (2)
                        </button>
                        <button
                            onClick={() => setActiveTab("overdue")}
                            className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5 ${
                                activeTab === "overdue"
                                    ? "bg-rose-600/20 text-rose-400 border border-rose-500/30"
                                    : "text-slate-400 hover:text-slate-200"
                            }`}
                        >
                            <AlertTriangle className="w-3.5 h-3.5" /> Overdue (2)
                        </button>
                        <button
                            onClick={() => setActiveTab("matrix")}
                            className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
                                activeTab === "matrix"
                                    ? "bg-emerald-600/20 text-emerald-400 border border-emerald-500/30"
                                    : "text-slate-400 hover:text-slate-200"
                            }`}
                        >
                            Eisenhower Matrix
                        </button>
                    </div>

                    {/* View Switcher Content */}
                    {activeTab === "matrix" ? (
                        /* Eisenhower Matrix View */
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Quadrant 1: Urgent & Important */}
                            <ExecutiveCard title="Do First (Urgent & Important)" subtitle="Critical operational priorities">
                                <div className="space-y-2 mt-2">
                                    {tasks
                                        .filter((t) => t.matrixCategory === "urgent_important")
                                        .map((t) => (
                                            <div
                                                key={t.id}
                                                className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 text-xs flex justify-between items-center"
                                            >
                                                <span className="font-semibold text-slate-200">{t.title}</span>
                                                <StatusBadge label="Urgent" variant="danger" />
                                            </div>
                                        ))}
                                </div>
                            </ExecutiveCard>

                            {/* Quadrant 2: Important, Not Urgent */}
                            <ExecutiveCard title="Schedule (Important, Not Urgent)" subtitle="Strategic long-term focus">
                                <div className="space-y-2 mt-2">
                                    {tasks
                                        .filter((t) => t.matrixCategory === "important_not_urgent")
                                        .map((t) => (
                                            <div
                                                key={t.id}
                                                className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 text-xs flex justify-between items-center"
                                            >
                                                <span className="font-semibold text-slate-200">{t.title}</span>
                                                <StatusBadge label="Scheduled" variant="info" />
                                            </div>
                                        ))}
                                </div>
                            </ExecutiveCard>
                        </div>
                    ) : (
                        /* Standard Task List View */
                        <div className="space-y-3">
                            {tasks.map((task) => (
                                <div
                                    key={task.id}
                                    className="p-4 rounded-2xl bg-[#131B2E] border border-[#1E293B] hover:border-slate-700 transition-all flex flex-col md:flex-row md:items-center justify-between gap-4 group"
                                >
                                    <div className="flex items-start gap-3 flex-1 min-w-0">
                                        <div className="w-5 h-5 rounded-md border border-slate-600 hover:border-blue-400 cursor-pointer flex items-center justify-center shrink-0 mt-0.5">
                                            <CheckSquare className="w-3.5 h-3.5 text-transparent hover:text-blue-400 transition-colors" />
                                        </div>
                                        <div className="min-w-0">
                                            <h3 className="text-sm font-semibold text-slate-100 group-hover:text-blue-400 transition-colors truncate">
                                                {task.title}
                                            </h3>
                                            <div className="flex items-center gap-3 text-xs text-slate-400 mt-1">
                                                <span>Project: {task.project}</span>
                                                <span>•</span>
                                                <span className="flex items-center gap-1">
                                                    <Clock className="w-3 h-3 text-rose-400" /> Due: {task.dueDate}
                                                </span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Action Buttons: Complete, Delegate, Reschedule, Convert to Workflow */}
                                    <div className="flex items-center gap-2 shrink-0 overflow-x-auto pt-2 md:pt-0">
                                        <button className="px-3 py-1.5 rounded-lg bg-emerald-600/20 text-emerald-400 border border-emerald-500/30 text-xs font-semibold hover:bg-emerald-600 hover:text-white transition-all">
                                            Complete
                                        </button>
                                        <button className="px-3 py-1.5 rounded-lg bg-slate-900 text-slate-300 border border-slate-800 text-xs font-semibold hover:text-white flex items-center gap-1">
                                            <UserPlus className="w-3 h-3" /> Delegate
                                        </button>
                                        <button className="px-3 py-1.5 rounded-lg bg-slate-900 text-slate-300 border border-slate-800 text-xs font-semibold hover:text-white flex items-center gap-1">
                                            <Calendar className="w-3 h-3" /> Reschedule
                                        </button>
                                        <Link
                                            href="/workflows"
                                            className="px-3 py-1.5 rounded-lg bg-purple-600/20 text-purple-400 border border-purple-500/30 text-xs font-semibold hover:bg-purple-600 hover:text-white transition-all flex items-center gap-1"
                                        >
                                            <GitBranch className="w-3 h-3" /> Convert to Workflow
                                        </Link>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </main>
            </div>

            <UniversalSearch isOpen={searchOpen} onClose={() => setSearchOpen(false)} />
        </div>
    );
}
