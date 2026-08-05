"use client";

import React, { useState } from "react";
import Sidebar from "@/components/executive/Sidebar";
import Header from "@/components/executive/Header";
import UniversalSearch from "@/components/executive/UniversalSearch";
import BusinessBrainForm from "@/components/BusinessBrainForm";
import { Brain } from "lucide-react";

export default function BusinessBrainPage() {
    const [searchOpen, setSearchOpen] = useState(false);

    return (
        <div className="min-h-screen bg-[#0B0F17] text-slate-100 flex flex-col md:flex-row antialiased font-sans">
            <Sidebar />

            <div className="flex-1 flex flex-col min-w-0">
                <Header onOpenSearch={() => setSearchOpen(true)} />

                <main className="flex-1 p-4 md:p-8 max-w-7xl w-full mx-auto space-y-6">
                    <div>
                        <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-slate-100 flex items-center gap-2.5">
                            <Brain className="w-7 h-7 text-purple-400" /> Business Brain Configurator
                        </h1>
                        <p className="text-xs md:text-sm text-slate-400 mt-1">
                            PAL&apos;s long-term business memory storing company profile, vision, goals, and operating preferences.
                        </p>
                    </div>

                    <div className="bg-[#131B2E] border border-[#1E293B] rounded-2xl p-6 shadow-xl">
                        <BusinessBrainForm mode="edit" />
                    </div>
                </main>
            </div>

            <UniversalSearch isOpen={searchOpen} onClose={() => setSearchOpen(false)} />
        </div>
    );
}
