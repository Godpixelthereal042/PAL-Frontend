"use client";

import React, { useState } from "react";
import { Lock, Mail, Building, User, Key, ArrowRight, X } from "lucide-react";

interface CommercialAuthModalProps {
    isOpen: boolean;
    onClose: () => void;
    onAuthenticated: (user: { email: string; organizationName: string; role: string }) => void;
}

export function CommercialAuthModal({ isOpen, onClose, onAuthenticated }: CommercialAuthModalProps) {
    const [mode, setMode] = useState<"login" | "signup" | "recovery">("login");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [organizationName, setOrganizationName] = useState("");
    const [fullName, setFullName] = useState("");
    const [isLoading, setIsLoading] = useState(false);

    if (!isOpen) return null;

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        setTimeout(() => {
            setIsLoading(false);
            onAuthenticated({
                email: email || "ceo@acmesaas.com",
                organizationName: organizationName || "Acme SaaS Corp",
                role: "CEO"
            });
            onClose();
        }, 600);
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/20 backdrop-blur-sm p-4">
            <div className="relative w-full max-w-md bg-white border border-[#EEF0F4] rounded-3xl shadow-2xl overflow-hidden p-6 text-[#1A1D26]">
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 p-2 text-[#9CA3AF] hover:text-[#1A1D26] rounded-xl hover:bg-[#F5F7FA] transition"
                >
                    <X className="w-5 h-5" />
                </button>

                <div className="text-center mb-6">
                    <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-[#EFF5FF] text-[#3B7BF6] mb-3 border border-[#C8DEFF]">
                        <Lock className="w-6 h-6" />
                    </div>
                    <h2 className="text-2xl font-bold tracking-tight text-[#1A1D26]">
                        {mode === "login" && "Sign In to PAL"}
                        {mode === "signup" && "Deploy PAL Autonomous OS"}
                        {mode === "recovery" && "Reset Password"}
                    </h2>
                    <p className="text-sm text-[#7C8494] mt-1">
                        {mode === "login" && "Access your autonomous executive cockpit"}
                        {mode === "signup" && "Connect your company & activate AI workforce"}
                        {mode === "recovery" && "Enter your email to receive recovery instructions"}
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    {mode === "signup" && (
                        <>
                            <div>
                                <label className="block text-xs font-semibold text-[#5A6070] uppercase tracking-wider mb-1">Full Name</label>
                                <div className="relative">
                                    <User className="absolute left-3 top-3 w-4 h-4 text-[#9CA3AF]" />
                                    <input
                                        type="text"
                                        required
                                        value={fullName}
                                        onChange={(e) => setFullName(e.target.value)}
                                        placeholder="Sarah Jenkins"
                                        className="w-full bg-[#F3F5F8] border border-[#E2E6ED] rounded-2xl pl-9 pr-4 py-2.5 text-sm text-[#1A1D26] focus:outline-none focus:border-[#3B7BF6]"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-semibold text-[#5A6070] uppercase tracking-wider mb-1">Company / Organization</label>
                                <div className="relative">
                                    <Building className="absolute left-3 top-3 w-4 h-4 text-[#9CA3AF]" />
                                    <input
                                        type="text"
                                        required
                                        value={organizationName}
                                        onChange={(e) => setOrganizationName(e.target.value)}
                                        placeholder="Acme SaaS Inc."
                                        className="w-full bg-[#F3F5F8] border border-[#E2E6ED] rounded-2xl pl-9 pr-4 py-2.5 text-sm text-[#1A1D26] focus:outline-none focus:border-[#3B7BF6]"
                                    />
                                </div>
                            </div>
                        </>
                    )}

                    <div>
                        <label className="block text-xs font-semibold text-[#5A6070] uppercase tracking-wider mb-1">Work Email</label>
                        <div className="relative">
                            <Mail className="absolute left-3 top-3 w-4 h-4 text-[#9CA3AF]" />
                            <input
                                type="email"
                                required
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="ceo@acmesaas.com"
                                className="w-full bg-[#F3F5F8] border border-[#E2E6ED] rounded-2xl pl-9 pr-4 py-2.5 text-sm text-[#1A1D26] focus:outline-none focus:border-[#3B7BF6]"
                            />
                        </div>
                    </div>

                    {mode !== "recovery" && (
                        <div>
                            <label className="block text-xs font-semibold text-[#5A6070] uppercase tracking-wider mb-1">Password</label>
                            <div className="relative">
                                <Key className="absolute left-3 top-3 w-4 h-4 text-[#9CA3AF]" />
                                <input
                                    type="password"
                                    required
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="••••••••••••"
                                    className="w-full bg-[#F3F5F8] border border-[#E2E6ED] rounded-2xl pl-9 pr-4 py-2.5 text-sm text-[#1A1D26] focus:outline-none focus:border-[#3B7BF6]"
                                />
                            </div>
                        </div>
                    )}

                    <button
                        type="submit"
                        disabled={isLoading}
                        className="w-full bg-gradient-to-r from-[#3B7BF6] to-[#6C5CE7] hover:from-[#2563EB] hover:to-[#5B4BD5] text-white font-medium py-2.5 px-4 rounded-2xl flex items-center justify-center space-x-2 transition shadow-md shadow-blue-500/15 disabled:opacity-50"
                    >
                        <span>{isLoading ? "Authenticating..." : mode === "login" ? "Sign In" : mode === "signup" ? "Create Workspace" : "Send Reset Link"}</span>
                        {!isLoading && <ArrowRight className="w-4 h-4" />}
                    </button>
                </form>

                <div className="mt-6 text-center text-xs text-[#7C8494] space-x-4">
                    {mode === "login" && (
                        <>
                            <button onClick={() => setMode("signup")} className="text-[#3B7BF6] hover:underline font-semibold">Create an Account</button>
                            <span>•</span>
                            <button onClick={() => setMode("recovery")} className="text-[#7C8494] hover:underline">Forgot Password?</button>
                        </>
                    )}
                    {mode === "signup" && (
                        <button onClick={() => setMode("login")} className="text-[#3B7BF6] hover:underline font-semibold">Already have an account? Sign In</button>
                    )}
                    {mode === "recovery" && (
                        <button onClick={() => setMode("login")} className="text-[#3B7BF6] hover:underline font-semibold">Back to Sign In</button>
                    )}
                </div>
            </div>
        </div>
    );
}
