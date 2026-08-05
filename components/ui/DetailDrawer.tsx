"use client";

import React from "react";
import { X, Calendar, CheckCircle2, ArrowRight, Bot, Clock, Tag } from "lucide-react";
import Link from "next/link";
import { useToast } from "./ToastProvider";

export interface DrawerItem {
    id: string;
    title: string;
    category?: string;
    description?: string;
    dueDate?: string;
    progressPct?: number;
    status?: string;
    assignedAgent?: string;
    milestones?: Array<{ title: string; done: boolean }>;
}

interface DetailDrawerProps {
    isOpen: boolean;
    item: DrawerItem | null;
    onClose: () => void;
}

export function DetailDrawer({ isOpen, item, onClose }: DetailDrawerProps) {
    const { showToast } = useToast();

    if (!isOpen || !item) return null;

    const handleExecuteAction = () => {
        showToast(`AI COO initiated task: "${item.title}"`, "success");
        onClose();
    };

    return (
        <div className="fixed inset-0 z-50 overflow-hidden">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
                onClick={onClose}
            />

            {/* Slide-over Drawer Panel */}
            <div className="fixed inset-y-0 right-0 max-w-md w-full bg-[#121620] border-l border-white/10 shadow-2xl p-6 flex flex-col justify-between overflow-y-auto scrollbar-hide text-white animate-in slide-in-from-right duration-300">
                <div className="space-y-6">
                    {/* Header */}
                    <div className="flex items-start justify-between gap-4 pb-4 border-b border-white/10">
                        <div className="space-y-1">
                            <span className="px-2.5 py-0.5 rounded-full text-[10px] uppercase font-extrabold bg-[#2D7FE0]/20 text-[#2D7FE0] border border-[#2D7FE0]/40">
                                {item.category || "Executive Priority"}
                            </span>
                            <h2 className="text-xl font-extrabold text-white leading-snug pt-1">{item.title}</h2>
                        </div>
                        <button
                            onClick={onClose}
                            className="p-2 rounded-xl text-[#999CA5] hover:text-white hover:bg-[#161B26] transition-colors"
                        >
                            <X className="w-5 h-5" />
                        </button>
                    </div>

                    {/* Metadata Grid */}
                    <div className="grid grid-cols-2 gap-3 text-xs">
                        <div className="p-3.5 rounded-2xl bg-[#161B26] border border-white/5 space-y-1">
                            <span className="text-[#999CA5] text-[10px] font-semibold uppercase flex items-center gap-1">
                                <Calendar className="w-3.5 h-3.5 text-[#2D7FE0]" /> Target Date
                            </span>
                            <p className="font-bold text-white">{item.dueDate || "Jan 30, 2026"}</p>
                        </div>
                        <div className="p-3.5 rounded-2xl bg-[#161B26] border border-white/5 space-y-1">
                            <span className="text-[#999CA5] text-[10px] font-semibold uppercase flex items-center gap-1">
                                <Bot className="w-3.5 h-3.5 text-[#22C55E]" /> AI Agent Lead
                            </span>
                            <p className="font-bold text-white">{item.assignedAgent || "COO Agent"}</p>
                        </div>
                    </div>

                    {/* Description */}
                    {item.description && (
                        <div className="space-y-1.5">
                            <h4 className="text-xs font-bold text-[#999CA5] uppercase tracking-wider">Overview</h4>
                            <p className="text-xs text-slate-300 leading-relaxed bg-[#161B26] p-4 rounded-2xl border border-white/5">
                                {item.description}
                            </p>
                        </div>
                    )}

                    {/* Progress Bar if available */}
                    {typeof item.progressPct === "number" && (
                        <div className="space-y-2">
                            <div className="flex items-center justify-between text-xs font-bold">
                                <span className="text-[#999CA5]">Execution Progress</span>
                                <span className="text-[#2D7FE0]">{item.progressPct}%</span>
                            </div>
                            <div className="w-full bg-[#161B26] h-2 rounded-full overflow-hidden border border-white/5">
                                <div
                                    style={{ width: `${item.progressPct}%` }}
                                    className="bg-gradient-to-r from-[#2D7FE0] to-[#3B82F6] h-full rounded-full"
                                />
                            </div>
                        </div>
                    )}

                    {/* Milestones / Checklist */}
                    <div className="space-y-2.5">
                        <h4 className="text-xs font-bold text-[#999CA5] uppercase tracking-wider">Key Milestones</h4>
                        <div className="space-y-2">
                            {(item.milestones || [
                                { title: "Executive Context & Data Sync", done: true },
                                { title: "Automated AI Agent Assessment", done: true },
                                { title: "Founder Sign-off & Execution Gate", done: false },
                            ]).map((m, idx) => (
                                <div
                                    key={idx}
                                    className="p-3 rounded-2xl bg-[#161B26] border border-white/5 flex items-center justify-between text-xs"
                                >
                                    <span className={m.done ? "text-slate-300 line-through opacity-70" : "text-white font-medium"}>
                                        {m.title}
                                    </span>
                                    <CheckCircle2 className={`w-4 h-4 ${m.done ? "text-[#22C55E]" : "text-[#646875]"}`} />
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Footer Action Buttons */}
                <div className="pt-6 border-t border-white/10 space-y-2">
                    <button
                        onClick={handleExecuteAction}
                        className="w-full py-3 rounded-2xl bg-[#2D7FE0] hover:bg-[#2563EB] text-white font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-blue-500/25 transition-transform hover:scale-[1.02] active:scale-[0.98]"
                    >
                        <span>Run AI Agent Action Now</span>
                        <ArrowRight className="w-4 h-4" />
                    </button>
                    <Link
                        href="/chat"
                        onClick={onClose}
                        className="w-full py-2.5 rounded-2xl bg-[#161B26] hover:bg-[#1E2636] text-[#999CA5] hover:text-white font-semibold text-xs flex items-center justify-center gap-2 transition-colors border border-white/5"
                    >
                        <span>Discuss with AI COO in Chat</span>
                    </Link>
                </div>
            </div>
        </div>
    );
}
