import { NextResponse } from "next/server";
import { getDB } from "@/lib/db";

const getFallbackRoadmap = (goal: string, industry: string) => {
    const cleanGoal = goal.toLowerCase();
    
    if (cleanGoal.includes("agency") || cleanGoal.includes("design") || industry.toLowerCase().includes("technology")) {
        return {
            title: "Launch Design Agency",
            description: "Launch a modern, visual-first design and product consultancy agency.",
            goal: "Establish brand visual identity, core PRD specs, and secure first retainer clients.",
            priority: "High",
            due_date: new Date(Date.now() + 1000 * 60 * 60 * 24 * 30).toISOString().split('T')[0], // 30 days
            tasks: [
                { title: "Define Core Spec Docs", description: "Establish client onboarding templates and design spec documentation.", priority: "high", due_date: new Date(Date.now() + 1000 * 60 * 60 * 24 * 3).toISOString().split('T')[0] },
                { title: "Verify Dashboard Mockups", description: "Create visual interactive wireframes for agency landing layout.", priority: "medium", due_date: new Date(Date.now() + 1000 * 60 * 60 * 24 * 7).toISOString().split('T')[0] },
                { title: "Setup Database Connectors", description: "Integrate backoffice SQLite ledger to track client invoices.", priority: "high", due_date: new Date(Date.now() + 1000 * 60 * 60 * 24 * 10).toISOString().split('T')[0] },
                { title: "Draft Service Agreement", description: "Write client legal templates and retainer terms.", priority: "medium", due_date: new Date(Date.now() + 1000 * 60 * 60 * 24 * 14).toISOString().split('T')[0] },
                { title: "Social Outreach Sprint", description: "Identify and email 10 potential tech startup clients.", priority: "low", due_date: new Date(Date.now() + 1000 * 60 * 60 * 24 * 21).toISOString().split('T')[0] }
            ]
        };
    }

    // Default bakery/retail fallback
    return {
        title: "Launch Local Store",
        description: "Set up and launch a physical local store and brick-and-mortar storefront.",
        goal: "Secure business license, establish vendor relations, and host a opening day event.",
        priority: "High",
        due_date: new Date(Date.now() + 1000 * 60 * 60 * 24 * 45).toISOString().split('T')[0], // 45 days
        tasks: [
            { title: "Secure Business License", description: "Register the business entity and obtain local operational permits.", priority: "high", due_date: new Date(Date.now() + 1000 * 60 * 60 * 24 * 5).toISOString().split('T')[0] },
            { title: "Order Initial Inventory", description: "Establish partner supply chains and place first batch order.", priority: "high", due_date: new Date(Date.now() + 1000 * 60 * 60 * 24 * 12).toISOString().split('T')[0] },
            { title: "Configure POS System", description: "Install check-out ledger machines and connect database nodes.", priority: "medium", due_date: new Date(Date.now() + 1000 * 60 * 60 * 24 * 20).toISOString().split('T')[0] },
            { title: "Visual Storefront Setup", description: "Design exterior signage and arrange internal display layout.", priority: "medium", due_date: new Date(Date.now() + 1000 * 60 * 60 * 24 * 30).toISOString().split('T')[0] }
        ]
    };
};

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { goal, industry, country, language } = body;

        if (!goal) {
            return NextResponse.json({ error: "Goal or business idea is required" }, { status: 400 });
        }

        const apiKey = process.env.GEMINI_API_KEY;
        if (!apiKey) {
            console.warn("Exposed GEMINI_API_KEY missing, using local template fallback.");
            return NextResponse.json(getFallbackRoadmap(goal, industry || "Technology"));
        }

        try {
            const systemPrompt = `You are PAL, the user's AI Co-Founder. The user wants to start a business or achieve a goal. 
Based on their goal, industry, and location, you must construct a structured project roadmap containing:
- Project Title
- Project Description
- Project Goal
- Project Priority (High, Medium, Low)
- Estimated Due Date (in YYYY-MM-DD format, roughly 30 days from today)
- A list of 4-5 concrete, actionable Tasks. Each task should have:
  - Title
  - Description
  - Priority: 'high' | 'medium' | 'low'
  - Due Date: (estimated due date in YYYY-MM-DD format)

Return JSON ONLY in this format, with no markdown backticks or triple-quotes:
{
  "title": "Project Title",
  "description": "Project Description",
  "goal": "Project Goal",
  "priority": "High",
  "due_date": "YYYY-MM-DD",
  "tasks": [
    {
      "title": "Task Title",
      "description": "Task Description",
      "priority": "high",
      "due_date": "YYYY-MM-DD"
    }
  ]
}`;

            const userPrompt = `Goal: "${goal}", Industry: "${industry || "Technology"}", Location: "${country || "United States"}", Language: "${language || "English"}"`;

            const res = await fetch(
                `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`,
                {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        contents: [
                            { role: "user", parts: [{ text: userPrompt }] }
                        ],
                        systemInstruction: {
                            parts: [{ text: systemPrompt }]
                        },
                        generationConfig: {
                            temperature: 0.2,
                            maxOutputTokens: 600,
                            responseMimeType: "application/json"
                        }
                    })
                }
            );

            if (res.ok) {
                const resData = await res.json();
                if (resData.error) {
                    console.error("Gemini API returned error payload during roadmap build:", resData.error);
                    throw new Error(resData.error.message || "Gemini API error payload");
                }
                const text = resData.candidates?.[0]?.content?.parts?.[0]?.text;
                if (text) {
                    const parsed = JSON.parse(text.trim());
                    return NextResponse.json(parsed);
                }
            }
            throw new Error("Gemini generation failed or returned invalid response");
        } catch (apiErr) {
            console.error("Gemini API error during roadmap build, falling back...", apiErr);
            return NextResponse.json(getFallbackRoadmap(goal, industry || "Technology"));
        }

    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
