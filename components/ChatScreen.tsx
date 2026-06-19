"use client";

import { Home, LayoutGrid, Tag, FileText, Image, Camera, Mic, Send, Receipt, BarChart2, SquarePen, UserPlus, Copy, ThumbsUp, ThumbsDown, Volume2, Share2, Plus, X, Menu, Sparkles, Monitor, Video, VideoOff, MicOff, MessageSquare, Check } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface Message {
    id: number;
    sender: "user" | "ai";
    text: string;
    time: string;
    attachments?: { name: string; type: string }[];
    image?: string; // Optional image data URL
}

interface StagedAttachment {
    id: string;
    name: string;
    type: string; // 'document' | 'photo' | 'audio'
    url: string; // Base64 data URL
    isLoading: boolean;
    progress: number;
}

const ACTION_ITEMS = [
    { label: "Attach new Documents", icon: FileText },
    { label: "Upload new Photos", icon: Image },
    { label: "Take direct Photos", icon: Camera },
    { label: "Upload an Audio file", icon: Mic },
    { label: "Generate new Invoice", icon: Receipt },
    { label: "Check weekly Report", icon: BarChart2 }
];

const getSplitLabel = (label: string): [string, string] => {
    switch (label) {
        case "Attach new Documents": return ["Attach new", "Documents"];
        case "Upload new Photos": return ["Upload new", "Photos"];
        case "Take direct Photos": return ["Take direct", "Photos"];
        case "Upload an Audio file": return ["Upload an", "Audio file"];
        case "Generate new Invoice": return ["Generate new", "Invoice"];
        case "Check weekly Report": return ["Check weekly", "Report"];
        default: return [label, ""];
    }
};

const renderActionIcon = (label: string) => {
    const iconProps = {
        width: "28",
        height: "28",
        strokeWidth: "2.2",
        strokeLinecap: "round" as const,
        strokeLinejoin: "round" as const,
        fill: "none"
    };

    switch (label) {
        case "Attach new Documents":
            return (
                <svg viewBox="0 0 24 24" stroke="#1a73e8" {...iconProps}>
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                    <path d="M14 2v6h6" />
                    <line x1="16" y1="13" x2="8" y2="13" />
                    <line x1="16" y1="17" x2="8" y2="17" />
                    <line x1="10" y1="9" x2="8" y2="9" />
                </svg>
            );
        case "Upload new Photos":
            return (
                <svg viewBox="0 0 24 24" stroke="#1a73e8" {...iconProps}>
                    <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h7" />
                    <line x1="16" y1="5" x2="22" y2="5" />
                    <line x1="19" y1="2" x2="19" y2="8" />
                    <circle cx="9" cy="9" r="2" />
                    <path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21" />
                </svg>
            );
        case "Take direct Photos":
            return (
                <svg viewBox="0 0 24 24" stroke="#1a73e8" {...iconProps}>
                    <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
                    <circle cx="12" cy="13" r="4" />
                </svg>
            );
        case "Upload an Audio file":
            return (
                <svg viewBox="0 0 24 24" stroke="#000000" {...iconProps}>
                    <rect x="3" y="3" width="18" height="18" rx="5" ry="5" />
                    <line x1="8" y1="10" x2="8" y2="14" />
                    <line x1="10" y1="8" x2="10" y2="16" />
                    <line x1="12" y1="6" x2="12" y2="18" />
                    <line x1="14" y1="8" x2="14" y2="16" />
                    <line x1="16" y1="10" x2="16" y2="14" />
                </svg>
            );
        case "Generate new Invoice":
            return (
                <svg viewBox="0 0 24 24" stroke="#1a73e8" {...iconProps}>
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                    <path d="M14 2v6h6" />
                    <line x1="8" y1="13" x2="16" y2="13" />
                    <line x1="8" y1="17" x2="14" y2="17" />
                </svg>
            );
        case "Check weekly Report":
            return (
                <svg viewBox="0 0 24 24" stroke="#1a73e8" {...iconProps}>
                    <rect x="3" y="3" width="18" height="12" rx="2" />
                    <path d="M9 15v6L6 22M15 15v6l3 1M12 15v7" />
                    <path d="M7 10l3-3 3 3 4-4" />
                </svg>
            );
        default:
            return null;
    }
};

const VOICES = ["Nova (Deep)", "Vega (Energetic)", "Capella (Calm)", "Sirius (Friendly)"];

const TRANSCRIPTION_PROMPTS = [
    "Help me brainstorm some revenue models for my new business idea.",
    "Pal, check if I have any outstanding invoices due this week.",
    "How do I break down my project goal into actionable milestones?",
    "Pal, let's run a user acquisition marketing experiment for a solo founder."
];


const TwoLinesMenu = () => (
    <svg viewBox="0 0 24 24" width="20" height="20" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" fill="none">
        <line x1="4" y1="8" x2="20" y2="8" />
        <line x1="4" y1="16" x2="20" y2="16" />
    </svg>
);

const TranscriptIcon = () => (
    <svg viewBox="0 0 24 24" width="20" height="20" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" fill="none">
        <rect x="4" y="4" width="16" height="16" rx="3" />
        <line x1="8" y1="9" x2="16" y2="9" />
        <line x1="8" y1="14" x2="14" y2="14" />
    </svg>
);

const GeminiSpark = ({ className = "w-8 h-8", style }: { className?: string; style?: React.CSSProperties }) => (
    <svg viewBox="0 0 24 24" className={className} style={style} fill="none" xmlns="http://www.w3.org/2000/svg">
        <defs>
            <linearGradient id="spark-grad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#22d3ee" />
                <stop offset="40%" stopColor="#6366f1" />
                <stop offset="70%" stopColor="#ec4899" />
                <stop offset="100%" stopColor="#eab308" />
            </linearGradient>
        </defs>
        <path d="M12 2C12 7.52 16.48 12 22 12C16.48 12 12 16.48 12 22C12 16.48 7.52 12 2 12C7.52 12 12 7.52 12 2Z" fill="url(#spark-grad)" />
    </svg>
);

const ScreenShareIcon = () => (
    <svg viewBox="0 0 24 24" width="18" height="18" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" fill="none">
        <rect x="3" y="3" width="18" height="18" rx="4" />
        <path d="M12 17V7M12 7L8 11M12 7L16 11" />
    </svg>
);

const PencilSparkIcon = () => (
    <svg viewBox="0 0 24 24" width="18" height="18" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" fill="none">
        <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
        <path d="M18.5 2.5a2.121 2.121 0 1 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
    </svg>
);

const BlueWaveButton = ({ onClick }: { onClick: () => void }) => (
    <button
        type="button"
        onClick={onClick}
        className="w-[34px] h-[34px] rounded-full bg-[#1a73e8] hover:bg-[#1557b0] flex items-center justify-center transition-all cursor-pointer shrink-0 active:scale-90"
        aria-label="Live voice mode"
    >
        <div className="flex items-center gap-[2.5px] h-3.5 justify-center">
            <span className="w-[2px] h-2 bg-white rounded-full animate-pulse"></span>
            <span className="w-[2px] h-3.5 bg-white rounded-full animate-pulse" style={{ animationDelay: '0.2s' }}></span>
            <span className="w-[2px] h-2.5 bg-white rounded-full animate-pulse" style={{ animationDelay: '0.4s' }}></span>
        </div>
    </button>
);

const LiveWavePill = ({ isMuted }: { isMuted: boolean }) => {
    return (
        <div className="w-28 h-[40px] rounded-full bg-black border border-white/10 overflow-hidden relative flex items-center justify-center shrink-0" style={{ background: 'var(--app-bg)', borderColor: 'var(--app-card-border)' }}>
            <style dangerouslySetInnerHTML={{__html: `
                @keyframes wave-move-slow {
                    0% { transform: translateX(0); }
                    100% { transform: translateX(-50%); }
                }
                @keyframes wave-move-medium {
                    0% { transform: translateX(-50%); }
                    100% { transform: translateX(0); }
                }
                @keyframes wave-move-fast {
                    0% { transform: translateX(0); }
                    100% { transform: translateX(-50%); }
                }
                .animate-wave-slow {
                    animation: wave-move-slow 6s linear infinite;
                }
                .animate-wave-medium {
                    animation: wave-move-medium 4.5s linear infinite;
                }
                .animate-wave-fast {
                    animation: wave-move-fast 3s linear infinite;
                }
            `}} />
            {isMuted ? (
                <span className="text-[10px] font-bold text-gray-500 tracking-wider uppercase z-10">Muted</span>
            ) : (
                <div className="absolute inset-0 w-full h-full">
                    <div className="absolute inset-0 bg-blue-500/10 blur-[4px]" />
                    
                    <svg className="absolute bottom-0 left-0 w-[200%] h-full animate-wave-slow opacity-60" viewBox="0 0 200 40" preserveAspectRatio="none">
                        <defs>
                            <linearGradient id="wave-grad-1" x1="0%" y1="0%" x2="0%" y2="100%">
                                <stop offset="0%" stopColor="#3b82f6" />
                                <stop offset="100%" stopColor="#1d4ed8" />
                            </linearGradient>
                        </defs>
                        <path d="M 0 20 C 50 10, 50 30, 100 20 C 150 10, 150 30, 200 20 L 200 40 L 0 40 Z" fill="url(#wave-grad-1)" />
                    </svg>

                    <svg className="absolute bottom-0 left-0 w-[200%] h-full animate-wave-fast opacity-80" viewBox="0 0 200 40" preserveAspectRatio="none">
                        <defs>
                            <linearGradient id="wave-grad-2" x1="0%" y1="0%" x2="0%" y2="100%">
                                <stop offset="0%" stopColor="#60a5fa" />
                                <stop offset="100%" stopColor="#2563eb" />
                            </linearGradient>
                        </defs>
                        <path d="M 0 25 C 40 35, 60 15, 100 25 C 140 35, 160 15, 200 25 L 200 40 L 0 40 Z" fill="url(#wave-grad-2)" />
                    </svg>

                    <svg className="absolute bottom-0 left-0 w-[200%] h-full animate-wave-medium opacity-40" viewBox="0 0 200 40" preserveAspectRatio="none">
                        <path d="M 0 15 C 30 5, 70 25, 100 15 C 130 5, 170 25, 200 15 L 200 40 L 0 40 Z" fill="#93c5fd" />
                    </svg>
                </div>
            )}
        </div>
    );
};

const INITIAL_MESSAGES: Message[] = [
    { 
        id: 1, 
        sender: "ai", 
        text: "Hello! I am PAL, your agentic co-founder. I can help you brainstorm business ideas, break goals down into structured projects, sync your Google Calendar, and generate invoices. What are we building today? 🚀", 
        time: "Now" 
    }
];

export default function ChatScreen() {
    const router = useRouter();
    const [messages, setMessages] = useState<Message[]>([]);
    const [inputText, setInputText] = useState("");
    const [stagedAttachments, setStagedAttachments] = useState<StagedAttachment[]>([]);
    const [isTyping, setIsTyping] = useState(false);
    const [isActionSheetOpen, setIsActionSheetOpen] = useState(false);
    const [isMoreMenuOpen, setIsMoreMenuOpen] = useState(false);
    const [userName, setUserName] = useState("");

    const stageFile = (file: File, type: string) => {
        const id = Math.random().toString(36).substring(2, 9);
        const newAttachment: StagedAttachment = {
            id,
            name: file.name,
            type,
            url: "",
            isLoading: true,
            progress: 0
        };

        setStagedAttachments(prev => [...prev, newAttachment]);

        // Start reading file and simulating progress
        const reader = new FileReader();
        reader.onload = (event) => {
            const base64Data = event.target?.result as string;
            
            // Simulate progress over 1.2 seconds
            let currentProgress = 0;
            const interval = setInterval(() => {
                currentProgress += 10;
                setStagedAttachments(prev => 
                    prev.map(item => 
                        item.id === id 
                            ? { 
                                ...item, 
                                progress: currentProgress, 
                                isLoading: currentProgress < 100 ? true : false,
                                url: currentProgress >= 100 ? base64Data : ""
                              } 
                            : item
                    )
                );
                if (currentProgress >= 100) {
                    clearInterval(interval);
                }
            }, 120);
        };

        reader.readAsDataURL(file);
    };

    // Voice recording simulation states
    const [isRecordingVoiceNote, setIsRecordingVoiceNote] = useState(false);
    const [recordingSeconds, setRecordingSeconds] = useState(0);
    
    // PAL Live states
    const [isLiveModeOpen, setIsLiveModeOpen] = useState(false);
    const [isAlertOpen, setIsAlertOpen] = useState(true);
    const [isTranscriptVisible, setIsTranscriptVisible] = useState(true);
    const [liveVoice, setLiveVoice] = useState("Nova (Deep)");
    const [isVoiceMenuOpen, setIsVoiceMenuOpen] = useState(false);
    const [isVideoActive, setIsVideoActive] = useState(false);
    const [isMuted, setIsMuted] = useState(false);
    const scrollContainerRef = useRef<HTMLDivElement>(null);

    // Attachment Input Refs
    const docInputRef = useRef<HTMLInputElement>(null);
    const photoInputRef = useRef<HTMLInputElement>(null);
    const cameraInputRef = useRef<HTMLInputElement>(null);
    const audioInputRef = useRef<HTMLInputElement>(null);

    // Invoice Modal States
    const [isInvoiceModalOpen, setIsInvoiceModalOpen] = useState(false);
    const [invoiceClient, setInvoiceClient] = useState("");
    const [invoiceAmount, setInvoiceAmount] = useState("");
    const [invoiceService, setInvoiceService] = useState("");

    // Toast state
    const [toastMessage, setToastMessage] = useState<string | null>(null);

    const triggerToast = (msg: string) => {
        setToastMessage(msg);
        setTimeout(() => setToastMessage(null), 2500);
    };

    const handleAttachmentUpload = (e: React.ChangeEvent<HTMLInputElement>, type: string) => {
        const file = e.target.files?.[0];
        if (file) {
            triggerToast(`${file.name} attached!`);
            stageFile(file, type);
        }
    };

    const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>, type: string) => {
        const file = e.target.files?.[0];
        if (file) {
            triggerToast(`${file.name} uploaded!`);
            stageFile(file, type);
        }
    };

    const handleInvoiceSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!invoiceClient.trim() || !invoiceAmount.trim() || !invoiceService.trim()) return;

        const client = invoiceClient.trim();
        const amount = invoiceAmount.trim();
        const service = invoiceService.trim();

        // Clear fields & close modal
        setInvoiceClient("");
        setInvoiceAmount("");
        setInvoiceService("");
        setIsInvoiceModalOpen(false);

        // Send chat message
        const prompt = `Generate an invoice for ${client} for $${amount} for ${service}`;
        setInputText("");
        setIsTyping(true);

        const timeNow = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }).toLowerCase();
        const tempUserMsg = {
            id: Date.now(),
            sender: "user" as const,
            text: prompt,
            time: timeNow
        };
        setMessages(prev => [...prev, tempUserMsg]);

        try {
            const res = await fetch("/api/chat", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ text: prompt })
            });

            if (res.ok) {
                const newMsgs = await res.json();
                setMessages(prev => [
                    ...prev.filter(m => m.id !== tempUserMsg.id),
                    ...newMsgs
                ]);
            }
        } catch (err) {
            console.error("Error creating invoice via chat", err);
        } finally {
            setIsTyping(false);
        }
    };

    const handleAcceptRoadmap = async (roadmap: any) => {
        try {
            triggerToast("Launching project...");
            const projRes = await fetch("/api/projects/from-idea", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    idea: roadmap.goal || roadmap.description || roadmap.title,
                    roadmap
                })
            });

            if (!projRes.ok) {
                const err = await projRes.json().catch(() => ({}));
                throw new Error(err.error || "PAL could not create the project right now. Please try again.");
            }

            const { project } = await projRes.json();

            triggerToast("Project launched successfully! 🚀");
            setTimeout(() => {
                router.push(`/projects/${project.id}`);
            }, 1000);

        } catch (err: any) {
            console.error("Failed to accept project roadmap", err);
            alert(err.message || "PAL could not create the project right now. Please try again.");
        }
    };

    const handleActionItemClick = (label: string) => {
        setIsActionSheetOpen(false);
        if (label === "Attach new Documents") {
            docInputRef.current?.click();
        } else if (label === "Upload new Photos") {
            photoInputRef.current?.click();
        } else if (label === "Take direct Photos") {
            cameraInputRef.current?.click();
        } else if (label === "Upload an Audio file") {
            audioInputRef.current?.click();
        } else if (label === "Generate new Invoice") {
            setIsInvoiceModalOpen(true);
        } else if (label === "Check weekly Report") {
            router.push("/weekly-data");
        }
    };

    // Auto scroll to bottom
    useEffect(() => {
        if (scrollContainerRef.current) {
            scrollContainerRef.current.scrollTop = scrollContainerRef.current.scrollHeight;
        }
    }, [messages, isTyping]);

    // Voice note simulation handlers
    const startVoiceRecording = () => {
        setIsRecordingVoiceNote(true);
        setRecordingSeconds(0);
    };

    const cancelVoiceRecording = () => {
        setIsRecordingVoiceNote(false);
        setRecordingSeconds(0);
        triggerToast("Recording cancelled");
    };

    const stopAndSendVoiceRecording = async () => {
        setIsRecordingVoiceNote(false);
        setRecordingSeconds(0);
        
        // Pick a prompt
        const randomPrompt = TRANSCRIPTION_PROMPTS[Math.floor(Math.random() * TRANSCRIPTION_PROMPTS.length)];
        triggerToast(`Transcribed: "${randomPrompt}"`);
        
        // Send it
        setIsTyping(true);
        const timeNow = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }).toLowerCase();
        const tempUserMsg = {
            id: Date.now(),
            sender: "user" as const,
            text: randomPrompt,
            time: timeNow
        };
        setMessages(prev => [...prev, tempUserMsg]);

        try {
            const res = await fetch("/api/chat", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ text: randomPrompt })
            });

            if (res.ok) {
                const newMsgs = await res.json();
                setMessages(prev => [
                    ...prev.filter(m => m.id !== tempUserMsg.id),
                    ...newMsgs
                ]);
            }
        } catch (err) {
            console.error("Error sending voice note prompt to API", err);
        } finally {
            setIsTyping(false);
        }
    };

    // Recording timer effect
    useEffect(() => {
        let interval: NodeJS.Timeout | null = null;
        if (isRecordingVoiceNote) {
            interval = setInterval(() => {
                setRecordingSeconds(prev => {
                    if (prev >= 4) {
                        // Stop and send at 5s
                        clearInterval(interval!);
                        stopAndSendVoiceRecording();
                        return 0;
                    }
                    return prev + 1;
                });
            }, 1000);
        }
        return () => {
            if (interval) clearInterval(interval);
        };
    }, [isRecordingVoiceNote]);

    // Fetch messages on mount
    useEffect(() => {
        async function fetchMessages() {
            try {
                const res = await fetch("/api/chat");
                if (res.ok) {
                    const data = await res.json();
                    if (data && data.length > 0) {
                        setMessages(data);
                    } else {
                        setMessages(INITIAL_MESSAGES);
                    }
                } else {
                    setMessages(INITIAL_MESSAGES);
                }
            } catch (err) {
                console.error("Error fetching chat messages", err);
                setMessages(INITIAL_MESSAGES);
            }
        }
        fetchMessages();
    }, []);

    // Fetch user profile name on mount
    useEffect(() => {
        async function fetchProfileName() {
            try {
                const res = await fetch("/api/profile");
                if (res.ok) {
                    const data = await res.json();
                    if (data?.fullName) {
                        setUserName(data.fullName.split(" ")[0]);
                    }
                }
            } catch (err) {
                console.error("Error fetching profile name", err);
            }
        }
        fetchProfileName();
    }, []);

    // Check if there is an uploaded image or scanned prompt in localStorage to start a new chat session
    useEffect(() => {
        const storedImage = localStorage.getItem("chat_upload_image");
        const storedPrompt = localStorage.getItem("chat_incoming_prompt");

        if (storedImage) {
            localStorage.removeItem("chat_upload_image");
            
            // Post analysis trigger
            fetch("/api/chat", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ 
                    text: "I uploaded this snapshot. Can you analyze it for me?"
                })
            }).then(res => {
                if (res.ok) return res.json();
            }).then(data => {
                if (data) {
                    // Update image property for the user message
                    const userMsg = {
                        ...data[0],
                        image: storedImage
                    };
                    setMessages(prev => [...prev, userMsg, data[1]]);
                }
            }).catch(err => console.error(err));

        } else if (storedPrompt) {
            localStorage.removeItem("chat_incoming_prompt");
            
            fetch("/api/chat", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ text: storedPrompt })
            }).then(res => {
                if (res.ok) return res.json();
            }).then(data => {
                if (data) {
                    setMessages(prev => [...prev, ...data]);
                }
            }).catch(err => console.error(err));
        }
    }, []);

    const handleSendMessage = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!inputText.trim() && stagedAttachments.length === 0) return;

        const userText = inputText.trim();
        const attachmentsToSend = stagedAttachments.map(att => ({
            name: att.name,
            type: att.type,
            url: att.url
        }));
        
        // Find first image
        const imageAttachment = stagedAttachments.find(att => att.type === "photo" || att.type === "camera photo");
        const imageToSend = imageAttachment ? imageAttachment.url : undefined;

        setInputText("");
        setStagedAttachments([]);
        setIsTyping(true);

        const timeNow = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }).toLowerCase();
        const tempUserMsg = {
            id: Date.now(),
            sender: "user" as const,
            text: userText,
            time: timeNow,
            image: imageToSend,
            attachments: attachmentsToSend
        };
        setMessages(prev => [...prev, tempUserMsg]);

        // Reset check
        if (userText.toLowerCase() === "clear" || userText.toLowerCase() === "reset") {
            try {
                const res = await fetch("/api/chat", { method: "DELETE" });
                if (res.ok) {
                    const data = await res.json();
                    setMessages(data);
                }
            } catch (err) {
                console.error("Error clearing chat logs", err);
            }
            setIsTyping(false);
            return;
        }

        try {
            const res = await fetch("/api/chat", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ 
                    text: userText,
                    image: imageToSend,
                    attachments: attachmentsToSend
                })
            });

            if (res.ok) {
                const newMsgs = await res.json();
                setMessages(prev => [
                    ...prev.filter(m => m.id !== tempUserMsg.id),
                    ...newMsgs
                ]);
            }
        } catch (err) {
            console.error("Error sending chat messages to API", err);
        } finally {
            setIsTyping(false);
        }
    };

    return (
        <div className="h-dvh p-4 w-full max-w-[430px] mx-auto relative shadow-2xl overflow-hidden selection:bg-blue-500/30 font-outfit flex flex-col" style={{ background: 'var(--app-bg)', color: 'var(--app-text)' }}>
            
            {/* Header (Fixed) */}
            <div className="flex justify-between items-center pt-2 mb-4 shrink-0 z-30">
                <div className="flex items-center gap-2">
                    <button
                        onClick={() => router.push('/')}
                        className="w-11 h-11 rounded-full border flex items-center justify-center transition-all cursor-pointer shadow-sm active:scale-95"
                        style={{ background: 'var(--app-card)', borderColor: 'var(--app-card-border)', color: 'var(--app-text-secondary)' }}
                        aria-label="Back to home"
                    >
                        <Home className="w-5 h-5" style={{ color: 'var(--app-text-secondary)' }} />
                    </button>
                    
                    {/* Model Dropdown Selector */}
                    <div className="relative">
                        <button
                            onClick={() => setIsMoreMenuOpen(!isMoreMenuOpen)}
                            className="flex items-center gap-1 text-sm font-semibold py-1 px-2.5 rounded-lg transition-all cursor-pointer"
                            style={{ color: 'var(--app-text-secondary)' }}
                        >
                            PAL Flash
                            <svg className="w-3.5 h-3.5 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5" style={{ color: 'var(--app-text-muted)' }}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
                            </svg>
                        </button>
                        
                        <AnimatePresence>
                            {isMoreMenuOpen && (
                                <>
                                    <div className="fixed inset-0 z-40" onClick={() => setIsMoreMenuOpen(false)} />
                                    <motion.div
                                        initial={{ opacity: 0, scale: 0.95, y: -10 }}
                                        animate={{ opacity: 1, scale: 1, y: 0 }}
                                        exit={{ opacity: 0, scale: 0.95, y: -10 }}
                                        className="absolute left-0 mt-2 w-[185px] rounded-2xl border p-2 shadow-2xl z-50 font-outfit"
                                        style={{ background: 'var(--app-surface)', borderColor: 'var(--app-card-border)' }}
                                    >
                                        <span className="text-[10px] font-bold uppercase px-3 py-1.5 block" style={{ color: 'var(--app-text-muted)' }}>Co-Founder Persona</span>
                                        <button
                                            onClick={() => {
                                                setIsMoreMenuOpen(false);
                                                alert("Persona switched to PAL Flash! Fast & efficient brainstorming.");
                                            }}
                                            className="w-full text-left px-3 py-2 text-xs font-semibold rounded-lg transition-colors flex items-center justify-between"
                                            style={{ color: 'var(--app-text)', background: 'var(--app-accent-soft)' }}
                                        >
                                            <span>⚡ PAL Flash</span>
                                            <div className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
                                        </button>
                                        <button
                                            onClick={() => {
                                                setIsMoreMenuOpen(false);
                                                alert("Persona switched to PAL Pro! Deep analytics & reasoning.");
                                            }}
                                            className="w-full text-left px-3 py-2 text-xs font-semibold rounded-lg transition-colors flex items-center justify-between"
                                            style={{ color: 'var(--app-text-secondary)' }}
                                        >
                                            <span>✨ PAL Pro</span>
                                        </button>
                                    </motion.div>
                                </>
                            )}
                        </AnimatePresence>
                    </div>
                </div>

                {/* Compose new chat button (Top Right) */}
                <button
                    onClick={() => {
                        setMessages([]); // Set to empty to show greeting UI
                        setIsAlertOpen(true); // Re-open tip
                    }}
                    className="w-11 h-11 rounded-full border flex items-center justify-center transition-all cursor-pointer shadow-sm active:scale-95"
                    style={{ background: 'var(--app-card)', borderColor: 'var(--app-card-border)', color: 'var(--app-text-secondary)' }}
                    aria-label="New chat"
                >
                    <PencilSparkIcon />
                </button>
            </div>

            {/* Chat Area logs (Scrollable) */}
            <div 
                ref={scrollContainerRef}
                className="flex-1 flex flex-col gap-6 overflow-y-auto scrollbar-hide pb-24 pr-1"
            >
                {messages.length === 0 ? (
                    <div className="flex-1 flex flex-col items-center justify-center px-4 py-8 text-center animate-fade-in my-auto">
                        <GeminiSpark className="w-12 h-12 mb-5 animate-pulse" />
                        <h2 className="text-[22px] font-medium tracking-tight text-center font-outfit" style={{ color: 'var(--app-text)' }}>
                            Hi{userName ? ` ${userName}` : ""}, let's get into it
                        </h2>
                        
                        {/* Recommended prompts */}
                        <div className="grid grid-cols-2 gap-3 mt-8 w-full max-w-[340px]">
                            <div
                                onClick={() => {
                                    setInputText("Help me brainstorm some revenue models");
                                }}
                                className="rounded-2xl border text-left text-xs font-semibold active:scale-95 transition-all cursor-pointer flex flex-col justify-between"
                                style={{ background: 'var(--app-card)', borderColor: 'var(--app-card-border)', color: 'var(--app-text-secondary)', padding: '16px', minHeight: '92px' }}
                            >
                                <span>Brainstorm revenue models</span>
                                <span className="text-blue-400 self-end text-[10px] font-bold">→</span>
                            </div>
                            <div
                                onClick={() => {
                                    setInputText("Analyze my startup weekly report");
                                }}
                                className="rounded-2xl border text-left text-xs font-semibold active:scale-95 transition-all cursor-pointer flex flex-col justify-between"
                                style={{ background: 'var(--app-card)', borderColor: 'var(--app-card-border)', color: 'var(--app-text-secondary)', padding: '16px', minHeight: '92px' }}
                            >
                                <span>Analyze weekly report</span>
                                <span className="text-blue-400 self-end text-[10px] font-bold">→</span>
                            </div>
                        </div>
                    </div>
                ) : (
                    messages.map((msg, index) => {
                        const isUser = msg.sender === "user";
                        const isLastAI = !isUser && (index === messages.length - 1 || messages[index + 1]?.sender === "user");

                        return (
                            <div key={msg.id} className={`flex flex-col ${isUser ? "items-end" : "items-start"} max-w-full`}>
                                {/* Message render block */}
                                {isUser ? (
                                    // User message gets a dark speech box bubble
                                    <div className="flex flex-col items-end max-w-[85%]">
                                        <div className="px-4 py-3 rounded-[20px] rounded-tr-[4px] border text-sm font-medium leading-relaxed text-left shadow-md" style={{ background: 'var(--app-card)', borderColor: 'var(--app-card-border)', color: 'var(--app-text)' }}>
                                            {msg.image && (
                                                <img 
                                                    src={msg.image} 
                                                    alt="Uploaded snapshot" 
                                                    className="w-full max-h-[180px] object-cover rounded-xl mb-2 border"
                                                    style={{ borderColor: 'var(--app-card-border)' }} 
                                                />
                                            )}
                                            {(() => {
                                                if (!msg.attachments) return null;
                                                let parsed = [];
                                                if (Array.isArray(msg.attachments)) {
                                                    parsed = msg.attachments;
                                                } else {
                                                    try {
                                                        parsed = JSON.parse(msg.attachments);
                                                    } catch (e) {}
                                                }
                                                return parsed.map((att: any, idx: number) => {
                                                    const isImg = att.type === "photo" || att.type === "camera photo";
                                                    if (isImg) {
                                                        if (att.url && att.url !== msg.image) {
                                                            return (
                                                                <img 
                                                                    key={idx}
                                                                    src={att.url} 
                                                                    alt={att.name} 
                                                                    className="w-full max-h-[180px] object-cover rounded-xl mb-2 border"
                                                                    style={{ borderColor: 'var(--app-card-border)' }} 
                                                                />
                                                            );
                                                        }
                                                        return null;
                                                    }
                                                    return (
                                                        <div key={idx} className="flex items-center gap-2 px-3 py-2 rounded-xl bg-white/5 border border-white/10 mb-2 max-w-[240px]">
                                                            {att.type === "audio" ? (
                                                                <Mic className="w-4 h-4 text-green-400 shrink-0" />
                                                            ) : (
                                                                <FileText className="w-4 h-4 text-blue-400 shrink-0" />
                                                            )}
                                                            <span className="text-xs truncate font-semibold text-white/90">{att.name}</span>
                                                        </div>
                                                    );
                                                });
                                            })()}
                                            {msg.text && <p>{msg.text}</p>}
                                        </div>
                                        <span className="text-[10px] font-semibold mt-1.5 mr-1" style={{ color: 'var(--app-text-muted)' }}>{msg.time}</span>
                                    </div>
                                ) : (
                                    // AI replies write directly on plain black background (like ChatGPT)
                                    <div className="flex flex-col items-start max-w-[90%] text-left">
                                        <div className="text-[15px] leading-relaxed font-medium" style={{ color: 'var(--app-text)' }}>
                                            <p>{msg.text.replace(/\[INVOICE_RECEIPT:.*?\]/, "").replace(/\[ROADMAP_CARD:.*?\]/, "").replace(/\[DECISION_CARD:.*?\]/, "").trim()}</p>
                                        </div>

                                        {/* Visual Invoice Card */}
                                        {(() => {
                                            const invoiceMatch = msg.text.match(/\[INVOICE_RECEIPT:(.*?)\]/);
                                            if (invoiceMatch && invoiceMatch[1]) {
                                                try {
                                                    const inv = JSON.parse(invoiceMatch[1]);
                                                    return (
                                                        <div className="w-[280px] bg-[#111318] border border-[var(--app-card-border)] rounded-[20px] p-5 font-outfit shadow-xl space-y-4 mt-3">
                                                            <div className="flex justify-between items-start">
                                                                <div>
                                                                    <span className="text-[10px] text-[#4CD964] font-extrabold uppercase tracking-wider bg-[#4CD964]/10 border border-[#4CD964]/15 px-2.5 py-0.5 rounded-full">PENDING</span>
                                                                    <h4 className="text-xs font-extrabold text-white mt-2">Invoice Generated</h4>
                                                                </div>
                                                                <Receipt className="w-5 h-5 text-gray-500" />
                                                            </div>
                                                            
                                                            <div className="space-y-1.5 border-t border-b border-white/5 py-3">
                                                                <div className="flex justify-between text-[11px]">
                                                                    <span className="text-zinc-500 font-medium">Client:</span>
                                                                    <span className="text-white font-bold">{inv.client}</span>
                                                                </div>
                                                                <div className="flex justify-between text-[11px]">
                                                                    <span className="text-zinc-500 font-medium">Service:</span>
                                                                    <span className="text-white font-bold">{inv.service}</span>
                                                                </div>
                                                                <div className="flex justify-between text-[11px]">
                                                                    <span className="text-zinc-500 font-medium">Date:</span>
                                                                    <span className="text-white font-bold">{inv.date || "June 10, 2026"}</span>
                                                                </div>
                                                            </div>
                                                            
                                                            <div className="flex justify-between items-baseline pt-1">
                                                                <span className="text-[10px] text-zinc-500 uppercase font-bold">Total Amount</span>
                                                                <span className="text-base font-extrabold text-[#51d4ff]">${parseFloat(inv.amount).toLocaleString()}</span>
                                                            </div>
                                                        </div>
                                                    );
                                                } catch (e) {
                                                    return null;
                                                }
                                            }
                                            return null;
                                        })()}

                                        {/* Visual Roadmap Card */}
                                        {(() => {
                                            const roadmapMatch = msg.text.match(/\[ROADMAP_CARD:(.*?)\]/);
                                            if (roadmapMatch && roadmapMatch[1]) {
                                                try {
                                                    const roadmap = JSON.parse(roadmapMatch[1]);
                                                    return (
                                                        <div className="w-[300px] bg-[#111318] border border-[var(--app-card-border)] rounded-[24px] p-5 font-outfit shadow-2xl space-y-4.5 mt-3 select-none">
                                                            <div className="flex justify-between items-start">
                                                                <div>
                                                                    <span className="text-[9px] text-[#2d7fe0] font-black uppercase tracking-widest bg-[#2d7fe0]/10 border border-[#2d7fe0]/15 px-2.5 py-0.5 rounded-full">
                                                                        Proposed Roadmap
                                                                    </span>
                                                                    <h4 className="text-sm font-black text-white mt-2 leading-tight">{roadmap.title}</h4>
                                                                </div>
                                                                <Sparkles className="w-5 h-5 text-cyan-400 animate-pulse" />
                                                            </div>

                                                            <p className="text-[11px] text-zinc-400 leading-relaxed font-medium">
                                                                {roadmap.description}
                                                            </p>

                                                            <div className="bg-white/5 border border-white/10 rounded-xl p-3.5 space-y-2">
                                                                <div className="text-[9px] font-bold text-zinc-500 uppercase tracking-wider">
                                                                    Business Goal
                                                                </div>
                                                                <div className="text-xs text-white font-semibold leading-relaxed">
                                                                    {roadmap.goal}
                                                                </div>
                                                                <div className="flex justify-between text-[10px] text-zinc-400 font-bold pt-1 border-t border-white/5 mt-1.5">
                                                                    <span>Priority: {roadmap.priority}</span>
                                                                    <span>Due: {roadmap.due_date}</span>
                                                                </div>
                                                            </div>

                                                            <div className="space-y-2">
                                                                <span className="text-[9px] font-bold text-zinc-500 uppercase tracking-wider block">
                                                                    Tasks Plan ({roadmap.tasks?.length || 0})
                                                                </span>
                                                                <div className="space-y-1.5 max-h-[120px] overflow-y-auto pr-1 scrollbar-hide">
                                                                    {roadmap.tasks?.map((t: any, idx: number) => (
                                                                        <div key={idx} className="flex justify-between items-center gap-2 px-3 py-2 rounded-xl bg-white/5 border border-white/10">
                                                                            <span className="text-[10px] font-semibold text-white truncate flex-1">{t.title}</span>
                                                                            <span className={`text-[8px] font-extrabold uppercase px-1.5 py-0.5 rounded-full ${
                                                                                t.priority === "high" ? "bg-red-500/10 text-red-400" :
                                                                                t.priority === "medium" ? "bg-amber-500/10 text-amber-400" :
                                                                                "bg-zinc-500/10 text-zinc-400"
                                                                            }`}>
                                                                                {t.priority}
                                                                            </span>
                                                                        </div>
                                                                    ))}
                                                                </div>
                                                            </div>

                                                            <button
                                                                type="button"
                                                                onClick={() => handleAcceptRoadmap(roadmap)}
                                                                className="w-full py-3 rounded-xl bg-[#2d7fe0] hover:bg-[#2067bd] text-xs font-bold text-white uppercase tracking-wider transition-all shadow-lg active:scale-95 cursor-pointer mt-3"
                                                            >
                                                                Accept Plan & Launch
                                                            </button>
                                                        </div>
                                                    );
                                                } catch (e) {
                                                    return null;
                                                }
                                            }
                                            return null;
                                        })()}

                                        {(() => {
                                            const decisionMatch = msg.text.match(/\[DECISION_CARD:(.*?)\]/);
                                            if (decisionMatch && decisionMatch[1]) {
                                                try {
                                                    const dec = JSON.parse(decisionMatch[1]);
                                                    return (
                                                        <div className="w-[280px] bg-[#111318] border border-[var(--app-card-border)] rounded-[20px] p-5 font-outfit shadow-xl space-y-3 mt-3">
                                                            <div className="flex justify-between items-start">
                                                                <div>
                                                                    <span className="text-[10px] text-[#a855f7] font-extrabold uppercase tracking-wider bg-[#a855f7]/10 border border-[#a855f7]/15 px-2.5 py-0.5 rounded-full">DECISION LOGGED</span>
                                                                    <h4 className="text-xs font-extrabold text-white mt-2 leading-tight">{dec.title}</h4>
                                                                </div>
                                                                <Check className="w-4 h-4 text-[#a855f7] shrink-0" />
                                                            </div>
                                                            <p className="text-[11px] text-zinc-400 leading-relaxed font-medium">
                                                                {dec.description}
                                                            </p>
                                                        </div>
                                                    );
                                                } catch (e) {
                                                    return null;
                                                }
                                            }
                                            return null;
                                        })()}

                                        {/* Reactions row */}
                                        {isLastAI && (
                                            <div className="flex gap-4 items-center mt-3 pl-0.5">
                                                <button className="active:scale-95 transition-all cursor-pointer" style={{ color: 'var(--app-text-muted)' }} aria-label="Copy message">
                                                    <Copy className="w-3.5 h-3.5" strokeWidth={2} />
                                                </button>
                                                <button className="active:scale-95 transition-all cursor-pointer" style={{ color: 'var(--app-text-muted)' }} aria-label="Upvote">
                                                    <ThumbsUp className="w-3.5 h-3.5" strokeWidth={2} />
                                                </button>
                                                <button className="active:scale-95 transition-all cursor-pointer" style={{ color: 'var(--app-text-muted)' }} aria-label="Downvote">
                                                    <ThumbsDown className="w-3.5 h-3.5" strokeWidth={2} />
                                                </button>
                                                <button className="active:scale-95 transition-all cursor-pointer" style={{ color: 'var(--app-text-muted)' }} aria-label="Speak text">
                                                    <Volume2 className="w-3.5 h-3.5" strokeWidth={2} />
                                                </button>
                                                <button className="active:scale-95 transition-all cursor-pointer" style={{ color: 'var(--app-text-muted)' }} aria-label="Share">
                                                    <Share2 className="w-3.5 h-3.5" strokeWidth={2} />
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        );
                    })
                )}
                
                {/* Typing status loader */}
                {isTyping && (
                    <div className="flex gap-2 items-center self-start pl-0.5">
                        <span className="text-[12px] font-semibold font-outfit" style={{ color: 'var(--app-text-muted)' }}>Pal is typing</span>
                        <div className="flex gap-1 items-center">
                            <span className="w-1.5 h-1.5 rounded-full bg-[#2d7fe0] typing-dot"></span>
                            <span className="w-1.5 h-1.5 rounded-full bg-[#2d7fe0] typing-dot"></span>
                            <span className="w-1.5 h-1.5 rounded-full bg-[#2d7fe0] typing-dot"></span>
                        </div>
                    </div>
                )}
            </div>

            {/* Bottom Input Capsule area (Absolute positioned) */}
            <div className="absolute bottom-[24px] left-1/2 -translate-x-1/2 w-[90%] max-w-[362px] z-40">
                {/* Co-Founder Tip Alert - Exactly styled like screenshot */}
                <AnimatePresence>
                    {isAlertOpen && (
                        <motion.div
                            initial={{ opacity: 0, y: 15, scale: 0.95 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: 15, scale: 0.95 }}
                            transition={{ duration: 0.2 }}
                            className="mb-4 border rounded-3xl p-4 pr-12 relative shadow-2xl text-left"
                            style={{ background: 'var(--app-card)', borderColor: 'var(--app-card-border)' }}
                        >
                            <span className="text-sm font-semibold block mb-1" style={{ color: 'var(--app-text)' }}>Keep in mind</span>
                            <p className="text-xs leading-relaxed font-medium text-[11px]" style={{ color: 'var(--app-text-muted)' }}>
                                Humans review some saved chats to improve PAL AI. If this setting is on, don't enter info you wouldn't want reviewed or used. <span className="underline cursor-pointer font-semibold" style={{ color: 'var(--app-text-secondary)' }}>How it works</span>
                            </p>
                            <button
                                type="button"
                                onClick={() => setIsAlertOpen(false)}
                                className="absolute top-3 right-3 w-8 h-8 rounded-full border flex items-center justify-center cursor-pointer transition-colors"
                                style={{ background: 'var(--app-card-alt)', borderColor: 'var(--app-card-border)', color: 'var(--app-text-muted)' }}
                                aria-label="Dismiss tip"
                            >
                                <X size={15} />
                            </button>
                        </motion.div>
                    )}
                </AnimatePresence>

                <form 
                    onSubmit={handleSendMessage}
                    className="flex items-center w-full"
                >
                    {/* Gemini-style Input Capsule */}
                    <div 
                        className={`flex-1 flex flex-col border pl-2.5 pr-2.5 py-2 shadow-inner gap-2.5 w-full transition-all duration-200 ${
                            stagedAttachments.length > 0 ? "rounded-[28px]" : "rounded-full h-[52px] justify-center"
                        }`} 
                        style={{ background: 'var(--app-card)', borderColor: 'var(--app-card-border)' }}
                    >
                        {isRecordingVoiceNote ? (
                            <div className="flex-1 flex items-center justify-between w-full pl-2 pr-1 h-[34px]">
                                <div className="flex items-center gap-2">
                                    <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-ping" />
                                    <span className="text-xs font-semibold text-red-500">Recording... {recordingSeconds}s</span>
                                </div>
                                <div className="flex items-center gap-3">
                                    <button 
                                        type="button" 
                                        onClick={cancelVoiceRecording} 
                                        className="text-xs font-bold text-gray-400 hover:text-white px-2 py-1 transition-all active:scale-95 cursor-pointer"
                                    >
                                        Cancel
                                    </button>
                                    <button 
                                        type="button" 
                                        onClick={stopAndSendVoiceRecording} 
                                        className="w-[34px] h-[34px] rounded-full bg-red-500 hover:bg-red-600 flex items-center justify-center cursor-pointer transition-all active:scale-90 animate-pulse"
                                        aria-label="Stop and send voice note"
                                    >
                                        <div className="w-2.5 h-2.5 bg-white rounded-sm" />
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <>
                                {/* Staged attachments preview row */}
                                {stagedAttachments.length > 0 && (
                                    <div className="flex gap-2.5 overflow-x-auto w-full px-1.5 pb-2 border-b border-white/5 scrollbar-hide">
                                        {stagedAttachments.map((att) => {
                                            const isImage = att.type === "photo" || att.type === "camera photo";
                                            return (
                                                <div key={att.id} className="relative shrink-0 select-none group">
                                                    {isImage ? (
                                                        <div className="w-[52px] h-[52px] rounded-xl overflow-hidden border border-white/10 relative bg-zinc-800">
                                                            {att.url ? (
                                                                <img src={att.url} alt={att.name} className="w-full h-full object-cover" />
                                                            ) : (
                                                                <div className="w-full h-full flex items-center justify-center">
                                                                    <Image className="w-5 h-5 text-gray-500" />
                                                                </div>
                                                            )}
                                                            {att.isLoading && (
                                                                <div className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center gap-1">
                                                                    <div className="w-4 h-4 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin" />
                                                                    <span className="text-[8px] text-cyan-400 font-bold">{att.progress}%</span>
                                                                </div>
                                                            )}
                                                        </div>
                                                    ) : (
                                                        <div className="h-[52px] px-3.5 rounded-xl border border-white/10 bg-[#16161b] flex items-center gap-2 relative min-w-[120px] max-w-[180px]">
                                                            {att.type === "audio" ? (
                                                                <Mic className="w-4.5 h-4.5 text-green-400 shrink-0" />
                                                            ) : (
                                                                <FileText className="w-4.5 h-4.5 text-blue-400 shrink-0" />
                                                            )}
                                                            <div className="flex flex-col min-w-0 flex-1">
                                                                <span className="text-[10px] font-bold text-white/90 truncate">{att.name}</span>
                                                                {att.isLoading ? (
                                                                    <div className="w-full bg-white/10 h-1 rounded-full mt-1 overflow-hidden">
                                                                        <div className="bg-cyan-400 h-full transition-all duration-150" style={{ width: `${att.progress}%` }} />
                                                                    </div>
                                                                ) : (
                                                                    <span className="text-[8px] font-bold text-zinc-500 uppercase mt-0.5">Ready</span>
                                                                )}
                                                            </div>
                                                        </div>
                                                    )}
                                                    {/* Close button overlays each pill */}
                                                    <button
                                                        type="button"
                                                        onClick={() => {
                                                            setStagedAttachments(prev => prev.filter(item => item.id !== att.id));
                                                        }}
                                                        className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-black border border-white/20 flex items-center justify-center text-white hover:bg-zinc-800 transition-colors cursor-pointer shadow-lg z-20"
                                                        aria-label="Remove attachment"
                                                    >
                                                        <X size={10} strokeWidth={3} />
                                                    </button>
                                                </div>
                                            );
                                        })}
                                    </div>
                                )}

                                {/* Bottom row: Plus button, Text input, Mic / Send buttons */}
                                <div className="flex items-center w-full gap-2 pl-0.5">
                                    <button
                                        type="button"
                                        onClick={() => setIsActionSheetOpen(!isActionSheetOpen)}
                                        className="w-[36px] h-[36px] rounded-full flex items-center justify-center active:scale-95 transition-all cursor-pointer shrink-0"
                                        style={{ color: 'var(--app-text-muted)' }}
                                        aria-label="Attach file"
                                    >
                                        <Plus className="w-5 h-5" />
                                    </button>

                                    <input
                                        type="text"
                                        value={inputText}
                                        onChange={(e) => setInputText(e.target.value)}
                                        placeholder="Ask PAL..."
                                        className="flex-1 bg-transparent outline-none text-sm font-medium"
                                        style={{ color: 'var(--app-text)', '--tw-placeholder-color': 'var(--app-text-muted)' } as React.CSSProperties}
                                    />

                                    <div className="flex items-center gap-1 shrink-0">
                                        {inputText.trim() === "" && stagedAttachments.length === 0 ? (
                                            <>
                                                <button
                                                    type="button"
                                                    onClick={startVoiceRecording}
                                                    className="w-[34px] h-[34px] rounded-full flex items-center justify-center active:scale-95 transition-all cursor-pointer"
                                                    style={{ color: 'var(--app-text-muted)' }}
                                                    aria-label="Voice input"
                                                >
                                                    <Mic className="w-[18px] h-[18px]" />
                                                </button>
                                                <BlueWaveButton onClick={() => setIsLiveModeOpen(true)} />
                                            </>
                                                                        ) : (
                                            <button
                                                type="submit"
                                                disabled={stagedAttachments.some(att => att.isLoading)}
                                                className="w-[36px] h-[36px] rounded-full flex items-center justify-center active:scale-95 transition-all disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                                                style={{ background: 'var(--app-text)', color: 'var(--app-bg)' }}
                                                aria-label="Send message"
                                            >
                                                <Send className="w-4 h-4 fill-current" strokeWidth={2.5} style={{ color: 'var(--app-bg)' }} />
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </>
                        )}
                    </div>
                </form>


            </div>

            {/* PAL Live Voice Mode Overlay */}
            <AnimatePresence>
                {isLiveModeOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: "100%" }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: "100%" }}
                        transition={{ type: "spring", damping: 30, stiffness: 250 }}
                        className="absolute inset-0 z-50 bg-black text-white flex flex-col font-outfit select-none"
                    >
                        {/* Video Backdrop Mockup */}
                        {isVideoActive && (
                            <div className="absolute inset-0 z-0 bg-[#0f172a] overflow-hidden">
                                <div className="absolute inset-0 opacity-40 bg-[radial-gradient(circle_at_center,rgba(59,130,246,0.3)_0,transparent_60%)] animate-pulse" />
                                <div className="absolute inset-0 opacity-10 bg-[linear-gradient(to_right,#808080_1px,transparent_1px),linear-gradient(to_bottom,#808080_1px,transparent_1px)] bg-[size:24px_24px]" />
                                
                                <div className="absolute inset-6 border border-white/5 pointer-events-none flex flex-col justify-between p-4">
                                    <div className="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2 border-cyan-400/60" />
                                    <div className="absolute top-0 right-0 w-4 h-4 border-t-2 border-r-2 border-cyan-400/60" />
                                    <div className="absolute bottom-0 left-0 w-4 h-4 border-b-2 border-l-2 border-cyan-400/60" />
                                    <div className="absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2 border-cyan-400/60" />
                                    
                                    <div className="flex justify-between items-center w-full">
                                        <span className="text-[10px] text-red-500 font-bold flex items-center gap-1.5">
                                            <span className="w-2 h-2 rounded-full bg-red-500 animate-ping" />
                                            REC
                                        </span>
                                        <span className="text-[10px] text-white/40 font-mono">1080P 60FPS</span>
                                    </div>
                                    
                                    <div className="self-center w-16 h-16 border border-dashed border-white/20 rounded flex items-center justify-center">
                                        <div className="w-1.5 h-1.5 rounded-full bg-cyan-400/40" />
                                    </div>
                                    
                                    <div className="w-full flex justify-between items-end">
                                        <span className="text-[10px] text-white/40 font-mono">ISO 400</span>
                                        <span className="text-[10px] text-white/40 font-mono">F 2.8</span>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Ambient Deep Blue Bottom Glow exactly like the screenshot */}
                        {!isVideoActive && (
                            <div className="absolute bottom-0 left-0 right-0 h-1/3 z-0 bg-[radial-gradient(ellipse_at_bottom,rgba(26,115,232,0.25)_0%,transparent_70%)] pointer-events-none" />
                        )}

                        {/* Top Header */}
                        <div className="relative z-10 flex justify-between items-center p-4 pt-6 shrink-0">
                            <button
                                onClick={() => {
                                    setIsLiveModeOpen(false);
                                    router.push('/');
                                }}
                                className="w-11 h-11 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-gray-300 hover:text-white transition-all cursor-pointer active:scale-95"
                                aria-label="Back to home"
                            >
                                <TwoLinesMenu />
                            </button>

                            <div className="flex flex-col items-center">
                                <span className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">PAL Live Session</span>
                                <span className="text-xs text-cyan-400 font-semibold">{liveVoice}</span>
                            </div>

                            <div className="flex items-center gap-2 relative">
                                <button
                                    onClick={() => setIsTranscriptVisible(!isTranscriptVisible)}
                                    className={`w-11 h-11 rounded-full border flex items-center justify-center transition-all cursor-pointer active:scale-95 ${
                                        isTranscriptVisible 
                                            ? "bg-cyan-500/20 border-cyan-500/30 text-cyan-400" 
                                            : "bg-white/5 border-white/10 text-gray-300 hover:text-white"
                                    }`}
                                    aria-label="Toggle transcript"
                                >
                                    <TranscriptIcon />
                                </button>

                                <button
                                    onClick={() => setIsVoiceMenuOpen(!isVoiceMenuOpen)}
                                    className={`w-11 h-11 rounded-full border flex items-center justify-center transition-all cursor-pointer active:scale-95 ${
                                        isVoiceMenuOpen 
                                            ? "bg-purple-500/20 border-purple-500/30 text-purple-400" 
                                            : "bg-white/5 border-white/10 text-gray-300 hover:text-white"
                                    }`}
                                    aria-label="Voice settings"
                                >
                                    <Sparkles className="w-5 h-5" />
                                </button>
                                
                                <AnimatePresence>
                                    {isVoiceMenuOpen && (
                                        <>
                                            <div className="fixed inset-0 z-40" onClick={() => setIsVoiceMenuOpen(false)} />
                                            <motion.div
                                                initial={{ opacity: 0, scale: 0.95, y: -10 }}
                                                animate={{ opacity: 1, scale: 1, y: 0 }}
                                                exit={{ opacity: 0, scale: 0.95, y: -10 }}
                                                className="absolute right-0 top-12 w-[180px] rounded-2xl backdrop-blur-md border p-2 shadow-2xl z-50 text-left font-outfit"
                                                style={{ background: 'var(--app-surface)', borderColor: 'var(--app-card-border)' }}
                                            >
                                                <span className="text-[10px] text-gray-500 font-bold uppercase px-3 py-1.5 block">Select PAL Voice</span>
                                                {VOICES.map((v) => (
                                                    <button
                                                        key={v}
                                                        onClick={() => {
                                                            setLiveVoice(v);
                                                            setIsVoiceMenuOpen(false);
                                                        }}
                                                        className={`w-full text-left px-3 py-2 text-xs font-semibold rounded-lg transition-colors flex items-center justify-between ${
                                                            liveVoice === v 
                                                                ? "bg-blue-600 text-white" 
                                                                : "text-white hover:bg-white/5"
                                                        }`}
                                                    >
                                                        {v}
                                                        {liveVoice === v && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                                                    </button>
                                                ))}
                                            </motion.div>
                                        </>
                                    )}
                                </AnimatePresence>
                            </div>
                        </div>

                        {/* Center Area */}
                        <div className="flex-1 flex flex-col items-center justify-center px-6 relative z-10">
                            {/* Gemini Spark star in center */}
                            <GeminiSpark className="w-12 h-12 mb-5 animate-pulse" style={{ animationDuration: '3s' }} />

                            <h2 className="text-xl font-medium tracking-tight text-white/95 text-center select-none font-outfit">
                                Hi Emmanuel, let's get into it
                            </h2>
                            <p className="text-xs text-gray-500 mt-1 text-center font-medium">
                                {isMuted ? "Voice paused" : `Listening on ${liveVoice}...`}
                            </p>

                            <AnimatePresence>
                                {isTranscriptVisible && (
                                    <motion.div
                                        initial={{ opacity: 0, height: 0, scale: 0.95 }}
                                        animate={{ opacity: 1, height: 120, scale: 1 }}
                                        exit={{ opacity: 0, height: 0, scale: 0.95 }}
                                        transition={{ duration: 0.25 }}
                                        className="w-full max-w-[340px] mt-6 bg-[#161618]/70 border border-white/10 rounded-2xl p-4 text-xs overflow-y-auto scrollbar-hide text-left flex flex-col gap-2.5 backdrop-blur-md shadow-2xl relative z-10"
                                    >
                                        <div className="text-gray-500 font-bold uppercase tracking-wider text-[9px]">PAL Live Transcript</div>
                                        <div className="flex flex-col gap-2 leading-relaxed">
                                            <p className="text-gray-300"><span className="font-bold text-white">Emmanuel:</span> I want to optimize the marketing budget.</p>
                                            <p className="text-cyan-300/95 font-medium animate-pulse"><span className="font-bold text-white">PAL:</span> Indeed, that's why we need to audit your recurring SaaS subscriptions. Shall we start with the AWS logs?</p>
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>

                        {/* Bottom Controls Row: Matches screenshot exactly */}
                        <div className="relative z-10 p-6 pb-8 shrink-0 flex flex-col items-center bg-gradient-to-t from-black via-black/80 to-transparent">
                            <div className="flex items-center justify-between w-full max-w-[370px] gap-2 px-2">
                                {/* 1. Video Camera Toggle */}
                                <button
                                    type="button"
                                    onClick={() => setIsVideoActive(!isVideoActive)}
                                    className={`w-11 h-11 rounded-full flex items-center justify-center border transition-all cursor-pointer active:scale-95 ${
                                        isVideoActive 
                                            ? "bg-green-500/20 border-green-500/30 text-green-400 shadow-[0_0_15px_rgba(34,197,94,0.15)]" 
                                            : "bg-white/5 border border-white/10 text-gray-300 hover:text-white"
                                    }`}
                                    aria-label="Toggle camera"
                                >
                                    {isVideoActive ? <Video className="w-5 h-5" /> : <VideoOff className="w-5 h-5" />}
                                </button>

                                {/* 2. Screen Share */}
                                <button
                                    type="button"
                                    onClick={() => alert("Screen sharing simulation active! 🖥️")}
                                    className="w-11 h-11 rounded-full flex items-center justify-center bg-white/5 border border-white/10 text-gray-300 hover:text-white active:scale-95 transition-all cursor-pointer"
                                    aria-label="Share screen"
                                >
                                    <ScreenShareIcon />
                                </button>

                                {/* 3. Live Wave Pill (Center sound wave) */}
                                <LiveWavePill isMuted={isMuted} />

                                {/* 4. Microphone Mute Toggle */}
                                <button
                                    type="button"
                                    onClick={() => setIsMuted(!isMuted)}
                                    className={`w-11 h-11 rounded-full flex items-center justify-center border transition-all cursor-pointer active:scale-95 ${
                                        isMuted 
                                            ? "bg-red-500/20 border-red-500/30 text-red-400 shadow-[0_0_15px_rgba(239,68,68,0.15)]" 
                                            : "bg-white/5 border border-white/10 text-gray-300 hover:text-white"
                                    }`}
                                    aria-label="Toggle mic"
                                >
                                    {isMuted ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
                                </button>

                                {/* 5. End Session Button */}
                                <button
                                    type="button"
                                    onClick={() => {
                                        setIsLiveModeOpen(false);
                                        setIsVoiceMenuOpen(false);
                                    }}
                                    className="w-11 h-11 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-gray-300 hover:text-red-400 active:scale-95 transition-all cursor-pointer"
                                    aria-label="End session"
                                >
                                    <X className="w-5 h-5" />
                                </button>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Toast Notification */}
            <AnimatePresence>
                {toastMessage && (
                    <motion.div
                        initial={{ opacity: 0, y: -20, scale: 0.9 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -20, scale: 0.9 }}
                        className="absolute top-[80px] left-1/2 -translate-x-1/2 bg-blue-600/90 text-white font-semibold text-xs py-2.5 px-5 rounded-full shadow-lg backdrop-blur-md z-50 flex items-center gap-2"
                    >
                        <span className="w-1.5 h-1.5 rounded-full bg-white animate-ping" />
                        {toastMessage}
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Invoice Creation Modal */}
            <AnimatePresence>
                {isInvoiceModalOpen && (
                    <>
                        {/* Overlay backdrop */}
                        <div 
                            className="fixed inset-0 bg-black/70 z-45"
                            onClick={() => setIsInvoiceModalOpen(false)}
                        />
                        
                        {/* Modal container */}
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 20 }}
                            className="absolute inset-x-6 top-[20%] bg-[#12141c] border border-white/10 rounded-[32px] p-6 shadow-2xl z-50 flex flex-col font-outfit"
                        >
                            <h3 className="text-lg font-bold text-white mb-1">Generate Invoice</h3>
                            <p className="text-[11px] text-zinc-400 mb-5">
                                Enter details to generate a structured invoice card for your ledger database.
                            </p>
                            
                            <form onSubmit={handleInvoiceSubmit} className="space-y-4">
                                <div className="space-y-1">
                                    <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider pl-1">
                                        Client Name
                                    </label>
                                    <input
                                        type="text"
                                        required
                                        value={invoiceClient}
                                        onChange={(e) => setInvoiceClient(e.target.value)}
                                        placeholder="e.g. Acme Corp"
                                        className="w-full h-11 bg-[#1a1c24] border border-white/5 rounded-xl px-3.5 text-sm font-medium text-white outline-none focus:border-blue-500/50 transition-colors"
                                    />
                                </div>

                                <div className="space-y-1">
                                    <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider pl-1">
                                        Amount ($)
                                    </label>
                                    <input
                                        type="number"
                                        required
                                        min="1"
                                        value={invoiceAmount}
                                        onChange={(e) => setInvoiceAmount(e.target.value)}
                                        placeholder="e.g. 1500"
                                        className="w-full h-11 bg-[#1a1c24] border border-white/5 rounded-xl px-3.5 text-sm font-medium text-white outline-none focus:border-blue-500/50 transition-colors"
                                    />
                                </div>

                                <div className="space-y-1">
                                    <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider pl-1">
                                        Service Description
                                    </label>
                                    <input
                                        type="text"
                                        required
                                        value={invoiceService}
                                        onChange={(e) => setInvoiceService(e.target.value)}
                                        placeholder="e.g. Product Consultation"
                                        className="w-full h-11 bg-[#1a1c24] border border-white/5 rounded-xl px-3.5 text-sm font-medium text-white outline-none focus:border-blue-500/50 transition-colors"
                                    />
                                </div>

                                <div className="flex gap-3 pt-3">
                                    <button
                                        type="button"
                                        onClick={() => setIsInvoiceModalOpen(false)}
                                        className="flex-1 h-11 rounded-xl border border-white/10 text-xs font-bold text-zinc-400 hover:text-white transition-colors"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        className="flex-1 h-11 rounded-xl bg-blue-600 hover:bg-blue-500 text-xs font-bold text-white transition-colors shadow-lg shadow-blue-500/10"
                                    >
                                        Generate
                                    </button>
                                </div>
                            </form>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>

            {/* Document Upload Bottom Sheet */}
            <AnimatePresence>
                {isActionSheetOpen && (
                    <>
                        {/* Backdrop overlay */}
                        <motion.div 
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="absolute inset-0 bg-black/60 z-45"
                            onClick={() => setIsActionSheetOpen(false)}
                        />
                        
                        {/* Action popup */}
                        <motion.div
                            initial={{ y: "100%" }}
                            animate={{ y: 0 }}
                            exit={{ y: "100%" }}
                            transition={{ type: "spring", damping: 25, stiffness: 220 }}
                            onClick={(e) => e.stopPropagation()}
                            className="absolute bottom-0 inset-x-0 bg-[#00214a] rounded-t-[40px] p-6 pb-10 shadow-2xl z-50 flex flex-col overflow-hidden"
                        >
                            <div className="grid grid-cols-3 gap-3">
                                {ACTION_ITEMS.map((item) => {
                                    const [firstLine, secondLine] = getSplitLabel(item.label);
                                    return (
                                        <motion.button
                                            key={item.label}
                                            type="button"
                                            onClick={() => handleActionItemClick(item.label)}
                                            whileHover={{ scale: 1.02 }}
                                            whileTap={{ scale: 0.98 }}
                                            className="flex flex-col items-start justify-between p-4 rounded-[20px] bg-white text-black hover:bg-zinc-50 transition-all cursor-pointer aspect-square shadow-sm"
                                        >
                                            <div className="flex items-center justify-start">
                                                {renderActionIcon(item.label)}
                                            </div>
                                            <span className="text-[11px] font-semibold leading-tight font-outfit text-left text-black mt-4">
                                                {firstLine}
                                                <br />
                                                {secondLine}
                                            </span>
                                        </motion.button>
                                    );
                                })}
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>

            {/* Hidden Inputs for Attachments */}
            <input 
                type="file" 
                ref={docInputRef} 
                onChange={(e) => handleAttachmentUpload(e, "document")} 
                style={{ display: "none" }} 
                accept=".pdf,.doc,.docx,.txt,.csv,.xls,.xlsx"
            />
            <input 
                type="file" 
                ref={photoInputRef} 
                onChange={(e) => handleImageSelect(e, "photo")} 
                style={{ display: "none" }} 
                accept="image/*"
            />
            <input 
                type="file" 
                ref={cameraInputRef} 
                onChange={(e) => handleImageSelect(e, "camera photo")} 
                style={{ display: "none" }} 
                accept="image/*"
                capture="environment"
            />
            <input 
                type="file" 
                ref={audioInputRef} 
                onChange={(e) => handleAttachmentUpload(e, "audio")} 
                style={{ display: "none" }} 
                accept="audio/*"
            />
        </div>
    );
}
