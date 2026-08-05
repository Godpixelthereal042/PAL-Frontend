"use client";

import React, { useState, useEffect } from "react";
import Sidebar from "@/components/executive/Sidebar";
import Header from "@/components/executive/Header";
import UniversalSearch from "@/components/executive/UniversalSearch";
import ChatScreen from "@/components/ChatScreen";
import { FolderKanban, Scale, Users, Calendar, Sparkles, MessageSquare, History, Plus } from "lucide-react";
import Link from "next/link";

export default function ChatPage() {
    return (
        <div className="min-h-screen bg-[#0B0F17] flex items-center justify-center">
            <ChatScreen />
        </div>
    );
}
