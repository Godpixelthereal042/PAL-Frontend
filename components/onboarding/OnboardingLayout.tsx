"use client";

import React from "react";
import { ArrowLeft } from "lucide-react";

interface OnboardingLayoutProps {
  currentStep?: number;
  totalSteps?: number;
  title?: React.ReactNode;
  subtitle?: string;
  illustration?: React.ReactNode;
  children?: React.ReactNode;
  primaryAction?: {
    label: string;
    onClick: () => void;
    disabled?: boolean;
  };
  secondaryAction?: {
    label: string;
    onClick: () => void;
  };
  onBack?: () => void;
}

export default function OnboardingLayout({
  currentStep,
  totalSteps = 3,
  title,
  subtitle,
  illustration,
  children,
  primaryAction,
  secondaryAction,
  onBack
}: OnboardingLayoutProps) {
  return (
    <div className="h-dvh w-full max-w-[430px] mx-auto bg-[var(--app-bg)] text-[var(--app-text)] flex flex-col justify-between relative overflow-hidden font-outfit px-5">
      {/* ─── 1. Header Bar ──────────────────────────────────── */}
      <div className="pt-[calc(env(safe-area-inset-top,0px)+12px)] pb-2 flex items-center justify-between shrink-0 z-30 min-h-[48px]">
        {onBack ? (
          <button
            type="button"
            onClick={onBack}
            className="w-10 h-10 rounded-full border border-[var(--app-card-border)] bg-[var(--app-card)] flex items-center justify-center text-[var(--app-text-secondary)] hover:text-white transition-colors cursor-pointer shrink-0 min-h-[44px] min-w-[44px]"
            aria-label="Go back"
          >
            <ArrowLeft size={18} />
          </button>
        ) : (
          <div className="w-10" />
        )}

        {/* Progress Dots / Bars */}
        {currentStep !== undefined && (
          <div className="flex items-center gap-1.5 shrink-0">
            {Array.from({ length: totalSteps }).map((_, idx) => (
              <span
                key={idx}
                className={`h-1.5 rounded-full transition-all duration-300 ${
                  idx === currentStep
                    ? "w-7 bg-[#2d7fe0]"
                    : "w-2 bg-white/20"
                }`}
              />
            ))}
          </div>
        )}

        <div className="w-10" />
      </div>

      {/* ─── 2. Scrollable / Flex Content Area ───────────── */}
      <div className="flex-1 flex flex-col justify-between min-h-0 overflow-y-auto scrollbar-hide py-2 gap-3">
        {/* Title & Subtitle section */}
        {(title || subtitle) && (
          <div className="space-y-2 text-left shrink-0">
            {title && (
              <h1 className="text-[clamp(1.5rem,6vw,2.25rem)] font-extrabold leading-[1.1] tracking-tight text-white">
                {title}
              </h1>
            )}
            {subtitle && (
              <p className="text-xs sm:text-sm font-medium text-[var(--app-text-secondary)] leading-relaxed">
                {subtitle}
              </p>
            )}
          </div>
        )}

        {/* Hero Illustration Container (Strict Max Height Constraint: 42% Viewport) */}
        {illustration && (
          <div className="flex-1 min-h-[140px] max-h-[42vh] w-full flex items-center justify-center relative my-auto py-2 overflow-hidden shrink-0">
            {illustration}
          </div>
        )}

        {/* Main Step Custom Body (Forms, Buttons, Options) */}
        {children && (
          <div className="w-full shrink-0 space-y-3 py-1">
            {children}
          </div>
        )}
      </div>

      {/* ─── 3. Fixed / Bottom Footer CTA Actions ──────────── */}
      {(primaryAction || secondaryAction) && (
        <div className="shrink-0 w-full pt-3 pb-[calc(env(safe-area-inset-bottom,0px)+16px)] flex flex-col gap-2 z-40 bg-gradient-to-t from-[var(--app-bg)] via-[var(--app-bg)] to-transparent">
          {primaryAction && (
            <button
              type="button"
              onClick={primaryAction.onClick}
              disabled={primaryAction.disabled}
              className="w-full h-[52px] min-h-[44px] rounded-full bg-[#2d7fe0] hover:bg-[#2563eb] text-white text-base font-bold transition-all active:scale-[0.98] shadow-lg shadow-blue-500/25 flex items-center justify-center cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {primaryAction.label}
            </button>
          )}

          {secondaryAction && (
            <button
              type="button"
              onClick={secondaryAction.onClick}
              className="w-full py-2 text-xs font-semibold text-[var(--app-text-muted)] hover:text-white transition-colors cursor-pointer text-center min-h-[36px]"
            >
              {secondaryAction.label}
            </button>
          )}
        </div>
      )}
    </div>
  );
}
