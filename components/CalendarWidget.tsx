"use client";

import React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface CalendarEvent {
    id: string;
    date: string; // YYYY-MM-DD
    time: string;
    title: string;
}

interface CalendarWidgetProps {
    events: CalendarEvent[];
    selectedDate: Date | null;
    setSelectedDate: (date: Date) => void;
    selectedTime: string | null;
    setSelectedTime: (time: string) => void;
    currentMonth: Date;
    setCurrentMonth: (date: Date) => void;
}

export default function CalendarWidget({
    events,
    selectedDate,
    setSelectedDate,
    selectedTime,
    setSelectedTime,
    currentMonth,
    setCurrentMonth
}: CalendarWidgetProps) {
    const times = ["17:30", "17:45", "18:00", "18:15", "18:30", "18:45"];

    const handlePrevMonth = () => {
        setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1));
    };

    const handleNextMonth = () => {
        setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1));
    };

    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();

    const firstDayOfMonth = new Date(year, month, 1);
    const startDayOfWeek = firstDayOfMonth.getDay(); // Sunday = 0
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const daysInPrevMonth = new Date(year, month, 0).getDate();

    const gridDays: { date: Date; isCurrentMonth: boolean }[] = [];

    // Prev month trailing days
    for (let i = startDayOfWeek - 1; i >= 0; i--) {
        const d = new Date(year, month - 1, daysInPrevMonth - i);
        gridDays.push({ date: d, isCurrentMonth: false });
    }

    // Current month days
    for (let i = 1; i <= daysInMonth; i++) {
        const d = new Date(year, month, i);
        gridDays.push({ date: d, isCurrentMonth: true });
    }

    // Next month trailing days to complete a 35 or 42 grid
    const totalCells = gridDays.length <= 35 ? 35 : 42;
    const remaining = totalCells - gridDays.length;
    for (let i = 1; i <= remaining; i++) {
        const d = new Date(year, month + 1, i);
        gridDays.push({ date: d, isCurrentMonth: false });
    }

    const isSameDay = (d1: Date, d2: Date) => {
        return (
            d1.getFullYear() === d2.getFullYear() &&
            d1.getMonth() === d2.getMonth() &&
            d1.getDate() === d2.getDate()
        );
    };

    return (
        <section className="rounded-[24px] border border-white/5 bg-[#0a0b0d] p-4.5 shadow-2xl font-outfit">
            {/* Split Calendar & Time Columns */}
            <div className="grid grid-cols-[1fr_80px] gap-6">
                {/* Left Column: Monthly Date Grid */}
                <div>
                    {/* Header: Month & Year Selector */}
                    <div className="flex items-center justify-between mb-4.5 px-0.5">
                        <div className="flex items-center gap-1">
                            <button
                                type="button"
                                onClick={handlePrevMonth}
                                className="text-zinc-500 hover:text-white p-1 transition cursor-pointer"
                                aria-label="Previous month"
                            >
                                <ChevronLeft size={16} />
                            </button>
                            <span className="text-[12.5px] font-extrabold text-white tracking-wide">
                                {currentMonth.toLocaleDateString("default", { month: "long", year: "numeric" })}
                            </span>
                            <button
                                type="button"
                                onClick={handleNextMonth}
                                className="text-zinc-500 hover:text-white p-1 transition cursor-pointer"
                                aria-label="Next month"
                            >
                                <ChevronRight size={16} />
                            </button>
                        </div>
                    </div>

                    {/* Weekday Initials Row */}
                    <div className="grid grid-cols-7 text-center text-[10px] font-bold text-zinc-600 mb-2.5">
                        <span>Su</span>
                        <span>Mo</span>
                        <span>Tu</span>
                        <span>We</span>
                        <span>Th</span>
                        <span>Fr</span>
                        <span>Sa</span>
                    </div>

                    {/* Date Grid */}
                    <div className="grid grid-cols-7 gap-y-2 gap-x-1 text-center">
                        {gridDays.map(({ date: d, isCurrentMonth }, idx) => {
                            const isSelected = selectedDate ? isSameDay(d, selectedDate) : false;
                            
                            // Check if there is an event on this day
                            const formattedDateStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
                            const hasEventOnDay = isCurrentMonth && events.some((e: any) => e.date === formattedDateStr);
                            
                            let dateStyleClass = "text-zinc-600 opacity-40";
                            let containerStyle = {};

                            if (isCurrentMonth) {
                                if (isSelected) {
                                    dateStyleClass = "calendar-day-active";
                                } else if (hasEventOnDay) {
                                    dateStyleClass = "text-[#8cb4e6] font-bold";
                                    containerStyle = {
                                        backgroundColor: "#111b2d"
                                    };
                                } else {
                                    dateStyleClass = "text-zinc-400 hover:text-white hover:bg-white/5";
                                }
                            }

                            return (
                                <button
                                    key={idx}
                                    type="button"
                                    onClick={() => isCurrentMonth && setSelectedDate(d)}
                                    style={containerStyle}
                                    className={`w-[26px] h-[26px] mx-auto rounded-[8px] flex items-center justify-center text-[10.5px] transition-all cursor-pointer ${dateStyleClass}`}
                                >
                                    {d.getDate()}
                                </button>
                            );
                        })}
                    </div>
                </div>

                {/* Right Column: Time List */}
                <div className="border-l border-white/5 pl-4 flex flex-col justify-start">
                    <span className="text-[10px] font-bold text-zinc-600 tracking-wider uppercase mb-4 text-center">
                        Time
                    </span>
                    <div className="flex flex-col gap-2">
                        {times.map((time) => {
                            const isSelectedTime = time === selectedTime;
                            
                            // Check if there is an event at this time on the selected date
                            const selectedDateStr = selectedDate 
                                ? `${selectedDate.getFullYear()}-${String(selectedDate.getMonth() + 1).padStart(2, '0')}-${String(selectedDate.getDate()).padStart(2, '0')}`
                                : "";
                            const hasEventAtTime = selectedDateStr ? events.some((e: any) => e.date === selectedDateStr && e.time === time) : false;

                            let timeStyleClass = "text-zinc-500 hover:text-white";
                            let containerStyle = {};

                            if (isSelectedTime) {
                                timeStyleClass = "calendar-time-active";
                            } else if (hasEventAtTime) {
                                timeStyleClass = "text-zinc-300 font-medium";
                                containerStyle = {
                                    backgroundColor: "#181a20"
                                };
                            }

                            return (
                                <button
                                    key={time}
                                    type="button"
                                    onClick={() => setSelectedTime(time)}
                                    style={containerStyle}
                                    className={`w-full py-1 text-center rounded-[8px] text-[10px] transition-all cursor-pointer ${timeStyleClass}`}
                                >
                                    {time}
                                </button>
                            );
                        })}
                    </div>
                </div>
            </div>
        </section>
    );
}
