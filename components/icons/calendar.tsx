"use client";

import React from "react";
import {
    Calendar as CalendarLucide,
    Clock,
    Video,
    CheckCircle2,
    AlertCircle,
    ChevronLeft,
    ChevronRight,
    LucideProps
} from "lucide-react";
import { IconProps } from "./navigation";

export function CalendarMain({ size = 20, strokeWidth = 1.5, className = "", ...props }: IconProps) {
    return <CalendarLucide size={size} strokeWidth={strokeWidth} className={className} aria-label="Calendar" {...props} />;
}

export function CalendarTime({ size = 18, strokeWidth = 1.5, className = "", ...props }: IconProps) {
    return <Clock size={size} strokeWidth={strokeWidth} className={className} aria-label="Time" {...props} />;
}

export function CalendarVideo({ size = 18, strokeWidth = 1.5, className = "", ...props }: IconProps) {
    return <Video size={size} strokeWidth={strokeWidth} className={className} aria-label="Video Call" {...props} />;
}

export function CalendarCompleted({ size = 18, strokeWidth = 1.5, className = "", ...props }: IconProps) {
    return <CheckCircle2 size={size} strokeWidth={strokeWidth} className={className} aria-label="Completed Event" {...props} />;
}

export function CalendarUrgent({ size = 18, strokeWidth = 1.5, className = "", ...props }: IconProps) {
    return <AlertCircle size={size} strokeWidth={strokeWidth} className={className} aria-label="Urgent Event" {...props} />;
}

export function CalendarPrev({ size = 18, strokeWidth = 1.5, className = "", ...props }: IconProps) {
    return <ChevronLeft size={size} strokeWidth={strokeWidth} className={className} aria-label="Previous Period" {...props} />;
}

export function CalendarNext({ size = 18, strokeWidth = 1.5, className = "", ...props }: IconProps) {
    return <ChevronRight size={size} strokeWidth={strokeWidth} className={className} aria-label="Next Period" {...props} />;
}
