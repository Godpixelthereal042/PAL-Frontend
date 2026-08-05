"use client";

import React, { useState, useEffect } from "react";
import { Sparkles, X, CheckCircle2, ThumbsUp, ThumbsDown, EyeOff, HelpCircle, ArrowRight } from "lucide-react";
import Link from "next/link";

interface ModalProps {
    isOpen: boolean;
    recommendationId: string;
    onClose: () => void;
}

export default function RecommendationInspectorModal({ isOpen, recommendationId, onClose }: ModalProps) {
    const [loading, setLoading] = useState(true);
    const [explanation, setExplanation] = useState<any>(null);
    const [feedbackSubmitted, setFeedbackSubmitted] = useState<string | null>(null);

    useEffect(() => {
        if (!isOpen) return;
        setLoading(true);
        setFeedbackSubmitted(null);

        async function fetchExplanation() {
            try {
                const res = await fetch(`/api/intelligence/explain?id=${encodeURIComponent(recommendationId)}`);
                const data = await res.json();
                if (data.success && data.explanation) {
                    setExplanation(data.explanation);
                }
            } catch (err) {
                console.error("Failed to load explanation:", err);
            } finally {
                setLoading(false);
            }
        }
        fetchExplanation();
    }, [isOpen, recommendationId]);

    async function sendFeedback(type: "helpful" | "not_helpful" | "dismissed" | "done" | "not_relevant") {
        try {
            setFeedbackSubmitted(type);
            await fetch("/api/intelligence/feedback", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ recommendationId, feedback: type }),
            });
        } catch (err) {
            console.error("Failed to submit feedback:", err);
        }
    }

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-[#131B2E] border border-[#1E293B] rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[85vh] animate-in fade-in zoom-in-95 duration-150">
                {/* Header */}
                <div className="p-4 border-b border-[#1E293B] flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <Sparkles className="w-5 h-5 text-purple-400" />
                        <h3 className="text-base font-bold text-slate-100">Recommendation Inspector</h3>
                    </div>
                    <button onClick={onClose} className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Body */}
                <div className="p-5 flex-1 overflow-y-auto space-y-6">
                    {loading ? (
                        <div className="py-12 text-center text-slate-400 text-sm animate-pulse">
                            Synthesizing evidence & confidence model...
                        </div>
                    ) : explanation ? (
                        <>
                            {/* Recommendation Summary */}
                            <div className="p-4 rounded-xl bg-purple-950/20 border border-purple-500/30 space-y-2">
                                <span className="text-[10px] font-bold uppercase tracking-wider text-purple-400">
                                    Strategic Guidance
                                </span>
                                <h4 className="text-base font-bold text-slate-100">{explanation.recommendation}</h4>
                                <p className="text-xs text-slate-300">Expected Outcome: {explanation.expectedImpact}</p>
                            </div>

                            {/* Why this recommendation exists */}
                            <div className="space-y-2">
                                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                                    Why This Recommendation Exists
                                </h4>
                                <div className="space-y-1.5">
                                    {explanation.why.map((reason: string, idx: number) => (
                                        <div key={idx} className="p-2.5 rounded-xl bg-slate-900/60 border border-slate-800 text-xs text-slate-200 flex items-start gap-2">
                                            <span className="w-1.5 h-1.5 rounded-full bg-purple-400 mt-1.5 shrink-0" />
                                            <span>{reason}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Supporting Evidence */}
                            <div className="space-y-2">
                                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                                    Supporting Business Evidence
                                </h4>
                                <div className="space-y-2">
                                    {explanation.supportingEvidence.map((ev: any, idx: number) => (
                                        <div key={idx} className="p-3 rounded-xl bg-slate-900/40 border border-slate-800/80 text-xs flex items-center justify-between">
                                            <span className="text-slate-300">{ev.description}</span>
                                            <span className="px-2 py-0.5 rounded text-[10px] uppercase font-mono font-bold bg-slate-800 text-slate-400">
                                                {ev.type}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Confidence Model */}
                            <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 flex items-center justify-between">
                                <div>
                                    <div className="text-xs font-bold text-slate-400 uppercase">Confidence Model</div>
                                    <div className="text-lg font-bold text-slate-100">
                                        Math: {Math.round(explanation.confidence.confidenceScore * 100)}% Confidence ({explanation.confidence.evidenceStrength} evidence)
                                    </div>
                                </div>
                                <div className="text-right text-xs text-emerald-400 font-semibold">
                                    Verified Evidence
                                </div>
                            </div>

                            {/* Feedback Section */}
                            <div className="pt-2 border-t border-[#1E293B] space-y-3">
                                <h4 className="text-xs font-bold text-slate-400 uppercase">Founder Feedback & Learning</h4>
                                {feedbackSubmitted ? (
                                    <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-semibold flex items-center gap-2">
                                        <CheckCircle2 className="w-4 h-4" /> Feedback recorded! PAL has adjusted future recommendation priorities.
                                    </div>
                                ) : (
                                    <div className="flex flex-wrap gap-2">
                                        <button
                                            onClick={() => sendFeedback("helpful")}
                                            className="px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-emerald-600/20 text-slate-300 hover:text-emerald-400 border border-slate-800 text-xs font-semibold flex items-center gap-1.5 transition-all"
                                        >
                                            <ThumbsUp className="w-3.5 h-3.5" /> Helpful
                                        </button>
                                        <button
                                            onClick={() => sendFeedback("not_helpful")}
                                            className="px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-rose-600/20 text-slate-300 hover:text-rose-400 border border-slate-800 text-xs font-semibold flex items-center gap-1.5 transition-all"
                                        >
                                            <ThumbsDown className="w-3.5 h-3.5" /> Not Helpful
                                        </button>
                                        <button
                                            onClick={() => sendFeedback("done")}
                                            className="px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-blue-600/20 text-slate-300 hover:text-blue-400 border border-slate-800 text-xs font-semibold flex items-center gap-1.5 transition-all"
                                        >
                                            <CheckCircle2 className="w-3.5 h-3.5" /> Already Done
                                        </button>
                                        <button
                                            onClick={() => sendFeedback("dismissed")}
                                            className="px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-400 border border-slate-800 text-xs font-semibold flex items-center gap-1.5 transition-all"
                                        >
                                            <EyeOff className="w-3.5 h-3.5" /> Dismiss
                                        </button>
                                    </div>
                                )}
                            </div>
                        </>
                    ) : (
                        <div className="py-8 text-center text-slate-500 text-sm">Failed to load explanation.</div>
                    )}
                </div>
            </div>
        </div>
    );
}
