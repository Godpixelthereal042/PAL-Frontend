"use client";

import React, { useState } from "react";
import { Sparkles, ArrowRight, CheckCircle2, HelpCircle } from "lucide-react";
import Link from "next/link";
import RecommendationInspectorModal from "./RecommendationInspectorModal";

interface AIRecommendationBannerProps {
    recommendation?: {
        id?: string;
        title: string;
        actionLabel: string;
        actionUrl: string;
        why: string;
    };
}

export default function AIRecommendationBanner({ recommendation }: AIRecommendationBannerProps) {
    const [inspectorOpen, setInspectorOpen] = useState(false);

    const id = recommendation?.id || "rec_default";
    const title =
        recommendation?.title ||
        "Investor follow-up with Sarah Jenkins is overdue by 3 days. Completing it today improves relationship health and unlocks next funding conversation.";
    const actionLabel = recommendation?.actionLabel || "Execute Action Now";
    const actionUrl = recommendation?.actionUrl || "/chat";
    const why = recommendation?.why || "High strategic impact on Q3 funding & stakeholder trust";

    return (
        <>
            <div className="relative overflow-hidden rounded-3xl bg-[#121620] border border-white/10 p-6 shadow-xl group">
                <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                    <div className="flex items-start gap-3.5 flex-1">
                        <div className="w-10 h-10 rounded-2xl bg-[#2D7FE0]/20 border border-[#2D7FE0]/40 flex items-center justify-center text-[#2D7FE0] shrink-0 mt-0.5">
                            <Sparkles className="w-5 h-5 animate-pulse" />
                        </div>
                        <div className="space-y-1.5">
                            <div className="flex items-center gap-2 flex-wrap">
                                <span className="text-xs font-bold uppercase tracking-wider text-[#2D7FE0]">
                                    AI COO Top Recommendation
                                </span>
                                <span className="px-2.5 py-0.5 text-[10px] font-semibold bg-[#2D7FE0]/20 text-[#2D7FE0] rounded-full border border-[#2D7FE0]/30">
                                    Priority #1
                                </span>
                                <button
                                    onClick={() => setInspectorOpen(true)}
                                    className="px-2 py-0.5 text-[10px] font-semibold bg-[#161B26] text-[#999CA5] hover:text-white rounded-full border border-white/10 transition-all flex items-center gap-1 ml-1"
                                >
                                    <HelpCircle className="w-3 h-3" /> Why?
                                </button>
                            </div>
                            <p className="text-sm md:text-base font-bold text-white leading-snug">{title}</p>
                            <p className="text-xs text-[#999CA5] flex items-center gap-1.5 pt-0.5">
                                <CheckCircle2 className="w-3.5 h-3.5 text-[#22C55E] shrink-0" />
                                <span>Why: {why}</span>
                            </p>
                        </div>
                    </div>

                    <Link
                        href={actionUrl}
                        className="px-5 py-3 rounded-full bg-[#2D7FE0] hover:bg-[#2563EB] text-white text-xs font-bold shadow-lg shadow-blue-500/25 transition-transform hover:scale-[1.02] active:scale-[0.98] flex items-center gap-2 shrink-0 self-end md:self-auto"
                    >
                        <span>{actionLabel}</span>
                        <ArrowRight className="w-4 h-4" />
                    </Link>
                </div>
            </div>

            <RecommendationInspectorModal
                isOpen={inspectorOpen}
                onClose={() => setInspectorOpen(false)}
                recommendationId={id}
            />
        </>
    );
}
