"use client";

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';

interface AddScheduleModalProps {
    isOpen: boolean;
    onClose: () => void;
    onAdd: (schedule: { title: string; date: string; time: string }) => void;
    initialDate?: string;
    initialTime?: string;
}

export default function AddScheduleModal({ isOpen, onClose, onAdd, initialDate = "", initialTime = "" }: AddScheduleModalProps) {
    const [title, setTitle] = useState("");
    const [date, setDate] = useState("");
    const [time, setTime] = useState("");

    React.useEffect(() => {
        if (isOpen) {
            setDate(initialDate);
            setTime(initialTime);
            setTitle("");
        }
    }, [isOpen, initialDate, initialTime]);

    const filled = title.trim().length > 0 && date.trim().length > 0 && time.trim().length > 0;

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (filled) {
            onAdd({ title, date, time });
            setTitle('');
            setDate('');
            setTime('');
            onClose();
        }
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[200] flex items-end justify-center bg-black/70 backdrop-blur-sm">
                    {/* Backdrop */}
                    <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="absolute inset-0"
                    />
                    
                    {/* Bottom Sheet */}
                    <motion.div
                        initial={{ y: "100%" }}
                        animate={{ y: 0 }}
                        exit={{ y: "100%" }}
                        transition={{ type: "spring", damping: 25, stiffness: 220 }}
                        className="w-full max-w-[430px] rounded-t-[28px] bg-white px-6 pb-8 pt-5 text-gray-900 shadow-2xl border-t border-gray-100 z-10 font-outfit"
                    >
                        {/* Drag Handle Bar */}
                        <div className="w-12 h-1 bg-gray-300 rounded-full mx-auto mb-4 cursor-pointer" onClick={onClose} />

                        {/* Header */}
                        <div className="flex items-center justify-between mb-6">
                            <div>
                                <h2 className="text-base font-bold text-gray-900 tracking-wide">Add New Schedule</h2>
                                <p className="mt-1 text-xs text-[var(--app-text-muted)]">Create a new schedule calendar event</p>
                            </div>
                            <button 
                                type="button" 
                                onClick={onClose} 
                                className="grid h-[28px] w-[28px] place-items-center rounded-full bg-gray-100 border border-gray-200 text-[var(--app-text-muted)] hover:text-gray-900 transition-colors cursor-pointer"
                                aria-label="Close"
                            >
                                <X size={14} />
                            </button>
                        </div>
                        
                        {/* Form */}
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="block text-[11px] font-bold text-gray-700 uppercase tracking-wider mb-1.5 font-outfit">
                                    Event Title
                                </label>
                                <input
                                    value={title}
                                    onChange={(event) => setTitle(event.target.value)}
                                    placeholder="Sync with Slack team"
                                    className="h-[46px] w-full rounded-2xl border border-gray-200 bg-gray-50 px-4 text-sm font-medium text-gray-900 outline-none placeholder:text-[var(--app-text-secondary)] focus:border-[#2d7fe0] focus:bg-white focus:ring-1 focus:ring-[#2d7fe0] transition-all"
                                    required
                                />
                            </div>
                            
                            {/* Date and Time side-by-side */}
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-[11px] font-bold text-gray-700 uppercase tracking-wider mb-1.5 font-outfit">
                                        Date
                                    </label>
                                    <input
                                        type="date"
                                        value={date}
                                        onChange={(event) => setDate(event.target.value)}
                                        className="h-[46px] w-full rounded-2xl border border-gray-200 bg-gray-50 px-4 text-sm font-medium text-gray-900 outline-none focus:border-[#2d7fe0] focus:bg-white focus:ring-1 focus:ring-[#2d7fe0] transition-all"
                                        required
                                    />
                                </div>

                                <div>
                                    <label className="block text-[11px] font-bold text-gray-700 uppercase tracking-wider mb-1.5 font-outfit">
                                        Time
                                    </label>
                                    <input
                                        type="time"
                                        value={time}
                                        onChange={(event) => setTime(event.target.value)}
                                        className="h-[46px] w-full rounded-2xl border border-gray-200 bg-gray-50 px-4 text-sm font-medium text-gray-900 outline-none focus:border-[#2d7fe0] focus:bg-white focus:ring-1 focus:ring-[#2d7fe0] transition-all"
                                        required
                                    />
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={!filled}
                                style={{
                                    backgroundColor: filled ? '#2563eb' : '#f3f4f6',
                                    color: filled ? '#ffffff' : '#9ca3af',
                                    cursor: filled ? 'pointer' : 'not-allowed',
                                }}
                                className="h-[44px] w-full rounded-full text-xs font-bold uppercase tracking-wider transition-all border-none mt-5 active:scale-[0.97] shadow-md"
                            >
                                Add Schedule
                            </button>
                        </form>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}
