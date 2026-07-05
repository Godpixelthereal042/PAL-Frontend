"use client";

import { Home, Folder, Telescope, Zap } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

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
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 w-[90%] max-w-[362px] z-50">
            <nav
                className="grid h-[77px] grid-cols-[68px_68px_68px_1fr] items-center rounded-full p-[5px] shadow-2xl"
                style={{
                    backgroundColor: 'rgba(18, 18, 24, 0.95)',
                    borderColor: 'rgba(255, 255, 255, 0.08)',
                    borderStyle: 'solid',
                    borderWidth: '1px',
                    color: '#ffffff',
                }}
            >
                <Link
                    href="/"
                    className="grid h-[66px] w-[66px] place-items-center rounded-full transition-all hover:opacity-85"
                    style={{
                        borderColor: 'rgba(255, 255, 255, 0.1)',
                        borderStyle: 'solid',
                        borderWidth: '1px',
                        backgroundColor: active === "home" ? '#2d7fe0' : 'rgba(255, 255, 255, 0.05)',
                        color: active === "home" ? '#ffffff' : '#a1a1aa'
                    }}
                >
                    <Home className="w-7 h-7" strokeWidth={1.5} style={{ color: active === "home" ? '#ffffff' : '#a1a1aa' }} />
                </Link>

                <Link
                    href="/projects"
                    className="grid h-[66px] w-[66px] place-items-center rounded-full transition-all hover:opacity-85"
                    style={{
                        borderColor: 'rgba(255, 255, 255, 0.1)',
                        borderStyle: 'solid',
                        borderWidth: '1px',
                        backgroundColor: active === "projects" ? '#2d7fe0' : 'rgba(255, 255, 255, 0.05)',
                        color: active === "projects" ? '#ffffff' : '#a1a1aa'
                    }}
                >
                    <Folder className="w-[26px] h-[26px]" strokeWidth={1.5} style={{ color: active === "projects" ? '#ffffff' : '#a1a1aa' }} />
                </Link>

                <Link
                    href="/research"
                    className="grid h-[66px] w-[66px] place-items-center rounded-full transition-all hover:opacity-85"
                    style={{
                        borderColor: 'rgba(255, 255, 255, 0.1)',
                        borderStyle: 'solid',
                        borderWidth: '1px',
                        backgroundColor: active === "research" ? '#2d7fe0' : 'rgba(255, 255, 255, 0.05)',
                        color: active === "research" ? '#ffffff' : '#a1a1aa'
                    }}
                >
                    <Telescope className="w-[26px] h-[26px]" strokeWidth={1.5} style={{ color: active === "research" ? '#ffffff' : '#a1a1aa' }} />
                </Link>

                <Link
                    href="/chat"
                    className="ml-[3px] flex h-[66px] items-center justify-center gap-[8px] px-[20px] rounded-full text-[17px] font-bold active:scale-95 transition-all"
                    style={{
                        borderColor: '#48b9ff',
                        borderStyle: 'solid',
                        borderWidth: '1.5px',
                        backgroundColor: '#2d7fe0',
                        color: '#ffffff'
                    }}
                >
                    <span>Chat</span>
                    <Zap className="w-[18px] h-[18px] fill-white" style={{ color: '#ffffff' }} />
                </Link>
            </nav>
        </div>
    );
}
