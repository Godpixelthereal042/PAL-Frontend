"use client";

import React from "react";
import type { DecisionExplainability } from "../../lib/integrations/ui/commandCenterTypes";

export function DecisionReasoningInspector({ decisions }: { decisions: DecisionExplainability[] }) {
    return (
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-lg">
            <h3 className="text-sm font-semibold text-slate-200 uppercase tracking-wider mb-4 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-cyan-400"></span>
                Autonomous Decision Inspector
            </h3>
            <div className="space-y-4">
                {decisions.map((dec) => (
                    <div key={dec.decisionId} className="p-4 bg-slate-950 border border-slate-800 rounded-xl text-xs space-y-3">
                        <div className="flex items-center justify-between">
                            <h4 className="font-semibold text-slate-100 text-sm">{dec.title}</h4>
                            <span className="bg-cyan-950 text-cyan-400 font-bold px-2.5 py-1 rounded border border-cyan-800 text-[11px]">
                                {Math.round(dec.confidence * 100)}% Confidence
                            </span>
                        </div>
                        <p className="text-slate-300 bg-slate-900 p-2.5 rounded border border-slate-800/80 leading-relaxed">
                            <strong className="text-cyan-400 font-medium">Why:</strong> {dec.reasoning}
                        </p>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-[11px]">
                            <div className="bg-slate-900/80 p-2 rounded border border-slate-800">
                                <span className="text-slate-400 block">Tools Used</span>
                                <span className="font-mono text-slate-200">{dec.toolsUsed.join(", ")}</span>
                            </div>
                            <div className="bg-slate-900/80 p-2 rounded border border-slate-800">
                                <span className="text-slate-400 block">Workers</span>
                                <span className="font-mono text-slate-200">{dec.workersInvolved.join(", ")}</span>
                            </div>
                            <div className="bg-slate-900/80 p-2 rounded border border-slate-800">
                                <span className="text-slate-400 block">Cost</span>
                                <span className="font-mono text-emerald-400">${dec.estimatedCostUSD} USD</span>
                            </div>
                            <div className="bg-slate-900/80 p-2 rounded border border-slate-800">
                                <span className="text-slate-400 block">Time Saved</span>
                                <span className="font-mono text-cyan-300">{dec.timeSavedHours} hours</span>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
