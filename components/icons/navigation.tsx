"use client";

import React from "react";
import {
    Home,
    FolderKanban,
    BarChart3,
    MessageSquare,
    Calendar,
    Telescope,
    Settings,
    Bell,
    Search,
    LucideProps
} from "lucide-react";

export interface IconProps extends Omit<LucideProps, "ref"> {
    size?: number;
    className?: string;
}

// ─── NAV SCALE: DEFAULT 24px, STROKE WIDTH 1.5 ────────────────

export function NavHome({ size = 24, strokeWidth = 1.5, className = "", ...props }: IconProps) {
    return <Home size={size} strokeWidth={strokeWidth} className={className} aria-label="Home" {...props} />;
}

export function NavProjects({ size = 24, strokeWidth = 1.5, className = "", ...props }: IconProps) {
    return <FolderKanban size={size} strokeWidth={strokeWidth} className={className} aria-label="Projects" {...props} />;
}

export function NavAnalytics({ size = 24, strokeWidth = 1.5, className = "", ...props }: IconProps) {
    return <BarChart3 size={size} strokeWidth={strokeWidth} className={className} aria-label="Analytics" {...props} />;
}

export function NavChat({ size = 24, strokeWidth = 1.5, className = "", ...props }: IconProps) {
    return <MessageSquare size={size} strokeWidth={strokeWidth} className={className} aria-label="Chat" {...props} />;
}

export function NavCalendar({ size = 24, strokeWidth = 1.5, className = "", ...props }: IconProps) {
    return <Calendar size={size} strokeWidth={strokeWidth} className={className} aria-label="Calendar" {...props} />;
}

export function NavResearch({ size = 24, strokeWidth = 1.5, className = "", ...props }: IconProps) {
    return <Telescope size={size} strokeWidth={strokeWidth} className={className} aria-label="Research" {...props} />;
}

export function NavSettings({ size = 24, strokeWidth = 1.5, className = "", ...props }: IconProps) {
    return <Settings size={size} strokeWidth={strokeWidth} className={className} aria-label="Settings" {...props} />;
}

export function NavNotifications({ size = 24, strokeWidth = 1.5, className = "", ...props }: IconProps) {
    return <Bell size={size} strokeWidth={strokeWidth} className={className} aria-label="Notifications" {...props} />;
}

export function NavSearch({ size = 24, strokeWidth = 1.5, className = "", ...props }: IconProps) {
    return <Search size={size} strokeWidth={strokeWidth} className={className} aria-label="Search" {...props} />;
}
