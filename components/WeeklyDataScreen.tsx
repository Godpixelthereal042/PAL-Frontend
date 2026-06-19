"use client";

import React, { useState, useEffect } from "react";
import { ArrowLeft, Calendar, Sparkles, BarChart, ArrowUpRight, ArrowDownRight, Layers } from "lucide-react";
import { useRouter } from "next/navigation";
import BottomNav from "./BottomNav";

interface MetricRow {
    category: string;
    value: string;
    change: string;
    type: "up" | "down" | "neutral";
}

export default function WeeklyDataScreen() {
    const router = useRouter();

    const [stats, setStats] = useState<MetricRow[]>([]);

    const [weeklyProgress, setWeeklyProgress] = useState([
        { day: "M", value: 0, color: "bg-blue-500" },
        { day: "T", value: 0, color: "bg-blue-400" },
        { day: "W", value: 0, color: "bg-[#48b9ff]" },
        { day: "T", value: 0, color: "bg-[#51d4ff]" },
        { day: "F", value: 0, color: "bg-emerald-400" },
        { day: "S", value: 0, color: "bg-zinc-700" },
        { day: "S", value: 0, color: "bg-zinc-800" }
    ]);

    const [coFounderAdvice, setCoFounderAdvice] = useState(
        "Welcome to PAL! Discuss in chat to get started with your first project roadmap and tasks."
    );

    useEffect(() => {
        async function fetchWeeklyData() {
            try {
                const res = await fetch("/api/weekly-data");
                if (res.ok) {
                    const data = await res.json();
                    if (data.stats) setStats(data.stats);
                    if (data.weeklyProgress) setWeeklyProgress(data.weeklyProgress);
                    if (data.coFounderAdvice) setCoFounderAdvice(data.coFounderAdvice);
                }
            } catch (err) {
                console.error("Failed to fetch weekly data metrics", err);
            }
        }
        fetchWeeklyData();
    }, []);

    return (
        <div className="h-dvh bg-[var(--app-bg)] text-[var(--app-text)] w-full max-w-[430px] mx-auto relative shadow-2xl overflow-hidden selection:bg-blue-500/30 flex flex-col font-outfit">
            {/* Header */}
            <div className="flex justify-between items-center p-4 pt-5 pb-2 shrink-0 z-30 bg-[var(--app-header-bg)] backdrop-blur-md border-b border-[var(--app-card-border)]">
                <button
                    onClick={() => router.push("/")}
                    className="grid h-[40px] w-[40px] place-items-center rounded-full border border-[var(--app-card-border)] bg-[#161616] text-[#9eeaff] hover:bg-[#1a6ecf]/10 transition-colors cursor-pointer"
                    aria-label="Back to home"
                >
                    <ArrowLeft size={18} />
                </button>
                <h1 className="text-xs font-bold text-white uppercase tracking-widest">Weekly Data</h1>
                <div className="w-[40px]" />
            </div>

            {/* Scrollable Content */}
            <div className="flex-1 overflow-y-auto px-4 pb-28 pt-4 space-y-6 scrollbar-hide">
                
                {/* SVG Bar Chart progress block */}
                {/* Bold Red-Orange Velocity Bar Chart Card (Inspired by Steps per minute in IMG_2574.JPG) */}
                <div className="bg-[#FF532B] rounded-[28px] p-6 space-y-4 shadow-xl relative overflow-hidden">
                    <div className="flex justify-between items-start">
                        <div>
                            <span className="text-[9px] font-semibold uppercase tracking-wider text-white/70 block">Weekly Velocity</span>
                            <h3 className="text-lg font-bold text-white tracking-tight mt-1 leading-none">Task Output</h3>
                        </div>
                        <span className="text-[8px] font-bold text-white bg-black/15 px-2.5 py-0.5 rounded-full uppercase tracking-wider border border-white/10">This Week</span>
                    </div>

                    {/* Simple HTML/Tailwind CSS Bar Chart with thick, rounded black bars */}
                    <div className="flex justify-between items-end h-[110px] pt-4 px-2 select-none">
                        {weeklyProgress.map((p, idx) => {
                            // Find the max value to highlight the highest bar
                            const isHighest = p.value === Math.max(...weeklyProgress.map(x => x.value));
                            return (
                                <div key={idx} className="flex flex-col items-center gap-2 flex-1">
                                    <div className="w-5 bg-black/10 rounded-t-[6px] h-full relative flex items-end h-[85px]">
                                        <div 
                                            style={{ height: `${Math.max(12, p.value)}%` }} 
                                            className={`w-full rounded-t-[6px] transition-all duration-500 shadow-md ${
                                                isHighest ? "bg-black" : "bg-black/60"
                                            }`}
                                        />
                                    </div>
                                    <span className="text-[9px] font-bold text-black/80">{p.day}</span>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* KPI Breakdown refactored into Playful Card Blocks (Inspired by Exercises in IMG_2574.JPG) */}
                <div className="space-y-3">
                    <h3 className="text-[10px] font-extrabold uppercase tracking-widest text-zinc-400 pl-1.5">Weekly Breakdown</h3>
                    
                    <div className="grid grid-cols-2 gap-3">
                        {stats.map((row, idx) => {
                            // Alternate colors for the cards: index 0 (blue), index 1 (orange), index 2 (white), index 3 (purple)
                            const cardStyles = [
                                "bg-[#2d7fe0] text-white border-none shadow-lg",
                                "bg-[#FF532B] text-white border-none shadow-lg",
                                "bg-[#FAF8F5] text-[#1C1A17] border-none shadow-lg",
                                "bg-[#a855f7] text-white border-none shadow-lg"
                            ];
                            const styleClass = cardStyles[idx % cardStyles.length];
                            
                            // Determine change badge colors
                            const isUp = row.type === "up";
                            const isDown = row.type === "down";
                            const badgeColor = isUp 
                                ? "bg-emerald-500/20 text-emerald-200 border border-emerald-500/20" 
                                : isDown 
                                    ? "bg-red-500/20 text-red-200 border border-red-500/20" 
                                    : "bg-zinc-500/20 text-zinc-300 border border-zinc-500/20";

                            const subtextDark = idx % cardStyles.length === 2 ? "text-zinc-500" : "text-white/70";

                            return (
                                <div 
                                    key={idx} 
                                    className={`rounded-[28px] p-5 flex flex-col justify-between h-[125px] hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 ${styleClass}`}
                                >
                                    <div>
                                        <span className={`text-[9px] font-bold uppercase tracking-wider block ${subtextDark}`}>
                                            {row.category}
                                        </span>
                                        <span className="text-3xl font-black tracking-tight leading-none block mt-2.5">
                                            {row.value}
                                        </span>
                                    </div>
                                    <div className="flex justify-between items-center mt-1">
                                        <span className={`text-[9px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full ${badgeColor}`}>
                                            {isUp ? "+" : ""}{row.change}
                                        </span>
                                        <span className="text-sm select-none">
                                            {isUp ? "📈" : isDown ? "📉" : "📊"}
                                        </span>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* AI Co-founder advice card */}
                <div className="bg-gradient-to-br from-[#0c244a] to-[#041126] border border-blue-500/20 rounded-[28px] p-5.5 space-y-4 shadow-xl">
                    <div className="flex items-center gap-2">
                        <Sparkles size={16} className="text-[#51d4ff]" />
                        <h3 className="text-xs font-bold uppercase tracking-wider text-white">Weekly Co-Founder Audit</h3>
                    </div>

                    <p className="text-xs text-blue-200/90 leading-relaxed font-semibold">
                        {coFounderAdvice}
                    </p>

                    <button
                        type="button"
                        onClick={() => {
                            localStorage.setItem("chat_incoming_prompt", "Let's review the Weekly Data metrics and write a plan to improve our social engagement rate.");
                            router.push("/chat");
                        }}
                        className="w-full h-[46px] rounded-full bg-gradient-to-r from-[#2d7fe0] to-[#1a6ecf] text-xs font-bold text-white shadow-lg shadow-blue-500/20 uppercase tracking-widest active:scale-[0.98] transition-all cursor-pointer flex items-center justify-center gap-1.5 border-none"
                    >
                        <Layers size={14} /> Discuss in Chat
                    </button>
                </div>
            </div>

            <BottomNav activePage="home" />
        </div>
    );
}
