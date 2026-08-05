"use client";

import React from "react";
import UserAvatar from "./UserAvatar";

export interface AvatarItem {
    src?: string;
    name: string;
}

interface AvatarGroupProps {
    avatars: AvatarItem[];
    max?: number;
    size?: number;
    className?: string;
}

export function AvatarGroup({
    avatars,
    max = 3,
    size = 26,
    className = "",
}: AvatarGroupProps) {
    const visibleAvatars = avatars.slice(0, max);
    const remainingCount = avatars.length - max;

    return (
        <div className={`inline-flex items-center -space-x-2 ${className}`}>
            {visibleAvatars.map((item, idx) => (
                <div key={idx} className="relative z-10 transition-transform hover:z-20 hover:scale-105">
                    <UserAvatar
                        src={item.src}
                        name={item.name}
                        size={size}
                        border={true}
                        className="ring-2 ring-[#0B0F17]"
                    />
                </div>
            ))}

            {remainingCount > 0 && (
                <div
                    style={{ width: size, height: size, fontSize: Math.max(9, size * 0.36) }}
                    className="relative z-20 rounded-full bg-[var(--app-card-alt)] border border-[var(--app-card-border)] ring-2 ring-[#0B0F17] text-[9.5px] font-black text-blue-400 flex items-center justify-center shrink-0"
                >
                    +{remainingCount}
                </div>
            )}
        </div>
    );
}

export default AvatarGroup;
