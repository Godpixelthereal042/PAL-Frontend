"use client";

import React from "react";
import {
    TrendingUp,
    Zap,
    Target,
    Activity,
    PieChart,
    Layers,
    LucideProps
} from "lucide-react";
import { IconProps } from "./navigation";

export function AnalyticsTrending({ size = 18, strokeWidth = 1.5, className = "", ...props }: IconProps) {
    return <TrendingUp size={size} strokeWidth={strokeWidth} className={className} aria-label="Trending" {...props} />;
}

export function AnalyticsExecution({ size = 18, strokeWidth = 1.5, className = "", ...props }: IconProps) {
    return <Zap size={size} strokeWidth={strokeWidth} className={className} aria-label="Execution Rate" {...props} />;
}

export function AnalyticsTarget({ size = 18, strokeWidth = 1.5, className = "", ...props }: IconProps) {
    return <Target size={size} strokeWidth={strokeWidth} className={className} aria-label="Target KPI" {...props} />;
}

export function AnalyticsHealth({ size = 18, strokeWidth = 1.5, className = "", ...props }: IconProps) {
    return <Activity size={size} strokeWidth={strokeWidth} className={className} aria-label="Health Score" {...props} />;
}

export function AnalyticsDistribution({ size = 18, strokeWidth = 1.5, className = "", ...props }: IconProps) {
    return <PieChart size={size} strokeWidth={strokeWidth} className={className} aria-label="Distribution" {...props} />;
}

export function AnalyticsLayers({ size = 18, strokeWidth = 1.5, className = "", ...props }: IconProps) {
    return <Layers size={size} strokeWidth={strokeWidth} className={className} aria-label="Layers" {...props} />;
}
