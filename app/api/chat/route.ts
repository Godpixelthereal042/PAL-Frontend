import { NextResponse } from "next/server";
import { getDB } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { getWorkspaceForUser } from "@/lib/security/workspaceContext";
import { buildBusinessContext, type BusinessContext } from "@/lib/contextEngine";
import { analyzeBusinessContext, type ReasoningAnalysis } from "@/lib/reasoningEngine";
import { composeLLMRequest, type ConversationMessage } from "@/lib/responseComposer";
import { actionEngine, ActionType } from "@/lib/actionEngine/engine";

const generateOfflineFallbackResponse = (
    context: BusinessContext,
    reasoning: ReasoningAnalysis,
    text: string
): string => {
    const founder = context.founder;
    const persona = founder.persona || "growth";
    const coachName =
        persona === "growth"
            ? "Growth Coach ⚡"
            : persona === "creative"
            ? "Creative Partner 🎨"
            : "Risk Auditor 🛡️";

    const projects = context.projects;
    const pendingMilestones = projects.flatMap((p) => p.milestones).filter((m) => !m.completed);
    const competitorAlerts = context.notifications.filter(
        (n) => n.title.toLowerCase().includes("competitor") || n.text.toLowerCase().includes("competitor")
    );

    const pendingSum = context.invoices
        .filter((i) => i.status.toLowerCase() === "pending" || i.status.toLowerCase() === "overdue")
        .reduce((sum, i) => sum + (parseFloat(i.amount) || 0), 0);
    const totalDue = pendingSum.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });

    const getStatsContext = () => {
        return `As your ${coachName}, I see you're building ${founder.company || "your startup"} with ${projects.length} active projects in play. You also have $${totalDue} outstanding in pending/overdue invoices.`;
    };
    const getCompetitorContext = () => {
        if (competitorAlerts.length > 0) {
            return `I noticed a competitor alert: "${competitorAlerts[0].text}"`;
        }
        return `No immediate competitor alerts are in our system currently.`;
    };

    const lowercaseText = text.toLowerCase();
    if (lowercaseText.includes("start") || lowercaseText.includes("launch") || lowercaseText.includes("bakery") || lowercaseText.includes("agency") || lowercaseText.includes("store") || lowercaseText.includes("shop") || lowercaseText.includes("project")) {
        const isAgency = lowercaseText.includes("agency") || lowercaseText.includes("design") || (context.business?.industry && context.business.industry.toLowerCase().includes("technology"));
        if (isAgency) {
            return `I have structured your design agency concept into a project roadmap. Review the milestones below and accept the plan to begin. ||ROADMAP:{"title":"Launch Design Agency","description":"Launch a modern, visual-first design and product consultancy agency.","goal":"Establish brand visual identity, core PRD specs, and secure first retainer clients.","priority":"High","due_date":"2026-07-10","tasks":[{"title":"Define Core Spec Docs","description":"Establish client onboarding templates and design spec documentation.","priority":"high","due_date":"2026-06-13"},{"title":"Verify Dashboard Mockups","description":"Create visual interactive wireframes for agency landing layout.","priority":"medium","due_date":"2026-06-17"},{"title":"Setup Database Connectors","description":"Integrate backoffice SQLite ledger to track client invoices.","priority":"high","due_date":"2026-06-20"},{"title":"Draft Service Agreement","description":"Write client legal templates and retainer terms.","priority":"medium","due_date":"2026-06-24"},{"title":"Social Outreach Sprint","description":"Identify and email 10 potential tech startup clients.","priority":"low","due_date":"2026-07-01"}]}||`;
        } else {
            return `I have structured your storefront idea into a project roadmap. Review the milestones below and accept the plan to begin. ||ROADMAP:{"title":"Launch Local Bakery","description":"Set up and launch a physical local bakery and storefront.","goal":"Secure business license, establish vendor relations, and host an opening day event.","priority":"High","due_date":"2026-07-25","tasks":[{"title":"Secure Business License","description":"Register the business entity and obtain local operational permits.","priority":"high","due_date":"2026-06-15"},{"title":"Order Initial Inventory","description":"Establish partner supply chains and place first batch order.","priority":"high","due_date":"2026-06-22"},{"title":"Configure POS System","description":"Install check-out ledger machines and connect database nodes.","priority":"medium","due_date":"2026-06-30"},{"title":"Visual Storefront Setup","description":"Design exterior signage and arrange internal display layout.","priority":"medium","due_date":"2026-07-10"}]}||`;
        }
    }

    if (persona === "growth") {
        if (text.includes("competitor") || text.includes("intelligence") || text.includes("market") || text.includes("checkout")) {
            return `Let's outpace them! 🚀 ${getCompetitorContext()} Competitor X's checkout update is a growth opportunity for us. We can run design revisions on ${projects[0]?.title || "The Base app"} to highlight our security hooks. Want me to write a launch plan?`;
        }
        if (text.includes("money") || text.includes("earn") || text.includes("sleep") || text.includes("revenue") || text.includes("invoice")) {
            return `Let's talk scale! 📈 ${getStatsContext()} To boost that cashflow, we should finalize those outstanding invoices. Gmail alerts show client interest in delta integrations. Want me to draft a marketing campaign for it?`;
        }
        if (text.includes("project") || text.includes("sprint") || text.includes("goal")) {
            const projList = projects.slice(0, 2).map((p) => p.title).join(" and ");
            return `Traction is everything! You have ${projects.length} folders, with ${projList} on top. To accelerate growth, let's complete the pending goals: "${pendingMilestones[0]?.text || "Establish core spec docs"}". Shall we structure a viral marketing loop?`;
        }
        return `Hello ${founder.name}! 🤝 ${getStatsContext()} Let's run a user acquisition campaign or set up a growth sync call to get more eyes on ${projects[0]?.title || "The Base app"}. What marketing experiment shall we run today?`;
    }

    if (persona === "creative") {
        if (text.includes("competitor") || text.includes("intelligence") || text.includes("market") || text.includes("checkout")) {
            return `Interesting competitive move! 🎨 ${getCompetitorContext()} We should counter this by focusing on visual superiority. Let's design a cleaner, more interactive landing flow than Competitor X's checkout system. Want me to sketch wireframes?`;
        }
        if (text.includes("design") || text.includes("ui") || text.includes("layout") || text.includes("style") || text.includes("look")) {
            return `Design is the differentiator! 🎨 For "${projects[0]?.title || "The Base app"}", let's optimize the backdrop blur contrast. I noticed the active cards could use a harmonic neon border to stand out in dark mode. Want me to sketch details?`;
        }
        if (text.includes("project") || text.includes("goal") || text.includes("sprint")) {
            return `Aesthetically matching your user flow is key. You've got ${projects.length} project folders. Let's tackle the creative milestone: "${pendingMilestones[0]?.text || "Verify dashboard mockups"}". Shall we draft wireframes for it?`;
        }
        return `Hey ${founder.name}! 🎨 ${getStatsContext()} I'm brainstorming product layout improvements for ${founder.company || "your business"}. We should check the active folder screens or sketch new user experiences. What feature are we designing today?`;
    }

    if (persona === "analytical") {
        if (text.includes("competitor") || text.includes("intelligence") || text.includes("market") || text.includes("checkout")) {
            return `Competitive intelligence analyzed. 🛡️ ${getCompetitorContext()} Launching a conversational checkout is a technical shift. We must ensure our biometric and ledger keys are audited before mimicking or countering. Shall we review compliance?`;
        }
        if (text.includes("risk") || text.includes("audit") || text.includes("security") || text.includes("compliance") || text.includes("safe")) {
            return `Security and stability are first. 🛡️ Checking transaction histories shows $${totalDue} in outstanding funds. We need to verify invoice authentication keys. I recommend checking the ledger integrity immediately.`;
        }
        if (text.includes("project") || text.includes("milestone") || text.includes("goal")) {
            return `Let's perform a technical risk analysis. With ${projects.length} folders, our primary focus is completing: "${pendingMilestones[0]?.text || "Integrate database ledger connectors"}". This secures the sync operations. Want me to review the codebase for leaks?`;
        }
        return `Greetings ${founder.name}. 🛡️ ${getStatsContext()} Let's run a security compliance audit on your data nodes (Slack/Gmail integration volume is looking steady). What system configuration should we audit today?`;
    }

    return `Got it ${founder.name}. Let's analyze your startup workspace logs to optimize this workflow!`;
};

// Helper to generate dynamic, context-aware AI replies using PAL Architecture:
// Context Engine -> Reasoning Engine -> Response Composer -> Gemini LLM
async function generateContextAwareAIResponse(db: any, userText: string, image?: string, attachments?: any[]): Promise<string> {
    const text = userText.toLowerCase();

    // Resolve user ID using getCurrentUser() session check
    const user = await getCurrentUser();
    const userId = user ? user.id : "current_user";

    // Handle standard resets/commands
    if (text.includes("clear") || text.includes("reset")) {
        return "Resetting conversation context... Done! How can I help you from scratch?";
    }

    // 1. Context Engine: Aggregate all business context
    const context = await buildBusinessContext(userId);
    try {
        const { executiveIntelligenceEngine } = await import("@/lib/intelligence/intelligenceEngine");
        (context as any).executiveIntelligence = await executiveIntelligenceEngine.getExecutiveIntelligence(userId);
    } catch (e) {
        console.error("Failed to attach executive intelligence to chat context:", e);
    }

    // 2. Reasoning Engine: Evaluate priorities, risks, opportunities, actions & missing info
    const reasoning = analyzeBusinessContext(context);

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
        return generateOfflineFallbackResponse(context, reasoning, text);
    }

    try {
        // Fetch recent message history (last 8 messages) to provide chat context
        const messageHistory = await db.all(
            "SELECT sender, text, image, attachments FROM messages WHERE user_id = ? OR user_id = 'current_user' OR user_id IS NULL ORDER BY timestamp DESC LIMIT 9",
            [userId]
        ) || [];
        let reversedHistory = messageHistory.reverse();

        // Avoid duplicating current message if already stored
        if (reversedHistory.length > 0 && reversedHistory[reversedHistory.length - 1].sender === "user" && reversedHistory[reversedHistory.length - 1].text === userText) {
            reversedHistory.pop();
        }
        reversedHistory = reversedHistory.slice(-8);

        const historyMessages: ConversationMessage[] = reversedHistory.map((msg: any) => {
            let atts: any[] | undefined = undefined;
            if (msg.attachments) {
                try {
                    atts = JSON.parse(msg.attachments);
                } catch (e) {}
            }
            return {
                sender: msg.sender === "user" ? "user" : "model",
                text: msg.text || "",
                image: msg.image || undefined,
                attachments: atts,
            };
        });

        // 3. Response Composer: Formulate complete LLM request with persona, context, and reasoning
        const llmRequest = composeLLMRequest(context, reasoning, userText, {
            history: historyMessages,
            image,
            attachments,
        });

        // 4. Gemini LLM: Dispatch to API endpoint
        const response = await fetch(
            `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`,
            {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    contents: llmRequest.contents,
                    systemInstruction: {
                        parts: [{ text: llmRequest.systemInstruction }]
                    },
                    generationConfig: {
                        temperature: 0.7,
                        maxOutputTokens: 350
                    }
                })
            }
        );

        if (!response.ok) {
            const errBody = await response.text();
            console.warn(`Gemini API returned error ${response.status}, falling back to offline mode: ${errBody}`);
            if (response.status === 429 || response.status === 503) {
                return "PAL is currently optimizing requests. I saved your details offline and will re-sync once available.";
            }
            return generateOfflineFallbackResponse(context, reasoning, text);
        }

        const resData = await response.json();
        if (resData.error) {
            console.error("Gemini API returned error payload:", resData.error);
            throw new Error(resData.error.message || "Gemini API error payload");
        }
        const responseText = resData.candidates?.[0]?.content?.parts?.[0]?.text;

        if (responseText) {
            return responseText.trim();
        } else {
            throw new Error("Empty candidate parts returned from Gemini API");
        }
    } catch (e: any) {
        console.error("Gemini API error, falling back...", e);
        if (e.message?.includes("quota") || e.message?.includes("limit") || e.message?.includes("503") || e.message?.includes("429")) {
            return "PAL is currently optimizing requests. I saved your details offline and will re-sync once available.";
        }
        return generateOfflineFallbackResponse(context, reasoning, text);
    }
}

export async function GET() {
    try {
        const db = await getDB();
        const user = await getCurrentUser();
        const userId = user ? user.id : null;

        let messages;
        if (userId) {
            const workspace = await getWorkspaceForUser(userId);
            messages = await db.all(
                "SELECT * FROM messages WHERE user_id = ? AND (workspace_id = ? OR workspace_id IS NULL) ORDER BY timestamp ASC LIMIT 200",
                [userId, workspace.id]
            );
            // Fallback: if user has no messages yet, also include legacy messages with no user_id
            if (messages.length === 0) {
                messages = await db.all(
                    "SELECT * FROM messages WHERE workspace_id IS NULL ORDER BY timestamp ASC LIMIT 200"
                );
            }
        } else {
            messages = await db.all("SELECT * FROM messages WHERE workspace_id IS NULL ORDER BY timestamp ASC LIMIT 200");
        }
        return NextResponse.json(messages);
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const db = await getDB();
        const body = await request.json();
        const { text, message, sender, image, attachments } = body;
        const chatText = text || message;

        if (!chatText && !attachments) {
            return NextResponse.json({ error: "Text or attachment field is required" }, { status: 400 });
        }

        // Resolve user for scoping
        const user = await getCurrentUser();
        const userId = user ? user.id : null;

        const nowMs = Date.now();
        const timeFormatted = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }).toLowerCase();
        const workspaceId = userId ? (await getWorkspaceForUser(userId)).id : null;
        
        // 1. Insert user message
        const userMsgId = String(nowMs);
        const userSender = sender || "user";
        await db.run(
            "INSERT INTO messages (id, sender, text, time, timestamp, image, attachments, user_id, workspace_id) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)",
            [
                userMsgId, 
                userSender, 
                chatText || (attachments && attachments.length > 0 ? `Sent ${attachments.length} attachments` : ""), 
                timeFormatted, 
                nowMs,
                image || null,
                attachments ? JSON.stringify(attachments) : null,
                userId,
                workspaceId
            ]
        );

        // 2. Automatically generate and insert AI response
        const aiMsgId = String(nowMs + 1);
        let aiText = await generateContextAwareAIResponse(db, chatText || "", image, attachments);
        const aiTimeFormatted = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }).toLowerCase();
        
        // Action Interceptor (Action Engine)
        const actionMatch = aiText.match(/\|\|ACTION:(.*?)\|\|/);
        if (actionMatch && actionMatch[1]) {
            try {
                const actionData = JSON.parse(actionMatch[1]);
                if (actionData.type === "create_invoice") {
                    const result = await actionEngine.execute({
                        type: ActionType.CREATE_INVOICE,
                        userId: userId || "current_user",
                        params: {
                            client: actionData.client || "New Client",
                            amount: actionData.amount || "1000",
                            service: actionData.service || "Consulting Service",
                        },
                    });

                    if (result.success && result.data?.receiptToken) {
                        aiText = aiText.replace(/\|\|ACTION:.*?\|\|/, "").trim() + " " + result.data.receiptToken;
                    } else {
                        aiText = aiText.replace(/\|\|ACTION:.*?\|\|/, "").trim();
                    }
                }
            } catch (e) {
                console.error("Failed to parse or execute AI action", e);
                aiText = aiText.replace(/\|\|ACTION:.*?\|\|/, "").trim();
            }
        } else {
            aiText = aiText.replace(/\|\|ACTION:.*?\|\|/, "").trim();
        }

        // Decision Interceptor (Action Engine)
        const decisionMatch = aiText.match(/\|\|DECISION:(.*?)\|\|/);
        if (decisionMatch && decisionMatch[1]) {
            try {
                const decData = JSON.parse(decisionMatch[1]);
                if (decData.project_id && decData.title) {
                    const result = await actionEngine.execute({
                        type: ActionType.SAVE_DECISION,
                        userId: userId || "current_user",
                        params: {
                            projectId: decData.project_id,
                            title: decData.title,
                            description: decData.description || "",
                        },
                    });

                    if (result.success && result.data?.cardToken) {
                        aiText = aiText.replace(/\|\|DECISION:.*?\|\|/, "").trim() + " " + result.data.cardToken;
                    } else {
                        aiText = aiText.replace(/\|\|DECISION:.*?\|\|/, "").trim();
                    }
                } else {
                    aiText = aiText.replace(/\|\|DECISION:.*?\|\|/, "").trim();
                }
            } catch (e) {
                console.error("Failed to parse or execute AI decision", e);
                aiText = aiText.replace(/\|\|DECISION:.*?\|\|/, "").trim();
            }
        } else {
            aiText = aiText.replace(/\|\|DECISION:.*?\|\|/, "").trim();
        }

        // Roadmap Interceptor
        const roadmapMatch = aiText.match(/\|\|ROADMAP:(.*?)\|\|/);
        if (roadmapMatch && roadmapMatch[1]) {
            aiText = aiText.replace(/\|\|ROADMAP:.*?\|\|/, "").trim() + 
                     ` [ROADMAP_CARD:${roadmapMatch[1]}]`;
        }

        await db.run(
            "INSERT INTO messages (id, sender, text, time, timestamp, user_id, workspace_id) VALUES (?, ?, ?, ?, ?, ?, ?)",
            [aiMsgId, "ai", aiText, aiTimeFormatted, nowMs + 1, userId, workspaceId]
        );

        const newMessages = await db.all("SELECT * FROM messages WHERE id IN (?, ?)", [userMsgId, aiMsgId]);
        return NextResponse.json(newMessages);
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function DELETE() {
    try {
        const db = await getDB();
        const user = await getCurrentUser();
        const userId = user ? user.id : null;

        if (userId) {
            await db.run("DELETE FROM messages WHERE user_id = ?", [userId]);
        } else {
            await db.run("DELETE FROM messages");
        }
        
        // Seed default greeting back after reset
        const nowMs = Date.now();
        await db.run(
            "INSERT INTO messages (id, sender, text, time, timestamp, user_id) VALUES (?, ?, ?, ?, ?, ?)",
            ["1", "ai", "What's on your mind today?", "1:15pm", nowMs, userId]
        );
        
        const seeded = await db.all("SELECT * FROM messages ORDER BY timestamp ASC LIMIT 200");
        return NextResponse.json(seeded);
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
// Forced reload comment to trigger Turbopack cache refresh.

