"use client";

import React from "react";
import type { PalEvent } from "../../lib/integrations/events/universalEventTypes";

export function ExecutiveActivityFeed({ events }: { events: PalEvent[] }) {
    return (
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-lg">
            <h3 className="text-sm font-semibold text-slate-200 uppercase tracking-wider mb-4 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                Executive Feed
            </h3>
            <div className="space-y-3 max-h-80 overflow-y-auto pr-1">
                {events.length === 0 ? (
                    <p className="text-xs text-slate-500 italic">No activity recorded yet.</p>
                ) : (
                    events.map((evt) => (
                        <div key={evt.id} className="p-3 bg-slate-950/60 border border-slate-800/80 rounded-lg flex items-start justify-between gap-3 text-xs">
                            <div>
                                <span className="font-mono text-emerald-400 font-medium">[{evt.classification}]</span>{" "}
                                <span className="text-slate-300 font-semibold">{evt.provider}</span>: <span className="text-slate-400">{evt.eventType}</span>
                                <div className="text-[11px] text-slate-500 mt-1">CID: {evt.correlationId}</div>
                            </div>
                            <span className="text-[10px] text-slate-500 font-mono whitespace-nowrap">
                                {new Date(evt.receivedAt).toLocaleTimeString()}
                            </span>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}
