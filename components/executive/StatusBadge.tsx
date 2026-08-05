"use client";

import React from "react";

export type StatusVariant =
    | "healthy"
    | "success"
    | "warning"
    | "at_risk"
    | "critical"
    | "danger"
    | "info"
    | "inactive"
    | "neutral";

interface StatusBadgeProps {
    label: string;
    variant?: StatusVariant;
}

const variantStyles: Record<string, string> = {
    healthy: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30",
    success: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30",
    warning: "bg-amber-500/15 text-amber-400 border-amber-500/30",
    at_risk: "bg-amber-500/15 text-amber-400 border-amber-500/30",
    critical: "bg-rose-500/15 text-rose-400 border-rose-500/30",
    danger: "bg-rose-500/15 text-rose-400 border-rose-500/30",
    info: "bg-blue-500/15 text-blue-400 border-blue-500/30",
    inactive: "bg-slate-800 text-slate-400 border-slate-700",
    neutral: "bg-slate-800 text-slate-300 border-slate-700",
};

const dotColors: Record<string, string> = {
    healthy: "bg-emerald-400",
    success: "bg-emerald-400",
    warning: "bg-amber-400",
    at_risk: "bg-amber-400",
    critical: "bg-rose-400",
    danger: "bg-rose-400",
    info: "bg-blue-400",
    inactive: "bg-slate-400",
    neutral: "bg-slate-400",
};

export default function StatusBadge({ label, variant = "neutral" }: StatusBadgeProps) {
    const style = variantStyles[variant] || variantStyles.neutral;
    const dot = dotColors[variant] || dotColors.neutral;

    return (
        <span
            className={`inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-semibold border ${style}`}
        >
            <span className={`w-1.5 h-1.5 rounded-full mr-1.5 ${dot}`} />
            {label}
        </span>
    );
}
