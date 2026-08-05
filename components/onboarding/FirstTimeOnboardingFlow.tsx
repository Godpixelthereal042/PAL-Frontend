"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";

export function FirstTimeOnboardingFlow() {
    const router = useRouter();
    const [step, setStep] = useState<1 | 2 | 3 | 4>(1);

    // Form state
    const [businessName, setBusinessName] = useState("");
    const [industry, setIndustry] = useState("B2B SaaS");
    const [revenueGoal, setRevenueGoal] = useState("1000000");
    const [primaryGoal, setPrimaryGoal] = useState("Increase MRR by 20% in 90 days");
    const [selectedTools, setSelectedTools] = useState<string[]>(["google_workspace", "stripe", "hubspot"]);
    const [isExecuting, setIsExecuting] = useState(false);

    const toggleTool = (toolId: string) => {
        setSelectedTools(prev =>
            prev.includes(toolId) ? prev.filter(t => t !== toolId) : [...prev, toolId]
        );
    };

    const handleFinishOnboarding = async () => {
        setIsExecuting(true);
        try {
            // Trigger first Golden Path execution
            await fetch("/api/workflows/golden-path", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    userPrompt: `PAL, analyze my business performance for '${businessName || "My SaaS Company"}' and execute plan to ${primaryGoal.toLowerCase()}.`,
                    budgetLimitUSD: 1000,
                    dryRun: true
                })
            });

            router.push("/");
        } catch (err) {
            console.error("Onboarding execution failed:", err);
            router.push("/");
        } finally {
            setIsExecuting(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#0B0F17] text-slate-100 flex items-center justify-center p-4">
            <div className="max-w-xl w-full bg-slate-900/90 border border-slate-800 rounded-3xl p-8 shadow-2xl space-y-6">
                {/* Progress Stepper */}
                <div className="flex items-center justify-between border-b border-slate-800/80 pb-4">
                    <div className="flex items-center gap-2">
                        <span className="w-8 h-8 rounded-full bg-indigo-600 text-white font-bold flex items-center justify-center text-sm">
                            {step}
                        </span>
                        <div>
                            <h2 className="text-sm font-bold text-slate-200">
                                {step === 1 && "Step 1: Your Business"}
                                {step === 2 && "Step 2: 90-Day Goals"}
                                {step === 3 && "Step 3: Connect Tools"}
                                {step === 4 && "Step 4: Launch PAL Session"}
                            </h2>
                            <p className="text-xs text-slate-400">Step {step} of 4</p>
                        </div>
                    </div>
                    <div className="flex gap-1.5">
                        {[1, 2, 3, 4].map(s => (
                            <div
                                key={s}
                                className={`w-6 h-1.5 rounded-full transition-all ${
                                    s <= step ? "bg-indigo-500" : "bg-slate-800"
                                }`}
                            />
                        ))}
                    </div>
                </div>

                {/* Step 1: Business Profile */}
                {step === 1 && (
                    <div className="space-y-4">
                        <h3 className="text-lg font-bold text-slate-100">What business are you building?</h3>
                        <div className="space-y-3">
                            <div>
                                <label className="text-xs text-slate-400 block mb-1">Company / Startup Name</label>
                                <input
                                    type="text"
                                    value={businessName}
                                    onChange={(e) => setBusinessName(e.target.value)}
                                    placeholder="e.g. Acme AI Technologies"
                                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-slate-200 focus:outline-none focus:border-indigo-500"
                                />
                            </div>
                            <div>
                                <label className="text-xs text-slate-400 block mb-1">Industry Sector</label>
                                <select
                                    value={industry}
                                    onChange={(e) => setIndustry(e.target.value)}
                                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-slate-200 focus:outline-none focus:border-indigo-500"
                                >
                                    <option value="B2B SaaS">B2B SaaS</option>
                                    <option value="Consumer Tech">Consumer Tech</option>
                                    <option value="Fintech">Fintech</option>
                                    <option value="E-Commerce">E-Commerce</option>
                                    <option value="Agency / Services">Agency / Services</option>
                                </select>
                            </div>
                        </div>
                        <button
                            onClick={() => setStep(2)}
                            disabled={!businessName.trim()}
                            className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-sm rounded-xl transition-colors disabled:opacity-50 mt-4"
                        >
                            Continue to Goals ➔
                        </button>
                    </div>
                )}

                {/* Step 2: Strategic Goals */}
                {step === 2 && (
                    <div className="space-y-4">
                        <h3 className="text-lg font-bold text-slate-100">What is your primary focus for the next 90 days?</h3>
                        <div className="space-y-2">
                            {[
                                "Increase MRR by 20% in 90 days",
                                "Reduce monthly operating expenses by 30%",
                                "Automate inactive customer retention outreach",
                                "Prepare investor pitch deck & metrics"
                            ].map((g, idx) => (
                                <div
                                    key={idx}
                                    onClick={() => setPrimaryGoal(g)}
                                    className={`p-3.5 rounded-xl border text-xs font-medium cursor-pointer transition-all ${
                                        primaryGoal === g
                                            ? "bg-indigo-600/10 border-indigo-500 text-indigo-300"
                                            : "bg-slate-950/60 border-slate-800 text-slate-300 hover:border-slate-700"
                                    }`}
                                >
                                    {g}
                                </div>
                            ))}
                        </div>
                        <div className="flex gap-3 mt-4">
                            <button
                                onClick={() => setStep(1)}
                                className="w-1/3 py-3 bg-slate-800 hover:bg-slate-700 text-slate-300 font-medium text-sm rounded-xl"
                            >
                                Back
                            </button>
                            <button
                                onClick={() => setStep(3)}
                                className="w-2/3 py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-sm rounded-xl"
                            >
                                Continue to Tools ➔
                            </button>
                        </div>
                    </div>
                )}

                {/* Step 3: Tool Integrations */}
                {step === 3 && (
                    <div className="space-y-4">
                        <h3 className="text-lg font-bold text-slate-100">Connect your tools to empower PAL</h3>
                        <div className="space-y-2">
                            {[
                                { id: "google_workspace", name: "Google Workspace (Gmail & Calendar)", icon: "🌐" },
                                { id: "stripe", name: "Stripe Billing & Revenue", icon: "💳" },
                                { id: "hubspot", name: "HubSpot CRM", icon: "🧡" }
                            ].map((tool) => (
                                <div
                                    key={tool.id}
                                    onClick={() => toggleTool(tool.id)}
                                    className={`p-3.5 rounded-xl border flex items-center justify-between cursor-pointer transition-all ${
                                        selectedTools.includes(tool.id)
                                            ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-300"
                                            : "bg-slate-950/60 border-slate-800 text-slate-400"
                                    }`}
                                >
                                    <div className="flex items-center gap-3 text-xs font-semibold">
                                        <span>{tool.icon}</span>
                                        <span>{tool.name}</span>
                                    </div>
                                    <span className="text-xs font-mono font-bold">
                                        {selectedTools.includes(tool.id) ? "Selected ✓" : "Connect"}
                                    </span>
                                </div>
                            ))}
                        </div>
                        <div className="flex gap-3 mt-4">
                            <button
                                onClick={() => setStep(2)}
                                className="w-1/3 py-3 bg-slate-800 hover:bg-slate-700 text-slate-300 font-medium text-sm rounded-xl"
                            >
                                Back
                            </button>
                            <button
                                onClick={() => setStep(4)}
                                className="w-2/3 py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-sm rounded-xl"
                            >
                                Continue to Launch ➔
                            </button>
                        </div>
                    </div>
                )}

                {/* Step 4: First Strategy Session */}
                {step === 4 && (
                    <div className="space-y-4 text-center py-4">
                        <div className="w-16 h-16 rounded-full bg-indigo-500/10 border border-indigo-500/30 text-indigo-400 flex items-center justify-center text-3xl mx-auto">
                            🚀
                        </div>
                        <h3 className="text-xl font-bold text-slate-100">Ready to Launch First PAL Session</h3>
                        <p className="text-xs text-slate-400 max-w-md mx-auto">
                            PAL will analyze <span className="text-indigo-400 font-semibold">{businessName}</span>, compile strategic OKRs, consult the Executive Council, and stage actions with dry-run safety.
                        </p>
                        <button
                            onClick={handleFinishOnboarding}
                            disabled={isExecuting}
                            className="w-full py-3.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-sm rounded-xl transition-all shadow-lg shadow-indigo-600/20 disabled:opacity-50"
                        >
                            {isExecuting ? "Initializing Executive Session..." : "Run First Strategy Session ⚡"}
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}
