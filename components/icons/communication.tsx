"use client";

import React from "react";
import {
    Mail,
    MessageSquare,
    Users,
    CreditCard,
    ShieldCheck,
    RefreshCw,
    LucideProps
} from "lucide-react";
import { IconProps } from "./navigation";

export function CommEmail({ size = 20, strokeWidth = 1.5, className = "", ...props }: IconProps) {
    return <Mail size={size} strokeWidth={strokeWidth} className={className} aria-label="Email" {...props} />;
}

export function CommSlack({ size = 20, strokeWidth = 1.5, className = "", ...props }: IconProps) {
    return <MessageSquare size={size} strokeWidth={strokeWidth} className={className} aria-label="Slack Message" {...props} />;
}

export function CommTeams({ size = 20, strokeWidth = 1.5, className = "", ...props }: IconProps) {
    return <Users size={size} strokeWidth={strokeWidth} className={className} aria-label="Teams Channel" {...props} />;
}

export function CommBilling({ size = 20, strokeWidth = 1.5, className = "", ...props }: IconProps) {
    return <CreditCard size={size} strokeWidth={strokeWidth} className={className} aria-label="Billing Alert" {...props} />;
}

export function CommSecurity({ size = 20, strokeWidth = 1.5, className = "", ...props }: IconProps) {
    return <ShieldCheck size={size} strokeWidth={strokeWidth} className={className} aria-label="Security Check" {...props} />;
}

export function CommSync({ size = 20, strokeWidth = 1.5, className = "", ...props }: IconProps) {
    return <RefreshCw size={size} strokeWidth={strokeWidth} className={className} aria-label="Syncing" {...props} />;
}
