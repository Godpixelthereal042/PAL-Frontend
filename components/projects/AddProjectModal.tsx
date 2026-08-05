"use client";

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';

interface AddProjectModalProps {
    isOpen: boolean;
    onClose: () => void;
    onAdd: (project: { title: string; type: string; description: string; date: string; color: string }) => void;
}

export default function AddProjectModal({ isOpen, onClose, onAdd }: AddProjectModalProps) {
    const [name, setName] = useState("");
    const [description, setDescription] = useState("");
    const [date, setDate] = useState("");
    
    // PAL predefined brand colors
    const presetColors = ["#2D7FE0", "#22C55E", "#8B5CF6", "#F97316", "#EF4444"];
    const [selectedColor, setSelectedColor] = useState(presetColors[0]);
    const [isCustomColor, setIsCustomColor] = useState(false);
    
    const filled = name.trim().length > 0 && description.trim().length > 0 && date.trim().length > 0 && /^#([0-9A-F]{3}){1,2}$/i.test(selectedColor);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (filled) {
            onAdd({
                title: name,
                type: "General",
                description: description,
                date: date,
                color: selectedColor
            });
            setName('');
            setDescription('');
            setDate('');
            setSelectedColor(presetColors[0]);
            setIsCustomColor(false);
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
                                <h2 className="text-base font-bold text-gray-900 tracking-wide">Create A New Project</h2>
                                <p className="mt-1 text-xs text-[var(--app-text-muted)]">Create a project folder to get started</p>
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
                                <label className="block text-[11px] font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                                    Project Name
                                </label>
                                <input
                                    value={name}
                                    onChange={(event) => setName(event.target.value)}
                                    placeholder="The Base app"
                                    className="h-[46px] w-full rounded-2xl border border-gray-200 bg-gray-50 px-4 text-sm font-medium text-gray-900 outline-none placeholder:text-[var(--app-text-secondary)] focus:border-[#2d7fe0] focus:bg-white focus:ring-1 focus:ring-[#2d7fe0] transition-all"
                                    required
                                />
                            </div>
                            
                            <div>
                                <label className="block text-[11px] font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                                    Description / Category
                                </label>
                                <input
                                    value={description}
                                    onChange={(event) => setDescription(event.target.value)}
                                    placeholder="Mobile app design"
                                    className="h-[46px] w-full rounded-2xl border border-gray-200 bg-gray-50 px-4 text-sm font-medium text-gray-900 outline-none placeholder:text-[var(--app-text-secondary)] focus:border-[#2d7fe0] focus:bg-white focus:ring-1 focus:ring-[#2d7fe0] transition-all"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-[11px] font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                                    Creation Date
                                </label>
                                <input
                                    value={date}
                                    onChange={(event) => setDate(event.target.value)}
                                    placeholder="e.g. 02/08/2025"
                                    className="h-[46px] w-full rounded-2xl border border-gray-200 bg-gray-50 px-4 text-sm font-medium text-gray-900 outline-none placeholder:text-[var(--app-text-secondary)] focus:border-[#2d7fe0] focus:bg-white focus:ring-1 focus:ring-[#2d7fe0] transition-all"
                                    required
                                />
                            </div>
                                
                                {/* Color Identity */}
                                <div>
                                    <label className="block text-[13px] font-semibold text-gray-700 mb-2">Folder Identity Color</label>
                                    <div className="flex items-center gap-3 mb-2">
                                        {presetColors.map((color) => (
                                            <button
                                                key={color}
                                                type="button"
                                                onClick={() => {
                                                    setSelectedColor(color);
                                                    setIsCustomColor(false);
                                                }}
                                                className={`w-8 h-8 rounded-full shadow-inner transition-transform ${selectedColor === color && !isCustomColor ? 'scale-110 ring-2 ring-offset-2 ring-blue-500' : 'hover:scale-105'}`}
                                                style={{ backgroundColor: color }}
                                                aria-label={`Select color ${color}`}
                                            />
                                        ))}
                                    </div>
                                    <div className="flex items-center gap-2 mt-3">
                                        <div className="text-xs font-semibold text-gray-500 w-16">Custom:</div>
                                        <input
                                            type="text"
                                            value={isCustomColor ? selectedColor : ""}
                                            onChange={(e) => {
                                                const val = e.target.value;
                                                setIsCustomColor(true);
                                                setSelectedColor(val.startsWith('#') ? val : '#' + val);
                                            }}
                                            placeholder="#HEXCODE"
                                            className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-[14px] font-medium text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 uppercase"
                                        />
                                        {isCustomColor && /^#([0-9A-F]{3}){1,2}$/i.test(selectedColor) && (
                                            <div 
                                                className="w-8 h-8 rounded-full border border-gray-200 shrink-0" 
                                                style={{ backgroundColor: selectedColor }} 
                                            />
                                        )}
                                    </div>
                                </div>

                                <button
                                type="submit"
                                disabled={!filled}
                                className={`h-[44px] w-full rounded-full text-xs font-bold uppercase tracking-wider transition-all border-none ${
                                    filled 
                                        ? "bg-[#2d7fe0] hover:bg-[#1e6bcf] text-white active:scale-[0.97] cursor-pointer shadow-md shadow-blue-500/10" 
                                        : "bg-[#f3f4f6] text-[#9ca3af] cursor-not-allowed"
                                } mt-5`}
                            >
                                Create Project
                            </button>
                        </form>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}
