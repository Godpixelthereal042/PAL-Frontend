"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Folder, Telescope, Zap } from "lucide-react";

export function FloatingBottomNav() {
    const pathname = usePathname();

    return (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50">
            <div className="flex items-center gap-3 px-4 py-2.5 bg-[#11151F]/90 backdrop-blur-xl border border-white/15 rounded-full shadow-[0_8px_32px_rgba(0,0,0,0.6)]">
                {/* 1. Home Button */}
                <Link
                    href="/"
                    className={`w-12 h-12 rounded-full flex items-center justify-center transition-all ${
                        pathname === "/"
                            ? "bg-[#2D7FE0] text-white shadow-lg shadow-blue-500/30 scale-105"
                            : "bg-[#1A202C] text-[#999CA5] hover:text-white hover:bg-[#232B3B]"
                    }`}
                    title="Home"
                >
                    <Home className="w-5 h-5" />
                </Link>

                {/* 2. Projects Folder Button */}
                <Link
                    href="/projects"
                    className={`w-12 h-12 rounded-full flex items-center justify-center transition-all ${
                        pathname === "/projects"
                            ? "bg-[#2D7FE0] text-white shadow-lg shadow-blue-500/30 scale-105"
                            : "bg-[#1A202C] text-[#999CA5] hover:text-white hover:bg-[#232B3B]"
                    }`}
                    title="Projects"
                >
                    <Folder className="w-5 h-5" />
                </Link>

                {/* 3. Research / Telescope Button */}
                <Link
                    href="/business-brain"
                    className={`w-12 h-12 rounded-full flex items-center justify-center transition-all ${
                        pathname === "/business-brain" || pathname === "/research"
                            ? "bg-[#2D7FE0] text-white shadow-lg shadow-blue-500/30 scale-105"
                            : "bg-[#1A202C] text-[#999CA5] hover:text-white hover:bg-[#232B3B]"
                    }`}
                    title="Research & Memory"
                >
                    <Telescope className="w-5 h-5" />
                </Link>

                {/* 4. Chat Pill Button */}
                <Link
                    href="/chat"
                    className={`px-6 h-12 rounded-full font-bold text-sm flex items-center gap-2 transition-all shadow-lg ${
                        pathname === "/chat"
                            ? "bg-[#3B82F6] text-white shadow-blue-500/40 scale-105"
                            : "bg-[#2D7FE0] hover:bg-[#2563EB] text-white shadow-blue-500/25"
                    }`}
                >
                    <span>Chat</span>
                    <Zap className="w-4 h-4 fill-white" />
                </Link>
            </div>
        </div>
    );
}
