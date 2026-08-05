"use client";

import React from "react";
import {
    UserPlus,
    Radio,
    Reply,
    Share2,
    Upload,
    Download,
    Mic,
    Camera,
    Paperclip,
    Edit3,
    Trash2,
    Send,
    Plus,
    Check,
    LucideProps
} from "lucide-react";
import { IconProps } from "./navigation";

// ─── ACTION SCALE: DEFAULT 20px - 24px, STROKE WIDTH 1.5 ─────

export function ActionAddMember({ size = 20, strokeWidth = 1.5, className = "", ...props }: IconProps) {
    return <UserPlus size={size} strokeWidth={strokeWidth} className={className} aria-label="Add Member" {...props} />;
}

export function ActionPing({ size = 20, strokeWidth = 1.5, className = "", ...props }: IconProps) {
    return <Radio size={size} strokeWidth={strokeWidth} className={className} aria-label="Ping Team" {...props} />;
}

export function ActionReply({ size = 20, strokeWidth = 1.5, className = "", ...props }: IconProps) {
    return <Reply size={size} strokeWidth={strokeWidth} className={className} aria-label="Reply" {...props} />;
}

export function ActionShare({ size = 20, strokeWidth = 1.5, className = "", ...props }: IconProps) {
    return <Share2 size={size} strokeWidth={strokeWidth} className={className} aria-label="Share" {...props} />;
}

export function ActionUpload({ size = 20, strokeWidth = 1.5, className = "", ...props }: IconProps) {
    return <Upload size={size} strokeWidth={strokeWidth} className={className} aria-label="Upload" {...props} />;
}

export function ActionDownload({ size = 20, strokeWidth = 1.5, className = "", ...props }: IconProps) {
    return <Download size={size} strokeWidth={strokeWidth} className={className} aria-label="Download" {...props} />;
}

export function ActionVoice({ size = 20, strokeWidth = 1.5, className = "", ...props }: IconProps) {
    return <Mic size={size} strokeWidth={strokeWidth} className={className} aria-label="Voice" {...props} />;
}

export function ActionCamera({ size = 20, strokeWidth = 1.5, className = "", ...props }: IconProps) {
    return <Camera size={size} strokeWidth={strokeWidth} className={className} aria-label="Camera" {...props} />;
}

export function ActionAttach({ size = 20, strokeWidth = 1.5, className = "", ...props }: IconProps) {
    return <Paperclip size={size} strokeWidth={strokeWidth} className={className} aria-label="Attach File" {...props} />;
}

export function ActionEdit({ size = 20, strokeWidth = 1.5, className = "", ...props }: IconProps) {
    return <Edit3 size={size} strokeWidth={strokeWidth} className={className} aria-label="Edit" {...props} />;
}

export function ActionDelete({ size = 20, strokeWidth = 1.5, className = "", ...props }: IconProps) {
    return <Trash2 size={size} strokeWidth={strokeWidth} className={className} aria-label="Delete" {...props} />;
}

export function ActionSend({ size = 20, strokeWidth = 1.5, className = "", ...props }: IconProps) {
    return <Send size={size} strokeWidth={strokeWidth} className={className} aria-label="Send" {...props} />;
}

export function ActionPlus({ size = 20, strokeWidth = 1.5, className = "", ...props }: IconProps) {
    return <Plus size={size} strokeWidth={strokeWidth} className={className} aria-label="Add" {...props} />;
}

export function ActionCheck({ size = 20, strokeWidth = 1.5, className = "", ...props }: IconProps) {
    return <Check size={size} strokeWidth={strokeWidth} className={className} aria-label="Confirm" {...props} />;
}
