"use client";

import React from "react";
import Image from "next/image";

interface UserAvatarProps {
    src?: string;
    name?: string;
    size?: number; // In pixels: e.g. 24, 32, 40
    className?: string;
    border?: boolean;
}

const GRADIENT_PALETTES = [
    "from-blue-600 to-indigo-800 text-blue-100",
    "from-purple-600 to-pink-800 text-purple-100",
    "from-emerald-600 to-teal-800 text-emerald-100",
    "from-amber-600 to-orange-800 text-amber-100",
    "from-sky-600 to-blue-800 text-sky-100",
];

export function UserAvatar({
    src,
    name = "PAL User",
    size = 32,
    className = "",
    border = true,
}: UserAvatarProps) {
    // Generate deterministic gradient index based on name string
    const paletteIndex = name
        .split("")
        .reduce((acc, char) => acc + char.charCodeAt(0), 0) % GRADIENT_PALETTES.length;
    const gradientClass = GRADIENT_PALETTES[paletteIndex];

    const initials = name
        .split(" ")
        .map((part) => part[0])
        .filter(Boolean)
        .slice(0, 2)
        .join("")
        .toUpperCase() || "U";

    return (
        <div
            style={{ width: size, height: size }}
            className={`relative rounded-full overflow-hidden shrink-0 flex items-center justify-center font-bold text-[10px] tracking-wider select-none shadow-md ${
                border ? "border border-[var(--app-card-border)]" : ""
            } ${className}`}
            title={name}
        >
            {src ? (
                <Image
                    src={src}
                    alt={name}
                    width={size}
                    height={size}
                    className="w-full h-full object-cover"
                />
            ) : (
                <div className={`w-full h-full bg-gradient-to-br ${gradientClass} flex items-center justify-center relative`}>
                    {/* Subtle inner mesh aura */}
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.25),transparent)]" />
                    <span style={{ fontSize: Math.max(9, size * 0.38) }} className="relative z-10 font-black">
                        {initials}
                    </span>
                </div>
            )}
        </div>
    );
}

export default UserAvatar;
