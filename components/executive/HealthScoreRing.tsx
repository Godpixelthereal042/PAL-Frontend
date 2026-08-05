"use client";

import React from "react";

interface HealthScoreRingProps {
    score: number; // 0 - 100
    size?: number;
    strokeWidth?: number;
    label?: string;
}

export default function HealthScoreRing({
    score = 75,
    size = 110,
    strokeWidth = 10,
    label = "Health Score",
}: HealthScoreRingProps) {
    const center = size / 2;
    const radius = center - strokeWidth / 2;
    const circumference = 2 * Math.PI * radius;
    const clampedScore = Math.max(0, Math.min(100, score));
    const strokeDashoffset = circumference - (clampedScore / 100) * circumference;

    let colorClass = "text-emerald-400";
    if (clampedScore < 50) colorClass = "text-rose-400";
    else if (clampedScore < 75) colorClass = "text-amber-400";

    return (
        <div className="flex flex-col items-center justify-center relative" style={{ width: size, height: size }}>
            <svg width={size} height={size} className="transform -rotate-90">
                {/* Background Track */}
                <circle
                    cx={center}
                    cy={center}
                    r={radius}
                    stroke="currentColor"
                    strokeWidth={strokeWidth}
                    className="text-slate-800"
                    fill="transparent"
                />
                {/* Score Ring */}
                <circle
                    cx={center}
                    cy={center}
                    r={radius}
                    stroke="currentColor"
                    strokeWidth={strokeWidth}
                    strokeDasharray={circumference}
                    strokeDashoffset={strokeDashoffset}
                    strokeLinecap="round"
                    className={`${colorClass} transition-all duration-700 ease-out`}
                    fill="transparent"
                />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                <span className="text-2xl font-bold text-slate-100 leading-none">{clampedScore}</span>
                {label && <span className="text-[9px] uppercase font-semibold text-slate-400 mt-1">{label}</span>}
            </div>
        </div>
    );
}
