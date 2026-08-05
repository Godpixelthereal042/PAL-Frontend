"use client";

import React, { useState } from "react";
import { CheckCircle2, Circle, ArrowRight, ShieldCheck, Zap, Sparkles } from "lucide-react";

export interface OnboardingStep {
    id: string;
    title: string;
    description: string;
    actionRoute: string;
    actionLabel: string;
    completed: boolean;
}

export function FounderOnboardingChecklist({ companyName = "Your Company" }: { companyName?: string }) {
    const [steps, setSteps] = useState<OnboardingStep[]>([
        {
            id: "1",
            title: "Create Workspace & Invite Team",
            description: "Set up multi-tenant organization boundaries and invite team members with RBAC roles.",
            actionRoute: "/settings/team",
            actionLabel: "Invite Team",
            completed: true,
        },
        {
            id: "2",
            title: "Connect Enterprise Tools",
            description: "Authorize Stripe, Google Workspace, Slack, and GitHub for data ingestion.",
            actionRoute: "/connect",
            actionLabel: "Connect Integrations",
            completed: true,
        },
        {
            id: "3",
            title: "Generate Business Brain Baseline",
            description: "Complete 5-minute Questionnaire to construct Executive AI Business Brain.",
            actionRoute: "/business-brain",
            actionLabel: "View Business Brain",
            completed: true,
        },
        {
            id: "4",
            title: "Approve First AI Action Card",
            description: "Review and approve PAL's first revenue recovery recommendation.",
            actionRoute: "/",
            actionLabel: "Approve Recommendation",
            completed: false,
        },
        {
            id: "5",
            title: "Verify Measured 90-Day ROI",
            description: "Review initial net business value recovery in Executive Cockpit.",
            actionRoute: "/analytics",
            actionLabel: "View ROI Report",
            completed: false,
        },
    ]);

    const completedCount = steps.filter((s) => s.completed).length;
    const progressPct = Math.round((completedCount / steps.length) * 100);

    const toggleStep = (id: string) => {
        setSteps((prev) =>
            prev.map((s) => (s.id === id ? { ...s, completed: !s.completed } : s))
        );
    };

    return (
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-xl mb-8 text-white">
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-3">
                    <div className="p-2 bg-indigo-600/20 text-indigo-400 rounded-lg border border-indigo-500/30">
                        <Sparkles className="w-6 h-6" />
                    </div>
                    <div>
                        <h2 className="text-xl font-bold text-slate-100">
                            Founder Activation Roadmap — {companyName}
                        </h2>
                        <p className="text-sm text-slate-400">
                            Complete setup to unlock PAL's autonomous business operations.
                        </p>
                    </div>
                </div>
                <div className="text-right">
                    <div className="text-2xl font-extrabold text-indigo-400">{progressPct}%</div>
                    <div className="text-xs text-slate-400">{completedCount} of {steps.length} completed</div>
                </div>
            </div>

            {/* Progress bar */}
            <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden mb-6">
                <div
                    className="bg-gradient-to-r from-indigo-500 to-emerald-400 h-full transition-all duration-500"
                    style={{ width: `${progressPct}%` }}
                />
            </div>

            {/* Step list */}
            <div className="space-y-3">
                {steps.map((step) => (
                    <div
                        key={step.id}
                        onClick={() => toggleStep(step.id)}
                        className={`flex items-start justify-between p-4 rounded-lg border cursor-pointer transition-all ${
                            step.completed
                                ? "bg-slate-950/60 border-slate-800/80 text-slate-300"
                                : "bg-slate-800/40 border-indigo-500/40 text-slate-100 hover:border-indigo-500/70"
                        }`}
                    >
                        <div className="flex items-start space-x-3">
                            <button className="mt-0.5 focus:outline-none">
                                {step.completed ? (
                                    <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                                ) : (
                                    <Circle className="w-5 h-5 text-slate-500" />
                                )}
                            </button>
                            <div>
                                <h3 className={`font-semibold ${step.completed ? "line-through text-slate-400" : "text-slate-100"}`}>
                                    {step.title}
                                </h3>
                                <p className="text-xs text-slate-400 mt-1">{step.description}</p>
                            </div>
                        </div>
                        {!step.completed && (
                            <a
                                href={step.actionRoute}
                                onClick={(e) => e.stopPropagation()}
                                className="flex items-center space-x-1 text-xs font-semibold px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-md transition-all shadow-md shrink-0 ml-4"
                            >
                                <span>{step.actionLabel}</span>
                                <ArrowRight className="w-3 h-3" />
                            </a>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
}
