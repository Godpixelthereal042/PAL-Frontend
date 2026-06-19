"use client";

import { Home, Camera, Bookmark, Copy } from "lucide-react";
import { useRouter } from "next/navigation";
import MascotAvatar from "./MascotAvatar";
import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";

export default function BaseAppInfo() {
    const router = useRouter();
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isCameraOpen, setIsCameraOpen] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleCopy = () => {
        const textToCopy = `What is The Base app?

Hey bro, Alright.

Base App is your go-to wallet and gateway for the Base blockchain. You can think of it as the ultimate "Everything App." It's a Layer-2 network built on Ethereum by Coinbase.
Here's what it does:
- It's a wallet – keep your crypto and NFTs safe and sound.
- It's a bridge – it helps you move from Ethereum to Base with lower fees.
- It's an app hub – dive into dApps like games, DeFi, and social apps on Base.
- It's super user-friendly – made for everyone, not just techies, so you can easily get into crypto.`;
        
        navigator.clipboard.writeText(textToCopy);
        alert("Results copied to clipboard!");
    };

    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                const imgData = reader.result as string;
                localStorage.setItem("chat_upload_image", imgData);
                router.push("/chat");
            };
            reader.readAsDataURL(file);
        }
    };

    return (
        <div className="h-dvh research-page-bg text-white p-4 w-full max-w-[430px] mx-auto relative shadow-2xl overflow-hidden selection:bg-cyan-500/30 font-outfit flex flex-col justify-between">
            {/* Hidden File Input */}
            <input
                type="file"
                ref={fileInputRef}
                className="hidden"
                accept="image/*"
                onChange={handleFileUpload}
            />

            <div className="relative z-10 flex flex-col h-full flex-1">
                
                {/* Header */}
                <div className="flex items-center justify-between pt-2 mb-8 relative">
                    <button
                        onClick={() => router.push('/')}
                        className="grid h-[42px] w-[42px] place-items-center rounded-full border border-[#48b9ff]/40 bg-[#07315d]/50 text-[#9eeaff] hover:bg-[#07315d]/85 transition-colors cursor-pointer"
                        aria-label="Back to home"
                    >
                        <Home size={18} />
                    </button>

                    <div className="flex items-center gap-[9px]">
                        {/* Bookmark Actions Dropdown Popover */}
                        <div className="relative">
                            <button
                                onClick={() => setIsMenuOpen(!isMenuOpen)}
                                className={`grid h-[36px] w-[36px] place-items-center rounded-full border border-[#6a8fb7]/40 bg-[#0b477e]/50 text-white hover:bg-[#0b477e]/85 transition-colors cursor-pointer ${
                                    isMenuOpen ? "ring-2 ring-cyan-400 bg-[#0b477e]/80" : ""
                                }`}
                                aria-label="Search actions"
                            >
                                <Bookmark size={16} className={isMenuOpen ? "fill-[#66d9f7] text-[#66d9f7]" : ""} />
                            </button>
                            <AnimatePresence>
                                {isMenuOpen && (
                                    <>
                                        {/* Click outside backdrop */}
                                        <div className="fixed inset-0 z-40" onClick={() => setIsMenuOpen(false)} />
                                        <motion.div
                                            initial={{ opacity: 0, scale: 0.95, y: -10 }}
                                            animate={{ opacity: 1, scale: 1, y: 0 }}
                                            exit={{ opacity: 0, scale: 0.95, y: -10 }}
                                            className="absolute right-0 mt-2 w-[160px] rounded-2xl bg-[#082245] border border-[#48b9ff]/30 p-2 shadow-2xl z-50 text-left font-outfit"
                                        >
                                            <button
                                                onClick={() => {
                                                    setIsMenuOpen(false);
                                                    alert("Research saved to library!");
                                                }}
                                                className="w-full text-left px-4 py-2.5 text-xs font-semibold text-[#c7edf9] hover:bg-[#2d7fe0] hover:text-white rounded-lg transition-colors cursor-pointer"
                                            >
                                                Save Search
                                            </button>
                                            <div className="h-[1px] bg-white/5 my-1" />
                                            <button
                                                onClick={() => {
                                                    setIsMenuOpen(false);
                                                    router.push('/research');
                                                }}
                                                className="w-full text-left px-4 py-2.5 text-xs font-semibold text-[#c7edf9] hover:bg-[#2d7fe0] hover:text-white rounded-lg transition-colors cursor-pointer"
                                            >
                                                Search More
                                            </button>
                                        </motion.div>
                                    </>
                                )}
                            </AnimatePresence>
                        </div>

                        <button 
                            onClick={handleCopy}
                            className="grid h-[36px] w-[36px] place-items-center rounded-full border border-[#6a8fb7]/40 bg-[#0b477e]/50 text-white hover:bg-[#0b477e]/85 transition-colors cursor-pointer"
                            aria-label="Copy results"
                        >
                            <Copy size={16} />
                        </button>

                        <button 
                            onClick={() => setIsCameraOpen(true)}
                            className="grid h-[36px] w-[36px] place-items-center rounded-full border border-[#6a8fb7]/40 bg-[#0b477e]/50 text-[#fff] hover:bg-[#07315d]/85 transition-colors cursor-pointer"
                            aria-label="Take snap or upload"
                        >
                            <Camera size={16} />
                        </button>

                        <div className="relative">
                            <div className="absolute -inset-0.5 rounded-full bg-cyan-400 opacity-75 blur-sm animate-pulse" />
                            <div className="relative w-[36px] h-[36px] rounded-full overflow-hidden border border-[#51d4ff] bg-[#d9fff7] ring-1 ring-black">
                                <MascotAvatar className="w-full h-full" />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Main Content Box */}
                <div className="flex-1 flex flex-col min-h-0">
                    
                    {/* Title Section with Vertical Left Line */}
                    <div className="relative pl-5 border-l-[3.5px] border-[#66d9f7] shrink-0 mb-4 mt-4 text-left">
                        <h1 className="text-[32px] font-bold leading-[1.1] text-white">
                            What is
                            <br />
                            The Base app?
                        </h1>
                    </div>

                    {/* Wrap Scrollable text details in a relative container to allow fading overlays */}
                    <div className="relative flex-1 min-h-0 mb-2">
                        {/* Text details - scrollable */}
                        <div className="h-full overflow-y-auto pr-1 pt-2 pb-16 space-y-5 scrollbar-hide">
                            <p className="text-base font-bold text-white mt-4 font-outfit text-left">Hey bro, Alright.</p>

                            <p className="text-[14px] leading-[1.5] text-[#d8edf8] font-medium font-outfit text-left">
                                Base App is your <span className="underline decoration-1 underline-offset-2">go-to</span> wallet and <span className="underline decoration-1 underline-offset-2">gateway</span> for the Base blockchain. You can think of it as the ultimate <strong className="text-white font-semibold">"Everything App."</strong> It's a Layer-2 network built on Ethereum by Coinbase.
                            </p>

                            <p className="text-[14px] leading-[1.5] text-[#d8edf8] font-medium font-outfit text-left">Here's what it does:</p>

                            <div className="space-y-4 pl-1 text-[14px] leading-[1.5] text-[#d8edf8] font-medium font-outfit text-left">
                                <p className="flex items-start gap-1.5">
                                    <span className="text-[var(--app-text-secondary)] shrink-0">•</span>
                                    <span><strong className="text-white font-semibold">It's a wallet</strong> – keep your crypto and NFTs safe and sound.</span>
                                </p>
                                <p className="flex items-start gap-1.5">
                                    <span className="text-[var(--app-text-secondary)] shrink-0">•</span>
                                    <span><strong className="text-white font-semibold">It's a bridge</strong> – it helps you move from Ethereum to Base with lower fees.</span>
                                </p>
                                <p className="flex items-start gap-1.5">
                                    <span className="text-[var(--app-text-secondary)] shrink-0">•</span>
                                    <span><strong className="text-white font-semibold">It's an app hub</strong> – dive into dApps like games, DeFi, and social apps on Base.</span>
                                </p>
                                <p className="flex items-start gap-1.5">
                                    <span className="text-[var(--app-text-secondary)] shrink-0">•</span>
                                    <span><strong className="text-white font-semibold">It's super user-friendly</strong> – made for everyone, not just techies, so you can easily get into crypto.</span>
                                </p>
                            </div>
                        </div>

                        {/* Top Fading gradient */}
                        <div className="absolute top-0 left-0 right-0 h-6 bg-gradient-to-b from-[#051c36] via-[#051c36]/40 to-transparent pointer-events-none z-10" />

                        {/* Bottom Fading gradient */}
                        <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-[#062446] via-[#062446]/80 to-transparent pointer-events-none z-10" />
                    </div>

                    {/* Winking Mascot Face Animation (Fixed/Static at the bottom, transparent background) */}
                    <div className="shrink-0 pt-2 pb-2 w-full flex items-center justify-center bg-transparent">
                        <div className="relative w-[80px] h-[80px] flex items-center justify-center">
                            <div className="absolute inset-0 rounded-full bg-[#66d9f7]/10 animate-pulse blur-sm" />
                            <svg className="w-[60px] h-[60px] relative z-10" viewBox="0 0 60 60" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <circle cx="18" cy="20" r="5" fill="#66d9f7" />
                                <rect x="32" y="19" width="12" height="3" rx="1.5" fill="#66d9f7" />
                                <path
                                    d="M 18 36 Q 30 45 42 36"
                                    stroke="#66d9f7"
                                    strokeWidth="4"
                                    strokeLinecap="round"
                                    fill="none"
                                />
                            </svg>
                        </div>
                    </div>

                </div>
            </div>

            {/* Bottom Sheet for Camera Actions */}
            <AnimatePresence>
                {isCameraOpen && (
                    <>
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setIsCameraOpen(false)}
                            className="absolute inset-0 bg-black/60 z-45"
                        />
                        <motion.div
                            initial={{ y: "100%" }}
                            animate={{ y: 0 }}
                            exit={{ y: "100%" }}
                            transition={{ type: "spring", damping: 25, stiffness: 200 }}
                            className="absolute bottom-0 left-0 right-0 bg-[#082245] border-t border-[#48b9ff]/30 rounded-t-[24px] p-6 z-50 font-outfit"
                        >
                            <div className="w-12 h-1 bg-[#48b9ff]/30 rounded-full mx-auto mb-6" />
                            <h3 className="text-base font-bold text-center text-white mb-6">
                                Upload a snapshot of your product
                            </h3>
                            
                            <div className="space-y-3 pb-4">
                                <button
                                    onClick={() => {
                                        setIsCameraOpen(false);
                                        const placeholderImg = "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='300' height='150' viewBox='0 0 300 150'><rect width='300' height='150' fill='%2305264a'/><text x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' fill='%2351d4ff' font-family='sans-serif' font-size='16'>Camera Snapshot</text></svg>";
                                        localStorage.setItem("chat_upload_image", placeholderImg);
                                        router.push("/chat");
                                    }}
                                    className="w-full py-3.5 rounded-full bg-[#0b2f5d] border border-[#48b9ff]/20 text-white font-medium text-center hover:bg-[#0f3d75] transition-colors cursor-pointer"
                                >
                                    Take a Picture
                                </button>
                                
                                <button
                                    onClick={() => {
                                        setIsCameraOpen(false);
                                        fileInputRef.current?.click();
                                    }}
                                    className="w-full py-3.5 rounded-full bg-[#2d7fe0] text-white font-medium text-center hover:bg-[#1a6ecf] transition-colors cursor-pointer"
                                >
                                    Upload an Image
                                </button>

                                <button
                                    onClick={() => setIsCameraOpen(false)}
                                    className="w-full py-3.5 rounded-full bg-transparent text-[var(--app-text-secondary)] font-medium text-center hover:text-white transition-colors cursor-pointer"
                                >
                                    Cancel
                                </button>
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </div>
    );
}
