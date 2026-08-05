"use client";

import React, { useState, useEffect, useMemo, FormEvent, TouchEvent } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  BriefcaseBusiness,
  Check,
  CircleDollarSign,
  Eye,
  EyeOff,
  Home,
  Rocket,
  Search,
  Sparkles,
  Stethoscope,
  GraduationCap,
  Hammer,
  Cpu,
  ShoppingBag,
  Truck,
  Utensils,
  Film,
  Scale,
  Building2,
  Brain
} from "lucide-react";
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
    icon: Rocket,
    title: "Startup",
    description: "Building something new with a team.",
    value: "Startup",
    color: "text-[#38bdf8]"
  },
  {
    icon: Sparkles,
    title: "Freelancer",
    description: "Managing clients and personal work.",
    value: "Freelancer",
    color: "text-[#2d7fe0]"
  },
  {
    icon: Building2,
    title: "Business Owner",
    description: "Running an existing business or company.",
    value: "Business Owner",
    color: "text-[#60a5fa]"
  },
  {
    icon: BriefcaseBusiness,
    title: "Other",
    description: "Tell PAL about your custom setup.",
    value: "Other",
    color: "text-[#a855f7]"
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
          <StatusBar />

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

function StatusBar() {
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
    <div className="progress-bars flex gap-2 w-full items-center" aria-hidden="true">
      {[0, 1, 2].map((index) => (
        <span 
          key={index} 
          className={cn(
            "h-1.5 flex-1 rounded-full transition-all duration-300",
            index === active 
              ? "bg-[#38bdf8] shadow-[0_0_12px_rgba(56,189,248,0.8)]" 
              : "bg-white/30"
          )} 
        />
      ))}
    </div>
  );
}

function BrandLogo({ className }: { className?: string }) {
  return (
    <div className={cn("relative flex items-center gap-2", className)}>
      <Image
        src="/assets/pal-logo.png"
        alt="PAL Logo"
        width={130}
        height={55}
        priority
        className="h-auto w-auto max-w-[130px] filter drop-shadow-[0_0_12px_rgba(45,127,224,0.4)]"
      />
    </div>
  );
}

function Mascot({ className, priority = false }: { className?: string; priority?: boolean }) {
  return (
    <div className={cn("pointer-events-none select-none", className)}>
      <Image
        src="/assets/pal-mascot.png"
        alt="PAL Mascot"
        width={440}
        height={410}
        priority={priority}
        className="w-full h-auto object-contain drop-shadow-[0_15px_35px_rgba(0,0,0,0.8)]"
      />
    </div>
  );
}

// ── 1. Welcome Intro Slides with Tight Composition & No Overlaps ─────────

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
      className="relative h-full flex-1 flex flex-col justify-between overflow-y-auto scrollbar-hide px-6 pt-3 pb-6"
    >
      {/* Top Header Controls */}
      <div className="flex justify-between items-center z-30 relative shrink-0">
        <ProgressBars active={0} />
        <button
          type="button"
          onClick={onSkip}
          className="text-xs font-bold text-slate-200 bg-white/10 backdrop-blur-md border border-white/15 px-3.5 py-1 rounded-full cursor-pointer hover:bg-white/20 transition-all ml-4"
        >
          Skip
        </button>
      </div>

      {/* Main Hero Content - Unblocked Headline & Background Mascot */}
      <div className="relative flex-1 flex flex-col justify-between pt-3 pb-2 z-20">
        <div className="relative z-10 text-left space-y-1">
          <h1 className="text-[44px] font-black leading-[0.94] tracking-tight">
            <span className="text-[#38bdf8] drop-shadow-[0_0_20px_rgba(56,189,248,0.3)]">
              GO FOR
              <br />
              BUSINESS
              <br />
              GROWTH
            </span>
          </h1>
          <h2 className="text-[40px] font-extrabold text-white leading-none">
            WITH PAL
          </h2>
        </div>

        {/* Mascot Hero - Anchored behind/beside headline in lower right background */}
        <div className="absolute right-0 bottom-4 w-[210px] sm:w-[230px] z-0 pointer-events-none opacity-95">
          <div className="absolute inset-0 bg-[#2d7fe0]/25 blur-3xl rounded-full" />
          <Mascot priority className="w-full relative z-10" />
        </div>
      </div>

      {/* Bottom Executive Action Card & CTA */}
      <div className="relative z-30 space-y-2.5 shrink-0 mt-auto">
        <button
          type="button"
          onClick={onNext}
          className="w-full text-left rounded-[22px] bg-[#101726]/90 border border-white/12 backdrop-blur-xl p-4 text-white shadow-2xl transition-all hover:border-white/25 active:scale-[0.98] cursor-pointer"
        >
          <p className="text-xs sm:text-sm font-semibold leading-snug text-white">
            It&apos;s more fun and quick when we do it together! 🚀
          </p>
          <p className="text-[11px] text-[#94a3b8] mt-0.5 font-medium">
            Initialize your Executive AI Operating System in 30 seconds.
          </p>
        </button>

        <button
          type="button"
          onClick={onNext}
          className="primary-pill w-full h-12 text-sm font-extrabold cursor-pointer bg-gradient-to-r from-[#0a438a] to-[#2d7fe0] shadow-[0_10px_30px_rgba(45,127,224,0.4)] hover:brightness-110 active:scale-[0.98] transition-all"
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
      className="relative h-full flex-1 flex flex-col justify-between overflow-y-auto scrollbar-hide px-6 pt-3 pb-6"
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
          className="text-xs font-bold text-slate-200 bg-white/10 backdrop-blur-md border border-white/15 px-3.5 py-1 rounded-full cursor-pointer hover:bg-white/20 transition-all ml-4"
        >
          Skip
        </button>
      </div>

      <div className="relative flex-1 flex flex-col justify-between pt-3 pb-2 z-20 text-left">
        <div className="relative z-10">
          <BrandLogo className="mb-2" />
          <h1 className="text-[38px] font-black leading-[0.96] tracking-tight">
            <span className="text-white">Tracks,</span>
            <br />
            <span className="text-[#38bdf8] drop-shadow-[0_0_20px_rgba(56,189,248,0.3)]">Manage &amp; Grow</span>
            <br />
            <span className="text-white font-extrabold">All In One Place.</span>
          </h1>
        </div>

        {/* Mascot Positioned Responsively in Lower Right */}
        <div className="absolute right-0 bottom-4 w-[210px] sm:w-[230px] z-0 pointer-events-none opacity-95">
          <div className="absolute inset-0 bg-[#2d7fe0]/25 blur-3xl rounded-full" />
          <Mascot priority className="w-full relative z-10" />
        </div>
      </div>

      <div className="relative z-30 shrink-0 mt-auto">
        <button
          type="button"
          onClick={onNext}
          className="primary-pill w-full h-12 text-sm font-extrabold cursor-pointer bg-gradient-to-r from-[#0a438a] to-[#2d7fe0] shadow-[0_10px_30px_rgba(45,127,224,0.4)] hover:brightness-110 active:scale-[0.98] transition-all"
        >
          Continue 🚀
        </button>
      </div>
    </div>
  );
}

function TogetherIntro({ onNext, onBack }: { onNext: () => void; onBack: () => void }) {
  return (
    <div className="relative h-full flex-1 flex flex-col justify-between overflow-y-auto scrollbar-hide px-6 pt-3 pb-6">
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

      {/* Rich Executive Value Proposition Card Filling Vertical Rhythm */}
      <div className="flex-1 flex flex-col justify-center py-2 z-20">
        <div className="relative rounded-[26px] bg-[#101726]/90 border border-white/12 backdrop-blur-xl p-5 shadow-2xl text-left space-y-3">
          <div className="flex items-center gap-2 border-b border-white/10 pb-2">
            <Sparkles size={18} className="text-[#38bdf8]" />
            <h2 className="text-base font-extrabold text-white">Why Founders Choose PAL</h2>
          </div>
          
          <ul className="space-y-2.5 text-xs leading-relaxed text-slate-300">
            <li className="flex items-start gap-2.5">
              <span className="text-[#38bdf8] font-bold text-sm shrink-0">✓</span>
              <span><strong className="text-white">Log sales, expenses &amp; tasks</strong> with zero manual friction.</span>
            </li>
            <li className="flex items-start gap-2.5">
              <span className="text-[#38bdf8] font-bold text-sm shrink-0">✓</span>
              <span><strong className="text-white">Daily Executive Briefings</strong> summarizing net profit, runway &amp; sprint progress.</span>
            </li>
            <li className="flex items-start gap-2.5">
              <span className="text-[#38bdf8] font-bold text-sm shrink-0">✓</span>
              <span><strong className="text-white">Automated Workflow Routing</strong> across Calendar, Slack &amp; GitHub.</span>
            </li>
            <li className="flex items-start gap-2.5">
              <span className="text-[#38bdf8] font-bold text-sm shrink-0">✓</span>
              <span><strong className="text-white">Smart Financial Tracking</strong> with instant multi-currency invoices.</span>
            </li>
            <li className="flex items-start gap-2.5">
              <span className="text-[#38bdf8] font-bold text-sm shrink-0">✓</span>
              <span><strong className="text-white">Adapts to your role</strong> — Startup, Freelance, Agency, or Enterprise.</span>
            </li>
          </ul>

          <div className="pt-2 border-t border-white/10 text-[11px] font-semibold text-[#38bdf8] flex items-center justify-between">
            <span>PAL Executive Brain Ready</span>
            <span>Let&apos;s go 🚀</span>
          </div>
        </div>
      </div>

      <div className="relative z-30 shrink-0 mt-auto">
        <button
          type="button"
          onClick={onNext}
          className="primary-pill w-full h-12 text-sm font-extrabold cursor-pointer bg-gradient-to-r from-[#0a438a] to-[#2d7fe0] shadow-[0_10px_30px_rgba(45,127,224,0.4)] hover:brightness-110 active:scale-[0.98] transition-all"
        >
          Let&apos;s Go 🚀
        </button>
      </div>
    </div>
  );
}

// ── 2. Rich Persona Cards with Lucide Brand Icons ─────────────────────────

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
    <div className="relative h-full flex-1 flex flex-col justify-between overflow-y-auto scrollbar-hide px-6 pt-3 pb-6">
      <div className="flex flex-col text-left">
        <div className="flex items-center gap-3 mb-1.5">
          <button
            type="button"
            onClick={onBack}
            className="w-8 h-8 rounded-full bg-white/10 border border-white/15 flex items-center justify-center text-white cursor-pointer hover:bg-white/20 transition-all"
          >
            <ArrowLeft size={16} />
          </button>
          <p className="text-xs font-semibold text-[#38bdf8]">Welcome to PAL</p>
        </div>
        
        <h1 className="text-2xl font-extrabold leading-tight text-white">
          Tell us who you are?
        </h1>

        <div className="mt-3.5 space-y-2.5">
          {personaOptions.map((opt) => {
            const Icon = opt.icon;
            const isSelected = value === opt.value;
            return (
              <button
                key={opt.value}
                type="button"
                onClick={() => onChange(opt.value)}
                className={cn(
                  "w-full rounded-2xl p-3.5 text-left transition-all cursor-pointer border flex items-center gap-3.5 backdrop-blur-xl",
                  isSelected
                    ? "bg-[#2d7fe0]/20 border-[#2d7fe0] text-white shadow-[0_0_25px_rgba(45,127,224,0.35)] scale-[1.01]"
                    : "bg-[#101726]/80 border-white/10 text-slate-300 hover:border-white/25 hover:bg-[#101726]"
                )}
              >
                <div className={cn("p-2.5 rounded-xl bg-white/10 shrink-0", opt.color)}>
                  <Icon size={20} />
                </div>
                <div>
                  <h3 className="text-xs font-bold text-white leading-tight">
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
        className="primary-pill mt-4 w-full h-12 text-sm font-extrabold cursor-pointer bg-gradient-to-r from-[#0a438a] to-[#2d7fe0] shadow-[0_10px_30px_rgba(45,127,224,0.4)] disabled:opacity-40 transition-all"
      >
        Next
      </button>
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
    <div className="relative h-full flex-1 flex flex-col justify-between overflow-y-auto scrollbar-hide px-6 pt-3 pb-6">
      <div className="flex flex-col text-left flex-1 min-h-0">
        <div className="flex items-center gap-3 mb-1 shrink-0">
          <button
            type="button"
            onClick={onBack}
            className="w-8 h-8 rounded-full bg-white/10 border border-white/15 flex items-center justify-center text-white cursor-pointer hover:bg-white/20 transition-all"
          >
            <ArrowLeft size={16} />
          </button>
          <h1 className="text-2xl font-extrabold leading-tight text-white">
            Choose Industry
          </h1>
        </div>

        <p className="mt-0.5 text-xs text-slate-400 font-medium shrink-0">
          Select your primary business sector below.
        </p>

        {/* Search Bar */}
        <div className="relative mt-2 mb-2 shrink-0">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchQuery(e.target.value)}
            placeholder="Search Industry..."
            className="w-full h-10 bg-[#060911] border border-white/15 rounded-xl pl-9 pr-4 text-xs font-semibold text-white outline-none focus:border-[#2d7fe0] placeholder:text-slate-500"
          />
        </div>

        {/* Grid Container Filling Height */}
        <div className="mt-1 flex-1 grid grid-cols-2 gap-2 w-full overflow-y-auto pr-1 scrollbar-hide min-h-0">
          {filteredIndustries.map(({ icon: Icon, label }) => {
            const isSelected = value === label;
            return (
              <button
                key={label}
                type="button"
                onClick={() => onChange(label)}
                className={cn(
                  "flex flex-col items-center justify-center gap-1 rounded-2xl border p-2.5 text-center text-xs font-bold transition-all cursor-pointer min-h-[80px] backdrop-blur-xl",
                  isSelected
                    ? "bg-[#2d7fe0] text-white border-[#2d7fe0] shadow-[0_0_20px_rgba(45,127,224,0.4)]"
                    : "bg-[#101726]/80 text-slate-200 border-white/10 hover:border-white/25 hover:bg-[#101726]"
                )}
              >
                <Icon 
                  size={18} 
                  className={isSelected ? "text-white" : "text-[#38bdf8]"}
                  strokeWidth={2.2} 
                />
                <span className="leading-tight text-[11px]">{label}</span>
              </button>
            );
          })}
        </div>
      </div>

      <button 
        type="button" 
        onClick={onNext} 
        disabled={!value}
        className="primary-pill mt-3 w-full h-12 text-sm font-extrabold cursor-pointer bg-gradient-to-r from-[#0a438a] to-[#2d7fe0] shadow-[0_10px_30px_rgba(45,127,224,0.4)] disabled:opacity-40 transition-all shrink-0"
      >
        Next
      </button>
    </div>
  );
}

// ── 4. Country & Language Screen in Executive Dark Glass ─────────────────

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
    <div className="relative h-full flex-1 flex flex-col justify-between overflow-y-auto scrollbar-hide px-6 pt-3 pb-6">
      <div className="flex flex-col text-left flex-1 min-h-0">
        <div className="flex items-center gap-3 mb-1 shrink-0">
          <button
            type="button"
            onClick={onBack}
            className="w-8 h-8 rounded-full bg-white/10 border border-white/15 flex items-center justify-center text-white cursor-pointer hover:bg-white/20 transition-all"
          >
            <ArrowLeft size={16} />
          </button>
          <h1 className="text-2xl font-extrabold leading-tight text-white">
            Choose Country
          </h1>
        </div>

        <p className="mt-0.5 text-xs text-slate-400 font-medium shrink-0">
          Select your primary business country.
        </p>

        {/* Executive Dark Glass Container */}
        <section className="mt-3 flex-1 overflow-hidden rounded-[24px] p-3 bg-[#101726]/90 border border-white/12 backdrop-blur-xl shadow-2xl flex flex-col min-h-0">
          <label className="relative block w-full shrink-0">
            <input
              value={query}
              onChange={(event) => onQuery(event.target.value)}
              className="h-10 w-full rounded-xl border border-white/15 bg-[#060911] px-4 pr-10 text-xs font-semibold text-white outline-none focus:border-[#2d7fe0] placeholder:text-slate-500"
              placeholder="Search country..."
            />
            <Search className="absolute right-3.5 top-3 text-slate-400" size={16} />
          </label>

          <div className="mt-2 flex-1 overflow-y-auto pr-1 scrollbar-hide space-y-1">
            {filtered.map(([flag, name]) => (
              <button
                key={name}
                type="button"
                onClick={() => onSelect(name)}
                className={cn(
                  "flex h-10 w-full items-center justify-between rounded-xl text-xs font-semibold cursor-pointer px-3 transition-colors",
                  selected === name 
                    ? "bg-[#2d7fe0]/20 text-[#38bdf8] border border-[#2d7fe0]/40 font-bold" 
                    : "text-slate-300 hover:bg-white/5"
                )}
              >
                <div className="flex items-center gap-3">
                  <span className="text-lg leading-none">{flag}</span>
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
        className="primary-pill mt-3 w-full h-12 text-sm font-extrabold cursor-pointer bg-gradient-to-r from-[#0a438a] to-[#2d7fe0] shadow-[0_10px_30px_rgba(45,127,224,0.4)] disabled:opacity-40 transition-all shrink-0"
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
    <div className="relative h-full flex-1 flex flex-col justify-between overflow-y-auto scrollbar-hide px-6 pt-3 pb-6">
      <div className="flex flex-col text-left flex-1 min-h-0">
        <div className="flex items-center gap-3 mb-1 shrink-0">
          <button
            type="button"
            onClick={onBack}
            className="w-8 h-8 rounded-full bg-white/10 border border-white/15 flex items-center justify-center text-white cursor-pointer hover:bg-white/20 transition-all"
          >
            <ArrowLeft size={16} />
          </button>
          <h1 className="text-2xl font-extrabold leading-tight text-white">
            Choose Language
          </h1>
        </div>

        <p className="mt-0.5 text-xs text-slate-400 font-medium shrink-0">
          Select your preferred language for PAL.
        </p>

        <section className="mt-3 flex-1 overflow-hidden rounded-[24px] p-3 bg-[#101726]/90 border border-white/12 backdrop-blur-xl shadow-2xl flex flex-col min-h-0">
          <div className="flex-1 overflow-y-auto pr-1 scrollbar-hide space-y-1">
            {languages.map(([flag, name]) => (
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
                  <span className="text-lg leading-none">{flag}</span>
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
        className="primary-pill mt-3 w-full h-12 text-sm font-extrabold cursor-pointer bg-gradient-to-r from-[#0a438a] to-[#2d7fe0] shadow-[0_10px_30px_rgba(45,127,224,0.4)] disabled:opacity-40 transition-all shrink-0"
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
    <div className="relative h-full flex-1 flex flex-col justify-between overflow-y-auto scrollbar-hide px-6 pt-3 pb-6 text-left">
      <div>
        <h1 className="text-2xl font-extrabold leading-none text-white">Create Account</h1>
        <p className="mt-1 text-xs text-slate-400">Initialize your PAL executive profile.</p>

        <form onSubmit={handleRegister} className="mt-3.5 space-y-3">
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

      <p className="mt-3 text-center text-xs text-slate-400">
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
    <div className="relative h-full flex-1 flex flex-col justify-between overflow-y-auto scrollbar-hide px-6 pt-3 pb-6 text-left">
      <div>
        <h1 className="text-2xl font-extrabold leading-none text-white">Welcome Back</h1>
        <p className="mt-1 text-xs text-slate-400">Sign in to your PAL Business Brain.</p>

        <form onSubmit={handleLoginSubmit} className="mt-3.5 space-y-3">
          <AuthField label="Email" placeholder="founder@company.com" type="email" value={email} onChange={setEmail} />
          <AuthField label="Password" placeholder="••••••••" password value={password} onChange={setPassword} />
          <AuthMeta />
          <AuthButtons primaryLabel="Sign In" onPrimary={handleLoginSubmit} onGoogle={onGoogle} onBase={onBase} />
        </form>
      </div>

      <p className="mt-3 text-center text-xs text-slate-400">
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

// ── 6. OTP Screen (NO WHITE BOX) ─────────────────────────────────────────

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
    <div className="relative h-full flex-1 flex flex-col justify-between overflow-y-auto scrollbar-hide text-left px-6 pt-3 pb-6">
      <div className="w-full flex-1 flex flex-col justify-between">
        <section className="rounded-[26px] p-5 bg-[#101726]/90 border border-white/12 backdrop-blur-xl shadow-2xl text-white">
          <h1 className="text-xl font-extrabold text-white">Enter Verification Code</h1>
          <p className="mt-1 text-xs text-slate-300 leading-relaxed">
            Activation code sent to <strong className="text-[#38bdf8]">{email || "your email"}</strong>
          </p>

          <div className="mt-4 flex justify-between gap-1.5 w-full">
            {[0, 1, 2, 3, 4].map((index) => (
              <button
                key={index}
                type="button"
                onClick={() => pressDigit("1")}
                className={cn(
                  "grid h-12 w-11 place-items-center rounded-xl border text-xl font-extrabold cursor-pointer transition-all outline-none",
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

          <p className="mt-3 text-center text-xs text-slate-400">
            Resend code in <strong className="text-[#38bdf8] font-mono">{timeLeft}s</strong>
          </p>
        </section>

        {/* Keypad */}
        <div className="py-3 grid grid-cols-3 gap-2 max-w-[280px] mx-auto w-full">
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

        {/* Executive Milestone Success Screen */}
        {success && <SuccessModal onNext={onNext} />}
      </div>
    </div>
  );
}

function SuccessModal({ onNext }: { onNext: () => void }) {
  return (
    <div className="absolute inset-0 z-50 bg-[#060911]/92 backdrop-blur-md flex items-center justify-center p-5 animate-in fade-in duration-300">
      <div className="w-full rounded-[28px] bg-[#101726] border border-white/20 p-6 text-center text-white shadow-2xl space-y-4">
        <BrandLogo className="w-32 mx-auto justify-center mb-1" />
        
        <div className="relative w-16 h-16 mx-auto">
          <div className="absolute inset-0 bg-[#2d7fe0]/30 rounded-full blur-xl animate-pulse" />
          <Mascot priority className="w-16 h-16 relative z-10 mx-auto" />
        </div>

        <div className="space-y-1">
          <h2 className="text-lg font-extrabold text-white">
            Congratulations. Your Executive Brain is now online.
          </h2>
          <p className="text-xs text-slate-300 leading-relaxed max-w-[270px] mx-auto">
            PAL is ready to orchestrate your projects, cashflow, and daily briefing.
          </p>
        </div>

        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#2d7fe0]/15 border border-[#2d7fe0]/30 text-[11px] font-bold text-[#38bdf8]">
          <Brain size={14} className="animate-pulse text-[#38bdf8]" />
          <span>PAL Business Brain Online</span>
        </div>

        <button 
          type="button" 
          onClick={onNext} 
          className="primary-pill w-full h-12 text-xs font-extrabold cursor-pointer bg-gradient-to-r from-[#0a438a] to-[#2d7fe0] shadow-[0_10px_30px_rgba(45,127,224,0.4)] flex items-center justify-center"
        >
          Enter Executive Dashboard 🚀
        </button>
      </div>
    </div>
  );
}
