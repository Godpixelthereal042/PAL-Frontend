"use client";

import React from "react";

interface OnboardingShellProps {
  children: React.ReactNode;
}

export default function OnboardingShell({ children }: OnboardingShellProps) {
  return (
    <div className="w-full min-h-dvh flex items-center justify-center bg-black text-white font-outfit select-none overflow-hidden p-0 sm:p-4">
      {/* 430px Fixed Width Mobile Shell Centered on Desktop Viewports */}
      <div className="relative w-full max-w-[430px] h-dvh sm:h-[860px] sm:max-h-[92dvh] sm:rounded-[44px] sm:border-[5px] sm:border-[#1e2638] shadow-[0_25px_70px_rgba(0,0,0,0.85)] overflow-hidden flex flex-col justify-between bg-gradient-to-b from-[#d3f9ff] via-[#6ed0eb] to-[#c9f6ff]">
        {children}
      </div>
    </div>
  );
}
