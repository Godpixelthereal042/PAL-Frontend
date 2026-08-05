"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Check, ChevronDown } from "lucide-react";

export default function TimelineWidget({ events }: { events: any[] }) {
    const [showTime, setShowTime] = useState(true);
    const [selectedDate, setSelectedDate] = useState("Fr 18");

    return (
        <div className="mt-8 space-y-4 shrink-0">
            {/* Date Carousel */}
            <div className="flex justify-between items-center overflow-x-auto scrollbar-hide py-1 border-t border-[var(--app-card-border)] pt-4">
                {[
                    { day: "Tu", date: "15" },
                    { day: "We", date: "16" },
                    { day: "Th", date: "17" },
                    { day: "Fr", date: "18", isToday: true },
                    { day: "Sa", date: "19" },
                    { day: "Su", date: "20" },
                    { day: "Mo", date: "21" }
                ].map((d, i) => {
                    const key = `${d.day} ${d.date}`;
                    const isSelected = selectedDate === key || (selectedDate === "" && d.isToday);
                    return (
                        <button
                            key={i}
                            onClick={() => setSelectedDate(key)}
                            className="flex flex-col items-center gap-1.5 shrink-0 px-2.5 py-1.5 rounded-xl transition-all cursor-pointer"
                        >
                            <span className={`text-[10px] font-bold ${isSelected ? "text-white" : "text-[var(--app-text-muted)]"}`}>{d.day}</span>
                            <span className={`text-xs font-black w-6 h-6 flex items-center justify-center rounded-full transition-all ${
                                isSelected 
                                    ? "bg-[#2d7fe0] text-white shadow-md shadow-blue-500/20" 
                                    : "text-[var(--app-text-secondary)] hover:text-white"
                            }`}>
                                {d.date}
                            </span>
                            {d.isToday && !isSelected && (
                                <span className="w-1 h-1 rounded-full bg-blue-500" />
                            )}
                        </button>
                    );
                })}
            </div>

            {/* Calendar Controls */}
            <div className="flex justify-between items-center bg-[#121419]/60 border border-[var(--app-card-border)] rounded-2xl p-3.5">
                <button
                    onClick={() => setShowTime(prev => !prev)}
                    className="flex items-center gap-2.5 text-xs text-[var(--app-text-secondary)] hover:text-white transition-colors cursor-pointer"
                >
                    <div className={`w-4.5 h-4.5 rounded border flex items-center justify-center transition-all ${
                        showTime 
                            ? "bg-[#2d7fe0] border-blue-500 text-white" 
                            : "border-zinc-700 bg-transparent text-transparent"
                    }`}>
                        <Check size={11} strokeWidth={3} />
                    </div>
                    <span className="font-bold">Show timeline</span>
                </button>

                <button 
                    onClick={() => setSelectedDate("Fr 18")}
                    className="flex items-center gap-1 bg-zinc-900 border border-[var(--app-card-border)] px-3.5 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-wider text-zinc-300 hover:text-white transition-colors cursor-pointer"
                >
                    <span>Today</span>
                    <ChevronDown size={11} />
                </button>
            </div>

            {/* Timeline Grid (Conditional based on showTime) */}
            <AnimatePresence>
                {showTime && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        className="space-y-3 pt-1"
                    >
                        {(() => {
                            const selectedDayNum = selectedDate.split(" ")[1]; // e.g. "18"
                            const dayEvents = events.filter((e: any) => {
                                const parts = (e.date || "").split("-");
                                return parts[2] === selectedDayNum;
                            });

                            if (dayEvents.length === 0) {
                                return (
                                    <div className="text-center py-8 text-xs text-[var(--app-text-muted)] border border-dashed border-zinc-800/80 rounded-2xl">
                                        No meetings or tasks scheduled for this day
                                    </div>
                                );
                            }

                            return dayEvents.map((ev, idx) => (
                                <div key={ev.id || idx} className="flex gap-4 items-start">
                                    <span className="text-[10px] font-bold text-[var(--app-text-muted)] w-8 pt-1">{ev.time}</span>
                                    <div className="flex-1 bg-[#121419] border border-[var(--app-card-border)] rounded-2xl p-3 flex justify-between items-center">
                                        <div className="min-w-0">
                                            <h4 className="text-xs font-bold text-zinc-300">{ev.title}</h4>
                                            <span className="text-[9px] text-[var(--app-text-muted)] font-semibold block mt-0.5 uppercase tracking-wider">Schedule Event</span>
                                        </div>
                                    </div>
                                </div>
                            ));
                        })()}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
