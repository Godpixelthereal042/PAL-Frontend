"use client";

import React from "react";
import { motion } from "framer-motion";

interface PalLogoIconProps {
    size?: number;
    className?: string;
    showText?: boolean;
    animate?: boolean;
}

export function PalLogoIcon({
    size = 28,
    className = "",
    showText = false,
    animate = false,
}: PalLogoIconProps) {
    return (
        <div className={`inline-flex items-center gap-2.5 ${className}`}>
            <motion.div
                animate={animate ? { scale: [1, 1.05, 1], filter: ["drop-shadow(0 0 8px rgba(45,127,224,0.4))", "drop-shadow(0 0 16px rgba(45,127,224,0.7))", "drop-shadow(0 0 8px rgba(45,127,224,0.4))"] } : {}}
                transition={animate ? { duration: 3, repeat: Infinity, ease: "easeInOut" } : {}}
                style={{ width: size, height: size }}
                className="relative flex items-center justify-center shrink-0"
            >
                <svg
                    viewBox="0 0 100 100"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    className="w-full h-full text-blue-500"
                    aria-label="PAL Logo"
                    role="img"
                >
                    {/* PAL Custom Cloud-Brain Bulb Mark */}
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
                    {/* Dual Core Cutouts */}
                    <rect x="38" y="40" width="7" height="18" rx="3.5" fill="#0B0F17" />
                    <rect x="55" y="40" width="7" height="18" rx="3.5" fill="#0B0F17" />
                    {/* Executive Base Pill */}
                    <rect x="35" y="86" width="30" height="7" rx="3.5" fill="currentColor" />
                </svg>
            </motion.div>

            {showText && (
                <span className="font-black text-lg tracking-tight text-white uppercase font-sans">
                    PAL
                </span>
            )}
        </div>
    );
}

export default PalLogoIcon;
