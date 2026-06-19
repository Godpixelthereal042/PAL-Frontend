"use client";

import { Home, Zap } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import MascotAvatar from "./MascotAvatar";

function StatusBar({ tone }: { tone: "light" | "dark" }) {
    return (
        <div className={`status-bar ${tone === "dark" ? "status-dark" : ""}`}>
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
            </div>
        </div>
    );
}

export default function ResearchScreen() {
    const router = useRouter();
    const [query, setQuery] = useState("");
    const selectedType = "Web";

    const handleResearch = (e?: React.FormEvent) => {
        if (e) e.preventDefault();
        if (!query.trim()) return;
        router.push(`/research/results?q=${encodeURIComponent(query.trim())}&type=${encodeURIComponent(selectedType)}`);
    };

    return (
        <div className="h-dvh research-page-bg w-full max-w-[430px] mx-auto relative shadow-2xl overflow-hidden selection:bg-cyan-500/30 font-outfit flex flex-col justify-between">
            {/* iOS Status Bar */}
            <StatusBar tone="dark" />

            <div className="flex-1 flex flex-col justify-between px-4 pb-4 pt-2 z-10">
                {/* Header & Main Content Wrapper */}
                <div className="flex flex-col flex-1">
                    {/* Header */}
                    <div className="flex items-center justify-between pt-2 mb-16">
                        <button
                            onClick={() => router.push('/')}
                            className="grid h-[54px] w-[54px] place-items-center rounded-full transition-all cursor-pointer shadow-md hover:opacity-90"
                            style={{
                                backgroundColor: '#07315d',
                                borderColor: '#48b9ff',
                                borderStyle: 'solid',
                                borderWidth: '1.5px',
                                color: '#9eeaff'
                            }}
                            aria-label="Go to home"
                        >
                            <Home size={22} style={{ color: '#9eeaff' }} />
                        </button>

                        <div className="w-[54px] h-[54px] rounded-full overflow-hidden border border-[#51d4ff] bg-[#d9fff7] relative ring-1 ring-black shadow-[0_0_12px_rgba(81,212,255,0.6)]">
                            <MascotAvatar className="w-full h-full" />
                        </div>
                    </div>

                    {/* Main Content */}
                    <div className="flex flex-col items-center justify-center mb-8">
                        {/* Main Heading */}
                        <div className="text-center mb-10 pt-[10px] w-full">
                            <h1 className="text-[46px] font-bold leading-[1.08] text-white tracking-tight">
                                What&apos;s
                            </h1>
                            <h1 className="text-[46px] font-bold leading-[1.08] text-white tracking-tight">
                                b<span className="underline decoration-1 underline-offset-[5px]">u</span>
                                <span className="underline decoration-1 underline-offset-[5px]">g</span>
                                <span className="underline decoration-1 underline-offset-[5px]">g</span>in
                                <span className="underline decoration-1 underline-offset-[5px]">g</span>
                            </h1>
                            <div className="relative inline-block w-full">
                                <h1 className="text-[46px] font-bold leading-[1.08] text-white tracking-tight">
                                    you <span className="relative inline-block px-1">
                                        today?
                                        <svg
                                            viewBox="0 0 200 30"
                                            className="absolute -bottom-4 left-[-10px] w-[110%] h-6 pointer-events-none"
                                            preserveAspectRatio="none"
                                        >
                                            <path
                                                d="M 10 6 L 190 6 L 40 22 L 180 22"
                                                stroke="#66d9f7"
                                                strokeWidth="3.5"
                                                fill="none"
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                            />
                                        </svg>
                                    </span>
                                </h1>
                            </div>
                        </div>

                        {/* Description Box */}
                        <div className="border-l-[3px] border-[#66d9f7] pl-5 pr-2 mb-16 max-w-[320px] text-left self-start">
                            <p className="text-[#c7e7f5] text-[13px] leading-relaxed mb-3 font-medium">
                                What topics are you thinking about for your research? Or is there something specific on your mind that you want to share?
                            </p>
                            <p className="text-[#c7e7f5] text-[13px] leading-relaxed font-medium">
                                Let&apos;s dive into that idea or business curiosity a bit more!
                            </p>
                        </div>
                    </div>
                </div>

                {/* Bottom Input Area */}
                <div className="w-full max-w-[362px] mx-auto mb-4 z-40">
                    <form 
                        onSubmit={handleResearch}
                        className="flex items-center justify-between h-[64px] rounded-[24px] bg-[#082f5d]/50 backdrop-blur-md border border-[#48b9ff]/20 p-[4px] pl-[20px] shadow-2xl"
                    >
                        <input
                            type="text"
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                            placeholder="Start your research"
                            className="flex-1 bg-transparent text-white placeholder:text-[#8fc9e8]/75 outline-none text-sm font-medium h-full mr-2"
                        />

                        <button
                            type="submit"
                            disabled={!query.trim()}
                            className="h-[56px] rounded-[20px] px-5 text-xs font-bold flex items-center gap-1.5 transition-all shrink-0 active:scale-95"
                            style={!query.trim() ? {
                                backgroundColor: 'rgba(45, 127, 224, 0.2)',
                                color: 'rgba(255, 255, 255, 0.3)',
                                border: '1px solid rgba(255, 255, 255, 0.05)',
                                cursor: 'not-allowed'
                            } : {
                                backgroundColor: '#2d7fe0',
                                color: '#ffffff',
                                cursor: 'pointer',
                                boxShadow: '0 10px 15px -3px rgba(59, 130, 246, 0.3)'
                            }}
                        >
                            Research
                            <Zap className="w-3.5 h-3.5 fill-current" style={!query.trim() ? { color: 'rgba(255, 255, 255, 0.3)' } : { color: '#ffffff' }} />
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
}
