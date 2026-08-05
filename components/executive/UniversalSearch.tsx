"use client";

import React, { useState, useEffect, useRef } from "react";
import { Search, X, FolderKanban, Users, Scale, ArrowRight } from "lucide-react";
import Link from "next/link";

interface UniversalSearchProps {
    isOpen: boolean;
    onClose: () => void;
}

export default function UniversalSearch({ isOpen, onClose }: UniversalSearchProps) {
    const [query, setQuery] = useState("");
    const [loading, setLoading] = useState(false);
    const [results, setResults] = useState<{
        people: any[];
        organizations: any[];
    }>({ people: [], organizations: [] });

    const inputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (isOpen) {
            setTimeout(() => inputRef.current?.focus(), 50);
        } else {
            setQuery("");
            setResults({ people: [], organizations: [] });
        }
    }, [isOpen]);

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
                e.preventDefault();
                if (isOpen) onClose();
                else {
                    window.dispatchEvent(new CustomEvent("open-universal-search"));
                }
            }
            if (e.key === "Escape" && isOpen) {
                onClose();
            }
        };

        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, [isOpen, onClose]);

    useEffect(() => {
        if (!query.trim()) {
            setResults({ people: [], organizations: [] });
            return;
        }

        const timer = setTimeout(async () => {
            setLoading(true);
            try {
                const res = await fetch(`/api/relationships/search?q=${encodeURIComponent(query)}`);
                const data = await res.json();
                if (data.success && data.results) {
                    setResults(data.results);
                }
            } catch (err) {
                console.error("Universal Search error:", err);
            } finally {
                setLoading(false);
            }
        }, 200);

        return () => clearTimeout(timer);
    }, [query]);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 bg-black/20 backdrop-blur-sm flex items-start justify-center pt-16 px-4">
            <div
                className="bg-white border border-[#EEF0F4] rounded-3xl shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[80vh] animate-in fade-in zoom-in-95 duration-150 text-[#1A1D26]"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Search Input Bar */}
                <div className="p-4 border-b border-[#EEF0F4] flex items-center gap-3">
                    <Search className="w-5 h-5 text-[#3B7BF6] shrink-0" />
                    <input
                        ref={inputRef}
                        type="text"
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        placeholder="Search stakeholders, organizations, projects, decisions..."
                        className="bg-transparent text-[#1A1D26] placeholder-[#9CA3AF] text-base focus:outline-none w-full"
                    />
                    {query && (
                        <button onClick={() => setQuery("")} className="text-[#9CA3AF] hover:text-[#1A1D26] p-1">
                            <X className="w-4 h-4" />
                        </button>
                    )}
                    <button
                        onClick={onClose}
                        className="px-2.5 py-1 text-xs font-semibold text-[#7C8494] bg-[#F5F7FA] border border-[#E2E6ED] rounded-xl hover:text-[#1A1D26]"
                    >
                        ESC
                    </button>
                </div>

                {/* Results Section */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                    {loading ? (
                        <div className="py-8 text-center text-[#7C8494] text-sm animate-pulse">
                            Searching PAL Memory...
                        </div>
                    ) : !query.trim() ? (
                        <div className="py-8 text-center space-y-3">
                            <p className="text-xs font-bold uppercase tracking-wider text-[#9CA3AF]">Quick Jump</p>
                            <div className="flex flex-wrap items-center justify-center gap-2">
                                <Link
                                    href="/chat"
                                    onClick={onClose}
                                    className="px-3.5 py-2 rounded-2xl bg-[#F5F7FA] border border-[#E2E6ED] text-xs font-semibold text-[#5A6070] hover:text-[#3B7BF6] hover:border-[#C8DEFF] flex items-center gap-1.5 transition-all"
                                >
                                    <Search className="w-3.5 h-3.5 text-[#3B7BF6]" /> Ask AI COO
                                </Link>
                                <Link
                                    href="/projects"
                                    onClick={onClose}
                                    className="px-3.5 py-2 rounded-2xl bg-[#F5F7FA] border border-[#E2E6ED] text-xs font-semibold text-[#5A6070] hover:text-[#3B7BF6] hover:border-[#C8DEFF] flex items-center gap-1.5 transition-all"
                                >
                                    <FolderKanban className="w-3.5 h-3.5 text-[#6C5CE7]" /> Projects
                                </Link>
                                <Link
                                    href="/relationships"
                                    onClick={onClose}
                                    className="px-3.5 py-2 rounded-2xl bg-[#F5F7FA] border border-[#E2E6ED] text-xs font-semibold text-[#5A6070] hover:text-[#3B7BF6] hover:border-[#C8DEFF] flex items-center gap-1.5 transition-all"
                                >
                                    <Users className="w-3.5 h-3.5 text-[#EC4899]" /> Stakeholders
                                </Link>
                                <Link
                                    href="/decisions"
                                    onClick={onClose}
                                    className="px-3.5 py-2 rounded-2xl bg-[#F5F7FA] border border-[#E2E6ED] text-xs font-semibold text-[#5A6070] hover:text-[#3B7BF6] hover:border-[#C8DEFF] flex items-center gap-1.5 transition-all"
                                >
                                    <Scale className="w-3.5 h-3.5 text-[#22c55e]" /> Decision Log
                                </Link>
                            </div>
                        </div>
                    ) : results.people.length === 0 && results.organizations.length === 0 ? (
                        <div className="py-8 text-center text-[#7C8494] text-sm">
                            No matching results found for &quot;{query}&quot;.
                        </div>
                    ) : (
                        <>
                            {/* Stakeholders */}
                            {results.people.length > 0 && (
                                <div className="space-y-2">
                                    <h4 className="text-xs font-bold text-[#9CA3AF] uppercase tracking-wider flex items-center gap-1.5">
                                        <Users className="w-3.5 h-3.5 text-[#3B7BF6]" /> Stakeholders
                                    </h4>
                                    <div className="space-y-1.5">
                                        {results.people.map((person: any) => (
                                            <Link
                                                key={person.id}
                                                href={`/relationships?id=${person.id}`}
                                                onClick={onClose}
                                                className="flex items-center justify-between p-3 rounded-2xl bg-[#F5F7FA] hover:bg-[#EFF5FF] border border-[#E2E6ED] hover:border-[#C8DEFF] transition-all group"
                                            >
                                                <div>
                                                    <div className="text-sm font-semibold text-[#1A1D26] group-hover:text-[#3B7BF6] transition-colors">
                                                        {person.name}
                                                    </div>
                                                    <div className="text-xs text-[#7C8494]">
                                                        {person.role || person.relationshipType}
                                                    </div>
                                                </div>
                                                <ArrowRight className="w-4 h-4 text-[#9CA3AF] group-hover:text-[#3B7BF6] transition-colors" />
                                            </Link>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Organizations */}
                            {results.organizations.length > 0 && (
                                <div className="space-y-2">
                                    <h4 className="text-xs font-bold text-[#9CA3AF] uppercase tracking-wider flex items-center gap-1.5">
                                        <FolderKanban className="w-3.5 h-3.5 text-[#6C5CE7]" /> Organizations
                                    </h4>
                                    <div className="space-y-1.5">
                                        {results.organizations.map((org: any) => (
                                            <Link
                                                key={org.id}
                                                href={`/relationships?orgId=${org.id}`}
                                                onClick={onClose}
                                                className="flex items-center justify-between p-3 rounded-2xl bg-[#F5F7FA] hover:bg-[#F4F0FF] border border-[#E2E6ED] hover:border-[#DDD0FD] transition-all group"
                                            >
                                                <div>
                                                    <div className="text-sm font-semibold text-[#1A1D26] group-hover:text-[#6C5CE7] transition-colors">
                                                        {org.name}
                                                    </div>
                                                    <div className="text-xs text-[#7C8494]">
                                                        {org.industry || "Organization"}
                                                    </div>
                                                </div>
                                                <ArrowRight className="w-4 h-4 text-[#9CA3AF] group-hover:text-[#6C5CE7] transition-colors" />
                                            </Link>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}
