"use client";

import React, { useState } from "react";
import { DecisionTimeline } from "./DecisionTimeline";
import type { GoldenPathExecutionResult } from "@/lib/workflows/goldenPathWorkflow";
import { Rocket, ShieldCheck, Play } from "lucide-react";
import { useToast } from "@/components/ui/ToastProvider";

export function InvestorDemoCockpit() {
    const { showToast } = useToast();
    const [prompt, setPrompt] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [result, setResult] = useState<GoldenPathExecutionResult | null>(null);
    const [error, setError] = useState<string | null>(null);

    const demoScenarios = [
        {
            title: "📈 Revenue Growth",
            prompt: "PAL, analyze my business performance and help me increase revenue by 20% in 90 days.",
            budgetLimitUSD: 5000,
            desc: "Triggers growth OKRs, 5 council votes, Monte Carlo risk simulation, & approval gate."
        },
        {
            title: "✂️ Cost Reduction",
            prompt: "My expenses increased by 30%. Find the problem and reduce monthly burn.",
            budgetLimitUSD: 800,
            desc: "Triggers SaaS vendor audit, CFO/COO approval, & auto-execution within policy limit."
        },
        {
            title: "🤝 Customer Follow-up",
            prompt: "Follow up with my inactive customers to prevent churn.",
            budgetLimitUSD: 300,
            desc: "Queries CRM & triggers personalized email outreach with dry-run safety gating."
        }
    ];

    const runGoldenPath = async (userPrompt: string, budgetLimitUSD: number = 1000) => {
        setIsLoading(true);
        setError(null);
        showToast(`Running Golden Path Demo Scenario: "${userPrompt.slice(0, 30)}..."`, "info");
        try {
            const res = await fetch("/api/workflows/golden-path", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    userPrompt,
                    budgetLimitUSD,
                    dryRun: true
                })
            });

            if (!res.ok) {
                throw new Error(`HTTP ${res.status}: ${res.statusText}`);
            }

            const data = await res.json();
            setResult(data.result);
            showToast("Golden Path Scenario Execution Complete!", "success");
        } catch (err: any) {
            console.error("Demo execution error:", err);
            setError(err.message || "Failed to execute Golden Path");
            showToast("Demo scenario error", "error");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="space-y-6">
            {/* Header & Quick Scenarios */}
            <div className="bg-[#121620] border border-white/10 rounded-3xl p-6 shadow-xl space-y-4">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h2 className="text-xl font-extrabold text-white flex items-center gap-2">
                            <Rocket className="w-5 h-5 text-[#2D7FE0]" />
                            <span>PAL Investor Demo Cockpit</span>
                        </h2>
                        <p className="text-xs text-[#999CA5] mt-1">
                            Execute one-click investor scenarios to witness PAL's autonomous decision-making, council debate, and dry-run worker execution.
                        </p>
                    </div>
                    <div className="flex items-center gap-2">
                        <span className="px-3 py-1 bg-[#22C55E]/15 text-[#22C55E] text-xs font-bold rounded-full border border-[#22C55E]/30 flex items-center gap-1">
                            <ShieldCheck className="w-3.5 h-3.5" /> Dry-Run Safety Active
                        </span>
                    </div>
                </div>

                {/* Scenario Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-2">
                    {demoScenarios.map((sc, idx) => (
                        <button
                            key={idx}
                            onClick={() => {
                                setPrompt(sc.prompt);
                                runGoldenPath(sc.prompt, sc.budgetLimitUSD);
                            }}
                            disabled={isLoading}
                            className="text-left p-4 bg-[#161B26] hover:bg-[#1E2636] border border-white/5 hover:border-[#2D7FE0]/50 rounded-2xl transition-all duration-200 group disabled:opacity-50"
                        >
                            <h4 className="text-sm font-bold text-white group-hover:text-[#2D7FE0] flex items-center justify-between">
                                {sc.title}
                                <span className="text-xs text-[#999CA5]">Run ➔</span>
                            </h4>
                            <p className="text-xs text-[#999CA5] line-clamp-2 mt-1.5">{sc.desc}</p>
                        </button>
                    ))}
                </div>

                {/* Custom Intent Input Bar */}
                <form
                    onSubmit={(e) => {
                        e.preventDefault();
                        if (prompt.trim()) runGoldenPath(prompt.trim());
                    }}
                    className="flex gap-2 pt-2"
                >
                    <input
                        type="text"
                        value={prompt}
                        onChange={(e) => setPrompt(e.target.value)}
                        placeholder="Or enter custom intent (e.g. 'PAL, analyze Q3 sales conversion rate')..."
                        className="flex-1 bg-[#161B26] border border-white/10 text-white placeholder-[#999CA5] text-xs font-medium rounded-2xl px-4 py-3 focus:outline-none focus:border-[#2D7FE0] transition-colors"
                        disabled={isLoading}
                    />
                    <button
                        type="submit"
                        disabled={isLoading || !prompt.trim()}
                        className="px-6 py-3 bg-[#2D7FE0] hover:bg-[#2563EB] text-white text-xs font-bold rounded-2xl shadow-lg shadow-blue-500/25 transition-all disabled:opacity-50 flex items-center gap-2"
                    >
                        <span>{isLoading ? "Analyzing..." : "Execute"}</span>
                        <Play className="w-3.5 h-3.5 fill-white" />
                    </button>
                </form>

                {error && (
                    <div className="p-3 bg-rose-500/15 border border-rose-500/30 text-rose-400 text-xs rounded-xl font-bold">
                        ⚠️ Error: {error}
                    </div>
                )}
            </div>

            {/* Live Interactive Execution Results & Timeline */}
            {(result || isLoading) && (
                <div className="bg-[#121620] border border-white/10 rounded-3xl p-6 shadow-xl space-y-4">
                    <h3 className="text-lg font-bold text-white border-b border-white/10 pb-3">
                        Golden Path Scenario Execution Result
                    </h3>
                    <DecisionTimeline result={result} isLoading={isLoading} />
                </div>
            )}
        </div>
    );
}
