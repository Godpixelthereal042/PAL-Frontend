"use client";

import React, { useState, useEffect } from "react";
import { ArrowLeft, Camera, Sparkles, RefreshCw, AlertCircle } from "lucide-react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import BottomNav from "./BottomNav";

export default function CameraScreen() {
    const router = useRouter();
    const [isScanning, setIsScanning] = useState(false);
    const [scanComplete, setScanComplete] = useState(false);
    const [logResult, setLogResult] = useState("");

    const handleCapture = () => {
        setIsScanning(true);
        setScanComplete(false);
        setLogResult("");

        // Simulate scanning animation duration
        setTimeout(() => {
            setIsScanning(false);
            setScanComplete(true);
            setLogResult("ERROR: Uncaught TypeError: Cannot read properties of undefined (reading 'map') at Dashboard.tsx:142");
        }, 2500);
    };

    const handleSendToChat = () => {
        if (logResult) {
            localStorage.setItem("chat_incoming_prompt", `I scanned this error log, can you help me fix it?\n\n\`\`\`\n${logResult}\n\`\`\``);
            router.push("/chat");
        }
    };

    return (
        <div className="h-dvh bg-[var(--app-bg)] text-[var(--app-text)] w-full max-w-[430px] mx-auto relative shadow-2xl overflow-hidden selection:bg-blue-500/30 flex flex-col font-outfit">
            {/* Header */}
            <div className="flex justify-between items-center p-4 pt-5 pb-2 shrink-0 z-30 bg-[var(--app-header-bg)] backdrop-blur-md border-b border-[var(--app-card-border)]">
                <button
                    onClick={() => router.push("/")}
                    className="grid h-[44px] w-[44px] place-items-center rounded-full border border-[var(--app-card-border)] bg-[#161616] text-[#9eeaff] hover:bg-[#1a6ecf]/10 transition-colors cursor-pointer"
                    aria-label="Back to home"
                >
                    <ArrowLeft size={20} />
                </button>
                <h1 className="text-base font-bold text-white tracking-wide">AI Screen Scanner</h1>
                <div className="w-[44px]" /> {/* Spacer */}
            </div>

            {/* Viewfinder Area */}
            <div className="flex-1 flex flex-col justify-center items-center p-6 bg-black relative">
                
                {/* Scanner Target Container */}
                <div className="w-full aspect-[4/3] rounded-[24px] border-2 border-white/15 relative overflow-hidden bg-zinc-950 flex flex-col items-center justify-center shadow-inner shadow-black">
                    
                    {/* Viewfinder Corner Highlights */}
                    <div className="absolute top-4 left-4 w-6 h-6 border-t-2 border-l-2 border-[#51d4ff] rounded-tl-md" />
                    <div className="absolute top-4 right-4 w-6 h-6 border-t-2 border-r-2 border-[#51d4ff] rounded-tr-md" />
                    <div className="absolute bottom-4 left-4 w-6 h-6 border-b-2 border-l-2 border-[#51d4ff] rounded-bl-md" />
                    <div className="absolute bottom-4 right-4 w-6 h-6 border-b-2 border-r-2 border-[#51d4ff] rounded-br-md" />
                    
                    {/* Scanning Laser Line */}
                    {isScanning && (
                        <motion.div
                            initial={{ top: "10%" }}
                            animate={{ top: "90%" }}
                            transition={{
                                repeat: Infinity,
                                repeatType: "reverse",
                                duration: 1.2,
                                ease: "easeInOut"
                            }}
                            className="absolute left-4 right-4 h-0.5 bg-gradient-to-r from-transparent via-[#48b9ff] to-transparent shadow-[0_0_12px_#48b9ff] z-20"
                        />
                    )}

                    {/* Simulated Screen Content */}
                    <div className="text-left font-mono text-[8px] text-zinc-600 leading-normal p-6 w-full h-full select-none select-all overflow-hidden flex flex-col justify-between">
                        <div>
                            <div>$ npm run build</div>
                            <div>&gt; pal-frontend@0.1.0 build</div>
                            <div>&gt; next build</div>
                            <div className="text-red-500/80 mt-1 font-bold">Uncaught TypeError: Cannot read properties of undefined</div>
                            <div className="pl-4 text-red-500/60 font-semibold">at Dashboard.tsx:142:24</div>
                            <div className="pl-4 text-red-500/60 font-semibold">at renderWithHooks (react-dom.development.js:15486)</div>
                        </div>
                        <div className="text-zinc-700 text-right uppercase tracking-wider text-[7px] font-bold">
                            Viewfinder screen capture target
                        </div>
                    </div>

                    {/* Faint Grid Lines Overlay */}
                    <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.01)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.01)_1px,transparent_1px)] bg-[size:20px_20px] pointer-events-none" />
                </div>

                {/* Status and Action Panel */}
                <div className="w-full mt-6 text-center space-y-4">
                    {isScanning && (
                        <div className="flex items-center justify-center gap-2 text-xs text-blue-400 font-semibold animate-pulse">
                            <RefreshCw size={14} className="animate-spin" /> Scanning screen logs...
                        </div>
                    )}

                    {scanComplete && (
                        <div className="space-y-4 animate-slide-up">
                            <div className="flex items-start gap-2 text-left bg-red-950/20 border border-red-900/40 p-3 rounded-2xl">
                                <AlertCircle size={16} className="text-red-400 shrink-0 mt-0.5" />
                                <div>
                                    <h4 className="text-xs font-bold text-white uppercase tracking-wider">Log Parsed</h4>
                                    <p className="text-[10px] text-[var(--app-text-secondary)] font-mono mt-1 leading-relaxed break-all">{logResult}</p>
                                </div>
                            </div>
                            
                            <button
                                type="button"
                                onClick={handleSendToChat}
                                className="w-full h-[46px] rounded-full bg-gradient-to-r from-[#2d7fe0] to-[#1a6ecf] text-xs font-bold text-white shadow-lg shadow-blue-500/20 flex items-center justify-center gap-2 uppercase tracking-wider active:scale-[0.98] transition-all cursor-pointer"
                            >
                                <Sparkles size={14} /> Diagnose in Chat
                            </button>
                        </div>
                    )}

                    {!isScanning && !scanComplete && (
                        <p className="text-xs text-[var(--app-text-muted)] max-w-[280px] mx-auto leading-relaxed">
                            Point your device at a screenshot of a bug, error log, or dashboard metric to scan it.
                        </p>
                    )}

                    {/* Capture Shutter Button */}
                    {!isScanning && (
                        <div className="pt-2">
                            <button
                                type="button"
                                onClick={handleCapture}
                                className="w-[68px] h-[68px] rounded-full border-4 border-zinc-800 bg-white hover:bg-zinc-200 transition-colors flex items-center justify-center active:scale-95 cursor-pointer shadow-xl shadow-black/40"
                                aria-label="Capture button"
                            >
                                <Camera size={26} className="text-black" />
                            </button>
                        </div>
                    )}
                </div>
            </div>

            <BottomNav activePage="home" />
        </div>
    );
}
