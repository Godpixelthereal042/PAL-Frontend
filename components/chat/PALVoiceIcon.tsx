"use client";

import React from "react";
import { motion, Variants } from "framer-motion";

export type VoiceState = "idle" | "listening" | "thinking" | "speaking";

interface PALVoiceIconProps {
    state: VoiceState;
    className?: string;
}

export default function PALVoiceIcon({ state, className = "" }: PALVoiceIconProps) {
    // Determine animation variants based on state
    
    const containerVariants: Variants = {
        idle: {
            scale: 1,
            y: [0, -4, 0],
            transition: { repeat: Infinity, duration: 4, ease: "easeInOut" }
        },
        listening: {
            scale: [1, 1.05, 1],
            y: [0, -2, 0],
            transition: { repeat: Infinity, duration: 2, ease: "easeInOut" }
        },
        thinking: {
            scale: 1,
            y: [0, -2, 0],
            transition: { repeat: Infinity, duration: 3, ease: "easeInOut" }
        },
        speaking: {
            scale: [1, 1.1, 1.05, 1.15, 1],
            y: [0, -6, 0],
            transition: { repeat: Infinity, duration: 1.5, ease: "easeInOut" }
        }
    };

    const glowVariants: Variants = {
        idle: {
            opacity: 0.3,
            scale: 1,
            rotate: 0,
            transition: { duration: 2 }
        },
        listening: {
            opacity: 0.7,
            scale: 1.4,
            rotate: 0,
            transition: { repeat: Infinity, duration: 2, ease: "easeInOut" }
        },
        thinking: {
            opacity: 0.5,
            scale: 1.2,
            rotate: 360,
            transition: { repeat: Infinity, duration: 6, ease: "linear" }
        },
        speaking: {
            opacity: [0.6, 1, 0.8, 1, 0.6],
            scale: [1.2, 1.6, 1.4, 1.7, 1.2],
            rotate: 0,
            transition: { repeat: Infinity, duration: 1.5, ease: "easeInOut" }
        }
    };

    return (
        <div className={`relative flex items-center justify-center ${className}`}>
            {/* Ambient Glow */}
            <motion.div
                variants={glowVariants}
                initial="idle"
                animate={state}
                className="absolute w-[120px] h-[120px] rounded-full blur-2xl"
                style={{ 
                    background: state === 'speaking' 
                        ? 'radial-gradient(circle, rgba(59,130,246,0.8) 0%, rgba(14,165,233,0) 70%)' 
                        : 'radial-gradient(circle, rgba(59,130,246,0.5) 0%, rgba(14,165,233,0) 70%)'
                }}
            />

            {/* Core SVG Icon */}
            <motion.div
                variants={containerVariants}
                initial="idle"
                animate={state}
                className="relative z-10 w-32 h-32 text-blue-500 drop-shadow-[0_0_15px_rgba(59,130,246,0.5)]"
            >
                <svg viewBox="0 0 100 100" fill="currentColor" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
                    {/* A 5-lobed cloud/brain shape */}
                    <path d="M 50 18
                             C 65 18, 72 25, 75 35
                             C 88 35, 92 45, 90 55
                             C 88 68, 78 75, 68 75
                             C 60 75, 55 78, 50 78
                             C 45 78, 40 75, 32 75
                             C 22 75, 12 68, 10 55
                             C 8 45, 12 35, 25 35
                             C 28 25, 35 18, 50 18 Z" 
                          fill="currentColor" />
                    
                    {/* The two vertical inner slots (cutouts/white) */}
                    <rect x="38" y="40" width="8" height="20" rx="4" fill="#000" />
                    <rect x="54" y="40" width="8" height="20" rx="4" fill="#000" />

                    {/* The bottom horizontal pill */}
                    <rect x="35" y="86" width="30" height="8" rx="4" fill="currentColor" />
                </svg>
            </motion.div>
        </div>
    );
}
