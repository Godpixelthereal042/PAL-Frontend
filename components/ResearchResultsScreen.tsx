"use client";

import { Home, Camera } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import MascotAvatar from "./MascotAvatar";
import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

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

export default function ResearchResultsScreen() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const query = searchParams.get("q") || "What is The Base app?";
    
    const [prevQuery, setPrevQuery] = useState(query);
    const [isCameraOpen, setIsCameraOpen] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const [content, setContent] = useState<{
        title: string;
        greeting: string;
        body: string;
        bullets: Array<{ label: string; desc: string }>;
    } | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    if (query !== prevQuery) {
        setPrevQuery(query);
        setLoading(true);
        setError(null);
        setContent(null);
    }

    const getTopicContent = (queryText: string) => {
        const q = queryText.toLowerCase();
        
        if (q.includes("ethereum") || q.includes("eth")) {
            return {
                title: "What is\nEthereum?",
                greeting: "Here is your Ethereum research, bro.",
                body: "Ethereum is a decentralized, open-source blockchain network with smart contract functionality. It powers the cryptocurrency Ether (ETH) and acts as the foundation for the decentralized finance (DeFi) ecosystem.",
                bullets: [
                    { label: "Smart Contracts", desc: "allows developers to build decentralized applications that run exactly as coded." },
                    { label: "Ether (ETH)", desc: "the native digital token used to pay gas fees and settle transactions." },
                    { label: "Global Network", desc: "a world computer operated by thousands of independent validator nodes worldwide." }
                ]
            };
        }
        
        if (q.includes("solana") || q.includes("sol")) {
            return {
                title: "What is\nSolana?",
                greeting: "Got the Solana research details right here.",
                body: "Solana is a high-speed, layer-1 blockchain designed for mass adoption. It is highly optimized for scalability, offering sub-second confirmation times and transaction costs that are a fraction of a cent.",
                bullets: [
                    { label: "Proof-of-History (PoH)", desc: "a cryptographic clock that orders transactions efficiently before consensus." },
                    { label: "High TPS", desc: "capable of handling up to 50,000 transactions per second natively." },
                    { label: "Developer Friendly", desc: "supports Rust and C programming languages for building smart contracts (programs)." }
                ]
            };
        }
        
        // Default / Base App
        return {
            title: "What is\nThe Base app?",
            greeting: "Hey bro, Alright.",
            body: "Base App is your go-to wallet and gateway for the Base blockchain. You can think of it as the ultimate “Everything App.” It’s a Layer-2 network built on Ethereum by Coinbase.",
            bullets: [
                { label: "It’s a wallet", desc: "keep your crypto and NFTs safe and sound." },
                { label: "It’s a bridge", desc: "it helps you move from Ethereum to Base with lower fees." },
                { label: "It’s an app hub", desc: "dive into dApps like games, DeFi, and social apps on Base." },
                { label: "It’s super user-friendly", desc: "made for everyone, not just techies, so you can easily get into crypto." }
            ]
        };
    };

    useEffect(() => {
        let isMounted = true;

        fetch(`/api/research?q=${encodeURIComponent(query)}`)
            .then((res) => {
                if (!res.ok) {
                    return res.json().then(data => {
                        return { error: data.error || "Failed to fetch research data", isError: true };
                    }).catch(() => {
                        return { error: "Failed to fetch research data", isError: true };
                    });
                }
                return res.json();
            })
            .then((data) => {
                if (isMounted) {
                    if (data && data.isError) {
                        setError(data.error);
                        setLoading(false);
                        setContent(getTopicContent(query));
                    } else {
                        setContent(data);
                        setLoading(false);
                    }
                }
            })
            .catch((err) => {
                if (isMounted) {
                    console.error("Research fetch error:", err);
                    setError(err instanceof Error ? err.message : String(err));
                    setLoading(false);
                    setContent(getTopicContent(query));
                }
            });

        return () => {
            isMounted = false;
        };
    }, [query]);

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

    const formatBodyText = (text: string) => {
        if (!text) return "";
        const formatted = text
            .replace(/(go-to)/gi, '<span class="underline">$1</span>')
            .replace(/(gateway)/gi, '<span class="underline">$1</span>')
            .replace(/“Everything App\.”/g, '<span class="font-bold text-white">“Everything App.”</span>')
            .replace(/"Everything App\."/g, '<span class="font-bold text-white">"Everything App."</span>');
        return <span dangerouslySetInnerHTML={{ __html: formatted }} />;
    };

    return (
        <div 
            style={{ background: 'linear-gradient(to bottom, #010103 0%, #051c36 40%, #0c3364 75%, #185092 100%)' }}
            className="h-dvh w-full max-w-[430px] mx-auto relative shadow-2xl overflow-hidden selection:bg-cyan-500/30 font-outfit flex flex-col justify-between"
        >
            {/* iOS Status Bar */}
            <StatusBar tone="dark" />

            {/* Hidden File Input */}
            <input
                type="file"
                ref={fileInputRef}
                className="hidden"
                accept="image/*"
                onChange={handleFileUpload}
            />

            {/* Main Content Wrapper (Handles all layout and padding) */}
            <div className="flex-1 flex flex-col justify-between p-4 pt-2 z-10 overflow-hidden relative">
                
                {/* Header & Content Box */}
                <div className="flex-grow flex flex-col min-h-0">
                    {/* Header */}
                    <div className="flex items-center justify-between pt-2 mb-8 relative z-50">
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
                            aria-label="Back to home"
                        >
                            <Home size={22} style={{ color: '#9eeaff' }} />
                        </button>

                        <div className="flex items-center gap-[12px]">
                            <button 
                                onClick={() => setIsCameraOpen(true)}
                                className="grid h-[54px] w-[54px] place-items-center rounded-full transition-all cursor-pointer shadow-md hover:opacity-90"
                                style={{
                                    backgroundColor: 'rgba(255, 255, 255, 0.15)',
                                    borderColor: 'rgba(255, 255, 255, 0.25)',
                                    borderStyle: 'solid',
                                    borderWidth: '1px',
                                    color: '#ffffff'
                                }}
                                aria-label="Take snap or upload"
                            >
                                <Camera size={22} style={{ color: '#ffffff' }} />
                            </button>

                            <div className="w-[54px] h-[54px] rounded-full overflow-hidden border border-[#51d4ff] bg-[#d9fff7] relative ring-1 ring-black shadow-[0_0_12px_rgba(81,212,255,0.6)]">
                                <MascotAvatar className="w-full h-full" />
                            </div>
                        </div>
                    </div>

                    {/* Main Content Box */}
                    <div className="flex-1 flex flex-col min-h-0">
                        {loading ? (
                            <>
                                {/* Title Section Skeleton */}
                                <div className="relative pl-5 border-l-[3.5px] border-[#66d9f7]/40 shrink-0 mb-4 mt-4 text-left">
                                    <div className="h-8 w-48 bg-[#0b477e]/40 rounded-lg animate-pulse mb-2" />
                                    <div className="h-8 w-32 bg-[#0b477e]/40 rounded-lg animate-pulse" />
                                </div>
                                
                                {/* Scrollable details Skeleton */}
                                <div className="relative flex-1 min-h-0 mb-2">
                                    <div className="h-full overflow-y-auto pr-1 pt-2 pb-16 space-y-5 scrollbar-hide">
                                        <div className="h-5 w-56 bg-[#0b477e]/40 rounded-lg animate-pulse mt-4" />
                                        
                                        <div className="space-y-2.5 mt-4">
                                            <div className="h-4 w-full bg-[#0b477e]/30 rounded-lg animate-pulse" />
                                            <div className="h-4 w-[95%] bg-[#0b477e]/30 rounded-lg animate-pulse" />
                                            <div className="h-4 w-[80%] bg-[#0b477e]/30 rounded-lg animate-pulse" />
                                        </div>
                                    </div>
                                </div>
                            </>
                        ) : error && !content ? (
                            <>
                                {/* Error Section */}
                                <div className="relative pl-5 border-l-[3.5px] border-red-500 shrink-0 mb-4 mt-4 text-left">
                                    <h1 className="text-[28px] font-bold leading-[1.1] text-white">
                                        Research Error
                                    </h1>
                                </div>
                                <div className="relative flex-1 min-h-0 mb-2">
                                    <div className="h-full overflow-y-auto pr-1 pt-2 pb-16 space-y-5 scrollbar-hide text-left">
                                        <p className="text-sm text-red-400">
                                            {error}
                                        </p>
                                        <button 
                                            onClick={() => router.push('/research')}
                                            className="px-4 py-2 bg-[#2d7fe0] text-white rounded-lg text-xs font-semibold hover:bg-[#1a6ecf] transition-all cursor-pointer"
                                        >
                                            Try Another Search
                                        </button>
                                    </div>
                                </div>
                            </>
                        ) : content ? (
                            <>
                                {/* Title Section */}
                                <div className="relative pl-5 border-l-[3px] border-[#66d9f7] shrink-0 mb-6 mt-6 text-left">
                                    <h1 className="text-[36px] font-bold leading-[1.1] text-white tracking-tight whitespace-pre-line">
                                        {content.title}
                                    </h1>
                                </div>
                                
                                {/* Scrollable details wrapper */}
                                <div className="relative flex-1 min-h-0 mb-2">
                                    <div className="h-full overflow-y-auto pr-1 pt-2 pb-[140px] space-y-6 scrollbar-hide">
                                        {content.greeting && (
                                            <p className="text-base text-[#c7e7f5] mt-4 font-outfit text-left">
                                                {content.greeting}
                                            </p>
                                        )}

                                        <p className="text-[14.5px] leading-[1.6] text-[#c7e7f5] font-medium font-outfit text-left">
                                            {formatBodyText(content.body)}
                                        </p>

                                        <div className="space-y-4 text-[14.5px] leading-[1.6] text-[#c7e7f5] font-medium font-outfit text-left pt-2">
                                            {content.bullets.map((b, idx) => (
                                                <p key={idx}>
                                                    - {b.label} – {b.desc}
                                                </p>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Top Fading gradient */}
                                    <div className="absolute top-0 left-0 right-0 h-6 bg-gradient-to-b from-[#051c36] via-[#051c36]/40 to-transparent pointer-events-none z-10" />
                                </div>
                            </>
                        ) : null}
                    </div>
                </div>

                {/* Bottom Fading Gradient (Negative margins to flush to the edges of the parent container) */}
                <div className="absolute bottom-0 left-0 right-0 h-[150px] -mx-4 -mb-4 bg-gradient-to-t from-[#185092] via-[#0c3364]/70 to-transparent pointer-events-none z-20" />

                {/* Winking Mascot Face Face Face (Centered at the bottom, sitting on top of the text fade) */}
                <div className="absolute bottom-[24px] left-1/2 -translate-x-1/2 flex items-center justify-center pointer-events-none z-30">
                    <div className="relative w-[110px] h-[110px] flex items-center justify-center">
                        {/* Wavy background layer 1 */}
                        <div 
                            className="absolute w-[106px] h-[106px] rounded-[42%_58%_45%_55%_/_57%_43%_57%_43%] bg-[#2d7fe0]/15 animate-wave-slow"
                        />
                        {/* Wavy background layer 2 */}
                        <div 
                            className="absolute w-[94px] h-[94px] rounded-[50%_50%_40%_60%_/_45%_55%_45%_55%] bg-[#2d7fe0]/20 animate-wave-slower"
                        />
                        {/* Wavy background layer 3 */}
                        <div 
                            className="absolute w-[84px] h-[84px] rounded-[45%_55%_50%_50%_/_50%_45%_55%_45%] bg-[#2d7fe0]/25 animate-wave-slow opacity-85"
                        />
                        
                        {/* Central solid blue circle */}
                        <div className="relative w-[70px] h-[70px] rounded-full bg-[#2d7fe0] shadow-lg flex items-center justify-center z-10 border border-[#48b9ff]/20">
                            <svg className="w-[50px] h-[50px]" viewBox="0 0 60 60" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <circle cx="18" cy="22" r="4.5" fill="white" />
                                <rect x="33" y="20.5" width="11" height="3.5" rx="1.75" fill="white" transform="rotate(-12 38.5 22.25)" />
                                <path
                                    d="M 19 35 Q 29 43 39 35"
                                    stroke="white"
                                    strokeWidth="3.5"
                                    strokeLinecap="round"
                                    fill="none"
                                />
                            </svg>
                        </div>
                    </div>
                </div>

                {/* Bottom Sheet for Camera Actions (Z-index 50 to sit on top of everything) */}
                <AnimatePresence>
                    {isCameraOpen && (
                        <>
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                onClick={() => setIsCameraOpen(false)}
                                className="absolute inset-0 bg-black/60 -mx-4 -mb-4 z-40 pointer-events-auto"
                            />
                            <motion.div
                                initial={{ y: "100%" }}
                                animate={{ y: 0 }}
                                exit={{ y: "100%" }}
                                transition={{ type: "spring", damping: 25, stiffness: 200 }}
                                className="absolute bottom-0 left-0 right-0 bg-[#082245] border-t border-[#48b9ff]/30 rounded-t-[24px] p-6 z-50 font-outfit -mx-4 -mb-4 pointer-events-auto"
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
        </div>
    );
}
