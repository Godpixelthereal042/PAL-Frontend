"use client";

import React from "react";
import Link from "next/link";
import { FolderKanban, ArrowRight, Layers, Sparkles } from "lucide-react";

export function ActiveProjectsBento() {
    const totalSegments = 24;
    const completedSegments = 19; // ~80%

    return (
        <div className="bg-white border border-[#EEF0F4] rounded-3xl p-6 shadow-[0_1px_3px_rgba(0,0,0,0.04),0_4px_16px_rgba(0,0,0,0.03)] space-y-5">
            {/* Header */}
            <div className="flex items-center justify-between">
                <h3 className="text-base font-bold text-[#1A1D26]">Active Workflows & Projects</h3>
                <Link
                    href="/projects"
                    className="text-xs font-semibold text-[#7C8494] hover:text-[#3B7BF6] flex items-center gap-1 transition-colors"
                >
                    <span>View all</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                </Link>
            </div>

            {/* Active Project Card 1 */}
            <div className="bg-[#F5F7FA] border border-[#E2E6ED] rounded-2xl p-5 hover:border-[#C8DEFF] transition-all space-y-4">
                <div className="flex items-start justify-between gap-4">
                    <div className="space-y-1.5 flex-1">
                        {/* Avatars */}
                        <div className="flex items-center -space-x-2">
                            <div className="w-6 h-6 rounded-full bg-[#3B7BF6] text-white text-[10px] font-bold flex items-center justify-center border-2 border-white">
                                S
                            </div>
                            <div className="w-6 h-6 rounded-full bg-[#6C5CE7] text-white text-[10px] font-bold flex items-center justify-center border-2 border-white">
                                K
                            </div>
                            <div className="w-6 h-6 rounded-full bg-[#EC4899] text-white text-[10px] font-bold flex items-center justify-center border-2 border-white">
                                Y
                            </div>
                            <span className="text-[10px] font-bold text-[#7C8494] pl-3">+4 team</span>
                        </div>

                        <h4 className="text-base font-bold text-[#1A1D26] pt-1">
                            Series A Pitch Deck & Growth OKRs
                        </h4>
                        <p className="text-xs text-[#7C8494]">28 milestones • 17 hours logged</p>
                    </div>

                    {/* 3D Glass Folder Graphic Card */}
                    <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#EFF5FF] to-[#DDD0FD] border border-[#C8DEFF] flex items-center justify-center text-[#3B7BF6] shadow-sm shrink-0 hover:scale-105 transition-transform cursor-pointer">
                        <FolderKanban className="w-8 h-8 text-[#3B7BF6]" />
                    </div>
                </div>

                {/* Segmented Progress Bar (matching reference image) */}
                <div className="space-y-2 pt-1">
                    <div className="flex items-center gap-1 w-full overflow-hidden">
                        {Array.from({ length: totalSegments }).map((_, idx) => (
                            <div
                                key={idx}
                                className={`h-3 flex-1 rounded-full transition-all ${
                                    idx < completedSegments
                                        ? "bg-[#3B7BF6]"
                                        : "bg-[#EEF0F4]"
                                }`}
                            />
                        ))}
                    </div>
                    <div className="flex items-center justify-between text-xs text-[#7C8494] font-medium pt-0.5">
                        <span>80% completed</span>
                        <span>5 milestones left</span>
                    </div>
                </div>
            </div>

            {/* Active Project Card 2 */}
            <div className="bg-[#F5F7FA] border border-[#E2E6ED] rounded-2xl p-5 hover:border-[#DDD0FD] transition-all space-y-4">
                <div className="flex items-start justify-between gap-4">
                    <div className="space-y-1.5 flex-1">
                        <div className="flex items-center -space-x-2">
                            <div className="w-6 h-6 rounded-full bg-[#16a34a] text-white text-[10px] font-bold flex items-center justify-center border-2 border-white">
                                L
                            </div>
                            <div className="w-6 h-6 rounded-full bg-[#F59E0B] text-white text-[10px] font-bold flex items-center justify-center border-2 border-white">
                                M
                            </div>
                            <span className="text-[10px] font-bold text-[#7C8494] pl-3">+2 team</span>
                        </div>

                        <h4 className="text-base font-bold text-[#1A1D26] pt-1">
                            Customer Onboarding & Retention Portal
                        </h4>
                        <p className="text-xs text-[#7C8494]">14 milestones • 9 hours logged</p>
                    </div>

                    <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#EDFCF2] to-[#FFF9F0] border border-[#C6F0D5] flex items-center justify-center text-[#16a34a] shadow-sm shrink-0 hover:scale-105 transition-transform cursor-pointer">
                        <Layers className="w-8 h-8 text-[#16a34a]" />
                    </div>
                </div>

                <div className="space-y-2 pt-1">
                    <div className="flex items-center gap-1 w-full overflow-hidden">
                        {Array.from({ length: totalSegments }).map((_, idx) => (
                            <div
                                key={idx}
                                className={`h-3 flex-1 rounded-full transition-all ${
                                    idx < 11
                                        ? "bg-[#6C5CE7]"
                                        : "bg-[#EEF0F4]"
                                }`}
                            />
                        ))}
                    </div>
                    <div className="flex items-center justify-between text-xs text-[#7C8494] font-medium pt-0.5">
                        <span>45% completed</span>
                        <span>13 milestones left</span>
                    </div>
                </div>
            </div>
        </div>
    );
}
