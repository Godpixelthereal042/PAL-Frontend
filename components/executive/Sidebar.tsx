"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
    LayoutGrid,
    BarChart2,
    Calendar,
    MessageSquare,
    Users,
    LogOut,
    Bot
} from "lucide-react";
import PALLogo from "../ui/PALLogo";

export interface SidebarProps {
    unreadNotifications?: number;
}

export default function Sidebar({ unreadNotifications = 4 }: SidebarProps) {
    const pathname = usePathname();

    const navItems = [
        { name: "Dashboard", href: "/", icon: LayoutGrid, isGrid: true },
        { name: "Analytics", href: "/reports", icon: BarChart2 },
        { name: "Calendar", href: "/calendar", icon: Calendar },
        { name: "AI COO Chat", href: "/chat", icon: MessageSquare, badge: unreadNotifications },
        { name: "Team & Stakeholders", href: "/relationships", icon: Users },
    ];

    return (
        <aside className="w-20 shrink-0 bg-[#121319] border-r border-[#1F202A] flex flex-col items-center justify-between py-6 h-screen sticky top-0 z-40 select-none">
            {/* Top Logo */}
            <div className="flex flex-col items-center gap-1">
                <Link href="/" className="flex flex-col items-center group">
                    <div className="w-10 h-10 bg-[#1A1D24] rounded-xl flex items-center justify-center border border-[#2A2E37] shadow-sm">
                        <PALLogo width={20} height={20} />
                    </div>
                </Link>
            </div>

            {/* Navigation Icons Stack */}
            <nav className="flex flex-col items-center gap-4 w-full px-3">
                {navItems.map((item) => {
                    const Icon = item.icon;
                    const isActive = pathname === item.href;

                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={`relative w-12 h-12 rounded-2xl flex items-center justify-center transition-all duration-200 ${
                                isActive
                                    ? "bg-[#E2E8F0] text-[#121319] shadow-md shadow-white/10 scale-105"
                                    : "text-[#7C8494] hover:text-white hover:bg-[#1B1C24]"
                            }`}
                            title={item.name}
                        >
                            <Icon className="w-5 h-5" />
                            {item.badge && item.badge > 0 && (
                                <span className="absolute top-2 right-2 w-4 h-4 rounded-full bg-[#6C5CE7] text-white text-[9px] font-bold flex items-center justify-center border-2 border-[#121319]">
                                    {item.badge}
                                </span>
                            )}
                        </Link>
                    );
                })}
            </nav>

            {/* Bottom Actions: User Avatar & Logout */}
            <div className="flex flex-col items-center gap-4">
                <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-white/20 shadow-md cursor-pointer hover:border-white transition-all">
                    <img
                        src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80"
                        alt="User Avatar"
                        className="w-full h-full object-cover"
                    />
                </div>
                <button
                    className="p-2.5 rounded-xl text-[#7C8494] hover:text-rose-400 hover:bg-[#1B1C24] transition-colors"
                    title="Logout"
                >
                    <LogOut className="w-5 h-5" />
                </button>
            </div>
        </aside>
    );
}
