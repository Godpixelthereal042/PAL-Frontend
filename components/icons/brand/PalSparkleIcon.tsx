"use client";

import React from "react";
import { motion } from "framer-motion";

interface PalSparkleIconProps {
    size?: number;
    className?: string;
    animate?: boolean;
}

export function PalSparkleIcon({
    size = 20,
    className = "",
    animate = false,
}: PalSparkleIconProps) {
    return (
        <motion.div
            animate={animate ? { scale: [1, 1.15, 1], rotate: [0, 15, 0] } : {}}
            transition={animate ? { duration: 2.5, repeat: Infinity, ease: "easeInOut" } : {}}
            style={{ width: size, height: size }}
            className={`inline-flex items-center justify-center shrink-0 ${className}`}
        >
            <svg
                viewBox="0 0 24 24"
                fill="currentColor"
                xmlns="http://www.w3.org/2000/svg"
                className="w-full h-full text-blue-400"
                aria-label="PAL AI Intelligence"
                role="img"
            >
                {/* 4-Point Diamond Sparkle Executive AI Mark */}
                <path d="M12 0L14.6 9.4L24 12L14.6 14.6L12 24L9.4 14.6L0 12L9.4 9.4L12 0Z" fill="currentColor" />
                {/* Secondary Micro Sparkle */}
                <path d="M19.5 2.5L20.5 6.5L24.5 7.5L20.5 8.5L19.5 12.5L18.5 8.5L14.5 7.5L18.5 6.5L19.5 2.5Z" fill="currentColor" opacity="0.6" />
            </svg>
        </motion.div>
    );
}

export default PalSparkleIcon;
