"use client";

interface MascotAvatarProps {
  className?: string;
  size?: number;
}

export default function MascotAvatar({ className = "w-full h-full", size }: MascotAvatarProps) {
  const style = size ? { width: size, height: size } : undefined;
  
  return (
    <div className={`relative overflow-hidden rounded-full ${className}`} style={style}>
      <svg className="w-full h-full" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
        {/* Sky blue background */}
        <rect width="40" height="40" fill="#51d4ff" />
        
        {/* Pixel-art character (Cryptopunk-style profile) */}
        
        {/* Glowing Gold Halo */}
        <ellipse cx="20" cy="5.5" rx="8" ry="1.8" stroke="#ffe000" strokeWidth="2" fill="none" />
        <ellipse cx="20" cy="5.5" rx="8" ry="1.8" stroke="#fff480" strokeWidth="0.8" fill="none" opacity="0.8" />
        
        {/* Hair / Cap (White Pixels) */}
        <rect x="12" y="9" width="16" height="2" fill="#ffffff" />
        <rect x="10" y="11" width="20" height="4" fill="#ffffff" />
        <rect x="9" y="15" width="3" height="4" fill="#ffffff" />
        <rect x="28" y="15" width="3" height="4" fill="#ffffff" />
        
        {/* Face (Skin Tone) */}
        <rect x="12" y="15" width="16" height="15" fill="#f5cab7" />
        <rect x="10" y="19" width="2" height="6" fill="#f5cab7" />
        <rect x="28" y="19" width="2" height="6" fill="#f5cab7" />

        {/* Cyberpunk Glasses (Cyan Frame + Black Lenses) */}
        {/* Top/Side Frames */}
        <rect x="10" y="17" width="20" height="1.5" fill="#00f0ff" />
        {/* Lenses */}
        <rect x="11" y="18.5" width="7" height="4" fill="#000000" />
        <rect x="22" y="18.5" width="7" height="4" fill="#000000" />
        {/* Center bridge */}
        <rect x="18" y="18.5" width="4" height="1.5" fill="#00f0ff" />
        {/* Glasses side temples */}
        <rect x="9" y="18.5" width="2" height="1.5" fill="#00f0ff" />
        <rect x="29" y="18.5" width="2" height="1.5" fill="#00f0ff" />

        {/* Mouth */}
        <rect x="18" y="26" width="4" height="1.2" fill="#e89e87" />

        {/* Neck */}
        <rect x="17" y="30" width="6" height="3" fill="#f5cab7" />

        {/* Clothing / Black Suit */}
        <rect x="8" y="33" width="24" height="7" fill="#141419" />
        
        {/* White shirt collar (V-neck) */}
        <path d="M16 33 L20 37.5 L24 33" stroke="#ffffff" strokeWidth="1.8" strokeLinecap="round" fill="none" />
      </svg>
    </div>
  );
}
