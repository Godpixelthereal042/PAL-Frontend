"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import BusinessBrainForm from "@/components/BusinessBrainForm";
import BottomNav from "@/components/BottomNav";

export default function BusinessBrainPage() {
    const router = useRouter();

    return (
        <div className="phone-stage">
            <section className="phone" aria-label="Business Brain">
                {/* Header */}
                <div
                    className="flex items-center gap-[12px] px-[20px] pt-[16px] pb-[12px]"
                    style={{ color: "var(--app-text)" }}
                >
                    <button
                        type="button"
                        onClick={() => router.back()}
                        className="cursor-pointer"
                        aria-label="Go back"
                    >
                        <ArrowLeft size={20} />
                    </button>
                    <h1 className="text-[18px] font-bold">Business Brain</h1>
                </div>

                {/* Scrollable Content */}
                <div
                    className="overflow-y-auto scrollbar-hide px-[20px] pb-[100px]"
                    style={{ height: "calc(100% - 56px - 70px)" }}
                >
                    <BusinessBrainForm mode="edit" />
                </div>

                <BottomNav />
            </section>
        </div>
    );
}
