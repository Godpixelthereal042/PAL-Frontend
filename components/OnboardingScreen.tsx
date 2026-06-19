"use client";

import React, { useState, useEffect, useMemo, ReactNode, FormEvent } from "react";
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
  Zap
} from "lucide-react";
import { useTheme } from "@/components/ThemeProvider";
import { supabase } from "@/lib/supabaseClient";

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
  | "otp";

type Tone = "light" | "dark";

// Utility function matching pal-app.tsx
function cn(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ");
}

const industries = [
  { icon: BriefcaseBusiness, label: "Consumer and Retail" },
  { icon: CircleDollarSign, label: "Financial services" },
  { icon: Home, label: "Real Estate" },
  { icon: BriefcaseBusiness, label: "Transportation and Logistics" },
  { icon: Lightbulb, label: "Technology and Innovation" },
  { icon: Sparkles, label: "others" }
];

const countries = [
  ["🇦🇫", "Afghanistan"],
  ["🇦🇱", "Albania"],
  ["🇩🇿", "Algeria"],
  ["🇦🇩", "Andorra"],
  ["🇦🇴", "Angola"],
  ["🇦🇷", "Argentina"],
  ["🇦🇲", "Armenia"],
  ["🇦🇺", "Australia"],
  ["🇦🇹", "Austria"],
  ["🇧🇪", "Belgium"],
  ["🇧🇷", "Brazil"],
  ["🇨🇦", "Canada"],
  ["🇨🇱", "Chile"],
  ["🇨🇳", "China"],
  ["🇨🇴", "Colombia"],
  ["🇩🇰", "Denmark"],
  ["🇪🇬", "Egypt"],
  ["🇫🇮", "Finland"],
  ["🇫🇷", "France"],
  ["🇩🇪", "Germany"],
  ["🇬🇭", "Ghana"],
  ["🇬🇷", "Greece"],
  ["🇮🇳", "India"],
  ["🇮🇩", "Indonesia"],
  ["🇮🇪", "Ireland"],
  ["🇮🇱", "Israel"],
  ["🇮🇹", "Italy"],
  ["🇯🇵", "Japan"],
  ["🇰🇪", "Kenya"],
  ["🇲🇽", "Mexico"],
  ["🇳🇱", "Netherlands"],
  ["🇳🇿", "New Zealand"],
  ["🇳🇬", "Nigeria"],
  ["🇳🇴", "Norway"],
  ["🇵🇰", "Pakistan"],
  ["🇵🇭", "Philippines"],
  ["🇵🇱", "Poland"],
  ["🇵🇹", "Portugal"],
  ["🇷🇺", "Russia"],
  ["🇸🇬", "Singapore"],
  ["🇿🇦", "South Africa"],
  ["🇪🇸", "Spain"],
  ["🇸🇪", "Sweden"],
  ["🇨🇭", "Switzerland"],
  ["🇹🇷", "Turkey"],
  ["🇺🇦", "Ukraine"],
  ["🇦🇪", "United Arab Emirates"],
  ["🇬🇧", "United Kingdom"],
  ["🇺🇸", "United States"],
  ["🇻🇳", "Vietnam"]
];

const languages = [
  ["🇸🇦", "Arabic"],
  ["🇧🇩", "Bengali"],
  ["🇬🇧", "English"],
  ["🇫🇷", "French"],
  ["🇩🇪", "German"],
  ["🇮🇳", "Hindi"],
  ["🇮🇹", "Italian"],
  ["🇯🇵", "Japanese"],
  ["🇵🇹", "Portuguese"]
];

export default function OnboardingScreen() {
  const router = useRouter();
  const { theme, toggleTheme } = useTheme();
  const [screen, setScreenState] = useState<Screen>("growth");
  
  // Custom states to collect user data during onboarding
  const [persona, setPersona] = useState("");
  const [industry, setIndustry] = useState("Technology and Innovation");
  const [country, setCountry] = useState("");
  const [language, setLanguage] = useState("");
  const [searchCountry, setSearchCountry] = useState("");

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
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
    const useSupabase = supabaseUrl && supabaseAnonKey && 
                        !supabaseUrl.includes("dummy-url") && 
                        !supabaseAnonKey.includes("dummy-key");

    if (useSupabase) {
      try {
        const { error } = await supabase.auth.signInWithOAuth({
          provider: "google", // both Google and Base buttons map to Google OAuth in production
          options: {
            redirectTo: `${window.location.origin}/api/auth/callback?next=/`
          }
        });
        if (error) {
          alert(error.message);
        }
      } catch (err: any) {
        console.error("OAuth sign in error:", err);
        alert("OAuth initialization failed. Please check your Supabase configuration.");
      }
      return;
    }

    const mockEmail = provider === "google" ? "google.user@gmail.com" : "base.user@base.org";
    const mockName = provider === "google" ? "Google User" : "Base User";
    const mockPassword = "social_login_password_123_safe";

    const signupPayload = {
      fullName: mockName,
      email: mockEmail,
      password: mockPassword,
      role: persona || "Business Owner",
      industry: industry || "Technology and Innovation",
      country: country || "United States",
      language: language || "English"
    };

    try {
      const signupRes = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(signupPayload)
      });

      if (signupRes.ok) {
        const profilePayload = {
          fullName: mockName,
          email: mockEmail,
          role: signupPayload.role,
          industry: signupPayload.industry,
          country: signupPayload.country,
          language: signupPayload.language,
          onboardingCompleted: true,
          creditsSaved: 0,
          computeBalance: 0,
          companyName: "",
          targetAudience: "",
          primaryKPI: "",
          selectedPersona: "growth"
        };
        localStorage.setItem("pal_user_profile", JSON.stringify(profilePayload));
        router.push("/");
        return;
      }

      const loginRes = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: mockEmail, password: mockPassword })
      });

      if (loginRes.ok) {
        const loginData = await loginRes.json();
        const profilePayload = {
          fullName: loginData.user.name,
          email: loginData.user.email,
          role: loginData.user.role,
          industry: "Technology and Innovation",
          country: "United States",
          language: "English",
          onboardingCompleted: true,
          creditsSaved: 0,
          computeBalance: 0,
          companyName: "",
          targetAudience: "",
          primaryKPI: "",
          selectedPersona: "growth"
        };
        localStorage.setItem("pal_user_profile", JSON.stringify(profilePayload));
        router.push("/");
      } else {
        const err = await loginRes.json();
        alert(err.error || "Social authentication failed");
      }
    } catch (e) {
      console.error("Social sign in error", e);
      alert("Social authentication failed. Please try again.");
    }
  };

  const handleOnboardingFinish = async () => {
    const isLoginFlow = screen === "login";

    const profilePayload = {
      fullName: fullName || "New User",
      email: email || "",
      role: persona || "Business Owner",
      industry: industry || "Technology and Innovation",
      country: country || "United States",
      language: language || "English",
      onboardingCompleted: true,
      creditsSaved: 0,
      computeBalance: 0,
      companyName: "",
      targetAudience: "",
      primaryKPI: "",
      selectedPersona: "growth"
    };

    if (isLoginFlow) {
      try {
        const res = await fetch("/api/auth/login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email,
            password
          })
        });

        if (res.ok) {
          const data = await res.json();
          const updatedPayload = {
            ...profilePayload,
            fullName: data.user.name,
            email: data.user.email,
            role: data.user.role
          };
          localStorage.setItem("pal_user_profile", JSON.stringify(updatedPayload));
          router.push("/");
        } else {
          const err = await res.json();
          alert(err.error || "Login failed");
        }
      } catch (e) {
        console.error("Login fetch failed", e);
        alert("Could not reach the server. Please check your connection and try again.");
      }
    } else {
      try {
        const res = await fetch("/api/auth/signup", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            fullName: profilePayload.fullName,
            email: profilePayload.email,
            password: password || "password123",
            role: profilePayload.role,
            industry: profilePayload.industry,
            country: profilePayload.country,
            language: profilePayload.language
          })
        });

        if (res.ok) {
          localStorage.setItem("pal_user_profile", JSON.stringify(profilePayload));
          router.push("/");
        } else {
          const err = await res.json();
          alert(err.error || "Registration failed");
        }
      } catch (e) {
        console.error("Signup fetch failed", e);
        localStorage.setItem("pal_user_profile", JSON.stringify(profilePayload));
        router.push("/");
      }
    }
  };

  return (
    <div className="phone-stage">
      <section className={cn("phone")} aria-label="PAL app">
        <StatusBar tone="dark" />

        {screen === "growth" && <GrowthIntro onNext={() => setScreen("manage")} />}
        {screen === "manage" && <ManageIntro onNext={() => setScreen("together")} />}
        {screen === "together" && <TogetherIntro onNext={() => setScreen("persona")} />}
        
        {screen === "persona" && (
          <PersonaScreen
            value={persona}
            onChange={setPersona}
            onNext={() => setScreen("industry")}
          />
        )}
        
        {screen === "industry" && (
          <IndustryScreen 
            value={industry} 
            onChange={setIndustry} 
            onNext={() => setScreen("country")} 
          />
        )}
        
        {screen === "country" && (
          <CountryScreen
            selected={country}
            query={searchCountry}
            onQuery={setSearchCountry}
            onSelect={setCountry}
            onNext={() => setScreen("language")}
          />
        )}
        
        {screen === "language" && (
          <LanguageScreen 
            selected={language} 
            onSelect={setLanguage} 
            onNext={() => setScreen("signup")} 
          />
        )}
        
        {screen === "signup" && (
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
        )}
        
        {screen === "login" && (
          <LoginScreen 
            email={email}
            setEmail={setEmail}
            password={password}
            setPassword={setPassword}
            onSignup={() => setScreen("signup")} 
            onNext={() => router.push("/")} 
            onGoogle={() => handleSocialSignIn("google")}
            onBase={() => handleSocialSignIn("base")}
          />
        )}
        
        {screen === "otp" && (
          <OtpScreen 
            email={email}
            onNext={() => router.push("/")} 
          />
        )}
      </section>
    </div>
  );
}

// ---------------- Helper Components exact from pal-app.tsx ----------------

function StatusBar({ tone, onToggleTheme }: { tone: Tone; onToggleTheme?: () => void }) {
  return (
    <div className={cn("status-bar", tone === "dark" && "status-dark")}>
      <span>9:41</span>
      {tone === "light" && <span className="dynamic-island" aria-hidden="true" />}
      <div className="status-icons" aria-hidden="true">
        <span className="signal">
          <span />
          <span />
          <span />
          <span />
        </span>
        <span className="wifi">
          <span className="wifi-dot" />
        </span>
        <span className="battery" />
        {onToggleTheme && (
          <button
            type="button"
            onClick={onToggleTheme}
            className="theme-toggle"
            aria-label={tone === "dark" ? "Switch to light mode" : "Switch to dark mode"}
          >
            {tone === "dark" ? <Sun size={15} strokeWidth={2.5} /> : <Moon size={15} strokeWidth={2.5} />}
          </button>
        )}
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

// Peak mascot overlay
function Mascot({ className, priority = false }: { className?: string; priority?: boolean }) {
  return (
    <div className={cn("pointer-events-none select-none mascot-peek", className)}>
      <Image
        src="/assets/pal-mascot.png"
        alt=""
        width={691}
        height={642}
        priority={priority}
        className="w-full h-auto"
      />
    </div>
  );
}

function GrowthIntro({ onNext }: { onNext: () => void }) {
  return (
    <div className="relative h-[calc(100%_-_58px)] overflow-y-auto scrollbar-hide">
      <div className="min-h-[650px] w-full h-full relative px-[34px] pt-[32px] flex flex-col text-left">
        <ProgressBars active={0} />
        <h1 className="mt-[33px] text-[65px] font-semibold leading-[0.94] text-left growth-heading" style={{ color: 'var(--app-accent)' }}>
          GO FOR
          <br />
          BUSINESS
          <br />
          GROWTH
          <br />
          <span style={{ color: 'var(--onb-heading)' }} className="font-bold">WITH</span>
          <br />
          <span style={{ color: 'var(--onb-heading)' }} className="font-bold">PAL</span>
        </h1>
        <Mascot priority className="absolute -right-[266px] bottom-[-52px] w-[496px] max-w-none growth-mascot" />
        <button
          type="button"
          onClick={onNext}
          className="absolute bottom-[42px] left-[34px] z-20 rounded-[15px] bg-white border border-gray-150 px-[20px] py-[14px] text-left text-[17px] font-semibold leading-[1.25] text-black shadow-lg cursor-pointer transition-transform active:scale-[0.98]"
        >
          It&apos;s more fun and quick
          <br />
          when we do it together!
        </button>
      </div>
    </div>
  );
}

function ManageIntro({ onNext }: { onNext: () => void }) {
  return (
    <div className="relative h-[calc(100%_-_58px)] overflow-y-auto scrollbar-hide px-[34px] pt-[32px]">
      <button
        type="button"
        onClick={onNext}
        className="flex flex-col w-full h-full min-h-[650px] items-start overflow-hidden text-left cursor-pointer border-0 outline-none relative"
        aria-label="Continue onboarding"
      >
        <ProgressBars active={1} />
        <BrandLogo className="mt-[48px] h-auto w-[168px] ml-[34px] manage-logo" />
        <h1 className="mt-[7px] text-[58px] font-semibold leading-[0.96] text-left ml-[34px] manage-heading" style={{ color: 'var(--onb-heading)' }}>
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
        <Mascot priority className="absolute -right-[250px] bottom-[-270px] w-[600px] max-w-none manage-mascot" />
      </button>
    </div>
  );
}

function TogetherIntro({ onNext }: { onNext: () => void }) {
  return (
    <div className="relative h-[calc(100%_-_58px)] overflow-y-auto scrollbar-hide">
      <div className="min-h-[620px] w-full h-full relative px-[34px] pt-[32px] flex flex-col text-left">
        <ProgressBars active={2} />
        <div className="pal-card-stack relative mt-[82px] rounded-[31px] bg-white px-[38px] pb-[31px] pt-[30px] shadow-pal text-left onb-card together-card">
          <ul className="relative z-10 list-disc space-y-[22px] pl-[18px] text-[17px] leading-[1.25] marker:text-[#3b5a7c]" style={{ color: '#3b5a7c' }}>
            <li>
              <span className="font-semibold text-[#0a438a]">Log sales, expenses,</span> and project updates
              effortlessly. PAL remembers everything so you can focus on what matters.
            </li>
            <li>
              <span className="font-semibold text-[#0a438a]">Get daily insights on profit,</span> spending, and growth.
              PAL breaks it down in simple terms just for you.
            </li>
            <li>
              <span className="font-semibold text-[#0a438a]">Tech? Retail? Services?</span>
              <br />
              PAL adapts to your hustle, your flow, your way.
            </li>
            <li>
              You don&apos;t have to do it alone anymore.
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

function PersonaScreen({
  value,
  onChange,
  onNext
}: {
  value: string;
  onChange: (value: string) => void;
  onNext: () => void;
}) {
  const options = ["🚀 Startup or Big brand", "🎨 Freelancer / Creative", "🛍️ Business Owner", "🧩 Or others"];

  return (
    <div className="relative h-[calc(100%_-_58px)] overflow-y-auto scrollbar-hide">
      <div className="min-h-[620px] w-full h-full relative px-[34px] pt-[8px] flex flex-col text-left">
        <p className="text-[23px] font-semibold leading-none" style={{ color: 'var(--onb-subtext)' }}>Hey welcome!</p>
        <h1 className="mt-[12px] text-[30px] font-extrabold leading-[1.12]" style={{ color: 'var(--onb-heading)' }}>
          Tell us who you are?
        </h1>
        <div className="pal-card-stack relative mt-[61px] rounded-[31px] bg-white px-[29px] pb-[31px] pt-[31px] shadow-pal onb-card persona-card" style={{ color: '#111827' }}>
          <div className="relative z-10 grid gap-[16px] persona-grid">
            {options.map((option) => {
              const cleanVal = option.replace(/^[^ ]+ /, "");
              return (
                <button
                  key={option}
                  type="button"
                  onClick={() => onChange(cleanVal)}
                  className={cn(
                    "h-[85px] rounded-[16px] text-[16px] font-bold transition cursor-pointer border persona-button"
                  )}
                  style={{
                    backgroundColor: value === cleanVal ? '#000000' : '#f3f4f6',
                    color: value === cleanVal ? '#ffffff' : '#111827',
                    borderColor: value === cleanVal ? '#000000' : '#d1d5db'
                  }}
                >
                  {option}
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

function IndustryScreen({
  value,
  onChange,
  onNext
}: {
  value: string;
  onChange: (value: string) => void;
  onNext: () => void;
}) {
  return (
    <div className="relative h-[calc(100%_-_58px)] overflow-y-auto scrollbar-hide">
      <div className="min-h-[580px] w-full h-full relative flex flex-col text-left px-[34px] pt-[8px]">
        <h1 className="text-[36px] font-extrabold leading-[1.05]" style={{ color: 'var(--onb-heading)' }}>
          Choose your Industry
        </h1>
        <p className="mt-[6px] max-w-[340px] text-[18px] font-medium leading-[1.25]" style={{ color: 'var(--onb-subtext)' }}>
          Please choose your profession from the list below.
        </p>
        <div className="mt-[25px] grid grid-cols-2 gap-[12px] w-full industry-grid">
          {industries.map(({ icon: Icon, label }) => (
            <button
              key={label}
              type="button"
              onClick={() => onChange(label)}
              className={cn(
                "flex flex-col items-center justify-center gap-[8px] rounded-[16px] border p-[12px] text-center text-[13px] font-bold transition cursor-pointer shadow-sm industry-button"
              )}
              style={{
                backgroundColor: value === label ? 'var(--app-accent)' : 'var(--app-card-alt)',
                borderColor: value === label ? 'var(--app-accent)' : 'var(--app-card-border)',
                color: value === label ? '#ffffff' : 'var(--app-text-secondary)',
                textAlign: 'center',
                height: '100px'
              }}
            >
              <Icon 
                size={22} 
                style={{ color: value === label ? '#ffffff' : 'var(--app-text-secondary)' }}
                strokeWidth={2.2} 
              />
              <span className="leading-tight">{label}</span>
            </button>
          ))}
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
  onNext
}: {
  selected: string;
  query: string;
  onQuery: (value: string) => void;
  onSelect: (value: string) => void;
  onNext: () => void;
}) {
  const filtered = useMemo(
    () => countries.filter((country) => country[1].toLowerCase().includes(query.toLowerCase())),
    [query]
  );

  return (
    <div className="relative h-[calc(100%_-_58px)] overflow-y-auto scrollbar-hide">
      <div className="min-h-[620px] w-full h-full relative flex flex-col text-left px-[34px] pt-[8px]">
        <h1 className="text-[36px] font-extrabold leading-[1.05]" style={{ color: 'var(--onb-heading)' }}>
          Choose your country
        </h1>
        <p className="mt-[6px] max-w-[350px] text-[18px] font-medium leading-[1.25]" style={{ color: 'var(--onb-subtext)' }}>
          Please choose your preferred country from the list below.
        </p>
        <section className="mt-[25px] h-[340px] overflow-hidden rounded-[30px] px-[16px] pt-[12px] shadow-pal bg-white border border-gray-100 flex flex-col pb-4 country-section">
          <label className="relative block w-full flex-shrink-0">
            <span className="sr-only">Search country</span>
            <input
              value={query}
              onChange={(event) => onQuery(event.target.value)}
              className="h-[40px] w-full rounded-full border border-gray-300 bg-gray-50 px-[23px] pr-[48px] text-[16px] text-black outline-none placeholder:text-gray-400"
              placeholder="Search here"
            />
            <Search className="absolute right-[20px] top-[9px] text-gray-400" size={22} />
          </label>
          <div className="mt-[16px] h-[250px] overflow-y-auto pb-[20px] pl-[6px] pr-[7px] scrollbar-hide text-black country-list">
            {filtered.map(([flag, name]) => (
              <button
                key={name}
                type="button"
                onClick={() => onSelect(name)}
                className={cn(
                  "flex h-[43px] w-full items-center justify-between rounded-[8px] text-[15px] cursor-pointer px-3 transition-colors",
                  selected === name 
                    ? "bg-[var(--app-accent-soft)] font-bold" 
                    : "hover:bg-gray-100"
                )}
                style={{ textAlign: 'left', color: selected === name ? 'var(--app-accent)' : '#1f2937' }}
              >
                <div className="flex items-center gap-[20px]">
                  <span className="text-[29px] leading-none">{flag}</span>
                  <span>{name}</span>
                </div>
                {selected === name && <Check size={18} className="text-[var(--app-accent)]" strokeWidth={3} />}
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
  onNext
}: {
  selected: string;
  onSelect: (value: string) => void;
  onNext: () => void;
}) {
  return (
    <div className="relative h-[calc(100%_-_58px)] overflow-y-auto scrollbar-hide">
      <div className="min-h-[620px] w-full h-full relative flex flex-col text-left px-[34px] pt-[8px]">
        <h1 className="text-[36px] font-extrabold leading-[1.05]" style={{ color: 'var(--onb-heading)' }}>
          Choose your language
        </h1>
        <p className="mt-[6px] max-w-[350px] text-[18px] font-medium leading-[1.25]" style={{ color: 'var(--onb-subtext)' }}>
          Please choose your preferred Language from the list below.
        </p>
        <button
          type="button"
          className="mt-[26px] h-[54px] w-full rounded-[21px] px-[36px] text-[18px] cursor-default border shadow-sm font-semibold flex items-center justify-between flex-shrink-0"
          style={{ textAlign: 'left', color: '#111827', backgroundColor: '#ffffff', borderColor: '#d1d5db' }}
        >
          <span>{selected || "Select Language"}</span>
          <ChevronDown size={20} className="text-gray-400" />
        </button>
        <section className="mt-[11px] h-[280px] overflow-hidden rounded-[30px] px-[20px] pt-[12px] shadow-pal bg-white border border-gray-100 text-black flex flex-col pb-4 language-section">
          <div className="h-full overflow-y-auto scrollbar-hide pb-4">
            {languages.map(([flag, name]) => (
              <button
                key={name}
                type="button"
                onClick={() => onSelect(name)}
                className={cn(
                  "flex h-[56px] w-full items-center justify-between rounded-[10px] text-[16px] cursor-pointer px-3 transition-colors",
                  selected === name 
                    ? "bg-[var(--app-accent-soft)] font-bold" 
                    : "hover:bg-gray-100"
                )}
                style={{ textAlign: 'left', color: selected === name ? 'var(--app-accent)' : '#1f2937' }}
              >
                <div className="flex items-center gap-[10px]">
                  <span className="text-[24px] leading-none">{flag}</span>
                  <span>{name}</span>
                </div>
                {selected === name && <Check size={18} className="text-[var(--app-accent)]" strokeWidth={3} />}
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
  const router = useRouter();
  const [errorMsg, setErrorMsg] = useState("");
  const [hasError, setHasError] = useState({
    fullName: false,
    email: false,
    password: false,
    confirmPassword: false
  });
  const [loading, setLoading] = useState(false);

  const handleRegister = async (e: FormEvent) => {
    e.preventDefault();
    setErrorMsg("");
    setHasError({ fullName: false, email: false, password: false, confirmPassword: false });

    if (!fullName.trim()) {
      setErrorMsg("Full name is required");
      setHasError(prev => ({ ...prev, fullName: true }));
      return;
    }
    if (!email.trim()) {
      setErrorMsg("Email is required");
      setHasError(prev => ({ ...prev, email: true }));
      return;
    }
    if (!password) {
      setErrorMsg("Password is required");
      setHasError(prev => ({ ...prev, password: true }));
      return;
    }
    if (password.length < 6) {
      setErrorMsg("Password must be at least 6 characters");
      setHasError(prev => ({ ...prev, password: true }));
      return;
    }
    if (password !== confirmPassword) {
      setErrorMsg("Passwords do not match");
      setHasError(prev => ({ ...prev, password: true, confirmPassword: true }));
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fullName,
          email,
          password,
          role: persona || "Business Owner",
          industry: industry || "Technology and Innovation",
          country: country || "United States",
          language: language || "English"
        })
      });

      if (res.ok) {
        const profilePayload = {
          fullName,
          email,
          role: persona || "Business Owner",
          industry: industry || "Technology and Innovation",
          country: country || "United States",
          language: language || "English",
          onboardingCompleted: true,
          creditsSaved: 0,
          computeBalance: 0,
          companyName: "",
          targetAudience: "",
          primaryKPI: "",
          selectedPersona: "growth"
        };
        localStorage.setItem("pal_user_profile", JSON.stringify(profilePayload));
        
        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
        const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
        const useSupabase = supabaseUrl && supabaseAnonKey && 
                            !supabaseUrl.includes("dummy-url") && 
                            !supabaseAnonKey.includes("dummy-key");
                            
        if (useSupabase) {
          router.push("/");
        } else {
          onNext();
        }
      } else {
        const err = await res.json();
        setErrorMsg(err.error || "Registration failed");
        setHasError(prev => ({ ...prev, email: true }));
      }
    } catch (err: any) {
      setErrorMsg("Registration failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative h-[calc(100%_-_58px)] overflow-y-auto scrollbar-hide">
      <div className="min-h-[620px] w-full h-full relative flex flex-col justify-start">
        <AuthShell offset="mt-[10px]" className="signup-shell">
          <h1 className="text-[25px] font-extrabold text-left" style={{ color: 'var(--onb-heading)' }}>Hi, Welcome! 👋</h1>
          <form onSubmit={handleRegister} className="mt-[28px] grid gap-[14px]">
            <AuthField label="Full Name" placeholder="Enter your name" value={fullName} onChange={setFullName} error={hasError.fullName} />
            <AuthField label="Email" placeholder="Your email" type="email" value={email} onChange={setEmail} error={hasError.email} />
            <AuthField label="Password" placeholder="Enter your password" password value={password} onChange={setPassword} error={hasError.password} />
            <AuthField label="Confirm Password" placeholder="Enter your password" password value={confirmPassword} onChange={setConfirmPassword} error={hasError.confirmPassword} />
            {errorMsg && <p className="text-[12px] text-[#ef4444] font-bold text-left">{errorMsg}</p>}
            <AuthMeta />
            <AuthButtons primaryLabel={loading ? "Registering..." : "Register"} onPrimary={handleRegister} onGoogle={onGoogle} onBase={onBase} />
          </form>
          <p className="mt-[20px] text-center text-[13px] text-[var(--app-text-secondary)]">
            Already have an account?{" "}
            <button type="button" onClick={onLogin} className="font-bold text-[var(--app-accent)] underline cursor-pointer">
              Log in
            </button>
          </p>
        </AuthShell>
      </div>
    </div>
  );
}

interface LoginScreenProps {
  email: string;
  setEmail: (v: string) => void;
  password: string;
  setPassword: (v: string) => void;
  onSignup: () => void;
  onNext: () => void;
  onGoogle: () => void;
  onBase: () => void;
}

function LoginScreen({ 
  email, setEmail,
  password, setPassword,
  onSignup, onNext, onGoogle, onBase 
}: LoginScreenProps) {
  const router = useRouter();
  const [errorMsg, setErrorMsg] = useState("");
  const [hasError, setHasError] = useState({ email: false, password: false });
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: FormEvent) => {
    e.preventDefault();
    setErrorMsg("");
    setHasError({ email: false, password: false });

    if (!email.trim()) {
      setErrorMsg("Email is required");
      setHasError(prev => ({ ...prev, email: true }));
      return;
    }
    if (!password) {
      setErrorMsg("Password is required");
      setHasError(prev => ({ ...prev, password: true }));
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password })
      });

      if (res.ok) {
        const data = await res.json();
        const profilePayload = {
          fullName: data.user.name,
          email: data.user.email,
          role: data.user.role,
          industry: "Technology and Innovation",
          country: "United States",
          language: "English",
          onboardingCompleted: true,
          creditsSaved: 0,
          computeBalance: 0,
          companyName: "",
          targetAudience: "",
          primaryKPI: "",
          selectedPersona: "growth"
        };
        localStorage.setItem("pal_user_profile", JSON.stringify(profilePayload));
        
        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
        const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
        const useSupabase = supabaseUrl && supabaseAnonKey && 
                            !supabaseUrl.includes("dummy-url") && 
                            !supabaseAnonKey.includes("dummy-key");
                            
        if (useSupabase) {
          router.push("/");
        } else {
          onNext();
        }
      } else {
        const err = await res.json();
        setErrorMsg(err.error || "Login failed");
        setHasError({ email: true, password: true });
      }
    } catch (err: any) {
      setErrorMsg("Login failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative h-[calc(100%_-_58px)] overflow-y-auto scrollbar-hide">
      <div className="min-h-[620px] w-full h-full relative flex flex-col justify-start">
        <AuthShell offset="mt-[92px]" className="login-shell">
          <h1 className="text-[25px] font-extrabold text-left" style={{ color: 'var(--onb-heading)' }}>Hi, Welcome! 👋</h1>
          <form onSubmit={handleLogin} className="mt-[31px] grid gap-[16px]">
            <AuthField label="Email" placeholder="Your email" type="email" value={email} onChange={setEmail} error={hasError.email} />
            <AuthField label="Password" placeholder="Enter your password" password value={password} onChange={setPassword} error={hasError.password} />
            {errorMsg && <p className="text-[12px] text-[#ef4444] font-bold text-left">{errorMsg}</p>}
            <AuthMeta />
            <AuthButtons primaryLabel={loading ? "Logging in..." : "Log in"} onPrimary={handleLogin} onGoogle={onGoogle} onBase={onBase} />
          </form>
          <p className="mt-[20px] text-center text-[13px] text-[var(--app-text-secondary)]">
            Don&apos;t have an account?{" "}
            <button type="button" onClick={onSignup} className="font-bold text-[var(--app-accent)] underline cursor-pointer">
              Sign up
            </button>
          </p>
        </AuthShell>
      </div>
    </div>
  );
}

function AuthShell({ children, offset, className }: { children: ReactNode; offset: string; className?: string }) {
  return (
    <div className={cn("mx-[20px] rounded-[30px] px-[30px] pb-[25px] pt-[25px] shadow-pal onb-white-card", offset, className)} style={{ color: 'var(--app-text)' }}>
      {children}
    </div>
  );
}

function AuthField({
  label,
  placeholder,
  value,
  onChange,
  type = "text",
  password = false,
  error = false
}: {
  label: string;
  placeholder: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
  password?: boolean;
  error?: boolean;
}) {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <label className="block text-[12px] text-[var(--app-text)] text-left">
      {label}
      <span className="relative mt-[7px] block">
        <input 
          className={cn(
            "auth-input text-[16px] bg-[var(--app-input-bg)] border-[var(--app-input-border)] text-[var(--app-text)]",
            error && "border-red-500"
          )}
          style={error ? { borderColor: '#ef4444' } : undefined}
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
            className="absolute right-[12px] top-[14px] text-[var(--app-text-secondary)] hover:text-[var(--app-text)] cursor-pointer"
            style={{ background: 'none', border: 'none', padding: 0 }}
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
    <div className="mt-[11px] flex items-center justify-between text-[12px] text-[var(--app-text-secondary)] select-none">
      <label className="flex items-center gap-[9px] cursor-pointer">
        <span className="grid h-[16px] w-[16px] place-items-center rounded-[4px] border border-[var(--app-input-border)] bg-[var(--app-input-bg)] text-[10px]">
          <Check size={12} className="text-[var(--app-accent)]" />
        </span>
        Remember me
      </label>
      <button type="button" onClick={() => alert("Password reset link sent!")} className="cursor-pointer hover:text-[var(--app-text)]">Forgot password?</button>
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
    <div className="mt-[24px] grid gap-[12px] w-full">
      <button 
        type="submit" 
        onClick={(e) => onPrimary(e)}
        className="primary-pill h-[43px] text-[13px] w-full cursor-pointer flex items-center justify-center"
      >
        {primaryLabel}
      </button>
      <button
        type="button"
        onClick={onGoogle}
        className="h-[41px] rounded-full border border-[#dedede] bg-white text-[13px] font-bold text-[#111] cursor-pointer active:scale-95 transition-transform flex items-center justify-center gap-[11px]"
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path fillRule="evenodd" clipRule="evenodd" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.3-4.74 3.3-8.09z" fill="#4285F4"/>
          <path fillRule="evenodd" clipRule="evenodd" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
          <path fillRule="evenodd" clipRule="evenodd" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/>
          <path fillRule="evenodd" clipRule="evenodd" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
        </svg>
        <span>Sign in with Google</span>
      </button>
      <button
        type="button"
        onClick={onBase}
        className="h-[41px] rounded-full border border-[#dedede] bg-white text-[13px] font-bold text-[#111] cursor-pointer active:scale-95 transition-transform flex items-center justify-center gap-[10px]"
      >
        <span className="inline-block h-[14px] w-[14px] rounded-[3.5px] bg-[#0052ff]" />
        <span>Sign in with Base ID</span>
      </button>
    </div>
  );
}

function OtpScreen({ email, onNext }: { email: string; onNext: () => void }) {
  const [code, setCode] = useState("");
  const [error, setError] = useState(false);
  const [success, setSuccess] = useState(false);
  const [timeLeft, setTimeLeft] = useState(60);
  const keyboardVisible = true; // Always visible for a mobile app mockup

  const pressDigit = (digit: string) => {
    setError(false);
    setCode((value) => (value.length < 5 ? `${value}${digit}` : value));
  };

  const verify = async () => {
    if (code.length < 5) return;

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
    const useSupabase = supabaseUrl && supabaseAnonKey && 
                        !supabaseUrl.includes("dummy-url") && 
                        !supabaseAnonKey.includes("dummy-key");

    if (useSupabase) {
      const { data, error: err } = await supabase.auth.verifyOtp({
        email,
        token: code,
        type: "signup"
      });
      if (err) {
        setError(true);
        console.error("OTP verification error:", err.message);
      } else {
        // Sync local profile metadata
        try {
          await fetch("/api/profile", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              fullName: localStorage.getItem("pal_user_profile") ? JSON.parse(localStorage.getItem("pal_user_profile") || "{}").fullName : "New User",
              email
            })
          });
        } catch (e) {
          console.error("Sync profile error:", e);
        }
        setSuccess(true);
      }
    } else {
      if (code === "11111") {
        setSuccess(true);
        return;
      }
      setError(true);
    }
  };

  useEffect(() => {
    if (timeLeft <= 0) return;
    const interval = setInterval(() => {
      setTimeLeft((t) => t - 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [timeLeft]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (success) return;
      if (e.key >= "0" && e.key <= "9") {
        setError(false);
        setCode((value) => (value.length < 5 ? `${value}${e.key}` : value));
      } else if (e.key === "Backspace") {
        setError(false);
        setCode((value) => value.slice(0, -1));
      } else if (e.key === "Enter") {
        if (code.length === 5) {
          verify();
        }
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [code, success]);

  const handleResendCode = () => {
    setCode("");
    setError(false);
    setTimeLeft(60);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="relative h-[calc(100%_-_58px)] text-left">
      <section className="mx-[20px] mt-[32px] rounded-[30px] px-[26px] pb-[32px] pt-[31px] shadow-pal onb-white-card" style={{ color: 'var(--app-text)' }}>
        <h1 className="text-[25px] font-extrabold" style={{ color: 'var(--onb-heading)' }}>Enter code</h1>
        <p className="mt-[13px] text-[14px] leading-[1.2] text-[var(--app-text-secondary)]">
          We&apos;ve sent an email with an activation code
          <br />
          to your email <span className="text-[var(--app-text)] font-semibold">{email || "your email"}</span>
        </p>
        <div className="mt-[16px] flex justify-between gap-1 w-full">
          {[0, 1, 2, 3, 4].map((index) => (
            <button
              key={index}
              type="button"
              onClick={() => pressDigit("1")}
              className={cn(
                "grid h-[60px] w-[50px] place-items-center rounded-[14px] border text-[24px] font-extrabold cursor-pointer transition-all duration-200 outline-none",
                error 
                  ? "border-[#ff3030] text-[#ff3030] bg-[#fff5f5]" 
                  : (index === code.length && !success)
                    ? "border-[var(--app-accent)] ring-2 ring-[var(--app-accent)]/20 bg-white shadow-md scale-105" 
                    : code[index] 
                      ? "border-gray-300 text-gray-900 bg-white font-bold" 
                      : "border-gray-200 text-gray-400 bg-gray-50/50"
              )}
            >
              {code[index] ?? ""}
            </button>
          ))}
        </div>
        {error && <p className="mt-[16px] text-center text-[12px] text-[#ff3030] font-bold">Wrong code, please try again</p>}
        <p className={cn("text-center text-[15px]", error ? "mt-[20px]" : "mt-[26px]")}>
          <button 
            type="button" 
            onClick={handleResendCode}
            disabled={timeLeft > 0}
            className={cn(
              "font-extrabold cursor-pointer",
              timeLeft > 0 
                ? "text-gray-400 cursor-not-allowed" 
                : "text-[var(--app-accent)] hover:underline"
            )}
            style={{ color: timeLeft > 0 ? '#9ca3af' : 'var(--app-accent)' }}
          >
            Send code again
          </button>{" "}
          <span className="text-[var(--app-text-secondary)] font-mono font-semibold" style={{ color: '#6b7280' }}>
            {formatTime(timeLeft)}
          </span>
        </p>
      </section>

      <button
        type="button"
        onClick={verify}
        disabled={code.length < 5}
        className="primary-pill absolute bottom-[39px] left-[34px] right-[34px] z-20 w-[calc(100%_-_68px)] cursor-pointer"
      >
        Verify
      </button>

      {/* Numerical Keyboard */}
      {keyboardVisible && (
        <NumberKeyboard 
          onDigit={pressDigit} 
          onBackspace={() => setCode((value) => value.slice(0, -1))} 
        />
      )}
      
      {/* Congrats Popup Modal */}
      {success && <SuccessModal onNext={onNext} />}
    </div>
  );
}

function NumberKeyboard({
  onDigit,
  onBackspace
}: {
  onDigit: (digit: string) => void;
  onBackspace: () => void;
}) {
  const keys = [
    ["1", ""],
    ["2", "ABC"],
    ["3", "DEF"],
    ["4", "GHI"],
    ["5", "JKL"],
    ["6", "MNO"],
    ["7", "PQRS"],
    ["8", "TUV"],
    ["9", "WXYZ"]
  ];

  return (
    <div className="absolute bottom-0 left-0 right-0 z-10">
      <div className="keyboard-grid">
        {keys.map(([digit, letters]) => (
          <button key={digit} type="button" onClick={() => onDigit(digit)} className="keyboard-key cursor-pointer">
            {digit}
            {letters && <small>{letters}</small>}
          </button>
        ))}
        <button type="button" className="h-[47px] text-[20px] text-[var(--app-text-secondary)] cursor-default opacity-50">
          +*#
        </button>
        <button type="button" onClick={() => onDigit("0")} className="keyboard-key cursor-pointer">
          0
        </button>
        <button type="button" onClick={onBackspace} className="grid h-[47px] place-items-center text-[var(--app-text)] cursor-pointer active:scale-95">
          ⌫
        </button>
      </div>
      <div className="grid h-[35px] place-items-center bg-[var(--app-card-alt)] border-t border-[var(--app-card-border)]">
        <span className="h-[4px] w-[135px] rounded-full bg-[var(--app-text)]" />
      </div>
    </div>
  );
}

function SuccessModal({ onNext }: { onNext: () => void }) {
  return (
    <div className="absolute inset-0 z-30 bg-[#0a4072]/72 backdrop-blur-[3px] flex items-end">
      <div className="w-full rounded-t-[26px] bg-[var(--app-surface)] px-[34px] pb-[49px] pt-[25px] text-center text-[var(--app-text)] shadow-2xl">
        <div className="mx-auto grid h-[132px] w-[132px] place-items-center rounded-full bg-[#e0f4ff]/10 border border-[#e0f4ff]/25">
          <span className="text-[72px] leading-none">🎉</span>
        </div>
        <h2 className="mt-[26px] text-[22px] font-extrabold leading-[1.45] text-[var(--app-text)]">
          Congrats!
          <br />
          you are all set up.
        </h2>
        <p className="mt-[11px] text-[16px] leading-[1.55] text-[var(--app-text-secondary)]">
          Get ready for a showdown!
          <br />
          Your <span className="font-bold text-[var(--app-accent)]">PAL</span> assistant is excited to help.💪
        </p>
        <button 
          type="button" 
          onClick={onNext} 
          className="primary-pill mt-[28px] w-full cursor-pointer flex items-center justify-center"
        >
          Next
        </button>
      </div>
    </div>
  );
}

