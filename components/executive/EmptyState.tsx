"use client";

import React from "react";
import { FolderOpen } from "lucide-react";

interface EmptyStateProps {
    title: string;
    description: string;
    actionLabel?: string;
    onAction?: () => void;
}

export default function EmptyState({ title, description, actionLabel, onAction }: EmptyStateProps) {
    return (
        <div className="py-12 px-4 text-center flex flex-col items-center justify-center bg-[#131B2E] border border-[#1E293B] rounded-2xl">
            <div className="w-12 h-12 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-400 mb-3 shadow-inner">
                <FolderOpen className="w-6 h-6" />
            </div>
            <h3 className="text-base font-semibold text-slate-200">{title}</h3>
            <p className="text-xs text-slate-400 max-w-sm mt-1 mb-4">{description}</p>
            {actionLabel && onAction && (
                <button
                    onClick={onAction}
                    className="px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold shadow-md transition-all"
                >
                    {actionLabel}
                </button>
            )}
        </div>
    );
}
