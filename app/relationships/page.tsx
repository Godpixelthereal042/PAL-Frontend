"use client";

import React, { useState, useEffect } from "react";
import Sidebar from "@/components/executive/Sidebar";
import Header from "@/components/executive/Header";
import UniversalSearch from "@/components/executive/UniversalSearch";
import ExecutiveCard from "@/components/executive/ExecutiveCard";
import StatusBadge from "@/components/executive/StatusBadge";
import HealthScoreRing from "@/components/executive/HealthScoreRing";
import TimelineFeed from "@/components/executive/TimelineFeed";
import { Users, Building, Sparkles, Plus, Calendar, Mail, Phone, Clock, ArrowRight } from "lucide-react";

export default function RelationshipsPage() {
    const [searchOpen, setSearchOpen] = useState(false);
    const [activeTab, setActiveTab] = useState<string>("All");
    const [people, setPeople] = useState<any[]>([]);
    const [insights, setInsights] = useState<any[]>([]);
    const [selectedPerson, setSelectedPerson] = useState<any>(null);
    const [timeline, setTimeline] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function loadData() {
            try {
                const res = await fetch("/api/relationships?type=context");
                const data = await res.json();
                if (data.success && data.context) {
                    setPeople(data.context.people || []);
                    setInsights(data.context.insights || []);
                    if (data.context.people.length > 0) {
                        loadPersonDetails(data.context.people[0].id);
                    }
                }
            } catch (err) {
                console.error("Failed to load relationship data:", err);
            } finally {
                setLoading(false);
            }
        }
        loadData();
    }, []);

    async function loadPersonDetails(id: string) {
        try {
            const res = await fetch(`/api/relationships/${id}`);
            const data = await res.json();
            if (data.success) {
                setSelectedPerson(data.person);
                setTimeline(data.timeline || []);
            }
        } catch (err) {
            console.error("Failed to load person details:", err);
        }
    }

    const categories = ["All", "Investor", "Client", "Partner", "Team Member", "Advisor", "Lead"];

    const filteredPeople =
        activeTab === "All" ? people : people.filter((p) => p.relationshipType === activeTab);

    return (
        <div className="min-h-screen bg-[#0B0F17] text-slate-100 flex flex-col md:flex-row antialiased font-sans">
            <Sidebar />

            <div className="flex-1 flex flex-col min-w-0">
                <Header onOpenSearch={() => setSearchOpen(true)} />

                <main className="flex-1 p-4 md:p-8 space-y-6 max-w-7xl w-full mx-auto">
                    {/* Header */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div>
                            <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-slate-100 flex items-center gap-2.5">
                                <Users className="w-7 h-7 text-purple-400" /> Executive Relationship Memory
                            </h1>
                            <p className="text-xs md:text-sm text-slate-400 mt-1">
                                Long-term organizational memory tracking stakeholders, recency, scores, and commitments.
                            </p>
                        </div>
                    </div>

                    {/* Category Tabs */}
                    <div className="flex items-center gap-2 border-b border-[#1E293B] pb-3 overflow-x-auto">
                        {categories.map((cat) => (
                            <button
                                key={cat}
                                onClick={() => setActiveTab(cat)}
                                className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
                                    activeTab === cat
                                        ? "bg-purple-600/20 text-purple-400 border border-purple-500/30"
                                        : "text-slate-400 hover:text-slate-200"
                                }`}
                            >
                                {cat}s
                            </button>
                        ))}
                    </div>

                    {/* 2-Column Inspector Layout */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        {/* Left Column: Stakeholder List */}
                        <div className="lg:col-span-1 space-y-3">
                            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                                Stakeholder Directory ({filteredPeople.length})
                            </h3>
                            <div className="space-y-2 max-h-[70vh] overflow-y-auto pr-1">
                                {filteredPeople.map((person) => (
                                    <div
                                        key={person.id}
                                        onClick={() => loadPersonDetails(person.id)}
                                        className={`
                                            p-3.5 rounded-2xl border cursor-pointer transition-all flex items-center justify-between gap-3
                                            ${
                                                selectedPerson?.id === person.id
                                                    ? "bg-purple-600/15 border-purple-500/40 shadow-md"
                                                    : "bg-[#131B2E] border-[#1E293B] hover:border-slate-700"
                                            }
                                        `}
                                    >
                                        <div className="min-w-0">
                                            <h4 className="text-sm font-semibold text-slate-100 truncate">{person.name}</h4>
                                            <p className="text-xs text-slate-400 truncate">
                                                {person.role || person.organizationName || person.relationshipType}
                                            </p>
                                        </div>

                                        <div className="text-right shrink-0">
                                            <StatusBadge label={person.status || "healthy"} variant={person.status} />
                                            <div className="text-[10px] text-slate-500 mt-1">
                                                Score: {person.score || 75}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Right Column: Stakeholder Inspector Panel */}
                        <div className="lg:col-span-2 space-y-6">
                            {selectedPerson ? (
                                <>
                                    {/* Stakeholder Detail Header Card */}
                                    <ExecutiveCard>
                                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                            <div className="space-y-1">
                                                <div className="flex items-center gap-3">
                                                    <h2 className="text-xl font-bold text-slate-100">
                                                        {selectedPerson.name}
                                                    </h2>
                                                    <StatusBadge
                                                        label={selectedPerson.relationshipType}
                                                        variant="info"
                                                    />
                                                </div>
                                                <p className="text-xs text-slate-400">
                                                    {selectedPerson.role} {selectedPerson.organizationId ? `at Organization` : ""}
                                                </p>
                                                <div className="flex items-center gap-4 text-xs text-slate-400 pt-2">
                                                    {selectedPerson.email && (
                                                        <span className="flex items-center gap-1">
                                                            <Mail className="w-3.5 h-3.5 text-blue-400" /> {selectedPerson.email}
                                                        </span>
                                                    )}
                                                    {selectedPerson.phone && (
                                                        <span className="flex items-center gap-1">
                                                            <Phone className="w-3.5 h-3.5 text-purple-400" /> {selectedPerson.phone}
                                                        </span>
                                                    )}
                                                </div>
                                            </div>

                                            {/* Score Ring */}
                                            <div className="shrink-0 flex items-center gap-3">
                                                <HealthScoreRing score={82} label="Score" size={90} />
                                            </div>
                                        </div>
                                    </ExecutiveCard>

                                    {/* Timeline & Audit History */}
                                    <ExecutiveCard title="Chronological Activity Timeline" subtitle="Meetings, decisions, tasks & interactions">
                                        {timeline.length === 0 ? (
                                            <p className="text-xs text-slate-500 py-4">No logged activity timeline yet.</p>
                                        ) : (
                                            <TimelineFeed
                                                items={timeline.map((t) => ({
                                                    id: t.id,
                                                    type: t.eventType === "relationship_created" ? "relationship" : t.eventType,
                                                    title: t.summary,
                                                    timestamp: t.timestamp,
                                                }))}
                                            />
                                        )}
                                    </ExecutiveCard>
                                </>
                            ) : (
                                <ExecutiveCard>
                                    <div className="py-12 text-center text-slate-500 text-sm">
                                        Select a stakeholder to view complete relationship memory timeline.
                                    </div>
                                </ExecutiveCard>
                            )}
                        </div>
                    </div>
                </main>
            </div>

            <UniversalSearch isOpen={searchOpen} onClose={() => setSearchOpen(false)} />
        </div>
    );
}
