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
  const { theme, toggleTheme } = useTheme();
  const [screen, setScreenState] = useState<Screen>("growth");
  
  // Collected User Data
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

  const isDark = theme === "dark";

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
        <section className={cn("phone")} aria-label="PAL app">
          <StatusBar tone={isDark ? "dark" : "light"} />

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
          <div className="relative h-[calc(100%_-_58px)] overflow-y-auto scrollbar-hide pb-10">
            <div className="min-h-[680px] w-full h-full relative">
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
          </div>
        )}
        
        {screen === "login" && (
          <div className="relative h-[calc(100%_-_58px)] overflow-y-auto scrollbar-hide pb-10">
            <div className="min-h-[600px] w-full h-full relative">
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
          </div>
        )}
        
        {screen === "otp" && (
          <div className="relative h-[calc(100%_-_58px)] overflow-y-auto scrollbar-hide">
            <div className="min-h-[640px] w-full h-full relative">
              <OtpScreen 
                email={email}
                onNext={() => setScreen("business_brain")} 
              />
            </div>
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

function StatusBar({ tone, onToggleTheme }: { tone: Tone; onToggleTheme?: () => void }) {
  return (
    <div className={cn("status-bar", tone === "dark" && "status-dark")}>
      <span>9:41</span>
      {tone === "light" && <span className="dynamic-island" aria-hidden="true" />}
      <div className="status-icons" aria-hidden="true">
        <span className="signal"><span /><span /><span /><span /></span>
        <span className="wifi"><span className="wifi-dot" /></span>
        <span className="battery" />
      </div>
    </div>
  );
}

function ProgressBars({ active }: { active: number }) {
  return (
    <div className="progress-bars" aria-hidden="true">
      {[0, 1, 2].map((index) => (
        <span key={index} className={index === active ? "active" : ""} />
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
        className="h-auto w-full"
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
        className="w-full h-auto"
      />
    </div>
  );
}

// ── 1. Welcome Intro Slides with Swipe, Skip, and Timer Support ───────────

function GrowthIntro({ onNext, onSkip }: { onNext: () => void; onSkip: () => void }) {
  const [touchStart, setTouchStart] = useState<number | null>(null);

  const handleTouchEnd = (e: TouchEvent) => {
    if (touchStart === null) return;
    const touchEnd = e.changedTouches[0].clientX;
    if (touchStart - touchEnd > 50) {
      onNext(); // Swipe left to next
    }
  };

  return (
    <div
      onTouchStart={(e) => setTouchStart(e.touches[0].clientX)}
      onTouchEnd={handleTouchEnd}
      className="relative h-full flex-1 flex flex-col justify-between overflow-y-auto scrollbar-hide px-[34px] pt-[20px] pb-[34px]"
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

      {/* Main Hero Content */}
      <div className="min-h-[440px] w-full flex-1 relative flex flex-col pt-4 z-20">
        <h1 className="mt-[16px] text-[54px] font-black leading-[0.94] text-left tracking-tight">
          <span className="text-[#38bdf8] drop-shadow-[0_0_25px_rgba(56,189,248,0.3)]">
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

        {/* Mascot Hero with Backlight Glow */}
        <div className="absolute -right-[240px] bottom-[-40px] z-10 pointer-events-none">
          <div className="absolute inset-0 bg-[#2d7fe0]/20 blur-3xl rounded-full" />
          <Mascot priority className="w-[480px] max-w-none mascot-peek relative z-10 drop-shadow-[0_20px_60px_rgba(0,0,0,0.8)]" />
        </div>
      </div>

      {/* Bottom Executive Action Card & CTA */}
      <div className="relative z-30 space-y-3 shrink-0 mt-auto">
        <button
          type="button"
          onClick={onNext}
          className="w-full text-left rounded-[24px] bg-[#101726]/85 border border-white/12 backdrop-blur-xl p-4 text-white shadow-2xl transition-all hover:border-white/25 active:scale-[0.98] cursor-pointer"
        >
          <p className="text-[15px] font-semibold leading-snug text-white">
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
      className="relative h-[calc(100%_-_58px)] overflow-y-auto scrollbar-hide px-[34px] pt-[24px]"
    >
      <div className="flex justify-between items-center z-30 relative">
        <button
          type="button"
          onClick={onBack}
          className="w-8 h-8 rounded-full bg-white/40 border border-white/60 flex items-center justify-center text-[#0a438a] cursor-pointer"
        >
          <ArrowLeft size={16} />
        </button>
        <ProgressBars active={1} />
        <button
          type="button"
          onClick={onSkip}
          className="text-xs font-bold text-[#0a438a] bg-white/40 backdrop-blur-xs border border-white/60 px-3 py-1 rounded-full cursor-pointer hover:bg-white transition-colors"
        >
          Skip
        </button>
      </div>

      <button
        type="button"
        onClick={onNext}
        className="flex flex-col w-full h-full min-h-[620px] items-start overflow-hidden text-left cursor-pointer border-0 outline-none relative pt-4"
      >
        <Mascot priority className="absolute -right-[250px] bottom-[-270px] w-[600px] max-w-none manage-mascot z-0" />
        <BrandLogo className="mt-[24px] h-auto w-[168px] ml-[10px] manage-logo relative z-10" />
        <h1 className="mt-[7px] text-[54px] font-semibold leading-[0.96] text-left ml-[10px] manage-heading relative z-10" style={{ color: 'var(--onb-heading)' }}>
          Tracks
          <br />
          Manage
          <br />
          &amp; Grow
          <br />
          <span style={{ color: 'var(--onb-heading)' }} className="font-bold">All In One</span>
          <br />
          <span style={{ color: 'var(--onb-heading)' }} className="font-bold">Place.</span>
        </h1>
      </button>
    </div>
  );
}

function TogetherIntro({ onNext, onBack }: { onNext: () => void; onBack: () => void }) {
  return (
    <div className="relative h-[calc(100%_-_58px)] overflow-y-auto scrollbar-hide px-[34px] pt-[24px]">
      <div className="flex justify-between items-center z-30 relative">
        <button
          type="button"
          onClick={onBack}
          className="w-8 h-8 rounded-full bg-white/40 border border-white/60 flex items-center justify-center text-[#0a438a] cursor-pointer"
        >
          <ArrowLeft size={16} />
        </button>
        <ProgressBars active={2} />
        <div className="w-8" />
      </div>

      <div className="min-h-[620px] w-full h-full relative flex flex-col pt-3">
        <div className="pal-card-stack relative mt-[42px] rounded-[31px] bg-white px-[32px] pb-[31px] pt-[28px] shadow-pal text-left onb-card together-card">
          <ul className="relative z-10 list-disc space-y-[18px] pl-[18px] text-[15px] leading-[1.3] marker:text-[#3b5a7c]" style={{ color: '#3b5a7c' }}>
            <li>
              <span className="font-semibold text-[#0a438a]">Log sales, expenses,</span> and project updates
              effortlessly. PAL remembers everything.
            </li>
            <li>
              <span className="font-semibold text-[#0a438a]">Get daily insights on profit,</span> spending, and growth in simple executive terms.
            </li>
            <li>
              <span className="font-semibold text-[#0a438a]">Tech? Retail? Services?</span>
              <br />
              PAL adapts to your hustle, your flow, your way.
            </li>
            <li>
              You don&apos;t have to build alone anymore.
              <br />
              <span className="font-semibold text-[#0a438a]">PAL is with you. Let&apos;s go 🚀</span>
            </li>
          </ul>
          <Mascot className="absolute -bottom-[83px] left-[118px] z-20 w-[96px]" />
        </div>
        <button
          type="button"
          onClick={onNext}
          className="primary-pill absolute bottom-[39px] left-[34px] right-[34px] w-[calc(100%_-_68px)] cursor-pointer"
        >
          Let&apos;s go 🚀
        </button>
      </div>
    </div>
  );
}

// ── 2. Rich Persona Cards ──────────────────────────────────────────────────

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
    <div className="relative h-[calc(100%_-_58px)] overflow-y-auto scrollbar-hide px-[34px] pt-[16px]">
      <div className="min-h-[620px] w-full h-full relative flex flex-col text-left">
        <div className="flex items-center gap-3 mb-2">
          <button
            type="button"
            onClick={onBack}
            className="w-8 h-8 rounded-full bg-white/40 border border-white/60 flex items-center justify-center text-[#0a438a] cursor-pointer"
          >
            <ArrowLeft size={16} />
          </button>
          <p className="text-[20px] font-semibold leading-none" style={{ color: 'var(--onb-subtext)' }}>Hey welcome!</p>
        </div>
        
        <h1 className="text-[28px] font-extrabold leading-[1.12]" style={{ color: 'var(--onb-heading)' }}>
          Tell us who you are?
        </h1>

        <div className="pal-card-stack relative mt-[28px] rounded-[31px] bg-white px-[20px] pb-[24px] pt-[24px] shadow-pal persona-card" style={{ color: '#111827' }}>
          <div className="relative z-10 grid gap-[12px]">
            {personaOptions.map((opt) => {
              const isSelected = value === opt.value;
              return (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => onChange(opt.value)}
                  className={cn(
                    "rounded-[18px] p-3.5 text-left transition-all cursor-pointer border flex items-center gap-3",
                    isSelected
                      ? "bg-[#0a438a] text-white border-[#0a438a] shadow-md scale-[1.01]"
                      : "bg-[#f8fafc] text-zinc-800 border-zinc-200 hover:border-[#0a438a]/40"
                  )}
                >
                  <span className="text-2xl shrink-0 p-2 rounded-xl bg-white/10">{opt.icon}</span>
                  <div>
                    <h3 className={cn("text-sm font-bold leading-tight", isSelected ? "text-white" : "text-zinc-900")}>
                      {opt.title}
                    </h3>
                    <p className={cn("text-[11px] leading-snug mt-0.5 font-medium", isSelected ? "text-blue-100" : "text-zinc-500")}>
                      {opt.description}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>
          <Mascot className="absolute -bottom-[68px] left-[119px] z-20 w-[97px]" />
        </div>

        <button 
          type="button" 
          onClick={onNext} 
          disabled={!value}
          className="primary-pill absolute bottom-[39px] left-[34px] right-[34px] w-[calc(100%_-_68px)] cursor-pointer disabled:opacity-50"
        >
          Next
        </button>
      </div>
    </div>
  );
}

// ── 3. Searchable Industry Selection ──────────────────────────────────────

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
    <div className="relative h-[calc(100%_-_58px)] overflow-y-auto scrollbar-hide px-[34px] pt-[16px]">
      <div className="min-h-[580px] w-full h-full relative flex flex-col text-left">
        <div className="flex items-center gap-3 mb-1">
          <button
            type="button"
            onClick={onBack}
            className="w-8 h-8 rounded-full bg-white/40 border border-white/60 flex items-center justify-center text-[#0a438a] cursor-pointer"
          >
            <ArrowLeft size={16} />
          </button>
          <h1 className="text-[28px] font-extrabold leading-[1.05]" style={{ color: 'var(--onb-heading)' }}>
            Choose Industry
          </h1>
        </div>

        <p className="mt-[2px] max-w-[340px] text-[14px] font-medium leading-[1.25]" style={{ color: 'var(--onb-subtext)' }}>
          Please select your business sector below.
        </p>

        {/* Search Industry Bar */}
        <div className="relative mt-3 mb-2">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchQuery(e.target.value)}
            placeholder="Search Industry..."
            className="w-full h-10 bg-white border border-gray-300 rounded-xl pl-9 pr-4 text-xs font-semibold text-black outline-none shadow-xs placeholder:text-gray-400"
          />
        </div>

        <div className="mt-1 grid grid-cols-2 gap-[10px] w-full max-h-[320px] overflow-y-auto pr-1 scrollbar-hide">
          {filteredIndustries.map(({ icon: Icon, label }) => {
            const isSelected = value === label;
            return (
              <button
                key={label}
                type="button"
                onClick={() => onChange(label)}
                className={cn(
                  "flex flex-col items-center justify-center gap-[6px] rounded-[16px] border p-[10px] text-center text-[12px] font-bold transition cursor-pointer shadow-sm min-h-[85px]",
                  isSelected
                    ? "bg-[#0a438a] text-white border-[#0a438a]"
                    : "bg-white text-zinc-800 border-zinc-200 hover:border-[#0a438a]/40"
                )}
              >
                <Icon 
                  size={20} 
                  className={isSelected ? "text-white" : "text-[#0a438a]"}
                  strokeWidth={2.2} 
                />
                <span className="leading-tight">{label}</span>
              </button>
            );
          })}
        </div>

        <button 
          type="button" 
          onClick={onNext} 
          disabled={!value}
          className="primary-pill absolute bottom-[39px] left-[34px] right-[34px] w-[calc(100%_-_68px)] cursor-pointer disabled:opacity-50"
        >
          Next
        </button>
      </div>
    </div>
  );
}

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
    <div className="relative h-[calc(100%_-_58px)] overflow-y-auto scrollbar-hide px-[34px] pt-[16px]">
      <div className="min-h-[620px] w-full h-full relative flex flex-col text-left">
        <div className="flex items-center gap-3 mb-1">
          <button
            type="button"
            onClick={onBack}
            className="w-8 h-8 rounded-full bg-white/40 border border-white/60 flex items-center justify-center text-[#0a438a] cursor-pointer"
          >
            <ArrowLeft size={16} />
          </button>
          <h1 className="text-[28px] font-extrabold leading-[1.05]" style={{ color: 'var(--onb-heading)' }}>
            Choose Country
          </h1>
        </div>

        <p className="mt-[2px] max-w-[350px] text-[14px] font-medium leading-[1.25]" style={{ color: 'var(--onb-subtext)' }}>
          Select your primary business country.
        </p>

        <section className="mt-[16px] h-[340px] overflow-hidden rounded-[30px] px-[16px] pt-[12px] shadow-pal bg-white border border-gray-100 flex flex-col pb-4">
          <label className="relative block w-full flex-shrink-0">
            <span className="sr-only">Search country</span>
            <input
              value={query}
              onChange={(event) => onQuery(event.target.value)}
              className="h-[40px] w-full rounded-full border border-gray-300 bg-gray-50 px-[23px] pr-[48px] text-[15px] text-black outline-none placeholder:text-gray-400 font-medium"
              placeholder="Search country..."
            />
            <Search className="absolute right-[20px] top-[9px] text-gray-400" size={20} />
          </label>

          <div className="mt-[14px] h-[250px] overflow-y-auto pb-[20px] pl-[6px] pr-[7px] scrollbar-hide text-black">
            {filtered.map(([flag, name]) => (
              <button
                key={name}
                type="button"
                onClick={() => onSelect(name)}
                className={cn(
                  "flex h-[43px] w-full items-center justify-between rounded-[8px] text-[15px] cursor-pointer px-3 transition-colors",
                  selected === name 
                    ? "bg-[#0a438a]/10 text-[#0a438a] font-bold" 
                    : "hover:bg-gray-100"
                )}
              >
                <div className="flex items-center gap-[16px]">
                  <span className="text-[24px] leading-none">{flag}</span>
                  <span>{name}</span>
                </div>
                {selected === name && <Check size={18} className="text-[#0a438a]" strokeWidth={3} />}
              </button>
            ))}
          </div>
        </section>

        <button 
          type="button" 
          onClick={onNext} 
          disabled={!selected}
          className="primary-pill absolute bottom-[39px] left-[34px] right-[34px] w-[calc(100%_-_68px)] cursor-pointer disabled:opacity-50"
        >
          Next
        </button>
      </div>
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
    <div className="relative h-[calc(100%_-_58px)] overflow-y-auto scrollbar-hide px-[34px] pt-[16px]">
      <div className="min-h-[620px] w-full h-full relative flex flex-col text-left">
        <div className="flex items-center gap-3 mb-1">
          <button
            type="button"
            onClick={onBack}
            className="w-8 h-8 rounded-full bg-white/40 border border-white/60 flex items-center justify-center text-[#0a438a] cursor-pointer"
          >
            <ArrowLeft size={16} />
          </button>
          <h1 className="text-[28px] font-extrabold leading-[1.05]" style={{ color: 'var(--onb-heading)' }}>
            Choose Language
          </h1>
        </div>

        <p className="mt-[2px] max-w-[350px] text-[14px] font-medium leading-[1.25]" style={{ color: 'var(--onb-subtext)' }}>
          Select your preferred language for PAL.
        </p>

        <section className="mt-[20px] h-[320px] overflow-hidden rounded-[30px] px-[20px] pt-[12px] shadow-pal bg-white border border-gray-100 text-black flex flex-col pb-4">
          <div className="h-full overflow-y-auto scrollbar-hide pb-4">
            {languages.map(([flag, name]) => (
              <button
                key={name}
                type="button"
                onClick={() => onSelect(name)}
                className={cn(
                  "flex h-[52px] w-full items-center justify-between rounded-[10px] text-[15px] cursor-pointer px-3 transition-colors",
                  selected === name 
                    ? "bg-[#0a438a]/10 text-[#0a438a] font-bold" 
                    : "hover:bg-gray-100"
                )}
              >
                <div className="flex items-center gap-[12px]">
                  <span className="text-[24px] leading-none">{flag}</span>
                  <span>{name}</span>
                </div>
                {selected === name && <Check size={18} className="text-[#0a438a]" strokeWidth={3} />}
              </button>
            ))}
          </div>
        </section>

        <button 
          type="button" 
          onClick={onNext} 
          disabled={!selected}
          className="primary-pill absolute bottom-[39px] left-[34px] right-[34px] w-[calc(100%_-_68px)] cursor-pointer disabled:opacity-50"
        >
          Next
        </button>
      </div>
    </div>
  );
}

// ── Auth Forms ─────────────────────────────────────────────────────────────

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
  confirmPassword, setConfirmPassword,
  persona, industry, country, language,
  onLogin, onNext, onGoogle, onBase
}: SignupScreenProps) {
  const [agreeTerms, setAgreeTerms] = useState(true);
  const [loading, setLoading] = useState(false);

  const handleRegister = async (e: FormEvent) => {
    e.preventDefault();
    if (!agreeTerms) {
      alert("Please agree to the Terms & Privacy Policy.");
      return;
    }
    setLoading(true);
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
    <div className="relative h-full overflow-y-auto scrollbar-hide px-[34px] pt-[24px]">
      <div className="min-h-[640px] w-full h-full relative flex flex-col text-left">
        <h1 className="text-[32px] font-extrabold leading-none text-white">Create Account</h1>
        <p className="mt-[8px] text-[13px] text-zinc-400">Initialize your PAL executive profile.</p>

        <form onSubmit={handleRegister} className="mt-5 space-y-3">
          <AuthField label="Full Name" placeholder="Emmanuel" value={fullName} onChange={setFullName} />
          <AuthField label="Work Email" placeholder="founder@company.com" type="email" value={email} onChange={setEmail} />
          <AuthField label="Password" placeholder="••••••••" password value={password} onChange={setPassword} />
          
          <label className="flex items-center gap-2 text-xs text-zinc-400 cursor-pointer pt-1">
            <input
              type="checkbox"
              checked={agreeTerms}
              onChange={(e) => setAgreeTerms(e.target.checked)}
              className="rounded border-zinc-700 bg-zinc-900 text-[#2d7fe0]"
            />
            <span>I agree to PAL&apos;s <strong className="text-white">Terms &amp; Privacy Policy</strong></span>
          </label>

          <AuthButtons primaryLabel="Continue to Business Brain" onPrimary={handleRegister} onGoogle={onGoogle} onBase={onBase} />
        </form>

        <p className="mt-4 text-center text-xs text-zinc-400">
          Already have an account?{" "}
          <button type="button" onClick={onLogin} className="font-bold text-[#2d7fe0] hover:underline cursor-pointer">
            Sign In
          </button>
        </p>
      </div>
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
    <div className="relative h-full overflow-y-auto scrollbar-hide px-[34px] pt-[24px]">
      <div className="min-h-[580px] w-full h-full relative flex flex-col text-left">
        <h1 className="text-[32px] font-extrabold leading-none text-white">Welcome Back</h1>
        <p className="mt-[8px] text-[13px] text-zinc-400">Sign in to your PAL Business Brain.</p>

        <form onSubmit={handleLoginSubmit} className="mt-5 space-y-3">
          <AuthField label="Email" placeholder="founder@company.com" type="email" value={email} onChange={setEmail} />
          <AuthField label="Password" placeholder="••••••••" password value={password} onChange={setPassword} />
          <AuthMeta />
          <AuthButtons primaryLabel="Sign In" onPrimary={handleLoginSubmit} onGoogle={onGoogle} onBase={onBase} />
        </form>

        <p className="mt-4 text-center text-xs text-zinc-400">
          Don&apos;t have an account?{" "}
          <button type="button" onClick={onSignup} className="font-bold text-[#2d7fe0] hover:underline cursor-pointer">
            Sign Up
          </button>
        </p>
      </div>
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
    <label className="block text-[12px] text-zinc-300 text-left font-semibold">
      {label}
      <span className="relative mt-1 block">
        <input 
          className="auth-input w-full h-11 rounded-xl text-[15px] bg-[#121620] border border-white/10 px-3.5 text-white outline-none focus:border-[#2d7fe0]"
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
            className="absolute right-3 top-3 text-zinc-400 hover:text-white cursor-pointer"
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
    <div className="mt-2 flex items-center justify-between text-xs text-zinc-400 select-none">
      <label className="flex items-center gap-2 cursor-pointer">
        <input type="checkbox" defaultChecked className="rounded border-zinc-700 bg-zinc-900 text-[#2d7fe0]" />
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
    <div className="mt-4 grid gap-2.5 w-full">
      <button 
        type="submit" 
        onClick={(e) => onPrimary(e)}
        className="primary-pill h-12 text-sm font-bold w-full cursor-pointer flex items-center justify-center"
      >
        {primaryLabel}
      </button>
      <button
        type="button"
        onClick={onGoogle}
        className="h-11 rounded-full border border-gray-300 bg-white text-xs font-bold text-black cursor-pointer active:scale-95 transition-transform flex items-center justify-center gap-2"
      >
        <span>Sign in with Google</span>
      </button>
      <button
        type="button"
        onClick={onBase}
        className="h-11 rounded-full border border-gray-300 bg-white text-xs font-bold text-black cursor-pointer active:scale-95 transition-transform flex items-center justify-center gap-2"
      >
        <span className="inline-block h-3.5 w-3.5 rounded-xs bg-[#0052ff]" />
        <span>Sign in with Base ID</span>
      </button>
    </div>
  );
}

// ── 4. OTP Screen with Automatic 5-Digit Verification ─────────────────────

function OtpScreen({ email, onNext }: { email: string; onNext: () => void }) {
  const [code, setCode] = useState("");
  const [error, setError] = useState(false);
  const [success, setSuccess] = useState(false);
  const [timeLeft, setTimeLeft] = useState(60);

  const pressDigit = (digit: string) => {
    setError(false);
    setCode((value) => (value.length < 5 ? `${value}${digit}` : value));
  };

  const verify = () => {
    if (code.length < 5) return;
    setSuccess(true);
  };

  // Auto verify when 5th digit is typed!
  useEffect(() => {
    if (code.length === 5) {
      verify();
    }
  }, [code]);

  return (
    <div className="relative h-[calc(100%_-_58px)] overflow-y-auto scrollbar-hide text-left">
      <div className="min-h-[640px] w-full h-full relative flex flex-col justify-between">
        <section className="mx-[20px] mt-[24px] rounded-[30px] px-[24px] pb-[28px] pt-[24px] shadow-pal bg-white" style={{ color: '#111827' }}>
          <h1 className="text-[24px] font-extrabold text-[#0a438a]">Enter Verification Code</h1>
          <p className="mt-[8px] text-[13px] leading-relaxed text-zinc-600">
            Activation code sent to <strong className="text-zinc-900">{email || "your email"}</strong>
          </p>

          <div className="mt-[16px] flex justify-between gap-1.5 w-full">
            {[0, 1, 2, 3, 4].map((index) => (
              <button
                key={index}
                type="button"
                onClick={() => pressDigit("1")}
                className={cn(
                  "grid h-[54px] w-[46px] place-items-center rounded-[12px] border text-[22px] font-extrabold cursor-pointer transition-all outline-none",
                  error 
                    ? "border-red-500 text-red-500 bg-red-50" 
                    : (index === code.length && !success)
                      ? "border-[#0a438a] ring-2 ring-[#0a438a]/20 bg-white scale-105" 
                      : code[index] 
                        ? "border-gray-400 text-gray-900 bg-white font-bold" 
                        : "border-gray-200 text-gray-400 bg-gray-50"
                )}
              >
                {code[index] ?? ""}
              </button>
            ))}
          </div>

          <p className="mt-4 text-center text-xs text-zinc-500">
            Resend code in <strong className="text-[#0a438a] font-mono">{timeLeft}s</strong>
          </p>
        </section>

        {/* Custom Number Pad */}
        <div className="p-4 grid grid-cols-3 gap-2 max-w-[320px] mx-auto w-full">
          {["1", "2", "3", "4", "5", "6", "7", "8", "9", "", "0", "⌫"].map((k, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => {
                if (k === "⌫") setCode(prev => prev.slice(0, -1));
                else if (k) pressDigit(k);
              }}
              className="h-12 rounded-xl bg-white/10 border border-white/10 text-lg font-bold text-white active:scale-95 transition-transform"
            >
              {k}
            </button>
          ))}
        </div>

        {/* Animated Celebration Success Modal */}
        {success && <SuccessModal onNext={onNext} />}
      </div>
    </div>
  );
}

function SuccessModal({ onNext }: { onNext: () => void }) {
  return (
    <div className="absolute inset-0 z-30 bg-[#0a4072]/85 backdrop-blur-md flex items-end animate-in fade-in duration-300">
      <div className="w-full rounded-t-[32px] bg-[#121620] border-t border-white/20 px-[32px] pb-[44px] pt-[28px] text-center text-white shadow-2xl space-y-4">
        <div className="mx-auto grid h-[110px] w-[110px] place-items-center rounded-full bg-[#2d7fe0]/20 border border-[#2d7fe0] animate-bounce">
          <span className="text-[56px] leading-none">🎉</span>
        </div>
        <h2 className="text-[22px] font-extrabold leading-[1.3] text-white">
          Congrats! You&apos;re All Set Up.
        </h2>
        <p className="text-xs text-zinc-300 leading-relaxed max-w-[280px] mx-auto">
          Your <strong className="text-[#2d7fe0]">PAL Executive Assistant</strong> is ready to build your Business Brain! 💪
        </p>
        <button 
          type="button" 
          onClick={onNext} 
          className="primary-pill mt-4 w-full h-12 text-sm font-bold cursor-pointer flex items-center justify-center shadow-lg"
        >
          Initialize Business Brain 🚀
        </button>
      </div>
    </div>
  );
}
