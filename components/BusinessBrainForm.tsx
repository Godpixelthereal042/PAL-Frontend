"use client";

import React, { useState, useEffect } from "react";

// ── Constants ────────────────────────────────────────────────────────────────

const businessStages = [
    { value: "idea", label: "Just an Idea", emoji: "💡" },
    { value: "pre-launch", label: "Pre-launch", emoji: "🔨" },
    { value: "launched", label: "Launched", emoji: "🚀" },
    { value: "scaling", label: "Scaling Up", emoji: "📈" },
];

function cn(...classes: Array<string | false | null | undefined>) {
    return classes.filter(Boolean).join(" ");
}

// ── Props ────────────────────────────────────────────────────────────────────

interface BusinessBrainFormProps {
    /** "onboarding" shows skip button & saves goals/challenges. "edit" updates core fields only. */
    mode?: "onboarding" | "edit";
    /** Pre-fill industry from the earlier onboarding step */
    initialIndustry?: string;
    /** Called after a successful save */
    onComplete?: () => void;
    /** Called when the user taps "Skip for now" (onboarding only) */
    onSkip?: () => void;
}

// ── Component ────────────────────────────────────────────────────────────────

export default function BusinessBrainForm({
    mode = "edit",
    initialIndustry = "",
    onComplete,
    onSkip,
}: BusinessBrainFormProps) {
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [saved, setSaved] = useState(false);

    // Core brain fields
    const [businessName, setBusinessName] = useState("");
    const [businessDescription, setBusinessDescription] = useState("");
    const [industry, setIndustry] = useState(initialIndustry);
    const [businessStage, setBusinessStage] = useState("");
    const [targetMarket, setTargetMarket] = useState("");
    const [priorities, setPriorities] = useState("");

    // Quick-add fields (captured once during onboarding)
    const [mainGoal, setMainGoal] = useState("");
    const [biggestChallenge, setBiggestChallenge] = useState("");

    // ── Load existing brain data ─────────────────────────────────────────

    useEffect(() => {
        async function loadBrain() {
            try {
                const res = await fetch("/api/business-brain");
                if (res.ok) {
                    const data = await res.json();
                    if (data.brain) {
                        setBusinessName(data.brain.business_name || "");
                        setBusinessDescription(data.brain.business_description || "");
                        if (data.brain.industry) setIndustry(data.brain.industry);
                        setBusinessStage(data.brain.business_stage || "");
                        setTargetMarket(data.brain.target_market || "");
                        setPriorities(data.brain.priorities || "");
                    }
                    if (data.goals?.length > 0) {
                        setMainGoal(data.goals[0].title || "");
                    }
                    if (data.challenges?.length > 0) {
                        setBiggestChallenge(data.challenges[0].title || "");
                    }
                }
                // 401 or 404 = no brain yet, that's fine for new users
            } catch (e) {
                console.error("Failed to load business brain:", e);
            } finally {
                setLoading(false);
            }
        }
        loadBrain();
    }, []);

    // ── Save handler ─────────────────────────────────────────────────────

    const handleSave = async () => {
        if (!businessName.trim()) return;

        setSaving(true);
        try {
            const payload: Record<string, unknown> = {
                business_name: businessName.trim(),
                business_description: businessDescription.trim() || null,
                industry: industry || null,
                business_stage: businessStage || null,
                target_market: targetMarket.trim() || null,
                priorities: priorities.trim() || null,
            };

            // Only batch-add goals/challenges during first-time onboarding
            if (mode === "onboarding") {
                if (mainGoal.trim()) {
                    payload.goals = [{ title: mainGoal.trim() }];
                }
                if (biggestChallenge.trim()) {
                    payload.challenges = [{ title: biggestChallenge.trim() }];
                }
            }

            const res = await fetch("/api/business-brain", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
            });

            if (res.ok) {
                if (onComplete) {
                    onComplete();
                } else {
                    setSaved(true);
                    setTimeout(() => setSaved(false), 3000);
                }
            } else {
                const err = await res.json();
                alert(err.error || "Failed to save");
            }
        } catch (e) {
            console.error("Save business brain error:", e);
            alert("Failed to save. Please try again.");
        } finally {
            setSaving(false);
        }
    };

    // ── Loading state ────────────────────────────────────────────────────

    if (loading) {
        return (
            <div className="flex items-center justify-center py-[60px]">
                <div
                    className="h-[24px] w-[24px] animate-spin rounded-full border-[3px] border-current border-t-transparent"
                    style={{ color: "var(--app-accent)" }}
                />
            </div>
        );
    }

    // ── Render ────────────────────────────────────────────────────────────

    return (
        <div className="text-left">
            {/* Header */}
            <div className="mb-[20px]">
                <h1
                    className="text-[24px] font-extrabold leading-[1.15]"
                    style={{ color: "var(--onb-heading, var(--app-text))" }}
                >
                    {mode === "onboarding"
                        ? "Tell PAL about your business"
                        : "Your Business Brain"}
                </h1>
                <p
                    className="mt-[8px] text-[14px] leading-[1.35]"
                    style={{ color: "var(--onb-subtext, var(--app-text-secondary))" }}
                >
                    {mode === "onboarding"
                        ? "This helps PAL give you personalized advice from day one."
                        : "Update your business context so PAL stays relevant."}
                </p>
            </div>

            {/* Form Fields */}
            <div className="grid gap-[14px]">
                {/* Business Name */}
                <label className="block text-[12px] font-medium text-left" style={{ color: "var(--app-text)" }}>
                    Business Name *
                    <input
                        className="auth-input mt-[6px] text-[15px]"
                        style={{
                            backgroundColor: "var(--app-input-bg)",
                            borderColor: "var(--app-input-border)",
                            color: "var(--app-text)",
                        }}
                        placeholder="e.g. Acme Design Studio"
                        value={businessName}
                        onChange={(e) => setBusinessName(e.target.value)}
                    />
                </label>

                {/* Business Description */}
                <label className="block text-[12px] font-medium text-left" style={{ color: "var(--app-text)" }}>
                    What does your business do?
                    <textarea
                        className="auth-input mt-[6px] text-[15px] min-h-[72px] resize-none"
                        style={{
                            backgroundColor: "var(--app-input-bg)",
                            borderColor: "var(--app-input-border)",
                            color: "var(--app-text)",
                        }}
                        placeholder="Describe your business in a few sentences..."
                        value={businessDescription}
                        onChange={(e) => setBusinessDescription(e.target.value)}
                        rows={3}
                    />
                </label>

                {/* Business Stage */}
                <div className="block text-[12px] font-medium text-left" style={{ color: "var(--app-text)" }}>
                    Business Stage
                    <div className="mt-[6px] grid grid-cols-2 gap-[8px]">
                        {businessStages.map(({ value, label, emoji }) => (
                            <button
                                key={value}
                                type="button"
                                onClick={() => setBusinessStage(value)}
                                className={cn(
                                    "h-[44px] rounded-[12px] text-[13px] font-bold transition cursor-pointer border",
                                    "flex items-center justify-center gap-[6px]"
                                )}
                                style={{
                                    backgroundColor:
                                        businessStage === value ? "var(--app-accent)" : "var(--app-input-bg)",
                                    color: businessStage === value ? "#ffffff" : "var(--app-text-secondary)",
                                    borderColor:
                                        businessStage === value ? "var(--app-accent)" : "var(--app-input-border)",
                                }}
                            >
                                <span>{emoji}</span>
                                <span>{label}</span>
                            </button>
                        ))}
                    </div>
                </div>

                {/* Target Market */}
                <label className="block text-[12px] font-medium text-left" style={{ color: "var(--app-text)" }}>
                    Who are your target customers?
                    <input
                        className="auth-input mt-[6px] text-[15px]"
                        style={{
                            backgroundColor: "var(--app-input-bg)",
                            borderColor: "var(--app-input-border)",
                            color: "var(--app-text)",
                        }}
                        placeholder="e.g. Small business owners, tech startups..."
                        value={targetMarket}
                        onChange={(e) => setTargetMarket(e.target.value)}
                    />
                </label>

                {/* Priorities */}
                <label className="block text-[12px] font-medium text-left" style={{ color: "var(--app-text)" }}>
                    What are your top priorities right now?
                    <input
                        className="auth-input mt-[6px] text-[15px]"
                        style={{
                            backgroundColor: "var(--app-input-bg)",
                            borderColor: "var(--app-input-border)",
                            color: "var(--app-text)",
                        }}
                        placeholder="e.g. Launch MVP, get first 10 customers..."
                        value={priorities}
                        onChange={(e) => setPriorities(e.target.value)}
                    />
                </label>

                {/* Main Goal */}
                <label className="block text-[12px] font-medium text-left" style={{ color: "var(--app-text)" }}>
                    {mode === "onboarding" ? "What's your main business goal?" : "Primary Goal"}
                    <input
                        className="auth-input mt-[6px] text-[15px]"
                        style={{
                            backgroundColor: "var(--app-input-bg)",
                            borderColor: "var(--app-input-border)",
                            color: "var(--app-text)",
                        }}
                        placeholder="e.g. Reach $10K monthly revenue"
                        value={mainGoal}
                        onChange={(e) => setMainGoal(e.target.value)}
                    />
                </label>

                {/* Biggest Challenge */}
                <label className="block text-[12px] font-medium text-left" style={{ color: "var(--app-text)" }}>
                    {mode === "onboarding" ? "What's your biggest challenge?" : "Main Challenge"}
                    <input
                        className="auth-input mt-[6px] text-[15px]"
                        style={{
                            backgroundColor: "var(--app-input-bg)",
                            borderColor: "var(--app-input-border)",
                            color: "var(--app-text)",
                        }}
                        placeholder="e.g. Finding product-market fit"
                        value={biggestChallenge}
                        onChange={(e) => setBiggestChallenge(e.target.value)}
                    />
                </label>
            </div>

            {/* Buttons */}
            <div className="mt-[22px] grid gap-[10px]">
                <button
                    type="button"
                    onClick={handleSave}
                    disabled={saving || !businessName.trim()}
                    className="primary-pill h-[44px] text-[14px] w-full cursor-pointer flex items-center justify-center disabled:opacity-50"
                >
                    {saving
                        ? "Saving..."
                        : saved
                            ? "✓ Saved!"
                            : mode === "onboarding"
                                ? "Save & Continue"
                                : "Save Changes"}
                </button>

                {mode === "onboarding" && onSkip && (
                    <button
                        type="button"
                        onClick={onSkip}
                        className="h-[36px] text-[13px] font-medium cursor-pointer"
                        style={{ color: "var(--app-text-secondary)" }}
                    >
                        Skip for now
                    </button>
                )}
            </div>
        </div>
    );
}
