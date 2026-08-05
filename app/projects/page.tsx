"use client";

import React from "react";
import ProjectsScreen from "@/components/ProjectsScreen";

export default function ProjectsPage() {
    return (
        <div className="min-h-screen bg-[#050505] flex items-center justify-center">
            {/* Mobile constraint container for desktop view */}
            <div className="w-full max-w-[430px] h-full min-h-screen sm:min-h-[850px] sm:max-h-[90vh] sm:rounded-[40px] sm:border-[8px] sm:border-[#1a1a1c] overflow-hidden shadow-2xl relative bg-[var(--app-bg)]">
                <ProjectsScreen />
            </div>
        </div>
    );
}
