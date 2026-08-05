"use client";

import React from "react";
import Image from "next/image";

interface PALLogoProps {
    className?: string;
    width?: number;
    height?: number;
    onClick?: () => void;
}

export default function PALLogo({ className = "", width = 28, height = 28, onClick }: PALLogoProps) {
    return (
        <div 
            className={`relative flex items-center justify-center shrink-0 ${onClick ? 'cursor-pointer' : ''} ${className}`}
            onClick={onClick}
        >
            <Image 
                src="/assets/pal-icon.png" 
                alt="PAL Logo" 
                width={width} 
                height={height}
                className="object-contain drop-shadow-[0_0_15px_rgba(59,130,246,0.3)]"
                priority
            />
        </div>
    );
}
