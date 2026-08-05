"use client";

import React from "react";
import type { BusinessHealthKPIs } from "../../lib/integrations/ui/commandCenterTypes";

export function BusinessHealthKPIWidget({ kpis }: { kpis: BusinessHealthKPIs }) {
    return (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl">
                <div className="text-xs text-slate-400 font-medium">Revenue (USD)</div>
                <div className="text-2xl font-bold text-emerald-400 mt-1">${kpis.revenueUSD.toLocaleString()}</div>
                <div className="text-[10px] text-slate-500 mt-1">Live tracking via Stripe</div>
            </div>
            <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl">
                <div className="text-xs text-slate-400 font-medium">Cash Flow</div>
                <div className="text-2xl font-bold text-cyan-400 mt-1">${kpis.cashFlowUSD.toLocaleString()}</div>
                <div className="text-[10px] text-slate-500 mt-1">Net operational balance</div>
            </div>
            <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl">
                <div className="text-xs text-slate-400 font-medium">Active Tasks</div>
                <div className="text-2xl font-bold text-indigo-400 mt-1">{kpis.activeTasks}</div>
                <div className="text-[10px] text-slate-500 mt-1">{kpis.totalWorkersActive} workers online</div>
            </div>
            <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl">
                <div className="text-xs text-slate-400 font-medium">Connector Health</div>
                <div className="text-2xl font-bold text-amber-400 mt-1">{kpis.healthyCount}/{kpis.connectedCount}</div>
                <div className="text-[10px] text-slate-500 mt-1">100% SLA operational</div>
            </div>
        </div>
    );
}
