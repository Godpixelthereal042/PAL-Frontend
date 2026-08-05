"use client";

import { motion, PanInfo } from "framer-motion";
import { useRouter } from "next/navigation";
import { Project } from "./PALFolderStack";

export interface FolderLayerProps {
    project: Project;
    index: number;
    onSwipe: () => void;
}

function hexToRgb(hex: string) {
    let result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16)
    } : { r: 59, g: 130, b: 246 }; // fallback
}

function getLuminance(r: number, g: number, b: number) {
    const a = [r, g, b].map(function (v) {
        v /= 255;
        return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
    });
    return a[0] * 0.2126 + a[1] * 0.7152 + a[2] * 0.0722;
}

function adjustColor(color: string, amount: number) {
    return '#' + color.replace(/^#/, '').replace(/../g, color => ('0'+Math.min(255, Math.max(0, parseInt(color, 16) + amount)).toString(16)).substring(-2)).slice(-6); // ensure exactly 6 chars
}

function generateTheme(baseHex: string) {
    const hex = baseHex || "#3b82f6";
    const rgb = hexToRgb(hex);
    const lum = getLuminance(rgb.r, rgb.g, rgb.b);
    const isLight = lum > 0.4;
    
    // Create a smooth gradient by lightening the base color
    let lightHex = "#ffffff";
    try {
        lightHex = adjustColor(hex, 30);
    } catch(e) {}
    
    return {
        background: `linear-gradient(135deg, ${hex} 0%, ${lightHex} 100%)`,
        textColor: isLight ? 'text-slate-900' : 'text-white',
        subTextColor: isLight ? 'text-slate-800' : 'text-blue-50',
        metaTextColor: isLight ? 'text-slate-600' : 'text-white/70',
        shadowColor: `rgba(0, 0, 0, 0.35)`,
        borderColor: isLight ? 'rgba(0,0,0,0.1)' : 'rgba(255,255,255,0.15)'
    };
}

export default function FolderLayer({ project, index, onSwipe }: FolderLayerProps) {
    const isTop = index === 0;
    const router = useRouter();

    const theme = generateTheme(project.color);

    // Target values based on current stack position (4 Distinct Layers)
    const targetY = isTop ? 0 : -(index * 24);
    const targetScale = isTop ? 1 : 1 - (index * 0.05);
    const targetOpacity = isTop ? 1 : index === 1 ? 0.9 : index === 2 ? 0.75 : 0.5;
    const targetBlur = isTop ? 0 : index;
    const targetBrightness = isTop ? 1 : 1 - (index * 0.15);

    const handleDragEnd = (event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
        if (info.offset.y > 100) {
            onSwipe();
        }
    };

    return (
        <motion.div
            layout
            drag={isTop ? "y" : false}
            dragConstraints={{ top: 0, bottom: 0 }} // Forces it to bounce back if not swiped far enough
            dragElastic={0.8} // Allows it to be pulled
            onDragEnd={handleDragEnd}
            initial={false}
            animate={{
                y: targetY,
                scale: targetScale,
                opacity: targetOpacity,
                filter: `blur(${targetBlur}px) brightness(${targetBrightness})`,
                zIndex: 50 - index,
            }}
            transition={{
                type: "spring",
                stiffness: 300,
                damping: 25,
                mass: 1
            }}
            className="absolute origin-top w-full h-[90%] left-0 top-[30px]"
            style={{ touchAction: "none" }}
        >
            <div 
                className="relative w-full h-full"
                style={{
                    filter: `drop-shadow(0 15px 30px ${theme.shadowColor})`
                }}
            >
                <div
                    onClick={() => {
                        if (isTop) {
                            router.push(`/projects/${project.id}`);
                        }
                    }}
                    className={`relative w-full h-full transition-colors duration-300 ${isTop ? 'cursor-pointer' : ''}`}
                    style={{
                        clipPath: "url(#folderClip)",
                        background: theme.background,
                    }}
                >
                    {/* Responsive Border Overlay */}
                    <svg className="absolute inset-0 w-full h-full pointer-events-none" viewBox="0 0 100 100" preserveAspectRatio="none">
                        <path
                            d="M 0.5 92 C 0.5 96.5 4 99.5 9 99.5 L 91 99.5 C 96 99.5 99.5 96.5 99.5 92 L 99.5 13 C 99.5 8 96 4.5 91 4.5 L 57 4.5 C 50 4.5 45 11 38 11 L 9 11 C 4 11 0.5 14 0.5 18 L 0.5 92 Z"
                            fill="none"
                            stroke={theme.borderColor}
                            strokeWidth="1.5"
                            vectorEffect="non-scaling-stroke"
                        />
                    </svg>

                    <div className={`p-8 flex flex-col justify-between h-full select-none pt-[60px] pb-6 transition-opacity duration-500 ease-out ${isTop ? 'opacity-100' : 'opacity-0'}`}>
                        {/* Title at the top-left */}
                        <div className="pr-4">
                            <h3 className={`text-[26px] font-extrabold tracking-tight leading-tight ${theme.textColor}`}>
                                {project.title}
                            </h3>
                        </div>

                        {/* Metadata at the bottom */}
                        <div className="flex flex-col items-start gap-0.5">
                            <span className={`text-[13px] font-bold tracking-wide ${theme.subTextColor}`}>
                                {project.type}
                            </span>
                            <span className={`text-[12px] font-semibold ${theme.metaTextColor}`}>
                                {project.date}
                            </span>
                        </div>
                    </div>
                </div>
            </div>
        </motion.div>
    );
}
