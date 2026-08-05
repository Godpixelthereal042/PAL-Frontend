"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Zap } from "lucide-react";
import { NavHome, NavProjects, NavResearch } from "@/components/icons";

interface BottomNavProps {
    activePage?: "home" | "chat" | "research" | "projects";
}

export default function BottomNav({ activePage }: BottomNavProps) {
    const pathname = usePathname();
    
    const active = activePage ?? (
        pathname === "/" ? "home" :
        pathname.startsWith("/chat") ? "chat" :
        pathname.startsWith("/research") ? "research" :
        pathname.startsWith("/projects") ? "projects" :
        "home"
    );

    return (
        <div className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[430px] px-3.5 z-50 pb-[calc(env(safe-area-inset-bottom,0px)+12px)] pointer-events-none">
            <nav
                className="pointer-events-auto flex items-center justify-between h-[66px] rounded-full p-1.5 shadow-2xl backdrop-blur-xl border border-white/10 bg-[#121218]/95 gap-1.5"
            >
                <Link
                    href="/"
                    className="flex-1 max-w-[54px] h-[54px] flex items-center justify-center rounded-full transition-all hover:opacity-85 border border-white/10 min-h-[44px] min-w-[44px]"
                    style={{
                        backgroundColor: active === "home" ? '#2d7fe0' : 'rgba(255, 255, 255, 0.05)',
                        color: active === "home" ? '#ffffff' : '#a1a1aa'
                    }}
                    title="Home"
                >
                    <NavHome size={22} style={{ color: active === "home" ? '#ffffff' : '#a1a1aa' }} />
                </Link>

                <Link
                    href="/projects"
                    className="flex-1 max-w-[54px] h-[54px] flex items-center justify-center rounded-full transition-all hover:opacity-85 border border-white/10 min-h-[44px] min-w-[44px]"
                    style={{
                        backgroundColor: active === "projects" ? '#2d7fe0' : 'rgba(255, 255, 255, 0.05)',
                        color: active === "projects" ? '#ffffff' : '#a1a1aa'
                    }}
                    title="Projects"
                >
                    <NavProjects size={22} style={{ color: active === "projects" ? '#ffffff' : '#a1a1aa' }} />
                </Link>

                <Link
                    href="/research"
                    className="flex-1 max-w-[54px] h-[54px] flex items-center justify-center rounded-full transition-all hover:opacity-85 border border-white/10 min-h-[44px] min-w-[44px]"
                    style={{
                        backgroundColor: active === "research" ? '#2d7fe0' : 'rgba(255, 255, 255, 0.05)',
                        color: active === "research" ? '#ffffff' : '#a1a1aa'
                    }}
                    title="Research"
                >
                    <NavResearch size={22} style={{ color: active === "research" ? '#ffffff' : '#a1a1aa' }} />
                </Link>

                <Link
                    href="/chat"
                    className="flex-2 h-[54px] flex items-center justify-center gap-2 px-5 rounded-full text-base font-bold active:scale-95 transition-all border border-[#48b9ff] bg-[#2d7fe0] text-white min-h-[44px] shrink-0"
                    title="Chat"
                >
                    <span>Chat</span>
                    <Zap className="w-[18px] h-[18px] fill-white" style={{ color: '#ffffff' }} />
                </Link>
            </nav>
        </div>
    );
}
