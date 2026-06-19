"use client";

import React, { useState, useEffect } from "react";
import { 
    ArrowLeft, 
    Plus, 
    Send, 
    ArrowDown, 
    RefreshCw, 
    ChevronDown, 
    FileText, 
    Check, 
    X,
    TrendingUp,
    Shield,
    DollarSign,
    Sparkles,
    Calendar,
    ArrowUpRight,
    ArrowDownRight
} from "lucide-react";
import { useRouter } from "next/navigation";
import BottomNav from "./BottomNav";
import { motion, AnimatePresence } from "framer-motion";

interface Invoice {
    id: string;
    client: string;
    amount: string;
    service: string;
    date: string;
    status: "paid" | "pending" | "overdue";
    timestamp: string;
}

export default function QuickInvoiceScreen() {
    const router = useRouter();

    // Invoice states
    const [invoices, setInvoices] = useState<Invoice[]>([]);
    const [totalOutstanding, setTotalOutstanding] = useState(0);
    const [growthPercentage, setGrowthPercentage] = useState(0);

    // Form inputs
    const [client, setClient] = useState("");
    const [amount, setAmount] = useState("");
    const [service, setService] = useState("");
    const [dueDate, setDueDate] = useState("June 18, 2026");

    // UI interactive states
    const [showCreateDrawer, setShowCreateDrawer] = useState(false);
    const [isSyncingLedger, setIsSyncingLedger] = useState(false);
    const [showSuccessToast, setShowSuccessToast] = useState(false);
    const [printInvoice, setPrintInvoice] = useState<Invoice | null>(null);

    useEffect(() => {
        if (printInvoice) {
            const timer = setTimeout(() => {
                window.print();
                setPrintInvoice(null);
            }, 200);
            return () => clearTimeout(timer);
        }
    }, [printInvoice]);

    // Fetch invoices on mount
    useEffect(() => {
        async function fetchInvoices() {
            try {
                const res = await fetch("/api/invoices");
                if (res.ok) {
                    const data = await res.json();
                    if (data && data.length > 0) {
                        setInvoices(data);
                        // Calculate total outstanding: sum of pending and overdue amounts
                        const outstandingSum = data
                            .filter((inv: Invoice) => inv.status === "pending" || inv.status === "overdue")
                            .reduce((sum: number, inv: Invoice) => sum + parseFloat(inv.amount), 0);
                        setTotalOutstanding(outstandingSum);
                    } else {
                        setInvoices([]);
                        setTotalOutstanding(0);
                    }
                }
            } catch (err) {
                console.error("Failed to load invoices", err);
            }
        }
        fetchInvoices();
    }, []);

    // Sync ledger simulation
    const handleSyncLedger = () => {
        if (isSyncingLedger) return;
        setIsSyncingLedger(true);
        setTimeout(() => {
            setIsSyncingLedger(false);
            // Simulate updating stats
            setGrowthPercentage(prev => +(prev + 1.2).toFixed(1));
            // Show toast
            setShowSuccessToast(true);
            setTimeout(() => setShowSuccessToast(false), 2500);
        }, 1500);
    };

    // Invoice Creation Handler
    const handleCreateInvoiceSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (client.trim() && amount.trim() && service.trim()) {
            const numAmount = parseFloat(amount.replace(/,/g, ""));
            if (isNaN(numAmount)) return;

            const payload = {
                client,
                amount: String(numAmount),
                service,
                date: new Date().toLocaleDateString("default", { month: "short", day: "numeric", year: "numeric" }),
                status: "pending" as const,
                timestamp: "Just now"
            };

            try {
                const res = await fetch("/api/invoices", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(payload)
                });

                if (res.ok) {
                    const savedInvoice = await res.json();
                    setInvoices(prev => [savedInvoice, ...prev]);
                    setTotalOutstanding(prev => +(prev + numAmount).toFixed(2));
                } else {
                    // Fallback
                    const fallbackInvoice: Invoice = {
                        id: String(Date.now()),
                        ...payload
                    };
                    setInvoices(prev => [fallbackInvoice, ...prev]);
                    setTotalOutstanding(prev => +(prev + numAmount).toFixed(2));
                }
            } catch (err) {
                console.error("Error creating invoice on server", err);
                const fallbackInvoice: Invoice = {
                    id: String(Date.now()),
                    ...payload
                };
                setInvoices(prev => [fallbackInvoice, ...prev]);
                setTotalOutstanding(prev => +(prev + numAmount).toFixed(2));
            }

            setClient("");
            setAmount("");
            setService("");
            setShowCreateDrawer(false);

            // Show toast
            setShowSuccessToast(true);
            setTimeout(() => setShowSuccessToast(false), 3000);
        }
    };

    return (
        <div className="h-dvh bg-[var(--app-bg)] text-[var(--app-text)] w-full max-w-[430px] mx-auto relative shadow-2xl overflow-hidden selection:bg-blue-500/30 flex flex-col font-outfit">
            
            {/* Header Area (Adapting Tobechukwu's header layout) */}
            <div className="flex justify-between items-center p-4 pt-5 pb-2 shrink-0 z-30 bg-[var(--app-header-bg)] backdrop-blur-md border-b border-[var(--app-card-border)]">
                <button
                    onClick={() => router.push("/")}
                    className="grid h-[40px] w-[40px] place-items-center rounded-full border border-[var(--app-card-border)] bg-[var(--app-card-alt)] text-[#9eeaff] hover:bg-[#1a6ecf]/10 transition-all cursor-pointer"
                    aria-label="Back to home"
                >
                    <ArrowLeft size={18} />
                </button>
                
                <div className="text-center">
                    <span className="text-[10px] font-bold text-[var(--app-text-muted)] uppercase tracking-widest block">Invoicing</span>
                    <span className="text-xs font-bold text-white mt-0.5 block">Pal Ledger Space</span>
                </div>

                <div className="w-8 h-8 rounded-full border border-white/20 bg-zinc-800 overflow-hidden relative shrink-0">
                    <img 
                        src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=100&auto=format&fit=crop" 
                        alt="User Profile" 
                        className="object-cover w-full h-full"
                    />
                    <div className="absolute top-0 right-0 w-2.5 h-2.5 rounded-full bg-emerald-500 border-2 border-black" />
                </div>
            </div>

            {/* Scrollable Contents */}
            <div className="flex-1 overflow-y-auto px-4 pb-28 pt-4 space-y-5 scrollbar-hide relative">
                
                {/* Greeting Header */}
                <div>
                    <span className="text-xs text-[var(--app-text-muted)] block">Good Morning</span>
                    <h2 className="text-xl font-bold text-white tracking-wide mt-0.5">Co-Founder!</h2>
                </div>

                {/* Outstanding Invoice Card (Adapting Total Balance Card from IMG_2558.JPG) */}
                <motion.div 
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-[var(--app-card)] border border-[var(--app-card-border)] rounded-[24px] p-5 relative overflow-hidden"
                >
                    {/* Glowing color blot */}
                    <div className="absolute top-0 right-0 w-24 h-24 bg-blue-500/5 rounded-full blur-2xl pointer-events-none" />

                    <div className="flex justify-between items-start">
                        <div>
                            <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--app-text-muted)]">Outstanding Balance</span>
                            <div className="text-2xl font-black tracking-tight text-white mt-1.5 flex items-baseline">
                                <span className="text-lg font-bold text-[var(--app-text-secondary)] mr-0.5">$</span>
                                <span>{totalOutstanding.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                            </div>
                        </div>

                        {/* Account filter dropdown */}
                        <div className="flex items-center gap-1.5 bg-[var(--app-card-alt)] border border-[var(--app-card-border)] px-3 py-1.5 rounded-full text-[10px] font-bold text-[var(--app-text-secondary)] cursor-pointer hover:text-white transition-colors">
                            <span>All Clients</span>
                            <ChevronDown size={12} />
                        </div>
                    </div>

                    {/* Change indicator stats */}
                    <div className="flex items-center gap-1 mt-4 text-emerald-400 text-xs font-bold">
                        <TrendingUp size={14} />
                        <span>+${(3200).toLocaleString()} ({growthPercentage}% growth)</span>
                    </div>
                </motion.div>

                {/* Cash-Flow Trend Chart Card */}
                <div className="bg-[var(--app-card)] border border-[var(--app-card-border)] rounded-[24px] p-5 space-y-4">
                    <div className="flex justify-between items-start">
                        <div>
                            <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--app-text-muted)]">Cash Flow Chart</span>
                            <span className="text-xs font-bold text-white block mt-0.5">Monthly Inflow & Outstanding</span>
                        </div>
                        <div className="flex items-center gap-3 text-[9px] font-bold">
                            <span className="flex items-center gap-1.5 text-emerald-400">
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" /> Inflow
                            </span>
                            <span className="flex items-center gap-1.5 text-amber-400">
                                <span className="w-1.5 h-1.5 rounded-full bg-amber-400" /> Pending
                            </span>
                        </div>
                    </div>

                    <div className="h-[95px] w-full pt-1 relative">
                        <svg className="w-full h-full overflow-visible" viewBox="0 0 100 40" preserveAspectRatio="none">
                            <defs>
                                <linearGradient id="inflowGlow" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="0%" stopColor="#10b981" stopOpacity="0.25" />
                                    <stop offset="100%" stopColor="#10b981" stopOpacity="0" />
                                </linearGradient>
                                <linearGradient id="pendingGlow" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="0%" stopColor="#fbbf24" stopOpacity="0.2" />
                                    <stop offset="100%" stopColor="#fbbf24" stopOpacity="0" />
                                </linearGradient>
                            </defs>
                            <line x1="0" y1="10" x2="100" y2="10" stroke="rgba(255,255,255,0.03)" strokeWidth="0.5" />
                            <line x1="0" y1="20" x2="100" y2="20" stroke="rgba(255,255,255,0.03)" strokeWidth="0.5" />
                            <line x1="0" y1="30" x2="100" y2="30" stroke="rgba(255,255,255,0.03)" strokeWidth="0.5" />

                            <path 
                                d="M 0 35 Q 25 28, 50 18 T 100 8 L 100 40 L 0 40 Z" 
                                fill="url(#inflowGlow)" 
                            />
                            <path 
                                d="M 0 35 Q 25 28, 50 18 T 100 8" 
                                stroke="#10b981" 
                                strokeWidth="2" 
                                strokeLinecap="round"
                                fill="none" 
                            />

                            <path 
                                d="M 0 32 Q 25 22, 50 25 T 100 15 L 100 40 L 0 40 Z" 
                                fill="url(#pendingGlow)" 
                            />
                            <path 
                                d="M 0 32 Q 25 22, 50 25 T 100 15" 
                                stroke="#fbbf24" 
                                strokeWidth="1.5" 
                                strokeDasharray="2" 
                                strokeLinecap="round"
                                fill="none" 
                            />
                        </svg>
                    </div>
                    <div className="flex justify-between text-[9px] text-[var(--app-text-muted)] font-semibold px-1 pt-1">
                        <span>Jan</span>
                        <span>Feb</span>
                        <span>Mar</span>
                        <span>Apr</span>
                        <span>May</span>
                        <span>Jun</span>
                    </div>
                </div>

                {/* Quick Action Buttons Row (Adapting Send/Receive/Swap row) */}
                <div className="grid grid-cols-3 gap-3">
                    <button
                        onClick={() => setShowCreateDrawer(true)}
                        className="h-[52px] rounded-2xl bg-white text-black font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 hover:bg-zinc-200 active:scale-95 transition-all shadow-md cursor-pointer"
                    >
                        <Send size={13} strokeWidth={2.5} />
                        <span>Send</span>
                    </button>

                    <button
                        onClick={() => alert("Deep-linking to payout Gateway Settings")}
                        className="h-[52px] rounded-2xl bg-[var(--app-card-alt)] border border-[var(--app-card-border)] text-zinc-300 font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 hover:bg-zinc-800 active:scale-95 transition-all cursor-pointer"
                    >
                        <ArrowDown size={13} strokeWidth={2.5} />
                        <span>Receive</span>
                    </button>

                    <button
                        onClick={handleSyncLedger}
                        className="h-[52px] rounded-2xl bg-[var(--app-card-alt)] border border-[var(--app-card-border)] text-zinc-300 font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 hover:bg-zinc-800 active:scale-95 transition-all cursor-pointer"
                        disabled={isSyncingLedger}
                    >
                        <RefreshCw size={13} className={isSyncingLedger ? "animate-spin text-blue-400" : ""} strokeWidth={2.5} />
                        <span>Sync</span>
                    </button>
                </div>

                {/* Automated Billing Banner (Adapting Invite Friend Referral Banner) */}
                <div className="bg-black border border-[var(--app-card-border)] rounded-[22px] p-4 relative overflow-hidden flex justify-between items-center">
                    {/* Floating grid graphics */}
                    <div className="absolute right-2 -bottom-2 opacity-10 pointer-events-none scale-125">
                        <FileText size={80} className="text-[var(--app-text-muted)]" />
                    </div>

                    <div className="pr-16">
                        <h4 className="text-xs font-bold text-white flex items-center gap-1.5">
                            <Sparkles size={13} className="text-blue-400 fill-current" /> Pal Auto-Billing
                        </h4>
                        <p className="text-[10px] text-[var(--app-text-secondary)] mt-1 leading-relaxed">
                            Auto-match wire transfers to open tasks. Eliminate manual ledger verification.
                        </p>
                        <span className="text-[8px] font-bold text-[var(--app-text-muted)] uppercase tracking-widest block mt-3.5 hover:text-white transition-colors cursor-pointer">
                            Configure Billing &gt;
                        </span>
                    </div>
                </div>

                {/* Invoice Activity Feed (Adapting Activity list from IMG_2558.JPG) */}
                <div className="space-y-3">
                    <div className="flex justify-between items-center pl-1">
                        <h3 className="text-xs font-bold uppercase tracking-wider text-[var(--app-text-secondary)]">Invoice Activity</h3>
                        <button 
                            onClick={() => alert("Opening full transaction history")}
                            className="text-[10px] font-bold text-[var(--app-text-muted)] hover:text-white uppercase tracking-wider transition-colors cursor-pointer"
                        >
                            See all &gt;
                        </button>
                    </div>

                    <div className="space-y-2.5">
                        {invoices.map((inv) => {
                            const isPaid = inv.status === "paid";
                            const isOverdue = inv.status === "overdue";
                            return (
                                <motion.div 
                                    layout
                                    initial={{ opacity: 0, scale: 0.98 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    key={inv.id} 
                                    className="bg-[var(--app-card)] border border-[var(--app-card-border)] rounded-[20px] p-4 flex justify-between items-center"
                                >
                                    {/* Left side circular icon block */}
                                    <div className="flex items-center gap-3">
                                        <div className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 shadow-md ${
                                            isPaid 
                                                ? "bg-emerald-500/10 border border-emerald-500/20 text-emerald-400" 
                                                : isOverdue
                                                    ? "bg-red-500/10 border border-red-500/20 text-red-400"
                                                    : "bg-amber-500/10 border border-amber-500/20 text-amber-400"
                                        }`}>
                                            {isPaid ? (
                                                <ArrowDownRight size={16} strokeWidth={2.5} />
                                            ) : (
                                                <ArrowUpRight size={16} strokeWidth={2.5} />
                                            )}
                                        </div>

                                        {/* Center Column details */}
                                        <div className="min-w-0">
                                            <span className="text-xs font-bold text-white block truncate">{inv.client}</span>
                                            <span className="text-[10px] text-[var(--app-text-secondary)] mt-0.5 block truncate">
                                                {inv.service} • {inv.timestamp}
                                            </span>
                                        </div>
                                    </div>

                                    {/* Right Column details */}
                                    <div className="text-right shrink-0 flex flex-col items-end">
                                        <div className="text-xs font-black text-white">
                                            ${parseFloat(inv.amount).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                                        </div>
                                        <div className="flex items-center gap-1.5 mt-1.5">
                                            <button 
                                                onClick={() => setPrintInvoice(inv)}
                                                className="text-[8.5px] font-bold px-2 py-0.5 rounded-md bg-zinc-850 text-zinc-300 border border-zinc-700 hover:text-white hover:bg-zinc-750 transition-all cursor-pointer shadow-sm active:scale-95"
                                                title="Print Invoice / PDF"
                                            >
                                                Print
                                            </button>
                                            <span className={`text-[8.5px] font-bold px-2 py-0.5 rounded-md uppercase tracking-wider inline-block ${
                                                isPaid 
                                                    ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/15" 
                                                    : isOverdue
                                                        ? "bg-red-500/10 text-red-400 border border-red-500/15"
                                                        : "bg-amber-500/10 text-amber-400 border border-amber-500/15"
                                            }`}>
                                                {inv.status}
                                            </span>
                                        </div>
                                    </div>
                                </motion.div>
                            );
                        })}
                    </div>
                </div>

            </div>

            {/* Slide-Up Drawer for Invoice Creator Form */}
            <AnimatePresence>
                {showCreateDrawer && (
                    <>
                        {/* Backdrop */}
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 0.6 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setShowCreateDrawer(false)}
                            className="absolute inset-0 bg-black z-40"
                        />

                        {/* Modal Form Drawer */}
                        <motion.div
                            initial={{ y: "100%" }}
                            animate={{ y: 0 }}
                            exit={{ y: "100%" }}
                            transition={{ type: "spring", damping: 25, stiffness: 220 }}
                            className="absolute bottom-0 left-0 right-0 max-h-[75%] bg-[var(--app-card)] border-t border-[var(--app-card-border)] rounded-t-[32px] p-6 z-50 overflow-y-auto"
                        >
                            {/* Drag bar indicator */}
                            <div className="flex justify-center -mt-2 mb-4">
                                <div className="w-10 h-1 bg-zinc-800 rounded-full" />
                            </div>

                            <div className="flex justify-between items-center mb-5">
                                <h3 className="text-sm font-bold text-white uppercase tracking-wider">Send Quick Invoice</h3>
                                <button
                                    onClick={() => setShowCreateDrawer(false)}
                                    className="p-1 rounded-full bg-zinc-900 border border-[var(--app-card-border)] text-[var(--app-text-secondary)] hover:text-white"
                                >
                                    <X size={16} />
                                </button>
                            </div>

                            <form onSubmit={handleCreateInvoiceSubmit} className="space-y-4 pb-6">
                                <div>
                                    <label className="block text-[9px] font-bold text-[var(--app-text-muted)] uppercase tracking-widest mb-1.5 pl-0.5">
                                        Client Name
                                    </label>
                                    <input
                                        value={client}
                                        onChange={(e) => setClient(e.target.value)}
                                        placeholder="Acme Corp"
                                        className="h-[44px] w-full rounded-2xl border border-[var(--app-card-border)] bg-black/40 px-4 text-xs font-semibold text-white outline-none focus:border-blue-500/50 transition-all placeholder:text-zinc-600"
                                        required
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-[9px] font-bold text-[var(--app-text-muted)] uppercase tracking-widest mb-1.5 pl-0.5">
                                            Amount ($)
                                        </label>
                                        <input
                                            value={amount}
                                            onChange={(e) => setAmount(e.target.value)}
                                            placeholder="1,200"
                                            className="h-[44px] w-full rounded-2xl border border-[var(--app-card-border)] bg-black/40 px-4 text-xs font-semibold text-white outline-none focus:border-blue-500/50 transition-all placeholder:text-zinc-600"
                                            required
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-[9px] font-bold text-[var(--app-text-muted)] uppercase tracking-widest mb-1.5 pl-0.5">
                                            Service
                                        </label>
                                        <input
                                            value={service}
                                            onChange={(e) => setService(e.target.value)}
                                            placeholder="UI Design"
                                            className="h-[44px] w-full rounded-2xl border border-[var(--app-card-border)] bg-black/40 px-4 text-xs font-semibold text-white outline-none focus:border-blue-500/50 transition-all placeholder:text-zinc-600"
                                            required
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-[9px] font-bold text-[var(--app-text-muted)] uppercase tracking-widest mb-1.5 pl-0.5">
                                        Due Date
                                    </label>
                                    <input
                                        value={dueDate}
                                        onChange={(e) => setDueDate(e.target.value)}
                                        placeholder="June 18, 2026"
                                        className="h-[44px] w-full rounded-2xl border border-[var(--app-card-border)] bg-black/40 px-4 text-xs font-semibold text-white outline-none focus:border-blue-500/50 transition-all placeholder:text-zinc-600"
                                        required
                                    />
                                </div>

                                <button
                                    type="submit"
                                    className="w-full h-[46px] rounded-full bg-white text-black font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-1.5 hover:bg-zinc-200 transition-all mt-4 cursor-pointer"
                                >
                                    <Check size={14} strokeWidth={2.5} />
                                    <span>Generate &amp; Send</span>
                                </button>
                            </form>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>

            {/* Micro-animated success toast */}
            <AnimatePresence>
                {showSuccessToast && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 20 }}
                        className="absolute bottom-28 left-4 right-4 z-50 bg-[var(--app-card)] border border-emerald-500/20 px-4 py-3 rounded-2xl flex items-center gap-3 shadow-lg shadow-black/80"
                    >
                        <div className="w-6 h-6 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
                            <Check size={14} strokeWidth={2.5} />
                        </div>
                        <span className="text-xs font-bold text-white">Ledger synchronized successfully!</span>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Hidden printable receipt for window.print() */}
            {printInvoice && (
                <div className="printable-invoice font-outfit" style={{ display: 'none' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '2px solid #333', paddingBottom: '15px', marginBottom: '20px' }}>
                        <div>
                            <h2 style={{ margin: 0, fontSize: '20px', fontWeight: 'bold' }}>PAL LEDGER RECEIPT</h2>
                            <p style={{ margin: '5px 0 0 0', fontSize: '11px', color: '#666' }}>Invoice ID: #{printInvoice.id}</p>
                        </div>
                        <div style={{ textAlign: 'right' }}>
                            <h3 style={{ margin: 0, fontSize: '14px', fontWeight: 'bold' }}>PAL BUSINESS PLATFORM</h3>
                            <p style={{ margin: '5px 0 0 0', fontSize: '11px', color: '#666' }}>Date Generated: {printInvoice.date}</p>
                        </div>
                    </div>
                    
                    <div style={{ margin: '20px 0', fontSize: '13px', lineHeight: '1.6' }}>
                        <p><strong>Billed To:</strong> {printInvoice.client}</p>
                        <p><strong>Service Rendered:</strong> {printInvoice.service}</p>
                        <p><strong>Payment Status:</strong> <span style={{ textTransform: 'uppercase', fontWeight: 'bold' }}>{printInvoice.status}</span></p>
                    </div>

                    <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '20px' }}>
                        <thead>
                            <tr style={{ borderBottom: '2px solid #ddd', textAlign: 'left', fontSize: '12px' }}>
                                <th style={{ padding: '8px 0' }}>Description</th>
                                <th style={{ padding: '8px 0', textAlign: 'right' }}>Amount</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr style={{ borderBottom: '1px solid #eee', fontSize: '12px' }}>
                                <td style={{ padding: '10px 0' }}>{printInvoice.service}</td>
                                <td style={{ padding: '10px 0', textAlign: 'right' }}>${parseFloat(printInvoice.amount).toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                            </tr>
                            <tr style={{ fontWeight: 'bold', fontSize: '14px' }}>
                                <td style={{ padding: '15px 0' }}>Total Balance Due:</td>
                                <td style={{ padding: '15px 0', textAlign: 'right' }}>${parseFloat(printInvoice.amount).toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                            </tr>
                        </tbody>
                    </table>

                    <div style={{ borderTop: '1px solid #ddd', marginTop: '40px', paddingTop: '15px', textAlign: 'center', fontSize: '10px', color: '#888' }}>
                        <p>Thank you for your business. For billing queries, contact support@palco-founder.com.</p>
                    </div>
                </div>
            )}

            <BottomNav activePage="home" />
        </div>
    );
}
