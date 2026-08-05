"use client";

import React, { useState } from "react";
import Sidebar from "@/components/executive/Sidebar";
import Header from "@/components/executive/Header";
import UniversalSearch from "@/components/executive/UniversalSearch";
import NotificationsScreen from "@/components/NotificationsScreen";

export default function NotificationsPage() {
    const [searchOpen, setSearchOpen] = useState(false);

    return (
        <div className="min-h-screen bg-[#0B0F17] text-slate-100 flex flex-col md:flex-row antialiased font-sans">
            <Sidebar />

            <div className="flex-1 flex flex-col min-w-0">
                <Header onOpenSearch={() => setSearchOpen(true)} />

                <main className="flex-1 p-4 md:p-8 max-w-7xl w-full mx-auto">
                    <NotificationsScreen />
                </main>
            </div>

            <UniversalSearch isOpen={searchOpen} onClose={() => setSearchOpen(false)} />
        </div>
    );
}
