"use client";

import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { Plus, Folder, Calendar, Clock, Settings, Search, Edit } from "lucide-react";
import PALLogo from "../ui/PALLogo";

interface WorkspaceDrawerProps {
    isOpen: boolean;
    onClose: () => void;
    onNewChat: () => void;
}

export default function WorkspaceDrawer({ isOpen, onClose, onNewChat }: WorkspaceDrawerProps) {
    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        onClick={onClose}
                        className="absolute inset-0 bg-black/50 z-[60]"
                    />

                    {/* Drawer */}
                    <motion.div
                        initial={{ x: "-100%" }}
                        animate={{ x: 0 }}
                        exit={{ x: "-100%" }}
                        transition={{ type: "spring", damping: 25, stiffness: 200, mass: 0.8 }}
                        drag="x"
                        dragConstraints={{ left: 0, right: 0 }}
                        dragElastic={{ left: 1, right: 0 }}
                        onDragEnd={(_, info) => {
                            if (info.offset.x < -50 || info.velocity.x < -500) {
                                onClose();
                            }
                        }}
                        className="absolute top-0 left-0 bottom-0 w-[320px] bg-black z-[70] flex flex-col font-sans"
                    >
                        {/* Top Header Section */}
                        <div className="flex items-center justify-between px-4 pt-6 pb-2">
                            <PALLogo width={26} height={26} />
                            <button className="w-9 h-9 rounded-full bg-[#1c1c1e] flex items-center justify-center text-white hover:bg-[#2c2c2e] transition-colors">
                                <Search className="w-4 h-4" />
                            </button>
                        </div>

                        {/* Menu Section */}
                        <div className="flex-1 overflow-y-auto pb-20 custom-scrollbar">
                            <nav className="flex flex-col mt-2">
                                <button
                                    onClick={() => {
                                        onNewChat();
                                        onClose();
                                    }}
                                    className="flex items-center gap-4 px-4 py-3.5 text-[16px] font-medium text-white hover:bg-white/10 transition-colors w-full text-left"
                                >
                                    <Edit className="w-5 h-5 text-white" strokeWidth={1.5} />
                                    New Chat
                                </button>
                                
                                <Link href="/projects" onClick={onClose} className="flex items-center gap-4 px-4 py-3.5 text-[16px] font-medium text-white hover:bg-white/10 transition-colors">
                                    <Folder className="w-5 h-5 text-white" strokeWidth={1.5} />
                                    Projects
                                </Link>
                                
                                <button className="flex items-center gap-4 px-4 py-3.5 text-[16px] font-medium text-white hover:bg-white/10 transition-colors w-full text-left">
                                    <Calendar className="w-5 h-5 text-white" strokeWidth={1.5} />
                                    Schedule
                                </button>

                                <button className="flex items-center gap-4 px-4 py-3.5 text-[16px] font-medium text-white hover:bg-white/10 transition-colors w-full text-left">
                                    <Clock className="w-5 h-5 text-white" strokeWidth={1.5} />
                                    Temporary Chat
                                </button>
                                
                                <button className="flex items-center gap-4 px-4 py-3.5 text-[16px] font-medium text-white hover:bg-white/10 transition-colors w-full text-left">
                                    <Settings className="w-5 h-5 text-white" strokeWidth={1.5} />
                                    Settings
                                </button>
                            </nav>

                            {/* Recents Section */}
                            <div className="mt-6">
                                <h3 className="text-[16px] font-bold text-white px-4 mb-2">
                                    Recents
                                </h3>
                                <div className="flex flex-col">
                                    {[
                                        "Hello conversation",
                                        "Charitable Initiative Email Subje...",
                                        "Spam Email Analysis",
                                        "BANA Offer Review"
                                    ].map((chat, idx) => (
                                        <button 
                                            key={idx}
                                            className="px-4 py-3 text-[16px] font-normal text-white hover:bg-white/10 transition-colors w-full text-left truncate"
                                        >
                                            {chat}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}
