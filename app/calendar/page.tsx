"use client";

import React from "react";
import CommunicationWorkspace from "@/components/CommunicationWorkspace";
import BottomNav from "@/components/BottomNav";
import { Calendar as CalendarIcon, ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";

export default function CalendarPage() {
    const router = useRouter();

    return (
        <div className="h-dvh bg-[var(--app-bg)] text-[var(--app-text)] w-full max-w-[430px] mx-auto relative shadow-2xl overflow-hidden selection:bg-blue-500/30 flex flex-col font-outfit">
            
            {/* Header Bar */}
            <div className="flex justify-between items-center p-4 pt-5 pb-2 shrink-0 z-30 bg-[var(--app-header-bg)] backdrop-blur-md border-b border-[var(--app-card-border)]">
                <button
                    onClick={() => router.push("/")}
                    className="grid h-[40px] w-[40px] place-items-center rounded-full border border-[var(--app-card-border)] bg-[var(--app-card-alt)] text-[var(--app-text-secondary)] hover:text-white transition-colors cursor-pointer"
                    aria-label="Back to home"
                >
                    <ArrowLeft size={18} />
                </button>

                <div className="flex items-center gap-2">
                    <CalendarIcon className="w-5 h-5 text-blue-400" />
                    <span className="text-sm font-bold text-white tracking-wide">Universal Calendar</span>
                </div>

                <div className="w-[40px]" />
            </div>

            {/* Main Communication & Universal Calendar Workspace */}
            <div className="flex-1 overflow-y-auto px-4 pb-28 pt-3 scrollbar-hide">
                <CommunicationWorkspace provider="google-calendar" initialTab="calendar" />
            </div>

            <BottomNav activePage="home" />
        </div>
    );
}
