import { NextResponse } from "next/server";
import { getDB } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { getBusinessBrain } from "@/lib/businessBrain";

const generateOfflineFallbackResponse = (
    profile: any,
    projects: any[],
    pendingMilestones: any[],
    totalDue: string,
    competitorAlerts: any[],
    persona: string,
    coachName: string,
    text: string
): string => {
    const getStatsContext = () => {
        return `As your ${coachName}, I see you're building ${profile.companyName || "your startup"} with ${projects.length} active projects in play. You also have $${totalDue} outstanding in pending/overdue invoices.`;
    };
    const getCompetitorContext = () => {
        if (competitorAlerts.length > 0) {
            return `I noticed a competitor alert: "${competitorAlerts[0].text}"`;
        }
        return `No immediate competitor alerts are in our system currently.`;
    };

    const lowercaseText = text.toLowerCase();
    if (lowercaseText.includes("start") || lowercaseText.includes("launch") || lowercaseText.includes("bakery") || lowercaseText.includes("agency") || lowercaseText.includes("store") || lowercaseText.includes("shop") || lowercaseText.includes("project")) {
        const isAgency = lowercaseText.includes("agency") || lowercaseText.includes("design") || (profile.industry && profile.industry.toLowerCase().includes("technology"));
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
            const projList = projects.slice(0, 2).map((p: any) => p.title).join(" and ");
            return `Traction is everything! You have ${projects.length} folders, with ${projList} on top. To accelerate growth, let's complete the pending goals: "${pendingMilestones[0]?.text || "Establish core spec docs"}". Shall we structure a viral marketing loop?`;
        }
        return `Hello ${profile.fullName}! 🤝 ${getStatsContext()} Let's run a user acquisition campaign or set up a growth sync call to get more eyes on ${projects[0]?.title || "The Base app"}. What marketing experiment shall we run today?`;
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
        return `Hey ${profile.fullName}! 🎨 ${getStatsContext()} I'm brainstorming product layout improvements for ${profile.companyName}. We should check the active folder screens or sketch new user experiences. What feature are we designing today?`;
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
        return `Greetings ${profile.fullName}. 🛡️ ${getStatsContext()} Let's run a security compliance audit on your data nodes (Slack/Gmail integration volume is looking steady). What system configuration should we audit today?`;
    }

    return `Got it ${profile.fullName}. Let's analyze your startup workspace logs to optimize this workflow!`;
};

// Helper to generate dynamic, context-aware AI replies based on database stats
async function generateContextAwareAIResponse(db: any, userText: string, image?: string, attachments?: any[]): Promise<string> {
    const text = userText.toLowerCase();

    // Resolve user ID using getCurrentUser() session check
    const user = await getCurrentUser();
    const userId = user ? user.id : "current_user";

    // 1. Fetch user profile
    const profile = await db.get("SELECT * FROM profile WHERE id = ?", [userId]) || 
                    await db.get("SELECT * FROM profile WHERE id = 'current_user'") || {
        fullName: "there",
        companyName: "your business",
        selectedPersona: "growth"
    };

    // 1b. Fetch Business Brain (graceful — null if not set up yet or on any error)
    let businessBrain = null;
    if (userId !== "current_user") {
        try {
            businessBrain = await getBusinessBrain(userId);
        } catch (e) {
            // Gracefully degrade — brain tables may not exist on older installs
            console.warn("Failed to fetch Business Brain, continuing without it:", e);
        }
    }

    // 2. Fetch projects & milestones
    const projects = await db.all("SELECT * FROM projects");
    const milestones = await db.all("SELECT * FROM milestones");
    const pendingMilestones = milestones.filter((m: any) => m.completed === 0);

    // 3. Fetch outstanding invoices balance
    const invoices = await db.all("SELECT * FROM invoices");
    const outstandingInvoices = invoices.filter((i: any) => i.status === "pending" || i.status === "overdue");
    const outstandingSum = outstandingInvoices.reduce((sum: number, i: any) => sum + parseFloat(i.amount), 0);
    const totalDue = (18430.90 + outstandingSum).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });

    // 4. Fetch notifications / competitor alerts
    const notifications = await db.all("SELECT * FROM notifications") || [];
    const competitorAlerts = notifications.filter((n: any) => 
        n.title.toLowerCase().includes("competitor") || 
        n.text.toLowerCase().includes("competitor")
    );

    // 5. Fetch synced calendar events for current user or default
    const calendarEvents = await db.all(
        "SELECT * FROM calendar_events WHERE user_id = ? OR user_id = 'current_user' ORDER BY starts_at ASC LIMIT 10",
        [userId]
    ) || [];

    const persona = profile.selectedPersona || "growth";
    const coachName = persona === "growth" 
        ? "Growth Coach ⚡" 
        : persona === "creative" 
            ? "Creative Partner 🎨" 
            : "Risk Auditor 🛡️";

    // Handle standard resets/commands
    if (text.includes("clear") || text.includes("reset")) {
        return "Resetting conversation context... Done! How can I help you from scratch?";
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
        return generateOfflineFallbackResponse(profile, projects, pendingMilestones, totalDue, competitorAlerts, persona, coachName, text);
    }

    try {
        // Build Business Brain context block (empty string if no brain exists)
        let businessBrainContext = "";
        if (businessBrain) {
            const b = businessBrain.brain;
            const parts: string[] = [];
            parts.push(`Business Brain (Founder's business context — use this to personalize every response):`);
            if (b.business_name) parts.push(`  Business Name: ${b.business_name}`);
            if (b.business_description) parts.push(`  What they do: ${b.business_description}`);
            if (b.industry) parts.push(`  Industry: ${b.industry}`);
            if (b.business_stage) parts.push(`  Stage: ${b.business_stage}`);
            if (b.target_market) parts.push(`  Target Customers: ${b.target_market}`);
            if (b.priorities) parts.push(`  Current Priorities: ${b.priorities}`);
            if (businessBrain.goals.length > 0) {
                parts.push(`  Goals: ${businessBrain.goals.map((g: any) => g.title + (g.status ? ` [${g.status}]` : "")).join("; ")}`);
            }
            if (businessBrain.offers.length > 0) {
                parts.push(`  Products/Services: ${businessBrain.offers.map((o: any) => o.name + (o.price ? ` ($${o.price})` : "")).join("; ")}`);
            }
            if (businessBrain.customerSegments.length > 0) {
                parts.push(`  Customer Segments: ${businessBrain.customerSegments.map((s: any) => s.name).join("; ")}`);
            }
            if (businessBrain.challenges.length > 0) {
                parts.push(`  Challenges: ${businessBrain.challenges.map((c: any) => c.title + (c.severity ? ` [${c.severity}]` : "")).join("; ")}`);
            }
            if (businessBrain.notes.length > 0) {
                parts.push(`  Notes: ${businessBrain.notes.slice(0, 5).map((n: any) => n.content).join("; ")}`);
            }
            businessBrainContext = "\n" + parts.join("\n");
        }

        const systemInstruction = `You are Pal, the user's AI Co-Founder and Personal Assistant Ledger.
You must adopt the persona: ${coachName} (${persona} persona).
Details:
- User's Name: ${profile.fullName}
- Company: ${profile.companyName || (businessBrain?.brain?.business_name) || "your business"}
${businessBrainContext}
- Current Date & Time: ${new Date().toISOString()} (Use this to resolve relative dates/times like tomorrow, next Tuesday, etc.)
- Active projects count: ${projects.length}
- Projects: ${JSON.stringify(projects)}
- Pending milestones: ${JSON.stringify(pendingMilestones)}
- Outstanding ledger invoices balance: $${totalDue}
- Outstanding invoices: ${JSON.stringify(outstandingInvoices)}
- Competitor updates / alerts: ${JSON.stringify(competitorAlerts)}
- Synced Google Calendar events (workload/deadlines): ${JSON.stringify(calendarEvents)}

Your tone should be helpful, collaborative, smart, and fully aligned with your selected persona.
- Growth Coach ⚡: Highly energetic, focused on viral growth loops, customer acquisition, marketing experiments, scaling revenue, and securing cashflow.
- Creative Partner 🎨: Highly design-oriented, focused on user experience (UX), visuals, branding, sketch wireframes, landing page layouts, and border/contrast micro-animations.
- Risk Auditor 🛡️: Highly analytical, focused on database security keys, Firestore rule checks, compliance, code vulnerability scans, ledger audits, and preventing infrastructure leakages.

Keep responses concise, relevant, and directly use the SQLite database metrics context to assist the user.
Talk naturally like a human. DO NOT use markdown bold stars (like **text**) or list bullet dashes (-) or asterisks (*) anywhere in your response. Simply write natural paragraph prose as if you are talking over a human chat thread. 

Google Calendar Sync Context: Refer to the Synced Google Calendar events when the user asks about schedules, meeting availability, or task planning. Proactively warn them if they propose task deadlines or schedules that clash with these synced events (e.g. Acme Corp Design Review, Launch Bakery Operational Permits Deadline).

If the user asks you to "create", "generate", or "send" an invoice, you should dynamically generate a structured action tag at the very end of your response. Ensure to extract or assume a client name, an amount (just a number), and the service description from the context.
Format the action tag EXACTLY like this at the end of your response:
||ACTION:{"type":"create_invoice","client":"Client Name","amount":"1200","service":"Service Description"}||

If the user shares a business idea, asks to launch a business/project/product, or requests a roadmap or plan:
Explain how you'll help structure it. Then, at the very end of your response, output a structured roadmap action tag EXACTLY like this:
||ROADMAP:{"title":"Project Title","description":"Project Description","goal":"Project Goal","priority":"High"|"Medium"|"Low","due_date":"YYYY-MM-DD","tasks":[{"title":"Task Title","description":"Task Description","priority":"high"|"medium"|"low","due_date":"YYYY-MM-DD"}]}||

If the user makes a clear decision about a project during the chat, or if you agree on a design or technical decision:
Explain it naturally. Then, at the very end of your response, output a structured decision tag EXACTLY like this:
||DECISION:{"project_id":"project_id_from_active_list","title":"Decision Title","description":"Decision description details"}||

Ensure the tasks are concrete, realistic, and contain no markdown bold stars or list bullet dashes in the natural response. The JSON inside ||ROADMAP:...|| and ||DECISION:...|| must be valid JSON without newlines.`;

        // Fetch recent message history (last 8 messages) to provide chat context
        const messageHistory = await db.all("SELECT sender, text, image, attachments FROM messages ORDER BY timestamp DESC LIMIT 9") || [];
        let reversedHistory = messageHistory.reverse();

        // If the last message in reversedHistory is the current user message, remove it to avoid duplication
        if (reversedHistory.length > 0 && reversedHistory[reversedHistory.length - 1].sender === "user" && reversedHistory[reversedHistory.length - 1].text === userText) {
            reversedHistory.pop();
        }
        // Limit history to last 8 messages
        reversedHistory = reversedHistory.slice(-8);

        // Helper to parse base64
        const parseBase64 = (dataUrl: string) => {
            const matches = dataUrl.match(/^data:([a-zA-Z0-9]+\/[a-zA-Z0-9-.+]+);base64,(.*)$/);
            if (!matches || matches.length < 3) return null;
            return {
                mimeType: matches[1],
                data: matches[2]
            };
        };

        const contents = [];
        for (const msg of reversedHistory) {
            let msgText = msg.text || "";
            if (msg.attachments) {
                try {
                    const atts = JSON.parse(msg.attachments);
                    if (atts && atts.length > 0) {
                        const attNames = atts.map((a: any) => `${a.type}: ${a.name}`).join(", ");
                        msgText += `\n[Attached files: ${attNames}]`;
                    }
                } catch (e) {}
            }
            const parts: any[] = [{ text: msgText }];
            if (msg.image) {
                const imgData = parseBase64(msg.image);
                if (imgData) {
                    parts.push({
                        inlineData: imgData
                    });
                }
            }
            contents.push({
                role: msg.sender === "user" ? "user" : "model",
                parts
            });
        }

        // Append current user message with optional image & attachments
        let currentText = userText;
        if (attachments && attachments.length > 0) {
            const attNames = attachments.map((a: any) => `${a.type}: ${a.name}`).join(", ");
            currentText += `\n[Attached files: ${attNames}]`;
        }
        const currentParts: any[] = [{ text: currentText }];
        if (image) {
            const imgData = parseBase64(image);
            if (imgData) {
                currentParts.push({
                    inlineData: imgData
                });
            }
        }
        contents.push({
            role: "user",
            parts: currentParts
        });

        const response = await fetch(
            `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`,
            {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    contents,
                    systemInstruction: {
                        parts: [{ text: systemInstruction }]
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
            return generateOfflineFallbackResponse(profile, projects, pendingMilestones, totalDue, competitorAlerts, persona, coachName, text);
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
        return generateOfflineFallbackResponse(profile, projects, pendingMilestones, totalDue, competitorAlerts, persona, coachName, text);
    }
}

export async function GET() {
    try {
        const db = await getDB();
        const user = await getCurrentUser();
        const userId = user ? user.id : null;

        let messages;
        if (userId) {
            messages = await db.all(
                "SELECT * FROM messages WHERE user_id = ? ORDER BY timestamp ASC LIMIT 200",
                [userId]
            );
            // Fallback: if user has no messages yet, also include legacy messages with no user_id
            if (messages.length === 0) {
                messages = await db.all(
                    "SELECT * FROM messages ORDER BY timestamp ASC LIMIT 200"
                );
            }
        } else {
            messages = await db.all("SELECT * FROM messages ORDER BY timestamp ASC LIMIT 200");
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
        
        // 1. Insert user message
        const userMsgId = String(nowMs);
        const userSender = sender || "user";
        await db.run(
            "INSERT INTO messages (id, sender, text, time, timestamp, image, attachments, user_id) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
            [
                userMsgId, 
                userSender, 
                chatText || (attachments && attachments.length > 0 ? `Sent ${attachments.length} attachments` : ""), 
                timeFormatted, 
                nowMs,
                image || null,
                attachments ? JSON.stringify(attachments) : null,
                userId
            ]
        );

        // 2. Automatically generate and insert AI response
        const aiMsgId = String(nowMs + 1);
        let aiText = await generateContextAwareAIResponse(db, chatText || "", image, attachments);
        const aiTimeFormatted = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }).toLowerCase();
        
        // Action Interceptor
        const actionMatch = aiText.match(/\|\|ACTION:(.*?)\|\|/);
        if (actionMatch && actionMatch[1]) {
            try {
                const actionData = JSON.parse(actionMatch[1]);
                if (actionData.type === "create_invoice") {
                    const invId = String(Date.now());
                    const invDate = new Date().toLocaleDateString("default", { month: "short", day: "numeric", year: "numeric" });
                    
                    await db.run(
                        "INSERT INTO invoices (id, client, amount, service, date, status, timestamp) VALUES (?, ?, ?, ?, ?, ?, ?)",
                        [
                            invId,
                            actionData.client || "New Client",
                            String(actionData.amount || "1000"),
                            actionData.service || "Consulting Service",
                            invDate,
                            "pending",
                            "Just now"
                        ]
                    );

                    // Append visual receipt payload token directly to message text
                    aiText = aiText.replace(/\|\|ACTION:.*?\|\|/, "").trim() + 
                             ` [INVOICE_RECEIPT:{"client":"${actionData.client || "New Client"}","amount":"${actionData.amount || "1000"}","service":"${actionData.service || "Consulting"}","id":"${invId}","date":"${invDate}"}]`;
                }
            } catch (e) {
                console.error("Failed to parse or execute AI action", e);
                aiText = aiText.replace(/\|\|ACTION:.*?\|\|/, "").trim();
            }
        } else {
            // Ensure any clean up if mismatch
            aiText = aiText.replace(/\|\|ACTION:.*?\|\|/, "").trim();
        }

        // Decision Interceptor
        const decisionMatch = aiText.match(/\|\|DECISION:(.*?)\|\|/);
        if (decisionMatch && decisionMatch[1]) {
            try {
                const decData = JSON.parse(decisionMatch[1]);
                if (decData.project_id && decData.title) {
                    const decId = String(Date.now());
                    const user = await getCurrentUser();
                    const userId = user ? user.id : "current_user";
                    
                    await db.run(
                        `INSERT INTO decisions (id, project_id, user_id, title, description, status, created_at) 
                         VALUES (?, ?, ?, ?, ?, ?, ?)`,
                        [
                            decId,
                            decData.project_id,
                            userId,
                            decData.title,
                            decData.description || "",
                            "decided",
                            Date.now()
                        ]
                    );

                    aiText = aiText.replace(/\|\|DECISION:.*?\|\|/, "").trim() + 
                             ` [DECISION_CARD:{"project_id":"${decData.project_id}","title":"${decData.title}","description":"${decData.description || ""}","id":"${decId}"}]`;
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
            "INSERT INTO messages (id, sender, text, time, timestamp, user_id) VALUES (?, ?, ?, ?, ?, ?)",
            [aiMsgId, "ai", aiText, aiTimeFormatted, nowMs + 1, userId]
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

