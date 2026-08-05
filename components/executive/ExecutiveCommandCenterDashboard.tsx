"use client";

import React, { useEffect, useState } from "react";
import { CommandCenterStore } from "../../lib/integrations/ui/commandCenterStore";
import type { CommandCenterState } from "../../lib/integrations/ui/commandCenterTypes";
import { BusinessHealthKPIWidget } from "./BusinessHealthKPIWidget";
import { ExecutiveActivityFeed } from "./ExecutiveActivityFeed";
import { ExecutiveMemoryWidget } from "./ExecutiveMemoryWidget";
import { DecisionReasoningInspector } from "./DecisionReasoningInspector";

export function ExecutiveCommandCenterDashboard({ store }: { store?: CommandCenterStore }) {
    const [centerStore] = useState(() => store || new CommandCenterStore());
    const [state, setState] = useState<CommandCenterState>(centerStore.getState());

    useEffect(() => {
        const unsubscribe = centerStore.subscribe((newState) => {
            setState({ ...newState });
        });
        return unsubscribe;
    }, [centerStore]);

    return (
        <div className="min-h-screen bg-slate-950 text-slate-100 p-6 space-y-6">
            <header className="flex items-center justify-between border-b border-slate-800 pb-4">
                <div>
                    <h1 className="text-xl font-bold text-slate-100 tracking-tight flex items-center gap-2">
                        PAL Executive Command Center
                        <span className="text-xs bg-emerald-950 text-emerald-400 border border-emerald-800 px-2 py-0.5 rounded font-mono">v0.6.0 Live</span>
                    </h1>
                    <p className="text-xs text-slate-400 mt-1">Autonomous Business Operating System & Real-Time Decision Cockpit</p>
                </div>
            </header>

            <BusinessHealthKPIWidget kpis={state.businessKPIs} />

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <ExecutiveActivityFeed events={state.activityFeed} />
                <ExecutiveMemoryWidget insights={state.memoryInsights} />
            </div>

            <DecisionReasoningInspector decisions={state.decisionFeed} />
        </div>
    );
}
