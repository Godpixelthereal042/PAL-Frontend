"use client";

import React from "react";

interface OnboardingShellProps {
  children: React.ReactNode;
}

export default function OnboardingShell({ children }: OnboardingShellProps) {
  return (
    <div className="w-full min-h-dvh flex items-center justify-center bg-[#03060c] text-white font-outfit select-none overflow-hidden p-0 sm:p-4">
      {/* Centered 430px Mobile Canvas with PAL Executive Dark Lighting */}
      <div className="relative w-full max-w-[430px] h-dvh sm:h-[860px] sm:max-h-[92dvh] sm:rounded-[44px] sm:border-[5px] sm:border-[#1e2638] shadow-[0_25px_80px_rgba(0,0,0,0.9)] overflow-hidden flex flex-col justify-between bg-[#060911]">
        {/* Ambient Radial Lighting Overlay */}
        <div 
          className="absolute -top-32 -left-32 w-96 h-96 rounded-full bg-[#0052ff]/20 blur-[100px] pointer-events-none z-0" 
          aria-hidden="true" 
        />
        <div 
          className="absolute bottom-1/4 -right-24 w-80 h-80 rounded-full bg-[#2d7fe0]/15 blur-[90px] pointer-events-none z-0" 
          aria-hidden="true" 
        />
        
        {/* Screen Content Wrapper */}
        <div className="relative z-10 w-full h-full flex flex-col justify-between">
          {children}
        </div>
      </div>
    </div>
  );
}
