"use client";

import React, { useState, useEffect } from "react";
import { Radio, Zap } from "lucide-react";
import ExecutiveCard from "./ExecutiveCard";

export default function LiveMonitoringWidget() {
    const [loading, setLoading] = useState(true);
    const [events, setEvents] = useState<any[]>([]);
    const [watchers, setWatchers] = useState<any[]>([]);

    useEffect(() => {
        async function fetchMonitoringData() {
            try {
                const [evtRes, watRes] = await Promise.all([
                    fetch("/api/events?limit=5"),
                    fetch("/api/events/watchers")
                ]);
                const evtData = await evtRes.json();
                const watData = await watRes.json();

                if (evtData.success && evtData.events) setEvents(evtData.events);
                if (watData.success && watData.watchers) setWatchers(watData.watchers);
            } catch (err) {
                console.error("Failed to load monitoring data:", err);
            } finally {
                setLoading(false);
            }
        }
        fetchMonitoringData();
    }, []);

    return (
        <ExecutiveCard
            title="Live Business Monitoring"
            subtitle="Real-time Event Bus & Agent Watchers stream"
        >
            <div className="space-y-4 pt-1">
                {loading ? (
                    <div className="py-6 text-center text-[#999CA5] text-xs animate-pulse">
                        Listening to Executive Event Bus...
                    </div>
                ) : (
                    <>
                        {/* Active Watchers Count */}
                        <div className="p-3 rounded-2xl bg-[#161B26] border border-white/5 flex items-center justify-between text-xs">
                            <div className="flex items-center gap-2">
                                <Radio className="w-4 h-4 text-[#2D7FE0] animate-pulse" />
                                <span className="text-white font-bold">Active Agent Watchers</span>
                            </div>
                            <span className="font-mono font-bold text-[#2D7FE0] bg-[#2D7FE0]/20 px-2.5 py-0.5 rounded-full border border-[#2D7FE0]/40">
                                {watchers.length} Active
                            </span>
                        </div>

                        {/* Recent Event Stream */}
                        <div className="space-y-2">
                            <h4 className="text-[10px] font-bold text-[#999CA5] uppercase tracking-wider">
                                Real-Time Business Event Stream
                            </h4>
                            {events.length > 0 ? (
                                <div className="space-y-1.5">
                                    {events.map((evt) => (
                                        <div
                                            key={evt.id}
                                            className="p-3 rounded-2xl bg-[#161B26] border border-white/5 flex items-center justify-between text-xs font-mono"
                                        >
                                            <span className="text-[#2D7FE0] font-bold truncate max-w-[200px]">
                                                {evt.eventType}
                                            </span>
                                            <span className="text-[#999CA5] text-[10px] truncate">
                                                {evt.source}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="p-4 text-center text-xs text-[#999CA5] bg-[#161B26] rounded-2xl border border-white/5 font-semibold">
                                    ✓ Event stream active (0 triggers fired in last 5m)
                                </div>
                            )}
                        </div>
                    </>
                )}
            </div>
        </ExecutiveCard>
    );
}
