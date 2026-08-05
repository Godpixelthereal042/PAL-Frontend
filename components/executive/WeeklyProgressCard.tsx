"use client";

import React from "react";
import { Calendar } from "lucide-react";

export function WeeklyProgressCard() {
    const weeklyData = [
        { day: "MON", height: "45%", color: "bg-[#E2E8F0]" },
        { day: "TUE", height: "65%", color: "bg-[#E2E8F0]" },
        { day: "WED", height: "75%", color: "bg-[#E2E8F0]" },
        { day: "THU", height: "55%", color: "bg-[#E2E8F0]" },
        { day: "FRI", height: "35%", color: "bg-[#E2E8F0]" },
        { day: "SAT", height: "68%", color: "bg-[#E2E8F0]" },
        { day: "SUN", height: "95%", color: "bg-[#C4B5FD]" },
    ];

    return (
        <div className="bg-[#1B1C24] border border-[#272835] rounded-3xl p-6 shadow-xl space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <h3 className="text-lg font-extrabold text-white tracking-tight">Weekly Progress</h3>
                <button className="p-2 rounded-xl bg-[#252632] text-[#9CA3AF] hover:text-white transition-colors">
                    <Calendar className="w-4 h-4" />
                </button>
            </div>

            {/* 7-Day Bar Chart */}
            <div className="h-28 flex items-end justify-between gap-3 px-2 pt-4">
                {weeklyData.map((bar) => (
                    <div key={bar.day} className="flex-1 flex flex-col items-center gap-2 h-full justify-end group">
                        <div className="w-full bg-[#121319] rounded-xl h-full flex items-end p-1">
                            <div
                                style={{ height: bar.height }}
                                className={`w-full rounded-lg transition-all duration-300 group-hover:opacity-90 ${bar.color}`}
                            />
                        </div>
                        <span className="text-[11px] font-bold text-[#7C8494]">{bar.day}</span>
                    </div>
                ))}
            </div>

            {/* 4 Metric Tiles Row */}
            <div className="grid grid-cols-4 gap-3 pt-2">
                {/* Tile 1: Soft Lavender Card */}
                <div className="bg-[#C4B5FD] text-[#121319] rounded-2xl p-4 flex flex-col justify-between shadow-md">
                    <span className="text-3xl font-black">8</span>
                    <span className="text-xs font-bold leading-tight mt-2 opacity-90">Autonomous Actions</span>
                </div>

                {/* Tile 2: Dark Card */}
                <div className="bg-[#252632] text-white rounded-2xl p-4 flex flex-col justify-between border border-[#2F303F]">
                    <span className="text-3xl font-black">5</span>
                    <span className="text-xs font-bold text-[#9CA3AF] leading-tight mt-2">Active Projects</span>
                </div>

                {/* Tile 3: Dark Card */}
                <div className="bg-[#252632] text-white rounded-2xl p-4 flex flex-col justify-between border border-[#2F303F]">
                    <span className="text-3xl font-black">3</span>
                    <span className="text-xs font-bold text-[#9CA3AF] leading-tight mt-2">Pending Approvals</span>
                </div>

                {/* Tile 4: Dark Card */}
                <div className="bg-[#252632] text-white rounded-2xl p-4 flex flex-col justify-between border border-[#2F303F]">
                    <span className="text-3xl font-black">82%</span>
                    <span className="text-xs font-bold text-[#9CA3AF] leading-tight mt-2">Business Health</span>
                </div>
            </div>
        </div>
    );
}
