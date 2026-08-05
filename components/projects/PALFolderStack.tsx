"use client";

import { useMotionValue, AnimatePresence } from "framer-motion";
import FolderLayer from "./FolderLayer";

export interface Project {
    id: number | string;
    title: string;
    type: string;
    description?: string;
    date: string;
    color: string;
    textColor: string;
}

export interface PALFolderStackProps {
    projects: Project[];
    onProjectsUpdate: (projects: Project[]) => void;
}

export default function PALFolderStack({ projects, onProjectsUpdate }: PALFolderStackProps) {
    const handleSwipe = () => {
        // Create a new array to trigger React state and Framer Motion layout animations
        const newProjects = [...projects];
        const movedItem = newProjects.shift();
        if (movedItem) newProjects.push(movedItem);
        
        // Notify parent to update the array
        onProjectsUpdate(newProjects);
    };

    return (
        <div className="relative w-full h-full max-w-[350px] mx-auto perspective-1000">
            <AnimatePresence>
                {projects.length > 0 ? (
                    projects.slice(0, 4).map((project, index) => (
                        <FolderLayer
                            key={project.id} // key MUST be tied to project ID so layout animation tracks it
                            project={project}
                            index={index}
                            onSwipe={handleSwipe}
                        />
                    )).reverse()
                ) : (
                    <div className="text-zinc-500 text-center mt-20 font-semibold">Loading projects...</div>
                )}
            </AnimatePresence>
        </div>
    );
}
