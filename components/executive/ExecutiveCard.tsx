"use client";

import React from "react";

interface ExecutiveCardProps {
    children: React.ReactNode;
    className?: string;
    title?: string;
    subtitle?: string;
    action?: React.ReactNode;
    tint?: string;
}

export default function ExecutiveCard({ children, className = "", title, subtitle, action }: ExecutiveCardProps) {
    return (
        <div
            className={`
                bg-[#121620] border border-white/10 hover:border-white/20
                rounded-3xl p-6 shadow-xl shadow-black/40 transition-all duration-300
                flex flex-col relative overflow-hidden ${className}
            `}
        >
            {(title || action) && (
                <div className="flex items-center justify-between gap-4 mb-4 pb-3 border-b border-white/10">
                    <div>
                        {title && <h3 className="text-base font-bold text-white tracking-wide">{title}</h3>}
                        {subtitle && <p className="text-xs text-[#999CA5] mt-0.5">{subtitle}</p>}
                    </div>
                    {action && <div>{action}</div>}
                </div>
            )}
            <div className="flex-1">{children}</div>
        </div>
    );
}
