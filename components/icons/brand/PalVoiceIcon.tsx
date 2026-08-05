"use client";

import React from "react";
import { motion, Variants } from "framer-motion";

export type VoiceState = "idle" | "listening" | "thinking" | "speaking";

interface PalVoiceIconProps {
    state?: VoiceState;
    size?: number;
    className?: string;
}

export function PalVoiceIcon({
    state = "idle",
    size = 48,
    className = "",
}: PalVoiceIconProps) {
    const containerVariants: Variants = {
        idle: {
            scale: 1,
            y: [0, -3, 0],
            transition: { repeat: Infinity, duration: 4, ease: "easeInOut" },
        },
        listening: {
            scale: [1, 1.06, 1],
            y: [0, -2, 0],
            transition: { repeat: Infinity, duration: 2, ease: "easeInOut" },
        },
        thinking: {
            scale: 1,
            rotate: [0, 360],
            transition: { repeat: Infinity, duration: 8, ease: "linear" },
        },
        speaking: {
            scale: [1, 1.12, 1.04, 1.15, 1],
            y: [0, -5, 0],
            transition: { repeat: Infinity, duration: 1.5, ease: "easeInOut" },
        },
    };

    const glowVariants: Variants = {
        idle: {
            opacity: 0.25,
            scale: 1,
            transition: { duration: 2 },
        },
        listening: {
            opacity: 0.65,
            scale: 1.35,
            transition: { repeat: Infinity, duration: 2, ease: "easeInOut" },
        },
        thinking: {
            opacity: 0.5,
            scale: 1.2,
            transition: { repeat: Infinity, duration: 3, ease: "easeInOut" },
        },
        speaking: {
            opacity: [0.6, 1, 0.7, 1, 0.6],
            scale: [1.2, 1.5, 1.3, 1.6, 1.2],
            transition: { repeat: Infinity, duration: 1.5, ease: "easeInOut" },
        },
    };

    return (
        <div className={`relative inline-flex items-center justify-center ${className}`}>
            {/* Ambient Brand Glow */}
            <motion.div
                variants={glowVariants}
                initial="idle"
                animate={state}
                className="absolute bg-blue-500 rounded-full blur-xl pointer-events-none"
                style={{ width: size * 1.5, height: size * 1.5 }}
            />

            {/* Core PAL Voice Icon */}
            <motion.div
                variants={containerVariants}
                initial="idle"
                animate={state}
                style={{ width: size, height: size }}
                className="relative z-10 text-blue-500 drop-shadow-[0_0_12px_rgba(45,127,224,0.6)] shrink-0"
            >
                <svg
                    viewBox="0 0 100 100"
                    fill="currentColor"
                    xmlns="http://www.w3.org/2000/svg"
                    className="w-full h-full"
                    aria-label="PAL Voice Assistant"
                    role="img"
                >
                    <path
                        d="M 50 18
                           C 65 18, 72 25, 75 35
                           C 88 35, 92 45, 90 55
                           C 88 68, 78 75, 68 75
                           C 60 75, 55 78, 50 78
                           C 45 78, 40 75, 32 75
                           C 22 75, 12 68, 10 55
                           C 8 45, 12 35, 25 35
                           C 28 25, 35 18, 50 18 Z"
                        fill="currentColor"
                    />
                    <rect x="38" y="40" width="7" height="18" rx="3.5" fill="#0B0F17" />
                    <rect x="55" y="40" width="7" height="18" rx="3.5" fill="#0B0F17" />
                    <rect x="35" y="86" width="30" height="7" rx="3.5" fill="currentColor" />
                </svg>
            </motion.div>
        </div>
    );
}

export default PalVoiceIcon;
