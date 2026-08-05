"use client";

import React from "react";
import type { ExecutiveMemoryInsight } from "../../lib/integrations/ui/commandCenterTypes";

export function ExecutiveMemoryWidget({ insights }: { insights: ExecutiveMemoryInsight[] }) {
    return (
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-lg">
            <h3 className="text-sm font-semibold text-slate-200 uppercase tracking-wider mb-4 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-purple-400"></span>
                Adaptive Executive Memory
            </h3>
            <div className="space-y-3">
                {insights.map((item) => (
                    <div key={item.id} className="p-3 bg-slate-950/60 border border-slate-800 rounded-lg text-xs">
                        <div className="flex items-center justify-between text-purple-400 font-medium mb-1">
                            <span className="capitalize">{item.category.replace("_", " ")}</span>
                            <span className="text-[10px] bg-purple-950 text-purple-300 px-2 py-0.5 rounded border border-purple-800">
                                {Math.round(item.confidence * 100)}% Confidence
                            </span>
                        </div>
                        <p className="text-slate-300">{item.summary}</p>
                    </div>
                ))}
            </div>
        </div>
    );
}
