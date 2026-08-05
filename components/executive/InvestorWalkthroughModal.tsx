"use client";

import React, { useState } from "react";

interface InvestorWalkthroughModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export function InvestorWalkthroughModal({ isOpen, onClose }: InvestorWalkthroughModalProps) {
    const [slide, setSlide] = useState<1 | 2 | 3 | 4>(1);

    if (!isOpen) return null;

    const slides = [
        {
            title: "1. Natural Language Intent → OKRs",
            desc: "Founders input executive goals (e.g. 'Increase MRR by 20% in 90 days'). PAL compiles structured OKRs with metric targets.",
            badge: "AI Strategy Engine"
        },
        {
            title: "2. Autonomous Council Debate & Risk Simulation",
            desc: "CEO, CFO, COO, CTO, and CMO agents vote on proposals and simulate 50 Monte Carlo risk outcomes before execution.",
            badge: "Multi-Agent Governance"
        },
        {
            title: "3. SaaS Connector Execution & Hash Chain",
            desc: "Domain workers execute via Gmail, Calendar, Stripe, and CRM connectors with dry-run safety gating & SHA-256 tamper-evident decision ledgering.",
            badge: "Security & Execution"
        },
        {
            title: "4. Business Model & Commercial Monetization",
            desc: "High-margin B2B SaaS subscription ($99/mo Pro, $499/mo Business) targeting 500,000 SMB founders and executive teams.",
            badge: "Market Opportunity"
        }
    ];

    const current = slides[slide - 1];

    return (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="max-w-xl w-full bg-slate-900 border border-slate-800 rounded-3xl p-8 shadow-2xl space-y-6">
                <div className="flex items-center justify-between">
                    <span className="px-3 py-1 bg-indigo-500/10 text-indigo-400 text-xs font-mono rounded-full border border-indigo-500/20">
                        {current.badge}
                    </span>
                    <button onClick={onClose} className="text-slate-400 hover:text-white text-sm font-mono">
                        Close ✕
                    </button>
                </div>

                <div className="space-y-2 py-4">
                    <h3 className="text-xl font-bold text-slate-100">{current.title}</h3>
                    <p className="text-sm text-slate-300 leading-relaxed">{current.desc}</p>
                </div>

                <div className="flex items-center justify-between border-t border-slate-800/80 pt-4">
                    <div className="flex gap-1.5">
                        {[1, 2, 3, 4].map(s => (
                            <div
                                key={s}
                                onClick={() => setSlide(s as any)}
                                className={`w-8 h-2 rounded-full cursor-pointer transition-all ${
                                    s === slide ? "bg-indigo-500" : "bg-slate-800"
                                }`}
                            />
                        ))}
                    </div>

                    <div className="flex gap-2">
                        {slide > 1 && (
                            <button
                                onClick={() => setSlide((slide - 1) as any)}
                                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium rounded-xl"
                            >
                                Previous
                            </button>
                        )}
                        {slide < 4 ? (
                            <button
                                onClick={() => setSlide((slide + 1) as any)}
                                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-medium rounded-xl"
                            >
                                Next ➔
                            </button>
                        ) : (
                            <button
                                onClick={onClose}
                                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-medium rounded-xl"
                            >
                                Complete Walkthrough ✓
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
