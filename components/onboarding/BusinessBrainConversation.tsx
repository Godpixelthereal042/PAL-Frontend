"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Send, CheckCircle2, Calendar, Mail, MessageSquare, CreditCard, Twitter, Github, Sparkles, ArrowRight } from "lucide-react";
import { palBrain } from "@/lib/brain/palBrain";

interface BusinessBrainConversationProps {
  userProfile: {
    fullName: string;
    email: string;
    persona: string;
    industry: string;
    country: string;
    language: string;
  };
  onComplete: () => void;
}

export default function BusinessBrainConversation({ userProfile, onComplete }: BusinessBrainConversationProps) {
  const router = useRouter();
  const [step, setStep] = useState<"name" | "description" | "team" | "integrations" | "analyzing">("name");
  
  // Collected Data State
  const [businessName, setBusinessName] = useState("");
  const [description, setDescription] = useState("");
  const [teamSize, setTeamSize] = useState("Solo Founder");
  const [connectedServices, setConnectedServices] = useState<string[]>([]);
  const [inputText, setInputText] = useState("");

  const name = userProfile.fullName || "Founder";
  const persona = userProfile.persona || "Business Owner";
  const industry = userProfile.industry || "Technology & Innovation";
  const country = userProfile.country || "United States";

  const handleNextStep = () => {
    if (step === "name" && inputText.trim()) {
      setBusinessName(inputText.trim());
      setInputText("");
      setStep("description");
    } else if (step === "description" && inputText.trim()) {
      setDescription(inputText.trim());
      setInputText("");
      setStep("team");
    }
  };

  const handleSelectTeam = (size: string) => {
    setTeamSize(size);
    setStep("integrations");
  };

  const toggleIntegration = (service: string) => {
    setConnectedServices(prev =>
      prev.includes(service) ? prev.filter(s => s !== service) : [...prev, service]
    );
  };

  const handleFinishBusinessBrain = () => {
    setStep("analyzing");

    // Populate PAL Centralized Brain
    palBrain.updateContext({
      businessName: businessName || "My Business",
      businessDescription: description || `${persona} in ${industry}`,
      teamSize: teamSize,
      industry: industry,
      country: country,
      connectedServices: connectedServices
    });

    const fullProfile = {
      ...userProfile,
      companyName: businessName || "My Business",
      companyDescription: description,
      teamSize: teamSize,
      connectedServices: connectedServices,
      onboardingCompleted: true
    };
    localStorage.setItem("pal_user_profile", JSON.stringify(fullProfile));

    setTimeout(() => {
      onComplete();
      router.push("/");
    }, 2800);
  };

  return (
    <div className="w-full h-full min-h-[580px] flex flex-col justify-between p-4 text-left font-outfit relative">
      {/* ── Top Header ────────────────────────────────────────── */}
      <div className="flex items-center justify-between pb-3 border-b border-white/10 shrink-0">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-[#2d7fe0]/20 border border-[#2d7fe0]/40 flex items-center justify-center">
            <Sparkles size={16} className="text-[#2d7fe0] animate-pulse" />
          </div>
          <div>
            <h2 className="text-xs font-bold text-white tracking-wide uppercase">PAL Business Brain</h2>
            <span className="text-[10px] text-zinc-400 font-medium">Conversational Initialization</span>
          </div>
        </div>
        <span className="text-[10px] font-bold text-[#2d7fe0] bg-[#2d7fe0]/10 border border-[#2d7fe0]/20 px-2 py-0.5 rounded-full">
          Live AI
        </span>
      </div>

      {/* ── Chat Messages Container ──────────────────────────── */}
      <div className="flex-1 overflow-y-auto scrollbar-hide py-4 space-y-4 min-h-0">
        {/* Intro Message */}
        <div className="flex items-start gap-2.5">
          <div className="w-7 h-7 rounded-full bg-[#2d7fe0] flex items-center justify-center shrink-0 mt-0.5 text-white font-extrabold text-xs shadow-md">
            PAL
          </div>
          <div className="bg-[#121620] border border-white/10 rounded-2xl rounded-tl-xs p-3.5 max-w-[88%] space-y-2 shadow-lg">
            <p className="text-xs sm:text-sm font-semibold text-white leading-relaxed">
              👋 Welcome <span className="text-[#2d7fe0] font-bold">{name}</span>! I&apos;m PAL.
            </p>
            <p className="text-xs text-zinc-300 leading-relaxed font-medium">
              I&apos;ve already learned a little about you: You&apos;re a <strong className="text-white">{persona}</strong> in <strong className="text-white">{industry}</strong> based in <strong className="text-white">{country}</strong>.
            </p>
            <p className="text-xs text-zinc-400 leading-relaxed">
              Now let&apos;s build your <strong className="text-[#2d7fe0]">Business Brain</strong> together so I can start managing your projects, cashflow, and executive tasks.
            </p>
          </div>
        </div>

        {/* Step 1: Business Name */}
        {step !== "name" && businessName && (
          <div className="flex justify-end">
            <div className="bg-[#2d7fe0] text-white rounded-2xl rounded-tr-xs p-3 max-w-[80%] text-xs font-semibold shadow-md">
              {businessName}
            </div>
          </div>
        )}

        {/* Step 2 Prompt */}
        {(step === "description" || step === "team" || step === "integrations" || step === "analyzing") && (
          <div className="flex items-start gap-2.5">
            <div className="w-7 h-7 rounded-full bg-[#2d7fe0] flex items-center justify-center shrink-0 text-white font-extrabold text-xs">
              PAL
            </div>
            <div className="bg-[#121620] border border-white/10 rounded-2xl rounded-tl-xs p-3.5 max-w-[88%] text-xs font-semibold text-white shadow-lg">
              Awesome name! What does <span className="text-[#2d7fe0]">{businessName}</span> primary offer or do?
            </div>
          </div>
        )}

        {/* Step 2 Answer */}
        {step !== "name" && step !== "description" && description && (
          <div className="flex justify-end">
            <div className="bg-[#2d7fe0] text-white rounded-2xl rounded-tr-xs p-3 max-w-[80%] text-xs font-semibold shadow-md">
              {description}
            </div>
          </div>
        )}

        {/* Step 3 Prompt */}
        {(step === "team" || step === "integrations" || step === "analyzing") && (
          <div className="flex items-start gap-2.5">
            <div className="w-7 h-7 rounded-full bg-[#2d7fe0] flex items-center justify-center shrink-0 text-white font-extrabold text-xs">
              PAL
            </div>
            <div className="bg-[#121620] border border-white/10 rounded-2xl rounded-tl-xs p-3.5 max-w-[88%] text-xs font-semibold text-white shadow-lg">
              Got it! How many team members work with you at {businessName}?
            </div>
          </div>
        )}

        {/* Step 3 Answer */}
        {step !== "name" && step !== "description" && step !== "team" && teamSize && (
          <div className="flex justify-end">
            <div className="bg-[#2d7fe0] text-white rounded-2xl rounded-tr-xs p-3 max-w-[80%] text-xs font-semibold shadow-md">
              {teamSize}
            </div>
          </div>
        )}

        {/* Step 4: Integrations Prompt */}
        {(step === "integrations" || step === "analyzing") && (
          <div className="flex items-start gap-2.5">
            <div className="w-7 h-7 rounded-full bg-[#2d7fe0] flex items-center justify-center shrink-0 text-white font-extrabold text-xs">
              PAL
            </div>
            <div className="bg-[#121620] border border-white/10 rounded-2xl rounded-tl-xs p-3.5 max-w-[88%] space-y-2 text-xs text-zinc-200 font-semibold shadow-lg">
              <p className="text-white">
                Connect your operational tools to give PAL full executive sight:
              </p>

              {/* Integrations Grid */}
              <div className="grid grid-cols-2 gap-2 pt-1">
                {[
                  { name: "Google Calendar", icon: Calendar, color: "text-blue-400" },
                  { name: "Gmail", icon: Mail, color: "text-red-400" },
                  { name: "Slack", icon: MessageSquare, color: "text-emerald-400" },
                  { name: "Stripe", icon: CreditCard, color: "text-[#2d7fe0]" },
                  { name: "X (Twitter)", icon: Twitter, color: "text-cyan-400" },
                  { name: "GitHub", icon: Github, color: "text-zinc-300" }
                ].map(({ name: sName, icon: SIcon, color }) => {
                  const isConnected = connectedServices.includes(sName);
                  return (
                    <button
                      key={sName}
                      type="button"
                      onClick={() => toggleIntegration(sName)}
                      className={`p-2.5 rounded-xl border flex items-center justify-between text-left transition-all cursor-pointer ${
                        isConnected
                          ? "bg-[#2d7fe0]/20 border-[#2d7fe0] text-white"
                          : "bg-black/40 border-white/10 text-zinc-300 hover:border-white/20"
                      }`}
                    >
                      <div className="flex items-center gap-1.5 min-w-0">
                        <SIcon size={14} className={color} />
                        <span className="text-[11px] font-bold truncate">{sName}</span>
                      </div>
                      {isConnected ? (
                        <CheckCircle2 size={14} className="text-[#2d7fe0] shrink-0" />
                      ) : (
                        <span className="text-[10px] text-zinc-500 font-bold shrink-0">+</span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* Step 5: Analyzing State */}
        {step === "analyzing" && (
          <div className="bg-[#121620] border border-[#2d7fe0]/40 rounded-2xl p-5 text-center space-y-3 animate-pulse shadow-2xl">
            <div className="w-12 h-12 rounded-full bg-[#2d7fe0]/20 border border-[#2d7fe0] mx-auto flex items-center justify-center">
              <Sparkles size={24} className="text-[#2d7fe0] animate-spin" />
            </div>
            <h3 className="text-sm font-extrabold text-white">Initializing Business Brain...</h3>
            <p className="text-xs text-zinc-400">
              Ingesting context for <strong className="text-white">{businessName}</strong> $\rightarrow$ Generating Executive Dashboard
            </p>
          </div>
        )}
      </div>

      {/* ── Input Controls ───────────────────────────────────── */}
      {step === "name" && (
        <div className="pt-3 border-t border-white/10 shrink-0">
          <label className="text-[10px] font-extrabold uppercase tracking-wider text-zinc-400 block mb-1">
            What is your business or project called?
          </label>
          <div className="flex gap-2">
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleNextStep()}
              placeholder="e.g. Acme Corp"
              className="flex-1 h-11 bg-[#121620] border border-white/10 rounded-xl px-3.5 text-xs font-semibold text-white outline-none focus:border-[#2d7fe0]"
              autoFocus
            />
            <button
              type="button"
              onClick={handleNextStep}
              disabled={!inputText.trim()}
              className="h-11 px-4 rounded-xl bg-[#2d7fe0] hover:bg-[#2563eb] text-white text-xs font-bold transition-all disabled:opacity-40 cursor-pointer flex items-center justify-center"
            >
              <Send size={15} />
            </button>
          </div>
        </div>
      )}

      {step === "description" && (
        <div className="pt-3 border-t border-white/10 shrink-0">
          <label className="text-[10px] font-extrabold uppercase tracking-wider text-zinc-400 block mb-1">
            What do you do or sell?
          </label>
          <div className="flex gap-2">
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleNextStep()}
              placeholder="e.g. B2B SaaS for marketing teams"
              className="flex-1 h-11 bg-[#121620] border border-white/10 rounded-xl px-3.5 text-xs font-semibold text-white outline-none focus:border-[#2d7fe0]"
              autoFocus
            />
            <button
              type="button"
              onClick={handleNextStep}
              disabled={!inputText.trim()}
              className="h-11 px-4 rounded-xl bg-[#2d7fe0] hover:bg-[#2563eb] text-white text-xs font-bold transition-all disabled:opacity-40 cursor-pointer flex items-center justify-center"
            >
              <Send size={15} />
            </button>
          </div>
        </div>
      )}

      {step === "team" && (
        <div className="pt-3 border-t border-white/10 shrink-0 space-y-2">
          <span className="text-[10px] font-extrabold uppercase tracking-wider text-zinc-400 block">
            Select Team Size
          </span>
          <div className="grid grid-cols-2 gap-2">
            {["Solo Founder", "2-5 People", "6-20 Team", "20+ Company"].map(size => (
              <button
                key={size}
                type="button"
                onClick={() => handleSelectTeam(size)}
                className="h-11 rounded-xl bg-[#121620] border border-white/10 hover:border-[#2d7fe0] text-xs font-bold text-white transition-all cursor-pointer flex items-center justify-center"
              >
                {size}
              </button>
            ))}
          </div>
        </div>
      )}

      {step === "integrations" && (
        <div className="pt-3 border-t border-white/10 shrink-0">
          <button
            type="button"
            onClick={handleFinishBusinessBrain}
            className="w-full h-12 rounded-full bg-[#2d7fe0] hover:bg-[#2563eb] text-white text-xs font-extrabold tracking-wide transition-all shadow-lg shadow-blue-500/25 flex items-center justify-center gap-2 cursor-pointer active:scale-98"
          >
            <span>Complete Setup &amp; Build Brain</span>
            <ArrowRight size={16} />
          </button>
        </div>
      )}
    </div>
  );
}
