"use client";

import React, { useState, useEffect } from "react";
import { 
    ArrowLeft, 
    Sparkles, 
    ShieldCheck, 
    RefreshCw, 
    X, 
    Check, 
    Mail, 
    Lock,
    ExternalLink,
    FileText,
    MessageSquare,
    Calendar,
    Users,
    Activity,
    AlertCircle,
    BarChart2,
    Layers,
    GitBranch,
    FolderGit2,
    CheckCircle2,
    Clock,
    TrendingUp,
    Trophy,
    Share2,
    Zap,
    ThumbsUp,
    Eye,
    MessageCircle,
    Send
} from "lucide-react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import BottomNav from "./BottomNav";
import { motion, AnimatePresence } from "framer-motion";

// ─── BRAND SVG ICONS ──────────────────────────────────────────

function GoogleIcon({ className = "w-5 h-5" }: { className?: string }) {
    return (
        <svg className={className} viewBox="0 0 24 24">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
        </svg>
    );
}

function XIcon({ className = "w-5 h-5" }: { className?: string }) {
    return (
        <svg className={className} viewBox="0 0 24 24" fill="currentColor">
            <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
        </svg>
    );
}

function GitHubIcon({ className = "w-5 h-5" }: { className?: string }) {
    return (
        <svg className={className} viewBox="0 0 24 24" fill="currentColor">
            <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
        </svg>
    );
}

function InstagramIcon({ className = "w-5 h-5" }: { className?: string }) {
    return (
        <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
            <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
            <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
        </svg>
    );
}

function LinkedInIcon({ className = "w-5 h-5" }: { className?: string }) {
    return (
        <svg className={className} viewBox="0 0 24 24" fill="currentColor">
            <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.46 10.9v8.37H9.25V10.9H6.46M7.86 6.72a1.47 1.47 0 1 0 0 2.94 1.47 1.47 0 0 0 0-2.94z" />
        </svg>
    );
}

function NotionIcon({ className = "w-5 h-5" }: { className?: string }) {
    return (
        <svg className={className} viewBox="0 0 24 24" fill="currentColor">
            <path d="M4.459 4.208c.746.606 1.026.56 2.428.466l11.413-.746c.327 0 .233-.28-.047-.373L15.938 2.06c-.42-.327-.98-.466-1.586-.42L3.899 2.62c-.606.047-.98.373-.84.933l1.4 1.4-1.4.155zM6.42 7.054v14.071c0 .84.373 1.166 1.306 1.12l12.861-.793c.933-.047 1.166-.513 1.166-1.306V6.074c0-.793-.327-1.12-1.12-1.073L7.586 5.841c-.933.047-1.166.42-1.166 1.213zm12.394 1.633l-5.6 7.606h-2.52l-2.8-5.32v6.626h-2.1V9.014h2.52l3.173 5.88 4.76-6.207h2.567z" />
        </svg>
    );
}

function SlackIcon({ className = "w-5 h-5" }: { className?: string }) {
    return (
        <svg className={className} viewBox="0 0 24 24" fill="none">
            <path d="M5.042 15.165a1.828 1.828 0 1 1-1.829-1.828h1.829v1.828zm0 1.22a1.828 1.828 0 0 1 1.828-1.828h5.485a1.828 1.828 0 1 1 0 3.656H8.09a1.828 1.828 0 0 1-1.828-1.828z" fill="#36C5F0"/>
            <path d="M8.87 5.042a1.828 1.828 0 1 1 1.829-1.829v1.829H8.87zm0 1.22a1.828 1.828 0 0 1 1.829 1.828v5.486a1.828 1.828 0 1 1-3.657 0V8.09a1.828 1.828 0 0 1 1.828-1.828z" fill="#2EB67D"/>
            <path d="M18.958 8.87a1.828 1.828 0 1 1 1.829 1.829h-1.829V8.87zm-1.22 0a1.828 1.828 0 0 1-1.828 1.829h-5.486a1.828 1.828 0 1 1 0-3.657h5.486a1.828 1.828 0 0 1 1.828 1.828z" fill="#E01E5A"/>
            <path d="M15.13 18.958a1.828 1.828 0 1 1-1.829 1.829v-1.829h1.829zm0-1.22a1.828 1.828 0 0 1-1.829-1.828v-5.486a1.828 1.828 0 1 1 3.657 0v5.486a1.828 1.828 0 0 1-1.828 1.828z" fill="#ECB22E"/>
        </svg>
    );
}

function FacebookIcon({ className = "w-5 h-5" }: { className?: string }) {
    return (
        <svg className={className} viewBox="0 0 24 24" fill="#1877F2">
            <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
        </svg>
    );
}

function AppleIcon({ className = "w-5 h-5" }: { className?: string }) {
    return (
        <svg className={className} viewBox="0 0 24 24" fill="currentColor">
            <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M15.97 6.33c.62-.76 1.05-1.82.93-2.88-.91.04-2.03.61-2.68 1.37-.58.67-.9 1.76-.76 2.8.91.07 1.89-.52 2.51-1.29z" />
        </svg>
    );
}

// ─── PROVIDER CONFIGURATION MATRIX ──────────────────────────

interface ProviderBadge {
    icon: any;
    label: string;
    value: string;
    color: string;
}

interface TopContentItem {
    rank: number;
    title: string;
    metric: string;
    engagement: string;
    badge: string;
}

interface ProviderConfig {
    id: string;
    name: string;
    title: string;
    headline: string;
    subtext: string;
    brandColor: string;
    brandGlow: string;
    ctaText: string;
    ctaBg: string;
    Icon: any;
    heroBadges: ProviderBadge[];
    analytics: {
        account: string;
        primaryMetricLabel: string;
        primaryMetricValue: string;
        primaryMetricChange: string;
        sparklineData: Record<string, { path: string; fillPath: string; dotX: number; dotY: number }>;
        kpis: { label: string; value: string; change: string; icon: any }[];
        topContent: TopContentItem[];
        authorityScore: number;
        authorityChange: string;
        aiBubbleText: string;
        recommendations: { text: string; actionPrompt: string; primary?: boolean }[];
    };
}

const PROVIDER_CONFIGS: Record<string, ProviderConfig> = {
    facebook: {
        id: "facebook",
        name: "Facebook",
        title: "Facebook Social Analytics",
        headline: "Connect your Facebook Page",
        subtext: "Track post reach, campaign conversions, and audience engagement.",
        brandColor: "bg-blue-600",
        brandGlow: "from-blue-600/30 via-indigo-600/20 to-[#1877F2]/30",
        ctaText: "Continue with Facebook",
        ctaBg: "bg-[#1877F2] text-white hover:bg-[#1566d2]",
        Icon: FacebookIcon,
        heroBadges: [
            { icon: BarChart2, label: "Reach", value: "18.4K", color: "text-blue-400 bg-blue-500/10 border-blue-500/20" },
            { icon: Activity, label: "Engagement", value: "+24.2%", color: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20" },
            { icon: Users, label: "Followers", value: "4.2K total", color: "text-purple-400 bg-purple-500/10 border-purple-500/20" },
            { icon: Sparkles, label: "Top Time", value: "Thu 6 PM", color: "text-amber-400 bg-amber-500/10 border-amber-500/20" },
        ],
        analytics: {
            account: "facebook.com/pal.app.official",
            primaryMetricLabel: "Total Reach & Impressions",
            primaryMetricValue: "18,420",
            primaryMetricChange: "+24.8% vs last month",
            sparklineData: {
                "1D": { path: "M 10 70 C 60 65, 120 40, 180 50 S 260 30, 320 25 S 380 18, 410 12", fillPath: "M 10 70 C 60 65, 120 40, 180 50 S 260 30, 320 25 S 380 18, 410 12 L 410 90 L 10 90 Z", dotX: 410, dotY: 12 },
                "1W": { path: "M 10 80 C 80 60, 140 70, 200 40 S 300 25, 410 15", fillPath: "M 10 80 C 80 60, 140 70, 200 40 S 300 25, 410 15 L 410 90 L 10 90 Z", dotX: 410, dotY: 15 },
                "1M": { path: "M 10 75 C 90 55, 160 45, 240 30 S 340 20, 410 10", fillPath: "M 10 75 C 90 55, 160 45, 240 30 S 340 20, 410 10 L 410 90 L 10 90 Z", dotX: 410, dotY: 10 },
                "1Y": { path: "M 10 85 C 100 70, 180 50, 260 35 S 350 18, 410 8", fillPath: "M 10 85 C 100 70, 180 50, 260 35 S 350 18, 410 8 L 410 90 L 10 90 Z", dotX: 410, dotY: 8 },
            },
            kpis: [
                { label: "Page Reach", value: "18.4K", change: "+24.8%", icon: Eye },
                { label: "Engagement Rate", value: "5.2%", change: "+1.8%", icon: ThumbsUp },
                { label: "Reels Views", value: "12.8K", change: "+42%", icon: Activity },
                { label: "Profile Visits", value: "1.4K", change: "+14%", icon: Users },
            ],
            topContent: [
                { rank: 1, title: "Base App Launch Showcase", metric: "8.4K views", engagement: "6.2% CTR", badge: "Highest Reach" },
                { rank: 2, title: "Co-Founder AI Feature Demo", metric: "4.2K views", engagement: "4.8% CTR", badge: "Most Shared" },
                { rank: 3, title: "Q3 Product Update Teaser", metric: "2.8K views", engagement: "3.9% CTR", badge: "Trending" },
            ],
            authorityScore: 88,
            authorityChange: "+4.2% last month",
            aiBubbleText: "Awesome! Engagement increased 24% this week. Thursday at 6 PM is your optimal posting time. 2 posts are currently trending.",
            recommendations: [
                { text: "Publish Follow-up Reel Tomorrow at 6 PM", actionPrompt: "Let me draft a script for a follow-up Reel to post tomorrow at 6 PM.", primary: true },
                { text: "Reply to 14 Unread Page Comments", actionPrompt: "Summarize the 14 unread comments on our Facebook page and draft replies.", primary: false },
                { text: "Boost Top Performing 'Base App Launch' Reel", actionPrompt: "Calculate ROI recommendation for boosting the 'Base App Launch' post.", primary: false },
            ]
        }
    },
    x: {
        id: "x",
        name: "X (Twitter)",
        title: "X Tweet Analytics",
        headline: "Connect your X account",
        subtext: "Let PAL monitor your growth, engagement, and content performance.",
        brandColor: "bg-zinc-100",
        brandGlow: "from-sky-500/30 via-purple-600/20 to-zinc-700/30",
        ctaText: "Continue with X",
        ctaBg: "bg-white text-black hover:bg-zinc-200",
        Icon: XIcon,
        heroBadges: [
            { icon: BarChart2, label: "Impressions", value: "24.8K", color: "text-sky-400 bg-sky-500/10 border-sky-500/20" },
            { icon: Activity, label: "Engagement", value: "+40.2%", color: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20" },
            { icon: Users, label: "Followers", value: "1.8K active", color: "text-purple-400 bg-purple-500/10 border-purple-500/20" },
            { icon: Sparkles, label: "Auto-Thread", value: "Ready", color: "text-amber-400 bg-amber-500/10 border-amber-500/20" },
        ],
        analytics: {
            account: "@emmanuel_pal",
            primaryMetricLabel: "Weekly Tweet Impressions",
            primaryMetricValue: "24,850",
            primaryMetricChange: "+40.2% vs last month",
            sparklineData: {
                "1D": { path: "M 10 75 C 70 60, 140 45, 210 50 S 310 30, 410 14", fillPath: "M 10 75 C 70 60, 140 45, 210 50 S 310 30, 410 14 L 410 90 L 10 90 Z", dotX: 410, dotY: 14 },
                "1W": { path: "M 10 82 C 90 65, 170 50, 250 30 S 350 18, 410 10", fillPath: "M 10 82 C 90 65, 170 50, 250 30 S 350 18, 410 10 L 410 90 L 10 90 Z", dotX: 410, dotY: 10 },
                "1M": { path: "M 10 70 C 80 50, 160 35, 240 25 S 330 15, 410 8", fillPath: "M 10 70 C 80 50, 160 35, 240 25 S 330 15, 410 8 L 410 90 L 10 90 Z", dotX: 410, dotY: 8 },
                "1Y": { path: "M 10 88 C 100 70, 190 45, 270 30 S 360 12, 410 6", fillPath: "M 10 88 C 100 70, 190 45, 270 30 S 360 12, 410 6 L 410 90 L 10 90 Z", dotX: 410, dotY: 6 },
            },
            kpis: [
                { label: "Tweet Impressions", value: "24.8K", change: "+40.2%", icon: Eye },
                { label: "Engagement Rate", value: "4.8%", change: "+1.2%", icon: Activity },
                { label: "Profile Visits", value: "1.8K", change: "+15%", icon: Users },
                { label: "Retweets / Retweets", value: "340", change: "+28%", icon: Share2 },
            ],
            topContent: [
                { rank: 1, title: "Thread on Web3 Gas Optimizations", metric: "12.4K impr.", engagement: "5.8% ER", badge: "Viral Thread" },
                { rank: 2, title: "Autonomous AI Agents in 2026", metric: "6.8K impr.", engagement: "4.4% ER", badge: "Most Saved" },
                { rank: 3, title: "PAL v2.0 Architecture Deep Dive", metric: "3.4K impr.", engagement: "3.9% ER", badge: "Top Quote" },
            ],
            authorityScore: 92,
            authorityChange: "+6.8% last month",
            aiBubbleText: "Your thread on Web3 gas optimizations performed 40% above benchmark! 2 major tech founders quoted it today.",
            recommendations: [
                { text: "Generate 5-Part Follow-up Thread", actionPrompt: "Auto-generate a 5-part follow-up X thread based on our Web3 gas optimizations post.", primary: true },
                { text: "Schedule Daily Post for 10 AM", actionPrompt: "Schedule tomorrow's post on AI agent workflows for 10:00 AM.", primary: false },
                { text: "Engage with 5 High-Value Mentions", actionPrompt: "Show me the top 5 high-value mentions on X to reply to.", primary: false },
            ]
        }
    },
    github: {
        id: "github",
        name: "GitHub",
        title: "GitHub Developer Analytics",
        headline: "Connect GitHub",
        subtext: "Let PAL understand your codebase and help manage development.",
        brandColor: "bg-purple-600",
        brandGlow: "from-purple-600/30 via-zinc-700/30 to-blue-600/30",
        ctaText: "Continue with GitHub",
        ctaBg: "bg-[#2ea44f] text-white hover:bg-[#2c974b]",
        Icon: GitHubIcon,
        heroBadges: [
            { icon: FolderGit2, label: "Repos", value: "8 active", color: "text-purple-400 bg-purple-500/10 border-purple-500/20" },
            { icon: GitBranch, label: "Pull Requests", value: "3 open", color: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20" },
            { icon: AlertCircle, label: "Issues", value: "12 tracked", color: "text-amber-400 bg-amber-500/10 border-amber-500/20" },
            { icon: Activity, label: "Commits", value: "42 this week", color: "text-blue-400 bg-blue-500/10 border-blue-500/20" },
        ],
        analytics: {
            account: "github.com/emmanuel-pal",
            primaryMetricLabel: "Weekly Commit Velocity & PR Activity",
            primaryMetricValue: "42 Commits",
            primaryMetricChange: "+14.2% velocity",
            sparklineData: {
                "1D": { path: "M 10 70 C 60 50, 130 65, 200 35 S 310 20, 410 12", fillPath: "M 10 70 C 60 50, 130 65, 200 35 S 310 20, 410 12 L 410 90 L 10 90 Z", dotX: 410, dotY: 12 },
                "1W": { path: "M 10 80 C 80 60, 160 40, 240 25 S 340 15, 410 8", fillPath: "M 10 80 C 80 60, 160 40, 240 25 S 340 15, 410 8 L 410 90 L 10 90 Z", dotX: 410, dotY: 8 },
                "1M": { path: "M 10 75 C 90 55, 180 35, 270 20 S 350 10, 410 5", fillPath: "M 10 75 C 90 55, 180 35, 270 20 S 350 10, 410 5 L 410 90 L 10 90 Z", dotX: 410, dotY: 5 },
                "1Y": { path: "M 10 85 C 100 65, 190 40, 280 25 S 360 8, 410 4", fillPath: "M 10 85 C 100 65, 190 40, 280 25 S 360 8, 410 4 L 410 90 L 10 90 Z", dotX: 410, dotY: 4 },
            },
            kpis: [
                { label: "Active Repos", value: "8", change: "Synced", icon: FolderGit2 },
                { label: "Open PRs", value: "3", change: "Needs review", icon: GitBranch },
                { label: "Commits / Wk", value: "42", change: "+14.2%", icon: Activity },
                { label: "Code Quality", value: "98%", change: "Passing CI", icon: CheckCircle2 },
            ],
            topContent: [
                { rank: 1, title: "pal-frontend / main", metric: "42 commits", engagement: "3 open PRs", badge: "Primary Repo" },
                { rank: 2, title: "pal-action-engine", metric: "18 commits", engagement: "CI Passing", badge: "High Velocity" },
                { rank: 3, title: "pal-analytics-sdk", metric: "12 commits", engagement: "v1.4.0 Live", badge: "Stable" },
            ],
            authorityScore: 96,
            authorityChange: "+8.4% build health",
            aiBubbleText: "PR #42 has 2 unreviewed security changes. Code quality is at 98% with zero breaking regressions.",
            recommendations: [
                { text: "Run Automated Code Review for PR #42", actionPrompt: "Run an automated code review and security audit on PR #42.", primary: true },
                { text: "Auto-generate Release Notes for v1.4.0", actionPrompt: "Generate release notes for the v1.4.0 milestone from recent commits.", primary: false },
            ]
        }
    },
    google: {
        id: "google",
        name: "Google Workspace",
        title: "Google Workspace Intelligence",
        headline: "Connect your Google Workspace",
        subtext: "Let PAL organize your emails, calendar, files, and reminders.",
        brandColor: "bg-blue-500",
        brandGlow: "from-blue-600/30 via-red-500/20 to-yellow-500/30",
        ctaText: "Continue with Google",
        ctaBg: "bg-white text-black hover:bg-zinc-100",
        Icon: GoogleIcon,
        heroBadges: [
            { icon: Mail, label: "Gmail", value: "14 unread", color: "text-red-400 bg-red-500/10 border-red-500/20" },
            { icon: Calendar, label: "Calendar", value: "2 syncs today", color: "text-blue-400 bg-blue-500/10 border-blue-500/20" },
            { icon: FileText, label: "Drive & Docs", value: "88 indexed", color: "text-amber-400 bg-amber-500/10 border-amber-500/20" },
            { icon: ShieldCheck, label: "OAuth 2.0", value: "Verified", color: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20" },
        ],
        analytics: {
            account: "emmanuel@pal.ai",
            primaryMetricLabel: "Workspace Ingestions & Briefings",
            primaryMetricValue: "142 Threads",
            primaryMetricChange: "+18.5% productivity",
            sparklineData: {
                "1D": { path: "M 10 70 C 60 55, 120 40, 180 45 S 280 25, 410 12", fillPath: "M 10 70 C 60 55, 120 40, 180 45 S 280 25, 410 12 L 410 90 L 10 90 Z", dotX: 410, dotY: 12 },
                "1W": { path: "M 10 80 C 80 60, 160 45, 240 30 S 340 18, 410 10", fillPath: "M 10 80 C 80 60, 160 45, 240 30 S 340 18, 410 10 L 410 90 L 10 90 Z", dotX: 410, dotY: 10 },
                "1M": { path: "M 10 75 C 90 55, 170 35, 250 20 S 350 12, 410 6", fillPath: "M 10 75 C 90 55, 170 35, 250 20 S 350 12, 410 6 L 410 90 L 10 90 Z", dotX: 410, dotY: 6 },
                "1Y": { path: "M 10 85 C 100 65, 190 40, 280 20 S 360 8, 410 4", fillPath: "M 10 85 C 100 65, 190 40, 280 20 S 360 8, 410 4 L 410 90 L 10 90 Z", dotX: 410, dotY: 4 },
            },
            kpis: [
                { label: "Emails Analyzed", value: "142", change: "+18.5%", icon: Mail },
                { label: "Calendar Events", value: "28", change: "This week", icon: Calendar },
                { label: "Docs Indexed", value: "88", change: "Synced", icon: FileText },
                { label: "AI Briefings", value: "34", change: "Generated", icon: Sparkles },
            ],
            topContent: [
                { rank: 1, title: "AlphaCorp Q3 Pitch Briefing", metric: "14 emails", engagement: "High Priority", badge: "Client Lead" },
                { rank: 2, title: "Executive Product Specs v2.4", metric: "Doc Synced", engagement: "88 pages", badge: "Core Brief" },
                { rank: 3, title: "Sprint 8 Alignment Sync", metric: "Thu 10:00", engagement: "4 attendees", badge: "Upcoming" },
            ],
            authorityScore: 90,
            authorityChange: "+5.2% workflow score",
            aiBubbleText: "AlphaCorp is requesting a Q3 budget update. You also have 3 calendar overlaps on Thursday. Auto-reschedule?",
            recommendations: [
                { text: "Draft Q3 Budget Response for AlphaCorp", actionPrompt: "Draft an executive email response for the AlphaCorp budget request.", primary: true },
                { text: "Auto-Reschedule Thursday Overlaps", actionPrompt: "Reschedule my 3 conflicting meetings on Thursday to open focus time.", primary: false },
            ]
        }
    }
};

const DEFAULT_CONFIG: ProviderConfig = PROVIDER_CONFIGS.facebook;

import CommunicationWorkspace from "./CommunicationWorkspace";

const COMMUNICATION_PROVIDERS = new Set(["gmail", "slack", "outlook", "teams", "discord", "telegram", "apple"]);

interface ConnectScreenProps {
    source: string;
}

export default function ConnectScreen({ source }: ConnectScreenProps) {
    const router = useRouter();
    const currentSourceKey = (source || "facebook").toLowerCase();
    const config = PROVIDER_CONFIGS[currentSourceKey] || {
        ...DEFAULT_CONFIG,
        id: currentSourceKey,
        name: source.toUpperCase(),
        title: `${source.toUpperCase()} Platform Analytics`,
        headline: `Connect ${source.toUpperCase()}`,
        subtext: `Let PAL analyze your data and manage your ${source.toUpperCase()} workflow.`,
        ctaText: `Continue with ${source.toUpperCase()}`
    };

    const ProviderIcon = config.Icon;

    // State management
    const [isSynced, setIsSynced] = useState(false);
    const [isConnecting, setIsConnecting] = useState(false);
    const [connectingStep, setConnectingStep] = useState(0);
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [activeInterval, setActiveInterval] = useState<"1D" | "1W" | "1M" | "1Y">("1M");

    // Fetch initial status on mount
    useEffect(() => {
        async function fetchStatus() {
            try {
                const res = await fetch(`/api/integrations?source=${config.id}`);
                if (res.ok) {
                    const data = await res.json();
                    if (data && (data.isSynced === 1 || data.isSynced === true)) {
                        setIsSynced(true);
                    }
                }
            } catch (err) {
                console.error("Failed to fetch connection status", err);
            }
        }
        fetchStatus();
    }, [config.id]);

    // Handle OAuth Connect Action
    const handleStartConnect = async () => {
        setIsConnecting(true);
        setConnectingStep(1);

        setTimeout(() => {
            setConnectingStep(2);
        }, 800);

        setTimeout(async () => {
            setIsSynced(true);
            setIsConnecting(false);
            setConnectingStep(0);

            try {
                await fetch("/api/integrations", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ id: config.id, isSynced: true })
                });
            } catch (err) {
                console.error("Failed to save connection state", err);
            }
        }, 1800);
    };

    // Handle Disconnect Action
    const handleDisconnect = async () => {
        if (!confirm(`Are you sure you want to disconnect ${config.name}?`)) return;
        setIsSynced(false);
        try {
            await fetch("/api/integrations", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ id: config.id, isSynced: false })
            });
        } catch (err) {
            console.error("Failed to disconnect service", err);
        }
    };

    // Handle Refresh Sync
    const handleRefresh = () => {
        setIsRefreshing(true);
        setTimeout(() => {
            setIsRefreshing(false);
            alert(`${config.name} platform analytics updated!`);
        }, 1200);
    };

    const currentSparkline = config.analytics.sparklineData[activeInterval] || config.analytics.sparklineData["1M"];

    return (
        <div className="h-dvh bg-[var(--app-bg)] text-[var(--app-text)] w-full max-w-[430px] mx-auto relative shadow-2xl overflow-hidden selection:bg-blue-500/30 flex flex-col font-outfit">

            {/* ─── HEADER ───────────────────────────────────────────── */}
            <div className="flex justify-between items-center p-4 pt-5 pb-2 shrink-0 z-30 bg-[var(--app-header-bg)] backdrop-blur-md border-b border-[var(--app-card-border)]">
                <button
                    onClick={() => router.push("/")}
                    className="grid h-[40px] w-[40px] place-items-center rounded-full border border-[var(--app-card-border)] bg-[var(--app-card-alt)] text-[var(--app-text-secondary)] hover:text-white transition-colors cursor-pointer"
                    aria-label="Back to home"
                >
                    <ArrowLeft size={18} />
                </button>

                <div className="flex items-center gap-2">
                    <ProviderIcon className="w-5 h-5" />
                    <span className="text-sm font-bold text-white tracking-wide">{config.title}</span>
                </div>

                <button
                    onClick={() => router.push("/")}
                    className="grid h-[40px] w-[40px] place-items-center rounded-full border border-[var(--app-card-border)] bg-[var(--app-card-alt)] text-[var(--app-text-secondary)] hover:text-white transition-colors cursor-pointer"
                    aria-label="Close"
                >
                    <X size={18} />
                </button>
            </div>

            {/* ─── MAIN CONTENT VIEW ───────────────────────────────── */}
            <AnimatePresence mode="wait">

                {/* ══ VIEW 1: PRE-CONNECTION ONBOARDING SCREEN ════════ */}
                {!isSynced && !isConnecting && (
                    <motion.div
                        key="onboarding-view"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.3 }}
                        className="flex-1 overflow-y-auto px-4 pb-28 pt-3 flex flex-col justify-between scrollbar-hide"
                    >
                        <div className="space-y-6">

                            {/* ─── Custom Hero Artwork Container ──────────── */}
                            <div className="relative w-full rounded-[28px] p-6 overflow-hidden border border-[var(--app-card-border)] bg-[#0C1017] shadow-2xl flex flex-col items-center justify-center min-h-[220px]">

                                <div className={`absolute inset-0 bg-gradient-to-tr ${config.brandGlow} opacity-40 blur-2xl pointer-events-none`} />

                                <div className="absolute inset-0 bg-[radial-gradient(#ffffff_1px,transparent_1px)] [background-size:16px_16px] opacity-10 pointer-events-none" />

                                <div className="relative z-10 w-full max-w-[280px] bg-[#121722]/90 border border-white/10 rounded-2xl p-4 shadow-xl backdrop-blur-md text-center">
                                    <div className="w-14 h-14 rounded-2xl bg-[var(--app-card-alt)] border border-white/15 flex items-center justify-center mx-auto mb-3 shadow-lg">
                                        <ProviderIcon className="w-8 h-8" />
                                    </div>
                                    <h3 className="text-sm font-bold text-white tracking-wide">{config.name}</h3>
                                    <span className="text-[10px] text-blue-400 font-bold bg-blue-500/10 px-2 py-0.5 rounded-full border border-blue-500/20 mt-1 inline-block">
                                        PAL Analytics Node
                                    </span>
                                </div>

                                <div className="grid grid-cols-2 gap-2 w-full mt-4 relative z-10">
                                    {config.heroBadges.map((badge, idx) => {
                                        const BadgeIcon = badge.icon;
                                        return (
                                            <motion.div
                                                key={idx}
                                                initial={{ opacity: 0, scale: 0.9 }}
                                                animate={{ opacity: 1, scale: 1 }}
                                                transition={{ delay: 0.1 * idx, duration: 0.4 }}
                                                className={`p-2.5 rounded-xl border flex items-center gap-2 backdrop-blur-sm ${badge.color}`}
                                            >
                                                <BadgeIcon size={14} className="shrink-0" />
                                                <div className="flex flex-col min-w-0">
                                                    <span className="text-[9.5px] font-bold uppercase tracking-wider truncate">{badge.label}</span>
                                                    <span className="text-[10.5px] font-black text-white truncate">{badge.value}</span>
                                                </div>
                                            </motion.div>
                                        );
                                    })}
                                </div>

                            </div>

                            {/* ─── Dynamic Headline & Value Copy ──────────── */}
                            <div className="text-center px-2 space-y-2">
                                <h2 className="text-2xl font-black tracking-tight text-white leading-tight">
                                    {config.headline}
                                </h2>
                                <p className="text-xs text-[var(--app-text-secondary)] leading-relaxed max-w-[340px] mx-auto">
                                    {config.subtext}
                                </p>
                            </div>

                        </div>

                        {/* ─── Action Buttons Stack ───────────────────── */}
                        <div className="space-y-3 pt-6">

                            <button
                                type="button"
                                onClick={handleStartConnect}
                                className={`w-full h-[52px] rounded-full font-extrabold text-xs uppercase tracking-wider flex items-center justify-center gap-3 transition-all transform active:scale-95 shadow-xl cursor-pointer ${config.ctaBg}`}
                            >
                                <ProviderIcon className="w-5 h-5 shrink-0" />
                                <span>{config.ctaText}</span>
                            </button>

                            <button
                                type="button"
                                onClick={handleStartConnect}
                                className="w-full h-[48px] rounded-full bg-[var(--app-card-alt)] border border-[var(--app-card-border)] hover:border-zinc-600 text-zinc-300 hover:text-white font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all cursor-pointer"
                            >
                                <Mail size={16} className="text-zinc-400" />
                                <span>Continue with Email</span>
                            </button>

                            <div className="flex items-center justify-center gap-1.5 text-[10px] text-[var(--app-text-muted)] pt-1">
                                <Lock size={12} className="text-emerald-400" />
                                <span>256-bit encrypted connection. PAL only requests read access.</span>
                            </div>

                        </div>
                    </motion.div>
                )}

                {/* ══ VIEW 2: CONNECTING / OAUTH TRANSITION STATE ═══════ */}
                {isConnecting && (
                    <motion.div
                        key="connecting-view"
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        className="flex-1 px-4 flex flex-col items-center justify-center text-center space-y-6"
                    >
                        <div className="relative w-24 h-24 flex items-center justify-center">
                            <div className={`absolute inset-0 rounded-full ${config.brandColor} opacity-20 animate-ping`} />
                            <div className="w-20 h-20 rounded-full border-4 border-zinc-800 border-t-blue-500 animate-spin flex items-center justify-center" />
                            <ProviderIcon className="w-8 h-8 absolute" />
                        </div>

                        <div className="space-y-2">
                            <h3 className="text-lg font-bold text-white">
                                {connectingStep === 1 ? `Authenticating with ${config.name}...` : "Generating Platform Analytics..."}
                            </h3>
                            <p className="text-xs text-[var(--app-text-secondary)] max-w-[280px] mx-auto">
                                {connectingStep === 1 
                                    ? "Establishing secure OAuth token handshake with PAL Engine."
                                    : "Building intelligent analytics dashboard and content insights."}
                            </p>
                        </div>

                        <div className="flex items-center gap-2 bg-[var(--app-card-alt)] border border-[var(--app-card-border)] px-4 py-2 rounded-full text-xs text-blue-400 font-bold">
                            <RefreshCw size={14} className="animate-spin text-blue-400" />
                            <span>Computing platform performance engine</span>
                        </div>
                    </motion.div>
                )}

                {/* ══ VIEW 3: DEDICATED PLATFORM ANALYTICS WORKSPACE / COMMUNICATION WORKSPACE ════ */}
                {isSynced && !isConnecting && (
                    <motion.div
                        key="platform-analytics-workspace"
                        initial={{ opacity: 0, y: 15 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -15 }}
                        transition={{ duration: 0.4 }}
                        className="flex-1 overflow-y-auto px-4 pb-28 pt-3 space-y-4 scrollbar-hide"
                    >
                        {COMMUNICATION_PROVIDERS.has(config.id) ? (
                            <CommunicationWorkspace provider={config.id} />
                        ) : (
                            <>
                                {/* ─── 1. PLATFORM PERFORMANCE HERO ──────────────── */}
                                <div className="bg-[var(--app-card)] border border-[var(--app-card-border)] rounded-[28px] p-5 space-y-4 relative overflow-hidden">
                            
                            {/* Top Info Banner */}
                            <div className="flex justify-between items-start">
                                <div className="flex gap-2.5 items-center">
                                    <div className="w-10 h-10 rounded-[14px] bg-[var(--app-card-alt)] border border-[var(--app-card-border)] flex items-center justify-center shrink-0 shadow-md">
                                        <ProviderIcon className="w-6 h-6" />
                                    </div>
                                    <div>
                                        <h2 className="text-sm font-extrabold text-white">{config.name}</h2>
                                        <span className="text-[10px] text-[var(--app-text-secondary)] font-medium block">
                                            {config.analytics.account}
                                        </span>
                                    </div>
                                </div>

                                <div className="flex items-center gap-2">
                                    <button
                                        type="button"
                                        onClick={handleRefresh}
                                        className="p-2 rounded-full bg-[var(--app-card-alt)] border border-[var(--app-card-border)] text-[var(--app-text-muted)] hover:text-white transition-colors cursor-pointer"
                                        title="Refresh Analytics"
                                    >
                                        <RefreshCw size={14} className={isRefreshing ? "animate-spin text-blue-400" : ""} />
                                    </button>
                                </div>
                            </div>

                            {/* Headline Primary Metric + Time Filter Switcher */}
                            <div className="flex justify-between items-end pt-1">
                                <div>
                                    <span className="text-[10px] font-bold text-[var(--app-text-muted)] uppercase tracking-widest block">
                                        {config.analytics.primaryMetricLabel}
                                    </span>
                                    <div className="flex items-baseline gap-2 mt-1">
                                        <span className="text-3xl font-black tracking-tight text-white">
                                            {config.analytics.primaryMetricValue}
                                        </span>
                                        <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                                            {config.analytics.primaryMetricChange}
                                        </span>
                                    </div>
                                </div>

                                {/* Time Pills */}
                                <div className="flex bg-[var(--app-card-alt)] border border-[var(--app-card-border)] p-0.5 rounded-full">
                                    {(["1D", "1W", "1M", "1Y"] as const).map(interval => (
                                        <button
                                            key={interval}
                                            onClick={() => setActiveInterval(interval)}
                                            className={`px-2.5 py-0.5 rounded-full text-[9px] font-bold uppercase transition-all cursor-pointer ${
                                                activeInterval === interval
                                                    ? "bg-white text-black shadow-sm"
                                                    : "text-[var(--app-text-muted)] hover:text-white"
                                            }`}
                                        >
                                            {interval}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Animated SVG Sparkline Chart */}
                            <div className="h-[100px] w-full relative pt-1">
                                <svg className="w-full h-full" viewBox="0 0 420 100" preserveAspectRatio="none">
                                    <defs>
                                        <linearGradient id="provider-sparkline-fill" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="0%" stopColor="#2D7FE0" stopOpacity="0.3" />
                                            <stop offset="100%" stopColor="#2D7FE0" stopOpacity="0.0" />
                                        </linearGradient>
                                    </defs>

                                    <motion.path
                                        key={`fill-${activeInterval}`}
                                        d={currentSparkline.fillPath}
                                        fill="url(#provider-sparkline-fill)"
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        transition={{ duration: 0.5 }}
                                    />

                                    <motion.path
                                        key={`line-${activeInterval}`}
                                        d={currentSparkline.path}
                                        fill="none"
                                        stroke="#2D7FE0"
                                        strokeWidth="2.5"
                                        strokeLinecap="round"
                                        initial={{ pathLength: 0 }}
                                        animate={{ pathLength: 1 }}
                                        transition={{ duration: 0.7, ease: "easeOut" }}
                                    />

                                    <motion.circle
                                        key={`dot-${activeInterval}`}
                                        cx={currentSparkline.dotX}
                                        cy={currentSparkline.dotY}
                                        r="4"
                                        fill="#2D7FE0"
                                        stroke="var(--app-card)"
                                        strokeWidth="2"
                                        initial={{ scale: 0 }}
                                        animate={{ scale: 1 }}
                                        transition={{ delay: 0.7, type: "spring" }}
                                    />
                                </svg>
                            </div>

                        </div>

                        {/* ─── 2. OVERVIEW KPI BENTO GRID (2x2) ────────────── */}
                        <div className="grid grid-cols-2 gap-3">
                            {config.analytics.kpis.map((kpi, idx) => {
                                const KpiIcon = kpi.icon;
                                return (
                                    <motion.div
                                        key={idx}
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: 0.1 * idx }}
                                        className="bg-[var(--app-card)] border border-[var(--app-card-border)] rounded-[20px] p-4 flex flex-col justify-between"
                                    >
                                        <div className="flex items-center justify-between text-[var(--app-text-muted)]">
                                            <span className="text-[9px] uppercase tracking-wider font-bold truncate">{kpi.label}</span>
                                            <KpiIcon size={14} className="text-blue-400 shrink-0" />
                                        </div>
                                        <div className="mt-3">
                                            <span className="text-2xl font-black tracking-tight text-white block">{kpi.value}</span>
                                            <span className="text-[10px] font-bold text-emerald-400 mt-0.5 block">{kpi.change}</span>
                                        </div>
                                    </motion.div>
                                );
                            })}
                        </div>

                        {/* ─── 3. TOP PERFORMING CONTENT (CITATION / PODIUM) ─ */}
                        <div className="bg-[var(--app-card)] border border-[var(--app-card-border)] rounded-[24px] p-5 space-y-3.5">
                            <div className="flex justify-between items-center">
                                <div className="flex items-center gap-2">
                                    <Trophy size={16} className="text-amber-400" />
                                    <h3 className="text-xs font-bold uppercase tracking-wider text-white">Top Performing Content</h3>
                                </div>
                                <span className="text-[9.5px] font-bold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-full border border-amber-500/20">
                                    Leaderboard
                                </span>
                            </div>

                            <div className="space-y-2.5">
                                {config.analytics.topContent.map((item) => (
                                    <div
                                        key={item.rank}
                                        className="bg-[var(--app-card-alt)] border border-[var(--app-card-border)] rounded-xl p-3 flex items-center justify-between gap-3"
                                    >
                                        <div className="flex items-center gap-3 min-w-0">
                                            <div className={`w-7 h-7 rounded-full flex items-center justify-center font-black text-xs shrink-0 ${
                                                item.rank === 1 ? "bg-amber-400 text-black shadow-md shadow-amber-400/20" :
                                                item.rank === 2 ? "bg-zinc-300 text-black" :
                                                "bg-amber-700/60 text-amber-200"
                                            }`}>
                                                #{item.rank}
                                            </div>
                                            <div className="min-w-0">
                                                <h4 className="text-xs font-bold text-white truncate">{item.title}</h4>
                                                <span className="text-[10px] text-[var(--app-text-muted)] font-semibold mt-0.5 block">
                                                    {item.metric} • {item.engagement}
                                                </span>
                                            </div>
                                        </div>
                                        <span className="text-[9px] font-bold text-blue-400 bg-blue-500/10 border border-blue-500/20 px-2 py-1 rounded-full shrink-0">
                                            {item.badge}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* ─── 4. AI AUTHORITY SCORE & COMMENTARY BUBBLE ──── */}
                        <div className="bg-[var(--app-card)] border border-[var(--app-card-border)] rounded-[24px] p-5 space-y-4">
                            <div className="flex justify-between items-center">
                                <span className="text-[10px] font-bold text-[var(--app-text-muted)] uppercase tracking-widest">
                                    Platform Engagement Score
                                </span>
                                <span className="text-[10px] font-bold text-emerald-400">{config.analytics.authorityChange}</span>
                            </div>

                            {/* Semi-Circular Arc Gauge */}
                            <div className="flex flex-col items-center justify-center relative py-1">
                                <div className="relative w-36 h-20 flex items-end justify-center overflow-hidden">
                                    <svg viewBox="0 0 100 50" className="w-full h-full">
                                        <path
                                            d="M 10 45 A 35 35 0 0 1 90 45"
                                            fill="none"
                                            stroke="var(--app-card-alt)"
                                            strokeWidth="8"
                                            strokeLinecap="round"
                                        />
                                        <motion.path
                                            d="M 10 45 A 35 35 0 0 1 90 45"
                                            fill="none"
                                            stroke="#10B981"
                                            strokeWidth="8"
                                            strokeLinecap="round"
                                            strokeDasharray="110"
                                            initial={{ strokeDashoffset: 110 }}
                                            animate={{ strokeDashoffset: 110 - (110 * (config.analytics.authorityScore / 100)) }}
                                            transition={{ duration: 1.2, ease: "easeOut" }}
                                        />
                                    </svg>
                                    <div className="absolute bottom-0 text-center">
                                        <span className="text-2xl font-black text-white leading-none">{config.analytics.authorityScore}</span>
                                        <span className="text-[10px] text-[var(--app-text-muted)] font-bold block">/ 100</span>
                                    </div>
                                </div>
                            </div>

                            {/* Conversational PAL Commentary Bubble (Reference Style) */}
                            <div className="bg-[#0e1726] border border-blue-500/20 rounded-2xl p-3.5 flex gap-3 items-start relative">
                                <Sparkles size={16} className="text-blue-400 shrink-0 mt-0.5" />
                                <p className="text-xs text-blue-100/90 leading-relaxed font-medium">
                                    {config.analytics.aiBubbleText}
                                </p>
                            </div>
                        </div>

                        {/* ─── 5. ACTIONABLE RECOMMENDATIONS STACK ─────────── */}
                        <div className="space-y-2.5 pt-1">
                            <span className="text-[10px] font-bold text-[var(--app-text-muted)] uppercase tracking-widest pl-1 block">
                                Recommended Co-Founder Actions
                            </span>

                            {config.analytics.recommendations.map((rec, i) => (
                                <button
                                    key={i}
                                    type="button"
                                    onClick={() => {
                                        localStorage.setItem("chat_incoming_prompt", rec.actionPrompt);
                                        router.push("/chat");
                                    }}
                                    className={`w-full py-3.5 px-5 rounded-full text-xs font-bold uppercase tracking-wider flex items-center justify-between transition-all cursor-pointer shadow-lg active:scale-98 ${
                                        rec.primary
                                            ? "bg-blue-500 hover:bg-blue-600 text-white shadow-blue-500/20"
                                            : "bg-[var(--app-card-alt)] border border-[var(--app-card-border)] hover:border-zinc-500 text-white"
                                    }`}
                                >
                                    <span>{rec.text}</span>
                                    <Send size={14} className="shrink-0" />
                                </button>
                            ))}
                        </div>

                        {/* Disconnect Footer Option */}
                        <div className="pt-2 text-center">
                            <button
                                type="button"
                                onClick={handleDisconnect}
                                className="text-[11px] font-bold text-red-400/80 hover:text-red-400 uppercase tracking-wider cursor-pointer"
                            >
                                Disconnect {config.name} Node
                            </button>
                        </div>

                        </>
                    )}
                    </motion.div>
                )}

            </AnimatePresence>

            <BottomNav activePage="home" />
        </div>
    );
}
