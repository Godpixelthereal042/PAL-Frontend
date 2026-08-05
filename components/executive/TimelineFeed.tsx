"use client";

import React from "react";
import { Calendar, GitBranch, Scale, CheckSquare, FileText, User } from "lucide-react";

export interface TimelineFeedItem {
    id: string;
    type: "meeting" | "decision" | "task" | "workflow" | "relationship" | "invoice";
    title: string;
    timestamp: number | string;
    details?: string;
}

export default function TimelineFeed({ items }: { items: TimelineFeedItem[] }) {
    const getIcon = (type: string) => {
        switch (type) {
            case "meeting":
                return <Calendar className="w-4 h-4 text-blue-400" />;
            case "decision":
                return <Scale className="w-4 h-4 text-purple-400" />;
            case "workflow":
                return <GitBranch className="w-4 h-4 text-emerald-400" />;
            case "task":
                return <CheckSquare className="w-4 h-4 text-amber-400" />;
            case "relationship":
                return <User className="w-4 h-4 text-rose-400" />;
            default:
                return <FileText className="w-4 h-4 text-slate-400" />;
        }
    };

    return (
        <div className="relative pl-6 space-y-6 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-[#1E293B]">
            {items.map((item) => {
                const dateStr =
                    typeof item.timestamp === "number"
                        ? new Date(item.timestamp).toLocaleString()
                        : item.timestamp;

                return (
                    <div key={item.id} className="relative flex items-start gap-4 group">
                        {/* Bullet Icon */}
                        <div className="absolute -left-6 top-0.5 w-5 h-5 rounded-full bg-[#131B2E] border border-[#1E293B] flex items-center justify-center shrink-0 group-hover:border-blue-500 transition-colors">
                            {getIcon(item.type)}
                        </div>

                        <div className="flex-1 bg-slate-900/60 border border-slate-800/80 p-3.5 rounded-xl hover:border-slate-700 transition-all">
                            <div className="flex items-center justify-between gap-2">
                                <h4 className="text-sm font-semibold text-slate-200">{item.title}</h4>
                                <span className="text-[10px] text-slate-500 font-mono">{dateStr}</span>
                            </div>
                            {item.details && <p className="text-xs text-slate-400 mt-1">{item.details}</p>}
                        </div>
                    </div>
                );
            })}
        </div>
    );
}
