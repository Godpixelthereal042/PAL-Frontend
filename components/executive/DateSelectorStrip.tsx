"use client";

import React, { useState } from "react";
import { ChevronLeft, ChevronRight, Search, Bell } from "lucide-react";

export function DateSelectorStrip({ onOpenSearch }: { onOpenSearch: () => void }) {
    const [selectedDate, setSelectedDate] = useState(15);

    const dates = [
        { day: 13, label: "Tue" },
        { day: 14, label: "Wed" },
        { day: 15, label: "Thu" },
        { day: 16, label: "Fri" },
        { day: 17, label: "Sat" },
    ];

    return (
        <div className="bg-white/80 backdrop-blur-md border border-[#EEF0F4] rounded-3xl p-4 shadow-[0_1px_3px_rgba(0,0,0,0.04)] space-y-4">
            {/* Top Bar: Month & Global Actions */}
            <div className="flex items-center justify-between">
                <div className="w-8 h-8 rounded-full bg-[#EDFCF2] border border-[#C6F0D5] flex items-center justify-center font-bold text-[#16a34a] text-xs">
                    PAL
                </div>

                <div className="flex items-center gap-2">
                    <button className="p-1 rounded-full text-[#7C8494] hover:text-[#1A1D26]">
                        <ChevronLeft className="w-4 h-4" />
                    </button>
                    <span className="text-sm font-bold text-[#1A1D26]">January 2026</span>
                    <button className="p-1 rounded-full text-[#7C8494] hover:text-[#1A1D26]">
                        <ChevronRight className="w-4 h-4" />
                    </button>
                </div>

                <div className="flex items-center gap-2">
                    <button
                        onClick={onOpenSearch}
                        className="p-2 rounded-full bg-[#F5F7FA] hover:bg-[#EFF5FF] text-[#7C8494] hover:text-[#3B7BF6] border border-[#E2E6ED] transition-colors"
                        title="Search"
                    >
                        <Search className="w-4 h-4" />
                    </button>
                    <button
                        className="p-2 rounded-full bg-[#F5F7FA] hover:bg-[#EFF5FF] text-[#7C8494] hover:text-[#3B7BF6] border border-[#E2E6ED] transition-colors relative"
                        title="Notifications"
                    >
                        <Bell className="w-4 h-4" />
                        <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-[#EF4444]" />
                    </button>
                </div>
            </div>

            {/* Date Pill Strip */}
            <div className="flex items-center justify-between gap-2 pt-1">
                {dates.map((d) => {
                    const isSelected = selectedDate === d.day;
                    return (
                        <button
                            key={d.day}
                            onClick={() => setSelectedDate(d.day)}
                            className={`flex-1 py-3 px-2 rounded-2xl flex flex-col items-center justify-center transition-all duration-200 ${
                                isSelected
                                    ? "bg-[#1A1D26] text-white shadow-md scale-105"
                                    : "bg-[#F5F7FA] text-[#7C8494] hover:bg-[#EFF5FF] hover:text-[#1A1D26]"
                            }`}
                        >
                            <span className="text-base font-extrabold">{d.day}</span>
                            <span className="text-[11px] font-medium opacity-80">{d.label}</span>
                        </button>
                    );
                })}
            </div>
        </div>
    );
}
