"use client";

import React, { useState, useMemo, FormEvent } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import {
  BriefcaseBusiness,
  Check,
  CircleDollarSign,
  Home,
  Lightbulb,
  Search,
  Sparkles
} from "lucide-react";
import { useTheme } from "@/components/ThemeProvider";
import BusinessBrainForm from "@/components/BusinessBrainForm";
import OnboardingLayout from "./onboarding/OnboardingLayout";

type Screen =
  | "growth"
  | "manage"
  | "together"
  | "persona"
  | "industry"
  | "country"
  | "language"
  | "signup"
  | "login"
  | "otp"
  | "business_brain";

function cn(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ");
}

const industries = [
  { icon: BriefcaseBusiness, label: "Consumer and Retail" },
  { icon: CircleDollarSign, label: "Financial services" },
  { icon: Home, label: "Real Estate" },
  { icon: BriefcaseBusiness, label: "Transportation & Logistics" },
  { icon: Lightbulb, label: "Technology & Innovation" },
  { icon: Sparkles, label: "Other Industry" }
];

const countries = [
  ["🇺🇸", "United States"],
  ["🇬🇧", "United Kingdom"],
  ["🇨🇦", "Canada"],
  ["🇦🇺", "Australia"],
  ["🇩🇪", "Germany"],
  ["🇫🇷", "France"],
  ["🇮🇳", "India"],
  ["🇧🇷", "Brazil"],
  ["🇯🇵", "Japan"],
  ["🇳🇬", "Nigeria"],
  ["🇸🇬", "Singapore"],
  ["🇦🇪", "United Arab Emirates"],
  ["🇿🇦", "South Africa"],
  ["🇲🇽", "Mexico"],
  ["🇪🇸", "Spain"],
  ["🇮🇹", "Italy"]
];

const languages = [
  ["🇬🇧", "English"],
  ["🇫🇷", "French"],
  ["🇩🇪", "German"],
  ["🇪🇸", "Spanish"],
  ["🇮🇳", "Hindi"],
  ["🇯🇵", "Japanese"],
  ["🇵🇹", "Portuguese"],
  ["🇸🇦", "Arabic"]
];

function Mascot({ priority = false, className }: { priority?: boolean; className?: string }) {
  return (
    <div className={cn("w-full h-full max-h-[38vh] flex items-center justify-center pointer-events-none select-none p-2", className)}>
      <Image
        src="/assets/pal-mascot.png"
        alt="PAL Mascot"
        width={320}
        height={320}
        priority={priority}
        className="max-h-full max-w-[85%] w-auto h-auto object-contain drop-shadow-[0_10px_25px_rgba(45,127,224,0.3)]"
      />
    </div>
  );
}

export default function OnboardingScreen() {
  const router = useRouter();
  const [screen, setScreen] = useState<Screen>("growth");

  // User Onboarding Form State
  const [persona, setPersona] = useState("");
  const [industry, setIndustry] = useState("Technology & Innovation");
  const [country, setCountry] = useState("United States");
  const [language, setLanguage] = useState("English");
  const [searchCountry, setSearchCountry] = useState("");

  // Auth Inputs
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const filteredCountries = useMemo(() => {
    if (!searchCountry) return countries;
    return countries.filter(([_, name]) =>
      name.toLowerCase().includes(searchCountry.toLowerCase())
    );
  }, [searchCountry]);

  const handleFinishSignup = async (e: FormEvent) => {
    e.preventDefault();
    const profilePayload = {
      fullName: fullName || "Founder",
      email: email || "user@pal.ai",
      role: persona || "Business Owner",
      industry: industry || "Technology & Innovation",
      country: country || "United States",
      language: language || "English",
      onboardingCompleted: true
    };

    try {
      await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(profilePayload)
      });
    } catch (err) {
      console.warn("Offline fallback signup proceed", err);
    }

    localStorage.setItem("pal_user_profile", JSON.stringify(profilePayload));
    setScreen("business_brain");
  };

  const handleFinishLogin = async (e: FormEvent) => {
    e.preventDefault();
    router.push("/");
  };

  return (
    <div className="w-full h-dvh bg-black flex items-center justify-center overflow-hidden">
      {/* ─── 1. GROWTH INTRO ───────────────────────────────── */}
      {screen === "growth" && (
        <OnboardingLayout
          currentStep={0}
          totalSteps={3}
          title={
            <span className="text-white">
              GO FOR <span className="text-[#2d7fe0]">BUSINESS GROWTH</span> WITH PAL
            </span>
          }
          subtitle="Your AI agentic co-founder that tracks, manages, and scales your company."
          illustration={<Mascot priority />}
          primaryAction={{
            label: "It's more fun & quick when we do it together! 🚀",
            onClick: () => setScreen("manage")
          }}
        />
      )}

      {/* ─── 2. MANAGE INTRO ───────────────────────────────── */}
      {screen === "manage" && (
        <OnboardingLayout
          currentStep={1}
          totalSteps={3}
          onBack={() => setScreen("growth")}
          title={
            <span className="text-white">
              Tracks, Manage &amp; Grow <span className="text-[#2d7fe0]">All In One Place.</span>
            </span>
          }
          subtitle="PAL centralizes project roadmaps, revenue insights, calendar schedules, and team actions."
          illustration={<Mascot priority />}
          primaryAction={{
            label: "Continue",
            onClick: () => setScreen("together")
          }}
        />
      )}

      {/* ─── 3. TOGETHER INTRO ─────────────────────────────── */}
      {screen === "together" && (
        <OnboardingLayout
          currentStep={2}
          totalSteps={3}
          onBack={() => setScreen("manage")}
          title="How PAL Helps You Win"
          subtitle="Automated executive assistance tailored to your business flow."
          primaryAction={{
            label: "Let's go 🚀",
            onClick: () => setScreen("persona")
          }}
        >
          <div className="rounded-3xl bg-[var(--app-card)] border border-[var(--app-card-border)] p-5 shadow-xl text-left space-y-3">
            <ul className="list-disc space-y-2.5 pl-4 text-xs sm:text-sm text-zinc-300 font-medium leading-relaxed marker:text-[#2d7fe0]">
              <li>
                <strong className="text-white">Log sales, expenses, and deliverables</strong> effortlessly. PAL remembers every detail.
              </li>
              <li>
                <strong className="text-white">Get daily executive briefs</strong> on cashflow, tasks, and high-impact risks.
              </li>
              <li>
                <strong className="text-white">Tech? Retail? Services?</strong> PAL adapts dynamically to your industry.
              </li>
              <li>
                You don&apos;t have to build alone anymore. <strong className="text-[#2d7fe0]">PAL is with you.</strong>
              </li>
            </ul>
          </div>
        </OnboardingLayout>
      )}

      {/* ─── 4. PERSONA SCREEN ─────────────────────────────── */}
      {screen === "persona" && (
        <OnboardingLayout
          onBack={() => setScreen("together")}
          title="Tell us who you are"
          subtitle="Choose the role that best describes your current work."
          primaryAction={{
            label: "Next",
            onClick: () => setScreen("industry"),
            disabled: !persona
          }}
        >
          <div className="grid gap-2.5 py-1">
            {["🚀 Startup or Big brand", "🎨 Freelancer / Creative", "🛍️ Business Owner", "🧩 Or others"].map((option) => {
              const cleanVal = option.replace(/^[^ ]+ /, "");
              const isSelected = persona === cleanVal;
              return (
                <button
                  key={option}
                  type="button"
                  onClick={() => setPersona(cleanVal)}
                  className={`h-[54px] min-h-[44px] rounded-2xl text-sm font-bold transition-all border flex items-center justify-between px-4 cursor-pointer ${
                    isSelected
                      ? "bg-[#2d7fe0] text-white border-[#48b9ff] shadow-lg shadow-blue-500/20"
                      : "bg-[var(--app-card)] text-zinc-200 border-[var(--app-card-border)] hover:border-blue-500/40"
                  }`}
                >
                  <span>{option}</span>
                  {isSelected && <Check size={18} className="text-white" />}
                </button>
              );
            })}
          </div>
        </OnboardingLayout>
      )}

      {/* ─── 5. INDUSTRY SCREEN ────────────────────────────── */}
      {screen === "industry" && (
        <OnboardingLayout
          onBack={() => setScreen("persona")}
          title="Choose your Industry"
          subtitle="Select your primary business sector for tailored PAL insights."
          primaryAction={{
            label: "Next",
            onClick: () => setScreen("country"),
            disabled: !industry
          }}
        >
          <div className="grid grid-cols-2 gap-2.5 py-1">
            {industries.map(({ icon: Icon, label }) => {
              const isSelected = industry === label;
              return (
                <button
                  key={label}
                  type="button"
                  onClick={() => setIndustry(label)}
                  className={`p-3.5 rounded-2xl border text-left flex flex-col justify-between min-h-[82px] transition-all cursor-pointer ${
                    isSelected
                      ? "bg-[#2d7fe0] text-white border-[#48b9ff] shadow-lg shadow-blue-500/20"
                      : "bg-[var(--app-card)] text-zinc-200 border-[var(--app-card-border)] hover:border-blue-500/40"
                  }`}
                >
                  <Icon size={20} className={isSelected ? "text-white" : "text-[#2d7fe0]"} />
                  <span className="text-xs font-bold leading-tight mt-2">{label}</span>
                </button>
              );
            })}
          </div>
        </OnboardingLayout>
      )}

      {/* ─── 6. COUNTRY SCREEN ─────────────────────────────── */}
      {screen === "country" && (
        <OnboardingLayout
          onBack={() => setScreen("industry")}
          title="Select Country"
          subtitle="Where is your primary business based?"
          primaryAction={{
            label: "Next",
            onClick: () => setScreen("language"),
            disabled: !country
          }}
        >
          <div className="space-y-3">
            <div className="relative">
              <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400" />
              <input
                type="text"
                value={searchCountry}
                onChange={(e) => setSearchCountry(e.target.value)}
                placeholder="Search country..."
                className="w-full h-11 bg-[var(--app-card)] border border-[var(--app-card-border)] rounded-xl pl-10 pr-4 text-xs font-medium text-white outline-none focus:border-blue-500/50"
              />
            </div>

            <div className="max-h-[260px] overflow-y-auto space-y-1.5 scrollbar-hide pr-1">
              {filteredCountries.map(([flag, name]) => {
                const isSelected = country === name;
                return (
                  <button
                    key={name}
                    type="button"
                    onClick={() => setCountry(name)}
                    className={`w-full px-3.5 py-2.5 rounded-xl border text-xs font-bold flex items-center justify-between transition-colors cursor-pointer ${
                      isSelected
                        ? "bg-[#2d7fe0] text-white border-[#48b9ff]"
                        : "bg-[var(--app-card)] text-zinc-200 border-[var(--app-card-border)] hover:border-blue-500/40"
                    }`}
                  >
                    <span className="flex items-center gap-2">
                      <span className="text-base">{flag}</span>
                      <span>{name}</span>
                    </span>
                    {isSelected && <Check size={16} className="text-white" />}
                  </button>
                );
              })}
            </div>
          </div>
        </OnboardingLayout>
      )}

      {/* ─── 7. LANGUAGE SCREEN ────────────────────────────── */}
      {screen === "language" && (
        <OnboardingLayout
          onBack={() => setScreen("country")}
          title="Select Language"
          subtitle="Choose your preferred language for PAL responses."
          primaryAction={{
            label: "Next",
            onClick: () => setScreen("signup"),
            disabled: !language
          }}
        >
          <div className="grid grid-cols-2 gap-2.5 py-1">
            {languages.map(([flag, name]) => {
              const isSelected = language === name;
              return (
                <button
                  key={name}
                  type="button"
                  onClick={() => setLanguage(name)}
                  className={`p-3.5 rounded-2xl border text-left flex items-center justify-between transition-all cursor-pointer ${
                    isSelected
                      ? "bg-[#2d7fe0] text-white border-[#48b9ff] shadow-lg shadow-blue-500/20"
                      : "bg-[var(--app-card)] text-zinc-200 border-[var(--app-card-border)] hover:border-blue-500/40"
                  }`}
                >
                  <span className="flex items-center gap-2">
                    <span className="text-base">{flag}</span>
                    <span className="text-xs font-bold">{name}</span>
                  </span>
                  {isSelected && <Check size={16} className="text-white" />}
                </button>
              );
            })}
          </div>
        </OnboardingLayout>
      )}

      {/* ─── 8. SIGNUP SCREEN ──────────────────────────────── */}
      {screen === "signup" && (
        <OnboardingLayout
          onBack={() => setScreen("language")}
          title="Create Account"
          subtitle="Set up your PAL executive profile."
          secondaryAction={{
            label: "Already have an account? Sign In",
            onClick: () => setScreen("login")
          }}
        >
          <form onSubmit={handleFinishSignup} className="space-y-3 text-left">
            <div>
              <label className="text-[10px] font-extrabold uppercase tracking-wider text-zinc-400 block mb-1">
                Full Name
              </label>
              <input
                type="text"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="e.g. Emmanuel"
                className="w-full h-11 bg-[var(--app-card)] border border-[var(--app-card-border)] rounded-xl px-3.5 text-xs font-medium text-white outline-none focus:border-blue-500/50"
              />
            </div>

            <div>
              <label className="text-[10px] font-extrabold uppercase tracking-wider text-zinc-400 block mb-1">
                Work Email
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="founder@company.com"
                className="w-full h-11 bg-[var(--app-card)] border border-[var(--app-card-border)] rounded-xl px-3.5 text-xs font-medium text-white outline-none focus:border-blue-500/50"
              />
            </div>

            <div>
              <label className="text-[10px] font-extrabold uppercase tracking-wider text-zinc-400 block mb-1">
                Password
              </label>
              <input
                type="password"
                required
                minLength={6}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full h-11 bg-[var(--app-card)] border border-[var(--app-card-border)] rounded-xl px-3.5 text-xs font-medium text-white outline-none focus:border-blue-500/50"
              />
            </div>

            <button
              type="submit"
              className="w-full h-[52px] min-h-[44px] rounded-full bg-[#2d7fe0] hover:bg-[#2563eb] text-white text-base font-bold transition-all shadow-lg shadow-blue-500/25 cursor-pointer mt-2"
            >
              Continue to Business Brain
            </button>
          </form>
        </OnboardingLayout>
      )}

      {/* ─── 9. LOGIN SCREEN ───────────────────────────────── */}
      {screen === "login" && (
        <OnboardingLayout
          onBack={() => setScreen("signup")}
          title="Welcome Back"
          subtitle="Sign in to access your business brain."
          secondaryAction={{
            label: "Don't have an account? Sign Up",
            onClick: () => setScreen("signup")
          }}
        >
          <form onSubmit={handleFinishLogin} className="space-y-3 text-left">
            <div>
              <label className="text-[10px] font-extrabold uppercase tracking-wider text-zinc-400 block mb-1">
                Email
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="founder@company.com"
                className="w-full h-11 bg-[var(--app-card)] border border-[var(--app-card-border)] rounded-xl px-3.5 text-xs font-medium text-white outline-none focus:border-blue-500/50"
              />
            </div>

            <div>
              <label className="text-[10px] font-extrabold uppercase tracking-wider text-zinc-400 block mb-1">
                Password
              </label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full h-11 bg-[var(--app-card)] border border-[var(--app-card-border)] rounded-xl px-3.5 text-xs font-medium text-white outline-none focus:border-blue-500/50"
              />
            </div>

            <button
              type="submit"
              className="w-full h-[52px] min-h-[44px] rounded-full bg-[#2d7fe0] hover:bg-[#2563eb] text-white text-base font-bold transition-all shadow-lg shadow-blue-500/25 cursor-pointer mt-2"
            >
              Sign In
            </button>
          </form>
        </OnboardingLayout>
      )}

      {/* ─── 10. BUSINESS BRAIN FORM ────────────────────────── */}
      {screen === "business_brain" && (
        <OnboardingLayout
          onBack={() => setScreen("signup")}
          title="Business Brain Setup"
          subtitle="Configure your PAL startup memory."
        >
          <div className="w-full text-left py-2">
            <BusinessBrainForm
              mode="onboarding"
              initialIndustry={industry}
              onComplete={() => router.push("/")}
              onSkip={() => router.push("/")}
            />
          </div>
        </OnboardingLayout>
      )}
    </div>
  );
}
