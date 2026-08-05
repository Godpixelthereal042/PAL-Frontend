"use client";

import React, { useState, useEffect, useMemo, ReactNode, FormEvent, TouchEvent } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  BriefcaseBusiness,
  Check,
  ChevronDown,
  CircleDollarSign,
  Eye,
  EyeOff,
  Home,
  Lightbulb,
  Moon,
  Search,
  Sparkles,
  Sun,
  Zap,
  Building2,
  Stethoscope,
  GraduationCap,
  Hammer,
  Cpu,
  ShoppingBag,
  Truck,
  Utensils,
  Film,
  Scale
} from "lucide-react";
import { useTheme } from "@/components/ThemeProvider";
import { supabase } from "@/lib/supabaseClient";
import BusinessBrainConversation from "@/components/onboarding/BusinessBrainConversation";
import OnboardingShell from "@/components/onboarding/OnboardingShell";

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

type Tone = "light" | "dark";

function cn(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ");
}

const personaOptions = [
  {
    icon: "🚀",
    title: "Startup",
    description: "Building something new with a team.",
    value: "Startup"
  },
  {
    icon: "🎨",
    title: "Freelancer",
    description: "Managing clients and personal work.",
    value: "Freelancer"
  },
  {
    icon: "🏪",
    title: "Business Owner",
    description: "Running an existing business or company.",
    value: "Business Owner"
  },
  {
    icon: "🧩",
    title: "Other",
    description: "Tell PAL about your custom setup.",
    value: "Other"
  }
];

const industries = [
  { icon: Cpu, label: "Technology & Innovation" },
  { icon: ShoppingBag, label: "Consumer & Retail" },
  { icon: CircleDollarSign, label: "Financial Services" },
  { icon: Home, label: "Real Estate & Housing" },
  { icon: Truck, label: "Logistics & Transport" },
  { icon: Stethoscope, label: "Healthcare & Biotech" },
  { icon: GraduationCap, label: "Education & E-learning" },
  { icon: Hammer, label: "Construction & Hardware" },
  { icon: Utensils, label: "Hospitality & Food" },
  { icon: Film, label: "Media & Entertainment" },
  { icon: Scale, label: "Legal & Professional" },
  { icon: Sparkles, label: "Other Industry" }
];

const countries = [
  ["🇳🇬", "Nigeria"],
  ["🇺🇸", "United States"],
  ["🇬🇧", "United Kingdom"],
  ["🇨🇦", "Canada"],
  ["🇦🇺", "Australia"],
  ["🇩🇪", "Germany"],
  ["🇫🇷", "France"],
  ["🇮🇳", "India"],
  ["🇧🇷", "Brazil"],
  ["🇯🇵", "Japan"],
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

export default function OnboardingScreen() {
  const router = useRouter();
  const { theme } = useTheme();
  const [screen, setScreenState] = useState<Screen>("growth");
  
  // User Data State
  const [persona, setPersona] = useState("");
  const [industry, setIndustry] = useState("Technology & Innovation");
  const [country, setCountry] = useState("Nigeria");
  const [language, setLanguage] = useState("English");
  const [searchCountry, setSearchCountry] = useState("");
  const [searchIndustry, setSearchIndustry] = useState("");

  // Input states for Auth
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const setScreen = (nextScreen: Screen) => {
    setScreenState(nextScreen);
  };

  const handleSocialSignIn = async (provider: "google" | "base") => {
    const mockEmail = provider === "google" ? "google.user@gmail.com" : "base.user@base.org";
    const mockName = provider === "google" ? "Google User" : "Base User";
    
    setEmail(mockEmail);
    setFullName(mockName);

    const profilePayload = {
      fullName: mockName,
      email: mockEmail,
      role: persona || "Business Owner",
      industry: industry || "Technology & Innovation",
      country: country || "Nigeria",
      language: language || "English",
      onboardingCompleted: true
    };

    localStorage.setItem("pal_user_profile", JSON.stringify(profilePayload));
    setScreen("business_brain");
  };

  return (
    <OnboardingShell>
      <div className="phone-stage">
        <section className="phone" aria-label="PAL app">
          <StatusBar tone="dark" />

          {screen === "growth" && (
            <GrowthIntro
              onNext={() => setScreen("manage")}
              onSkip={() => setScreen("persona")}
            />
          )}
          {screen === "manage" && (
            <ManageIntro
              onNext={() => setScreen("together")}
              onBack={() => setScreen("growth")}
              onSkip={() => setScreen("persona")}
            />
          )}
          {screen === "together" && (
            <TogetherIntro
              onNext={() => setScreen("persona")}
              onBack={() => setScreen("manage")}
            />
          )}
          
          {screen === "persona" && (
            <PersonaScreen
              value={persona}
              onChange={setPersona}
              onNext={() => setScreen("industry")}
              onBack={() => setScreen("together")}
            />
          )}
          
          {screen === "industry" && (
            <IndustryScreen 
              value={industry} 
              searchQuery={searchIndustry}
              onSearchQuery={setSearchIndustry}
              onChange={setIndustry} 
              onNext={() => setScreen("country")} 
              onBack={() => setScreen("persona")}
            />
          )}
          
          {screen === "country" && (
            <CountryScreen
              selected={country}
              query={searchCountry}
              onQuery={setSearchCountry}
              onSelect={setCountry}
              onNext={() => setScreen("language")}
              onBack={() => setScreen("industry")}
            />
          )}
          
          {screen === "language" && (
            <LanguageScreen 
              selected={language} 
              onSelect={setLanguage} 
              onNext={() => setScreen("signup")} 
              onBack={() => setScreen("country")}
            />
          )}
          
          {screen === "signup" && (
            <div className="relative h-full flex-1 flex flex-col overflow-y-auto scrollbar-hide pb-6">
              <SignupScreen 
                fullName={fullName}
                setFullName={setFullName}
                email={email}
                setEmail={setEmail}
                password={password}
                setPassword={setPassword}
                confirmPassword={confirmPassword}
                setConfirmPassword={setConfirmPassword}
                persona={persona}
                industry={industry}
                country={country}
                language={language}
                onLogin={() => setScreen("login")} 
                onNext={() => setScreen("otp")} 
                onGoogle={() => handleSocialSignIn("google")}
                onBase={() => handleSocialSignIn("base")}
              />
            </div>
          )}
          
          {screen === "login" && (
            <div className="relative h-full flex-1 flex flex-col overflow-y-auto scrollbar-hide pb-6">
              <LoginScreen 
                email={email}
                setEmail={setEmail}
                password={password}
                setPassword={setPassword}
                onSignup={() => setScreen("signup")} 
                onNext={() => setScreen("business_brain")} 
                onGoogle={() => handleSocialSignIn("google")}
                onBase={() => handleSocialSignIn("base")}
              />
            </div>
          )}
          
          {screen === "otp" && (
            <div className="relative h-full flex-1 flex flex-col overflow-y-auto scrollbar-hide">
              <OtpScreen 
                email={email}
                onNext={() => setScreen("business_brain")} 
              />
            </div>
          )}
          
          {screen === "business_brain" && (
            <div className="relative h-full flex-1 flex flex-col justify-between overflow-y-auto scrollbar-hide">
              <BusinessBrainConversation
                userProfile={{
                  fullName: fullName || "Emmanuel",
                  email: email || "user@pal.ai",
                  persona: persona || "Business Owner",
                  industry: industry || "Technology & Innovation",
                  country: country || "Nigeria",
                  language: language || "English"
                }}
                onComplete={() => router.push("/")}
              />
            </div>
          )}
        </section>
      </div>
    </OnboardingShell>
  );
}

// ---------------- Helper Components ----------------

function StatusBar({ tone }: { tone: Tone }) {
  return (
    <div className="status-bar text-white px-6 pt-3 pb-2 flex justify-between items-center z-40 shrink-0">
      <span className="font-bold text-xs">9:41</span>
      <div className="status-icons flex items-center gap-1.5 opacity-90" aria-hidden="true">
        <span className="signal flex gap-0.5"><span className="w-1 h-2 bg-white rounded-xs"/><span className="w-1 h-2.5 bg-white rounded-xs"/><span className="w-1 h-3 bg-white rounded-xs"/><span className="w-1 h-3.5 bg-white rounded-xs"/></span>
        <span className="battery w-5 h-2.5 border border-white rounded-xs relative ml-1 inline-block"><span className="absolute inset-0.5 bg-white rounded-2xs" /></span>
      </div>
    </div>
  );
}

function ProgressBars({ active }: { active: number }) {
  return (
    <div className="progress-bars flex gap-1.5 w-full" aria-hidden="true">
      {[0, 1, 2].map((index) => (
        <span 
          key={index} 
          className={cn(
            "h-1 flex-1 rounded-full transition-all duration-300",
            index === active ? "bg-[#2d7fe0] shadow-[0_0_10px_rgba(45,127,224,0.6)]" : "bg-white/20"
          )} 
        />
      ))}
    </div>
  );
}

function BrandLogo({ className }: { className?: string }) {
  return (
    <div className={cn("relative", className)}>
      <Image
        src="/assets/pal-logo.png"
        alt="PAL"
        width={170}
        height={80}
        priority
        className="h-auto w-full filter drop-shadow-[0_0_12px_rgba(45,127,224,0.4)]"
      />
    </div>
  );
}

function Mascot({ className, priority = false }: { className?: string; priority?: boolean }) {
  return (
    <div className={cn("pointer-events-none select-none mascot-peek", className)}>
      <Image
        src="/assets/pal-mascot.png"
        alt="Mascot"
        width={691}
        height={642}
        priority={priority}
        className="w-full h-auto drop-shadow-[0_20px_50px_rgba(0,0,0,0.8)]"
      />
    </div>
  );
}

// ── 1. Welcome Intro Slides with Recomposed Mascot Breathing Room ─────────

function GrowthIntro({ onNext, onSkip }: { onNext: () => void; onSkip: () => void }) {
  const [touchStart, setTouchStart] = useState<number | null>(null);

  const handleTouchEnd = (e: TouchEvent) => {
    if (touchStart === null) return;
    const touchEnd = e.changedTouches[0].clientX;
    if (touchStart - touchEnd > 50) {
      onNext();
    }
  };

  return (
    <div
      onTouchStart={(e) => setTouchStart(e.touches[0].clientX)}
      onTouchEnd={handleTouchEnd}
      className="relative h-full flex-1 flex flex-col justify-between overflow-y-auto scrollbar-hide px-[30px] pt-[16px] pb-[30px]"
    >
      {/* Top Header Controls */}
      <div className="flex justify-between items-center z-30 relative shrink-0">
        <ProgressBars active={0} />
        <button
          type="button"
          onClick={onSkip}
          className="text-xs font-bold text-slate-300 bg-white/10 backdrop-blur-md border border-white/15 px-3.5 py-1 rounded-full cursor-pointer hover:bg-white/20 hover:text-white transition-all ml-4"
        >
          Skip
        </button>
      </div>

      {/* Main Hero Content - Unblocked Headline & Recomposed Mascot */}
      <div className="min-h-[420px] w-full flex-1 relative flex flex-col pt-4 z-20">
        <h1 className="mt-[12px] text-[50px] font-black leading-[0.94] text-left tracking-tight">
          <span className="text-[#38bdf8] drop-shadow-[0_0_20px_rgba(56,189,248,0.3)]">
            GO FOR
            <br />
            BUSINESS
            <br />
            GROWTH
          </span>
          <br />
          <span className="text-white font-extrabold">WITH</span>
          <br />
          <span className="text-white font-extrabold">PAL</span>
        </h1>

        {/* Mascot Hero Positioned on Right Side with Breathing Room */}
        <div className="absolute -right-[180px] bottom-[-20px] z-10 pointer-events-none">
          <div className="absolute inset-0 bg-[#2d7fe0]/20 blur-3xl rounded-full" />
          <Mascot priority className="w-[420px] max-w-none mascot-peek relative z-10" />
        </div>
      </div>

      {/* Bottom Executive Action Card & CTA */}
      <div className="relative z-30 space-y-3 shrink-0 mt-auto">
        <button
          type="button"
          onClick={onNext}
          className="w-full text-left rounded-[24px] bg-[#101726]/85 border border-white/12 backdrop-blur-xl p-4 text-white shadow-2xl transition-all hover:border-white/25 active:scale-[0.98] cursor-pointer"
        >
          <p className="text-[14px] font-semibold leading-snug text-white">
            It&apos;s more fun and quick when we do it together! 🚀
          </p>
          <p className="text-[12px] text-[#94a3b8] mt-1 font-medium">
            Initialize your Executive AI Operating System in 30 seconds.
          </p>
        </button>

        <button
          type="button"
          onClick={onNext}
          className="primary-pill w-full h-13 text-[15px] font-extrabold cursor-pointer bg-gradient-to-r from-[#0a438a] to-[#2d7fe0] shadow-[0_10px_30px_rgba(45,127,224,0.4)] hover:brightness-110 active:scale-[0.98] transition-all"
        >
          Get Started 🚀
        </button>
      </div>
    </div>
  );
}

function ManageIntro({ onNext, onBack, onSkip }: { onNext: () => void; onBack: () => void; onSkip: () => void }) {
  const [touchStart, setTouchStart] = useState<number | null>(null);

  const handleTouchEnd = (e: TouchEvent) => {
    if (touchStart === null) return;
    const touchEnd = e.changedTouches[0].clientX;
    if (touchStart - touchEnd > 50) {
      onNext();
    } else if (touchEnd - touchStart > 50) {
      onBack();
    }
  };

  return (
    <div
      onTouchStart={(e) => setTouchStart(e.touches[0].clientX)}
      onTouchEnd={handleTouchEnd}
      className="relative h-full flex-1 flex flex-col justify-between overflow-y-auto scrollbar-hide px-[30px] pt-[16px] pb-[30px]"
    >
      <div className="flex justify-between items-center z-30 relative shrink-0">
        <button
          type="button"
          onClick={onBack}
          className="w-8 h-8 rounded-full bg-white/10 border border-white/15 flex items-center justify-center text-white cursor-pointer hover:bg-white/20 transition-all"
        >
          <ArrowLeft size={16} />
        </button>
        <ProgressBars active={1} />
        <button
          type="button"
          onClick={onSkip}
          className="text-xs font-bold text-slate-300 bg-white/10 backdrop-blur-md border border-white/15 px-3.5 py-1 rounded-full cursor-pointer hover:bg-white/20 hover:text-white transition-all ml-4"
        >
          Skip
        </button>
      </div>

      <div className="min-h-[420px] w-full flex-1 relative flex flex-col pt-4 z-20 text-left">
        <BrandLogo className="mt-2 h-auto w-[150px]" />
        <h1 className="mt-4 text-[48px] font-black leading-[0.96] text-left tracking-tight">
          <span className="text-white">Tracks</span>
          <br />
          <span className="text-[#38bdf8] drop-shadow-[0_0_20px_rgba(56,189,248,0.3)]">Manage &amp; Grow</span>
          <br />
          <span className="text-white font-extrabold">All In One Place.</span>
        </h1>

        {/* Mascot Standing Proudly on Right */}
        <div className="absolute -right-[150px] bottom-[-30px] z-10 pointer-events-none">
          <div className="absolute inset-0 bg-[#2d7fe0]/20 blur-3xl rounded-full" />
          <Mascot priority className="w-[440px] max-w-none mascot-peek relative z-10" />
        </div>
      </div>

      <div className="relative z-30 shrink-0 mt-auto">
        <button
          type="button"
          onClick={onNext}
          className="primary-pill w-full h-13 text-[15px] font-extrabold cursor-pointer bg-gradient-to-r from-[#0a438a] to-[#2d7fe0] shadow-[0_10px_30px_rgba(45,127,224,0.4)] hover:brightness-110 active:scale-[0.98] transition-all"
        >
          Continue 🚀
        </button>
      </div>
    </div>
  );
}

function TogetherIntro({ onNext, onBack }: { onNext: () => void; onBack: () => void }) {
  return (
    <div className="relative h-full flex-1 flex flex-col justify-between overflow-y-auto scrollbar-hide px-[30px] pt-[16px] pb-[30px]">
      <div className="flex justify-between items-center z-30 relative shrink-0">
        <button
          type="button"
          onClick={onBack}
          className="w-8 h-8 rounded-full bg-white/10 border border-white/15 flex items-center justify-center text-white cursor-pointer hover:bg-white/20 transition-all"
        >
          <ArrowLeft size={16} />
        </button>
        <ProgressBars active={2} />
        <div className="w-8" />
      </div>

      <div className="min-h-[440px] w-full flex-1 relative flex flex-col justify-center pt-2 z-20">
        <div className="relative rounded-[30px] bg-[#101726]/90 border border-white/12 backdrop-blur-xl p-6 shadow-2xl text-left space-y-4">
          <h2 className="text-xl font-extrabold text-white">Why Founders Choose PAL</h2>
          <ul className="space-y-3 text-[13px] leading-relaxed text-slate-300">
            <li className="flex items-start gap-2.5">
              <span className="text-[#38bdf8] font-bold text-base">✓</span>
              <span><strong className="text-white">Log sales, expenses &amp; tasks</strong> effortlessly. PAL remembers everything.</span>
            </li>
            <li className="flex items-start gap-2.5">
              <span className="text-[#38bdf8] font-bold text-base">✓</span>
              <span><strong className="text-white">Daily Executive Insights</strong> on cashflow, profit &amp; sprint progress.</span>
            </li>
            <li className="flex items-start gap-2.5">
              <span className="text-[#38bdf8] font-bold text-base">✓</span>
              <span><strong className="text-white">Adapts to your workflow</strong> — Tech, Retail, Freelance, or Services.</span>
            </li>
          </ul>

          <div className="pt-2 border-t border-white/10 text-xs font-semibold text-[#38bdf8]">
            PAL is ready to build your Business Brain. Let&apos;s go 🚀
          </div>
        </div>
      </div>

      <div className="relative z-30 shrink-0 mt-auto">
        <button
          type="button"
          onClick={onNext}
          className="primary-pill w-full h-13 text-[15px] font-extrabold cursor-pointer bg-gradient-to-r from-[#0a438a] to-[#2d7fe0] shadow-[0_10px_30px_rgba(45,127,224,0.4)] hover:brightness-110 active:scale-[0.98] transition-all"
        >
          Let&apos;s Go 🚀
        </button>
      </div>
    </div>
  );
}

// ── 2. Rich Persona Cards in Dark Executive Glass ──────────────────────────

function PersonaScreen({
  value,
  onChange,
  onNext,
  onBack
}: {
  value: string;
  onChange: (value: string) => void;
  onNext: () => void;
  onBack: () => void;
}) {
  return (
    <div className="relative h-full flex-1 flex flex-col justify-between overflow-y-auto scrollbar-hide px-[30px] pt-[16px] pb-[30px]">
      <div className="flex flex-col text-left">
        <div className="flex items-center gap-3 mb-2">
          <button
            type="button"
            onClick={onBack}
            className="w-8 h-8 rounded-full bg-white/10 border border-white/15 flex items-center justify-center text-white cursor-pointer hover:bg-white/20 transition-all"
          >
            <ArrowLeft size={16} />
          </button>
          <p className="text-sm font-semibold text-[#38bdf8]">Welcome to PAL</p>
        </div>
        
        <h1 className="text-[28px] font-extrabold leading-tight text-white">
          Tell us who you are?
        </h1>

        <div className="mt-5 space-y-3">
          {personaOptions.map((opt) => {
            const isSelected = value === opt.value;
            return (
              <button
                key={opt.value}
                type="button"
                onClick={() => onChange(opt.value)}
                className={cn(
                  "w-full rounded-[22px] p-4 text-left transition-all cursor-pointer border flex items-center gap-3.5 backdrop-blur-xl",
                  isSelected
                    ? "bg-[#2d7fe0]/20 border-[#2d7fe0] text-white shadow-[0_0_25px_rgba(45,127,224,0.35)] scale-[1.01]"
                    : "bg-[#101726]/80 border-white/10 text-slate-300 hover:border-white/25 hover:bg-[#101726]"
                )}
              >
                <span className="text-2xl shrink-0 p-2.5 rounded-xl bg-white/10">{opt.icon}</span>
                <div>
                  <h3 className="text-sm font-bold text-white leading-tight">
                    {opt.title}
                  </h3>
                  <p className="text-[11px] leading-snug mt-0.5 text-slate-400 font-medium">
                    {opt.description}
                  </p>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      <button 
        type="button" 
        onClick={onNext} 
        disabled={!value}
        className="primary-pill mt-6 w-full h-13 text-[15px] font-extrabold cursor-pointer bg-gradient-to-r from-[#0a438a] to-[#2d7fe0] shadow-[0_10px_30px_rgba(45,127,224,0.4)] disabled:opacity-40 transition-all"
      >
        Next
      </button>
    </div>
  );
}

// ── 3. Searchable Industry Selection in Executive Dark ─────────────────────

function IndustryScreen({
  value,
  searchQuery,
  onSearchQuery,
  onChange,
  onNext,
  onBack
}: {
  value: string;
  searchQuery: string;
  onSearchQuery: (v: string) => void;
  onChange: (value: string) => void;
  onNext: () => void;
  onBack: () => void;
}) {
  const filteredIndustries = useMemo(
    () => industries.filter((ind) => ind.label.toLowerCase().includes(searchQuery.toLowerCase())),
    [searchQuery]
  );

  return (
    <div className="relative h-full flex-1 flex flex-col justify-between overflow-y-auto scrollbar-hide px-[30px] pt-[16px] pb-[30px]">
      <div className="flex flex-col text-left">
        <div className="flex items-center gap-3 mb-1">
          <button
            type="button"
            onClick={onBack}
            className="w-8 h-8 rounded-full bg-white/10 border border-white/15 flex items-center justify-center text-white cursor-pointer hover:bg-white/20 transition-all"
          >
            <ArrowLeft size={16} />
          </button>
          <h1 className="text-[28px] font-extrabold leading-tight text-white">
            Choose Industry
          </h1>
        </div>

        <p className="mt-1 text-xs text-slate-400 font-medium">
          Select your primary business sector below.
        </p>

        {/* Search Bar */}
        <div className="relative mt-3 mb-2">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchQuery(e.target.value)}
            placeholder="Search Industry..."
            className="w-full h-11 bg-[#060911] border border-white/15 rounded-xl pl-9 pr-4 text-xs font-semibold text-white outline-none focus:border-[#2d7fe0] placeholder:text-slate-500"
          />
        </div>

        <div className="mt-1 grid grid-cols-2 gap-2.5 w-full max-h-[310px] overflow-y-auto pr-1 scrollbar-hide">
          {filteredIndustries.map(({ icon: Icon, label }) => {
            const isSelected = value === label;
            return (
              <button
                key={label}
                type="button"
                onClick={() => onChange(label)}
                className={cn(
                  "flex flex-col items-center justify-center gap-1.5 rounded-[18px] border p-3 text-center text-xs font-bold transition-all cursor-pointer min-h-[85px] backdrop-blur-xl",
                  isSelected
                    ? "bg-[#2d7fe0] text-white border-[#2d7fe0] shadow-[0_0_20px_rgba(45,127,224,0.4)]"
                    : "bg-[#101726]/80 text-slate-200 border-white/10 hover:border-white/25 hover:bg-[#101726]"
                )}
              >
                <Icon 
                  size={20} 
                  className={isSelected ? "text-white" : "text-[#38bdf8]"}
                  strokeWidth={2.2} 
                />
                <span className="leading-tight">{label}</span>
              </button>
            );
          })}
        </div>
      </div>

      <button 
        type="button" 
        onClick={onNext} 
        disabled={!value}
        className="primary-pill mt-4 w-full h-13 text-[15px] font-extrabold cursor-pointer bg-gradient-to-r from-[#0a438a] to-[#2d7fe0] shadow-[0_10px_30px_rgba(45,127,224,0.4)] disabled:opacity-40 transition-all"
      >
        Next
      </button>
    </div>
  );
}

// ── 4. Country & Language Screen in Executive Dark Glass (NO WHITE PANELS) ──

function CountryScreen({
  selected,
  query,
  onQuery,
  onSelect,
  onNext,
  onBack
}: {
  selected: string;
  query: string;
  onQuery: (value: string) => void;
  onSelect: (value: string) => void;
  onNext: () => void;
  onBack: () => void;
}) {
  const filtered = useMemo(
    () => countries.filter((country) => country[1].toLowerCase().includes(query.toLowerCase())),
    [query]
  );

  return (
    <div className="relative h-full flex-1 flex flex-col justify-between overflow-y-auto scrollbar-hide px-[30px] pt-[16px] pb-[30px]">
      <div className="flex flex-col text-left">
        <div className="flex items-center gap-3 mb-1">
          <button
            type="button"
            onClick={onBack}
            className="w-8 h-8 rounded-full bg-white/10 border border-white/15 flex items-center justify-center text-white cursor-pointer hover:bg-white/20 transition-all"
          >
            <ArrowLeft size={16} />
          </button>
          <h1 className="text-[28px] font-extrabold leading-tight text-white">
            Choose Country
          </h1>
        </div>

        <p className="mt-1 text-xs text-slate-400 font-medium">
          Select your primary business country.
        </p>

        {/* Executive Dark Glass Container */}
        <section className="mt-4 h-[330px] overflow-hidden rounded-[26px] p-4 bg-[#101726]/90 border border-white/12 backdrop-blur-xl shadow-2xl flex flex-col">
          <label className="relative block w-full shrink-0">
            <input
              value={query}
              onChange={(event) => onQuery(event.target.value)}
              className="h-10 w-full rounded-xl border border-white/15 bg-[#060911] px-4 pr-10 text-xs font-semibold text-white outline-none focus:border-[#2d7fe0] placeholder:text-slate-500"
              placeholder="Search country..."
            />
            <Search className="absolute right-3.5 top-3 text-slate-400" size={16} />
          </label>

          <div className="mt-3 flex-1 overflow-y-auto pr-1 scrollbar-hide space-y-1">
            {filtered.map(([flag, name]) => (
              <button
                key={name}
                type="button"
                onClick={() => onSelect(name)}
                className={cn(
                  "flex h-11 w-full items-center justify-between rounded-xl text-xs font-semibold cursor-pointer px-3 transition-colors",
                  selected === name 
                    ? "bg-[#2d7fe0]/20 text-[#38bdf8] border border-[#2d7fe0]/40 font-bold" 
                    : "text-slate-300 hover:bg-white/5"
                )}
              >
                <div className="flex items-center gap-3">
                  <span className="text-xl leading-none">{flag}</span>
                  <span>{name}</span>
                </div>
                {selected === name && <Check size={16} className="text-[#38bdf8]" strokeWidth={3} />}
              </button>
            ))}
          </div>
        </section>
      </div>

      <button 
        type="button" 
        onClick={onNext} 
        disabled={!selected}
        className="primary-pill mt-4 w-full h-13 text-[15px] font-extrabold cursor-pointer bg-gradient-to-r from-[#0a438a] to-[#2d7fe0] shadow-[0_10px_30px_rgba(45,127,224,0.4)] disabled:opacity-40 transition-all"
      >
        Next
      </button>
    </div>
  );
}

function LanguageScreen({
  selected,
  onSelect,
  onNext,
  onBack
}: {
  selected: string;
  onSelect: (value: string) => void;
  onNext: () => void;
  onBack: () => void;
}) {
  return (
    <div className="relative h-full flex-1 flex flex-col justify-between overflow-y-auto scrollbar-hide px-[30px] pt-[16px] pb-[30px]">
      <div className="flex flex-col text-left">
        <div className="flex items-center gap-3 mb-1">
          <button
            type="button"
            onClick={onBack}
            className="w-8 h-8 rounded-full bg-white/10 border border-white/15 flex items-center justify-center text-white cursor-pointer hover:bg-white/20 transition-all"
          >
            <ArrowLeft size={16} />
          </button>
          <h1 className="text-[28px] font-extrabold leading-tight text-white">
            Choose Language
          </h1>
        </div>

        <p className="mt-1 text-xs text-slate-400 font-medium">
          Select your preferred language for PAL.
        </p>

        <section className="mt-4 h-[330px] overflow-hidden rounded-[26px] p-4 bg-[#101726]/90 border border-white/12 backdrop-blur-xl shadow-2xl flex flex-col">
          <div className="flex-1 overflow-y-auto pr-1 scrollbar-hide space-y-1">
            {languages.map(([flag, name]) => (
              <button
                key={name}
                type="button"
                onClick={() => onSelect(name)}
                className={cn(
                  "flex h-12 w-full items-center justify-between rounded-xl text-xs font-semibold cursor-pointer px-3 transition-colors",
                  selected === name 
                    ? "bg-[#2d7fe0]/20 text-[#38bdf8] border border-[#2d7fe0]/40 font-bold" 
                    : "text-slate-300 hover:bg-white/5"
                )}
              >
                <div className="flex items-center gap-3">
                  <span className="text-xl leading-none">{flag}</span>
                  <span>{name}</span>
                </div>
                {selected === name && <Check size={16} className="text-[#38bdf8]" strokeWidth={3} />}
              </button>
            ))}
          </div>
        </section>
      </div>

      <button 
        type="button" 
        onClick={onNext} 
        disabled={!selected}
        className="primary-pill mt-4 w-full h-13 text-[15px] font-extrabold cursor-pointer bg-gradient-to-r from-[#0a438a] to-[#2d7fe0] shadow-[0_10px_30px_rgba(45,127,224,0.4)] disabled:opacity-40 transition-all"
      >
        Next
      </button>
    </div>
  );
}

// ── 5. Auth Forms ─────────────────────────────────────────────────────────

interface SignupScreenProps {
  fullName: string;
  setFullName: (v: string) => void;
  email: string;
  setEmail: (v: string) => void;
  password: string;
  setPassword: (v: string) => void;
  confirmPassword: string;
  setConfirmPassword: (v: string) => void;
  persona: string;
  industry: string;
  country: string;
  language: string;
  onLogin: () => void;
  onNext: () => void;
  onGoogle: () => void;
  onBase: () => void;
}

function SignupScreen({ 
  fullName, setFullName,
  email, setEmail,
  password, setPassword,
  persona, industry, country, language,
  onLogin, onNext, onGoogle, onBase
}: SignupScreenProps) {
  const [agreeTerms, setAgreeTerms] = useState(true);

  const handleRegister = async (e: FormEvent) => {
    e.preventDefault();
    if (!agreeTerms) {
      alert("Please agree to the Terms & Privacy Policy.");
      return;
    }
    const profilePayload = {
      fullName: fullName || "Emmanuel",
      email,
      role: persona || "Business Owner",
      industry: industry || "Technology & Innovation",
      country: country || "Nigeria",
      language: language || "English"
    };
    localStorage.setItem("pal_user_profile", JSON.stringify(profilePayload));
    onNext();
  };

  return (
    <div className="relative h-full flex-1 flex flex-col justify-between overflow-y-auto scrollbar-hide px-[30px] pt-[20px] pb-[30px] text-left">
      <div>
        <h1 className="text-[32px] font-extrabold leading-none text-white">Create Account</h1>
        <p className="mt-2 text-xs text-slate-400">Initialize your PAL executive profile.</p>

        <form onSubmit={handleRegister} className="mt-4 space-y-3">
          <AuthField label="Full Name" placeholder="Emmanuel" value={fullName} onChange={setFullName} />
          <AuthField label="Work Email" placeholder="founder@company.com" type="email" value={email} onChange={setEmail} />
          <AuthField label="Password" placeholder="••••••••" password value={password} onChange={setPassword} />
          
          <label className="flex items-center gap-2 text-xs text-slate-400 cursor-pointer pt-1">
            <input
              type="checkbox"
              checked={agreeTerms}
              onChange={(e) => setAgreeTerms(e.target.checked)}
              className="rounded border-white/20 bg-black text-[#2d7fe0]"
            />
            <span>I agree to PAL&apos;s <strong className="text-white">Terms &amp; Privacy Policy</strong></span>
          </label>

          <AuthButtons primaryLabel="Continue to Business Brain" onPrimary={handleRegister} onGoogle={onGoogle} onBase={onBase} />
        </form>
      </div>

      <p className="mt-4 text-center text-xs text-slate-400">
        Already have an account?{" "}
        <button type="button" onClick={onLogin} className="font-bold text-[#38bdf8] hover:underline cursor-pointer">
          Sign In
        </button>
      </p>
    </div>
  );
}

function LoginScreen({
  email,
  setEmail,
  password,
  setPassword,
  onSignup,
  onNext,
  onGoogle,
  onBase
}: {
  email: string;
  setEmail: (v: string) => void;
  password: string;
  setPassword: (v: string) => void;
  onSignup: () => void;
  onNext: () => void;
  onGoogle: () => void;
  onBase: () => void;
}) {
  const handleLoginSubmit = (e: FormEvent) => {
    e.preventDefault();
    onNext();
  };

  return (
    <div className="relative h-full flex-1 flex flex-col justify-between overflow-y-auto scrollbar-hide px-[30px] pt-[20px] pb-[30px] text-left">
      <div>
        <h1 className="text-[32px] font-extrabold leading-none text-white">Welcome Back</h1>
        <p className="mt-2 text-xs text-slate-400">Sign in to your PAL Business Brain.</p>

        <form onSubmit={handleLoginSubmit} className="mt-4 space-y-3">
          <AuthField label="Email" placeholder="founder@company.com" type="email" value={email} onChange={setEmail} />
          <AuthField label="Password" placeholder="••••••••" password value={password} onChange={setPassword} />
          <AuthMeta />
          <AuthButtons primaryLabel="Sign In" onPrimary={handleLoginSubmit} onGoogle={onGoogle} onBase={onBase} />
        </form>
      </div>

      <p className="mt-4 text-center text-xs text-slate-400">
        Don&apos;t have an account?{" "}
        <button type="button" onClick={onSignup} className="font-bold text-[#38bdf8] hover:underline cursor-pointer">
          Sign Up
        </button>
      </p>
    </div>
  );
}

function AuthField({
  label,
  placeholder,
  type = "text",
  password = false,
  value,
  onChange
}: {
  label: string;
  placeholder: string;
  type?: string;
  password?: boolean;
  value: string;
  onChange: (val: string) => void;
}) {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <label className="block text-xs text-slate-300 text-left font-semibold">
      {label}
      <span className="relative mt-1 block">
        <input 
          className="w-full h-11 rounded-xl text-xs bg-[#060911] border border-white/15 px-3.5 text-white outline-none focus:border-[#2d7fe0]"
          placeholder={placeholder} 
          type={password ? (showPassword ? "text" : "password") : type} 
          value={value}
          onChange={(e) => onChange(e.target.value)}
          required
        />
        {password && (
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-3 text-slate-400 hover:text-white cursor-pointer"
          >
            {showPassword ? <Eye size={16} /> : <EyeOff size={16} />}
          </button>
        )}
      </span>
    </label>
  );
}

function AuthMeta() {
  return (
    <div className="mt-2 flex items-center justify-between text-xs text-slate-400 select-none">
      <label className="flex items-center gap-2 cursor-pointer">
        <input type="checkbox" defaultChecked className="rounded border-white/20 bg-black text-[#2d7fe0]" />
        Remember me
      </label>
      <button type="button" onClick={() => alert("Password reset link sent!")} className="cursor-pointer hover:text-white">
        Forgot password?
      </button>
    </div>
  );
}

function AuthButtons({ 
  primaryLabel, 
  onPrimary,
  onGoogle,
  onBase
}: { 
  primaryLabel: string; 
  onPrimary: (e: FormEvent) => void;
  onGoogle: () => void;
  onBase: () => void;
}) {
  return (
    <div className="mt-3 grid gap-2 w-full">
      <button 
        type="submit" 
        onClick={(e) => onPrimary(e)}
        className="primary-pill h-12 text-xs font-extrabold w-full cursor-pointer bg-gradient-to-r from-[#0a438a] to-[#2d7fe0] shadow-[0_10px_30px_rgba(45,127,224,0.4)] flex items-center justify-center"
      >
        {primaryLabel}
      </button>
      <button
        type="button"
        onClick={onGoogle}
        className="h-11 rounded-full border border-white/15 bg-white/10 hover:bg-white/15 text-xs font-bold text-white cursor-pointer transition-all flex items-center justify-center gap-2"
      >
        <span>Sign in with Google</span>
      </button>
      <button
        type="button"
        onClick={onBase}
        className="h-11 rounded-full border border-white/15 bg-white/10 hover:bg-white/15 text-xs font-bold text-white cursor-pointer transition-all flex items-center justify-center gap-2"
      >
        <span className="inline-block h-3 w-3 rounded-xs bg-[#0052ff]" />
        <span>Sign in with Base ID</span>
      </button>
    </div>
  );
}

// ── 6. OTP Screen in Executive Dark Glass (NO WHITE BOX) ─────────────────

function OtpScreen({ email, onNext }: { email: string; onNext: () => void }) {
  const [code, setCode] = useState("");
  const [error, setError] = useState(false);
  const [success, setSuccess] = useState(false);
  const [timeLeft] = useState(60);

  const pressDigit = (digit: string) => {
    setError(false);
    setCode((value) => (value.length < 5 ? `${value}${digit}` : value));
  };

  const verify = () => {
    if (code.length < 5) return;
    setSuccess(true);
  };

  useEffect(() => {
    if (code.length === 5) {
      verify();
    }
  }, [code]);

  return (
    <div className="relative h-full flex-1 flex flex-col justify-between overflow-y-auto scrollbar-hide text-left px-[24px] pt-[20px] pb-[24px]">
      <div className="w-full flex-1 flex flex-col justify-between">
        <section className="rounded-[30px] p-6 bg-[#101726]/90 border border-white/12 backdrop-blur-xl shadow-2xl text-white">
          <h1 className="text-xl font-extrabold text-white">Enter Verification Code</h1>
          <p className="mt-2 text-xs text-slate-300 leading-relaxed">
            Activation code sent to <strong className="text-[#38bdf8]">{email || "your email"}</strong>
          </p>

          <div className="mt-4 flex justify-between gap-1.5 w-full">
            {[0, 1, 2, 3, 4].map((index) => (
              <button
                key={index}
                type="button"
                onClick={() => pressDigit("1")}
                className={cn(
                  "grid h-13 w-11 place-items-center rounded-xl border text-xl font-extrabold cursor-pointer transition-all outline-none",
                  error 
                    ? "border-red-500 text-red-400 bg-red-950/40" 
                    : (index === code.length && !success)
                      ? "border-[#2d7fe0] ring-2 ring-[#2d7fe0]/40 bg-[#060911] text-white scale-105" 
                      : code[index] 
                        ? "border-[#2d7fe0]/60 text-white bg-[#060911] font-bold" 
                        : "border-white/15 text-slate-500 bg-[#060911]/50"
                )}
              >
                {code[index] ?? ""}
              </button>
            ))}
          </div>

          <p className="mt-4 text-center text-xs text-slate-400">
            Resend code in <strong className="text-[#38bdf8] font-mono">{timeLeft}s</strong>
          </p>
        </section>

        {/* Custom Number Pad */}
        <div className="py-4 grid grid-cols-3 gap-2 max-w-[300px] mx-auto w-full">
          {["1", "2", "3", "4", "5", "6", "7", "8", "9", "", "0", "⌫"].map((k, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => {
                if (k === "⌫") setCode(prev => prev.slice(0, -1));
                else if (k) pressDigit(k);
              }}
              className="h-11 rounded-xl bg-white/10 border border-white/10 text-base font-bold text-white active:scale-95 transition-all hover:bg-white/20"
            >
              {k}
            </button>
          ))}
        </div>

        {/* Animated Executive Success Modal */}
        {success && <SuccessModal onNext={onNext} />}
      </div>
    </div>
  );
}

function SuccessModal({ onNext }: { onNext: () => void }) {
  return (
    <div className="absolute inset-0 z-50 bg-[#060911]/90 backdrop-blur-md flex items-end animate-in fade-in duration-300">
      <div className="w-full rounded-t-[32px] bg-[#101726] border-t border-white/20 p-6 text-center text-white shadow-2xl space-y-4">
        <div className="mx-auto grid h-20 w-20 place-items-center rounded-full bg-[#2d7fe0]/20 border border-[#2d7fe0] animate-bounce">
          <span className="text-4xl leading-none">🎉</span>
        </div>
        <div className="space-y-1">
          <h2 className="text-xl font-extrabold text-white">
            Congrats! You&apos;re All Set Up.
          </h2>
          <p className="text-xs text-slate-300 leading-relaxed max-w-[280px] mx-auto">
            Your <strong className="text-[#38bdf8]">PAL Executive Assistant</strong> is ready to build your Business Brain! 💪
          </p>
        </div>

        {/* Dashboard Preview Badge */}
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#2d7fe0]/15 border border-[#2d7fe0]/30 text-[11px] font-bold text-[#38bdf8]">
          <Sparkles size={14} className="animate-spin" />
          <span>Executive Brain Online • Syncing Projects</span>
        </div>

        <button 
          type="button" 
          onClick={onNext} 
          className="primary-pill w-full h-13 text-xs font-extrabold cursor-pointer bg-gradient-to-r from-[#0a438a] to-[#2d7fe0] shadow-[0_10px_30px_rgba(45,127,224,0.4)] flex items-center justify-center"
        >
          Initialize Business Brain 🚀
        </button>
      </div>
    </div>
  );
}
