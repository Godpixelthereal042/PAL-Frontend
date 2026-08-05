"use client";

import React, { useState } from "react";

export interface MemoryFact {
    id: string;
    category: "profile" | "decision" | "metric" | "preference";
    factKey: string;
    factValue: string;
    confidence: number;
    lastUpdated: string;
}

export function BusinessBrainMemoryWidget() {
    const [memories, setMemories] = useState<MemoryFact[]>([
        { id: "mem_1", category: "profile", factKey: "Business Model", factValue: "B2B Subscription SaaS ($1,200 ACV)", confidence: 0.98, lastUpdated: "Today" },
        { id: "mem_2", category: "decision", factKey: "Spend Threshold Policy", factValue: "High-spend actions > $1,000 require human sign-off", confidence: 0.95, lastUpdated: "Yesterday" },
        { id: "mem_3", category: "metric", factKey: "Target 90-Day MRR", factValue: "Increase monthly recurring revenue by 20%", confidence: 0.92, lastUpdated: "2 days ago" },
        { id: "mem_4", category: "preference", factKey: "Outreach Approval", factValue: "Email campaigns must be reviewed in dry-run mode before dispatch", confidence: 0.90, lastUpdated: "3 days ago" }
    ]);

    const [editingId, setEditingId] = useState<string | null>(null);
    const [editValue, setEditValue] = useState("");

    const handleSaveEdit = (id: string) => {
        setMemories(prev => prev.map(m => {
            if (m.id === id) {
                return { ...m, factValue: editValue, lastUpdated: "Just now" };
            }
            return m;
        }));
        setEditingId(null);
    };

    return (
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 space-y-4">
            <div className="flex items-center justify-between">
                <div>
                    <h3 className="text-lg font-bold text-slate-100 flex items-center gap-2">
                        <span>🧠</span> PAL Business Memory & Knowledge Base
                    </h3>
                    <p className="text-xs text-slate-400">
                        Operational facts, preferences, and decision history learned by PAL.
                    </p>
                </div>
                <span className="px-2.5 py-1 bg-indigo-500/10 text-indigo-400 text-xs font-mono rounded-full border border-indigo-500/20">
                    {memories.length} Active Memory Items
                </span>
            </div>

            <div className="space-y-2.5">
                {memories.map(m => (
                    <div key={m.id} className="p-3.5 bg-slate-950/70 border border-slate-800 rounded-xl flex items-center justify-between gap-4">
                        <div className="space-y-1 flex-1">
                            <div className="flex items-center gap-2">
                                <span className="text-[11px] font-mono px-2 py-0.5 bg-slate-800 text-slate-300 rounded uppercase">
                                    {m.category}
                                </span>
                                <h4 className="text-xs font-semibold text-slate-200">{m.factKey}</h4>
                            </div>

                            {editingId === m.id ? (
                                <div className="flex gap-2 pt-1">
                                    <input
                                        type="text"
                                        value={editValue}
                                        onChange={(e) => setEditValue(e.target.value)}
                                        className="flex-1 bg-slate-900 border border-indigo-500 rounded px-2.5 py-1 text-xs text-slate-200"
                                    />
                                    <button
                                        onClick={() => handleSaveEdit(m.id)}
                                        className="px-3 py-1 bg-emerald-600 text-white text-xs font-medium rounded"
                                    >
                                        Save
                                    </button>
                                </div>
                            ) : (
                                <p className="text-xs text-slate-300 font-mono">{m.factValue}</p>
                            )}
                        </div>

                        {editingId !== m.id && (
                            <button
                                onClick={() => {
                                    setEditingId(m.id);
                                    setEditValue(m.factValue);
                                }}
                                className="text-xs text-indigo-400 hover:text-indigo-300 font-mono underline"
                            >
                                Edit
                            </button>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
}
