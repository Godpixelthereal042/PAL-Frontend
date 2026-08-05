"use client";

import React from "react";
import Link from "next/link";
import { Zap } from "lucide-react";
import { PalLogoIcon, NavSearch, NavNotifications } from "@/components/icons";

interface HeaderProps {
    onOpenSearch: () => void;
    unreadNotifications?: number;
}

export default function Header({ onOpenSearch, unreadNotifications = 0 }: HeaderProps) {
    return (
        <header className="sticky top-0 z-30 pt-[calc(env(safe-area-inset-top,0px)+8px)] pb-2.5 bg-[#000000]/90 backdrop-blur-xl border-b border-white/10 px-3.5 sm:px-6 flex items-center justify-between gap-2.5 shrink-0 w-full">
            
            {/* PAL Brand Logo */}
            <Link href="/" className="flex items-center gap-2 shrink-0">
                <PalLogoIcon size={28} showText={true} />
            </Link>

            {/* Search Trigger */}
            <button
                onClick={onOpenSearch}
                className="flex items-center gap-3 px-4 py-2 bg-[#121620] border border-white/10 hover:border-[#2D7FE0]/50 rounded-full text-[#999CA5] hover:text-white text-xs font-semibold transition-all w-full max-w-md group"
            >
                <NavSearch size={16} className="text-[#999CA5] group-hover:text-[#2D7FE0] transition-colors" />
                <span className="flex-1 text-left truncate">
                    Search projects, tasks, connectors, executives...
                </span>
                <kbd className="hidden sm:inline-flex items-center gap-0.5 px-2 py-0.5 text-[10px] font-mono font-bold text-[#999CA5] bg-[#161B26] border border-white/10 rounded-md">
                    <span>⌘</span>K
                </kbd>
            </button>

            {/* Right Status & Actions */}
            <div className="flex items-center gap-3 shrink-0">
                {/* Live Context Sync Badge */}
                <div className="hidden lg:flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#22C55E]/15 border border-[#22C55E]/30 text-[#22C55E] text-xs font-bold">
                    <span className="w-2 h-2 rounded-full bg-[#22C55E] animate-pulse" />
                    <span>Live Context Sync</span>
                </div>

                {/* Quick Action Button */}
                <Link
                    href="/chat"
                    className="flex items-center gap-2 px-4 py-2 rounded-full bg-[#2D7FE0] hover:bg-[#2563EB] text-white text-xs font-bold shadow-lg shadow-blue-500/25 transition-all hover:scale-[1.02] active:scale-[0.98]"
                >
                    <span>Ask AI COO</span>
                    <Zap className="w-3.5 h-3.5 fill-white" />
                </Link>

                {/* Notification Trigger */}
                <Link
                    href="/notifications"
                    className="relative p-2.5 rounded-full bg-[#121620] border border-white/10 hover:border-white/20 text-[#999CA5] hover:text-white transition-colors"
                    title="Notifications"
                >
                    <NavNotifications size={18} />
                    {unreadNotifications > 0 && (
                        <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-[#EF4444]" />
                    )}
                </Link>
            </div>
        </header>
    );
}
