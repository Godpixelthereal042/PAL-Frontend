"use client";

import React from "react";

interface LoadingCardProps {
    className?: string;
}

export default function LoadingCard({ className = "" }: LoadingCardProps) {
    return (
        <div
            className={`bg-white border border-black/5 rounded-3xl p-6 overflow-hidden relative ${className}`}
        >
            <div className="animate-pulse space-y-4">
                <div className="h-3 bg-[#EEF0F4] rounded-full w-1/3" />
                <div className="h-2 bg-[#EEF0F4] rounded-full w-2/3" />
                <div className="h-2 bg-[#EEF0F4] rounded-full w-1/2" />
                <div className="h-10 bg-[#F5F7FA] rounded-2xl w-full mt-2" />
            </div>
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/60 to-transparent animate-[shimmer_2s_infinite] pointer-events-none" />
        </div>
    );
}
