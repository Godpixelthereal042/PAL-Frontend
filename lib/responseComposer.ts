/**
 * Strategic Response Composer
 *
 * PAL Milestone 2C — Response Composer
 *
 * This module receives:
 *   1. BusinessContext (from Milestone 2A Context Engine)
 *   2. ReasoningAnalysis (from Milestone 2B Reasoning Engine)
 *   3. User Message & Conversation History
 *
 * It formats and structures these inputs into a complete, deterministic LLMRequest payload
 * ready for Gemini API generation.
 *
 * CRITICAL RULE: The Response Composer MUST NOT alter strategy, invent new recommendations,
 * or drop rationales determined by the Reasoning Engine. Gemini is responsible ONLY for phrasing
 * and delivery; PAL's engines are responsible for thinking and strategy.
 *
 * Reference: PAL-DOC-003 (AI Architecture) §03, PAL-DOC-002 (MVP) §04
 */

import type { BusinessContext } from "./contextEngine";
import type { ReasoningAnalysis } from "./reasoningEngine";

// ---------------------------------------------------------------------------
// TypeScript Interfaces
// ---------------------------------------------------------------------------

export interface ConversationMessage {
    sender: "user" | "assistant" | "model";
    text: string;
    image?: string;
    attachments?: any[];
}

export interface ComposeOptions {
    history?: ConversationMessage[];
    image?: string;
    attachments?: any[];
}

export interface LLMMessagePart {
    text?: string;
    inlineData?: {
        mimeType: string;
        data: string;
    };
}

export interface LLMMessageContent {
    role: "user" | "model";
    parts: LLMMessagePart[];
}

export interface LLMRequest {
    systemInstruction: string;
    contents: LLMMessageContent[];
    rawContext: BusinessContext;
    rawReasoning: ReasoningAnalysis;
}

// ---------------------------------------------------------------------------
// System Prompt Section Builders
// ---------------------------------------------------------------------------

/**
 * Build the persona and identity section of the system prompt.
 */
function buildPersonaHeader(context: BusinessContext): string {
    const persona = context.founder.persona || "growth";
    const coachName =
        persona === "growth"
            ? "Growth Coach ⚡"
            : persona === "creative"
            ? "Creative Partner 🎨"
            : "Risk Auditor 🛡️";

    return `You are Pal, the user's AI Co-Founder and Personal Assistant Ledger.
You MUST adopt the persona: ${coachName} (${persona} persona).

Your tone should be helpful, collaborative, smart, and fully aligned with your selected persona:
- Growth Coach ⚡: Highly energetic, focused on viral growth loops, customer acquisition, marketing experiments, scaling revenue, and securing cashflow.
- Creative Partner 🎨: Highly design-oriented, focused on user experience (UX), visuals, branding, sketch wireframes, landing page layouts, and border/contrast micro-animations.
- Risk Auditor 🛡️: Highly analytical, focused on database security keys, compliance, code vulnerability scans, ledger audits, and preventing infrastructure leakages.`;
}

/**
 * Format Founder and Business Brain context sections.
 */
function buildContextBlock(context: BusinessContext): string {
    const { founder, business, projects, tasks, calendar, notifications, invoices, summary } = context;
    const parts: string[] = [];

    parts.push(`=== FOUNDER & BUSINESS CONTEXT ===`);
    parts.push(`- Founder Name: ${founder.name}`);
    parts.push(`- Founder Email: ${founder.email}`);
    parts.push(`- Founder Role: ${founder.role}`);
    parts.push(`- Company: ${founder.company || (business?.name) || "your business"}`);

    if (business) {
        parts.push(`\n[Business Brain Details]`);
        if (business.name) parts.push(`  Business Name: ${business.name}`);
        if (business.description) parts.push(`  What they do: ${business.description}`);
        if (business.industry) parts.push(`  Industry: ${business.industry}`);
        if (business.stage) parts.push(`  Stage: ${business.stage}`);
        if (business.targetMarket) parts.push(`  Target Customers: ${business.targetMarket}`);
        if (business.priorities) parts.push(`  Current Priorities: ${business.priorities}`);

        if (business.goals.length > 0) {
            parts.push(`  Goals: ${business.goals.map((g) => `${g.title} [${g.status}]`).join("; ")}`);
        }
        if (business.offers.length > 0) {
            parts.push(`  Offers/Products: ${business.offers.map((o) => `${o.name} ($${o.price || "N/A"})`).join("; ")}`);
        }
        if (business.customerSegments.length > 0) {
            parts.push(`  Customer Segments: ${business.customerSegments.map((s) => s.name).join("; ")}`);
        }
        if (business.challenges.length > 0) {
            parts.push(`  Challenges: ${business.challenges.map((c) => `${c.title} [${c.severity}]`).join("; ")}`);
        }
        if (business.notes.length > 0) {
            parts.push(`  Notes: ${business.notes.slice(0, 5).map((n) => n.content).join("; ")}`);
        }
    } else {
        parts.push(`\n[Business Brain Details]: Not configured yet.`);
    }

    parts.push(`\n[Operational Snapshot]`);
    parts.push(`- Active Projects Count: ${summary.activeProjects}`);
    parts.push(`- Projects: ${JSON.stringify(projects)}`);
    parts.push(`- Tasks Count: ${tasks.length}`);
    parts.push(`- Calendar Events Count: ${calendar.length}`);
    parts.push(`- Notifications Count: ${notifications.length}`);
    parts.push(`- Invoices Count: ${invoices.length}`);

    if (context.decisions && context.decisions.length > 0) {
        parts.push(`\n[Active Confirmed Strategic Decisions]`);
        for (const dec of context.decisions) {
            parts.push(`  - Decision: ${dec.title}${dec.rationale ? ` (Rationale: ${dec.rationale})` : ""}${dec.impactArea ? ` [Impact Area: ${dec.impactArea}]` : ""}`);
        }
    }

    if ((context as any).executiveIntelligence) {
        const intel = (context as any).executiveIntelligence;
        parts.push(`\n=== EXECUTIVE INTELLIGENCE SUMMARY ===`);
        if (intel.topRisk) parts.push(`- Top Risk: ${intel.topRisk.title} (${intel.topRisk.severity}) — ${intel.topRisk.description}`);
        if (intel.topOpportunity) parts.push(`- Top Opportunity: ${intel.topOpportunity.title} — ${intel.topOpportunity.reason}`);
        if (intel.keyTrend) parts.push(`- Key Trend: ${intel.keyTrend.metric} (${intel.keyTrend.direction}) — ${intel.keyTrend.description}`);
        if (intel.topForecast) parts.push(`- Top Forecast: ${intel.topForecast.prediction}`);
    }

    return parts.join("\n");
}

/**
 * Format Strategic Reasoning section from Reasoning Engine analysis.
 */
function buildReasoningBlock(reasoning: ReasoningAnalysis): string {
    const parts: string[] = [];

    parts.push(`=== STRATEGIC REASONING (DETERMINED BY PAL REASONING ENGINE) ===`);
    parts.push(`- Strategic Confidence Score: ${reasoning.confidenceScore}/100`);

    // Priorities
    if (reasoning.priorities.length > 0) {
        parts.push(`\n[Highest Priorities]`);
        for (const p of reasoning.priorities) {
            parts.push(`  * ${p.title} (${p.priority.toUpperCase()} priority - Source: ${p.source}): ${p.description}`);
        }
    }

    // Risks
    if (reasoning.risks.length > 0) {
        parts.push(`\n[Detected Risks & Bottlenecks]`);
        for (const r of reasoning.risks) {
            parts.push(`  * ${r.title} [Severity: ${r.severity.toUpperCase()}, Category: ${r.category}]: ${r.description}`);
        }
    }

    // Opportunities
    if (reasoning.opportunities.length > 0) {
        parts.push(`\n[Strategic Opportunities]`);
        for (const o of reasoning.opportunities) {
            parts.push(`  * ${o.title} [Impact: ${o.impact.toUpperCase()}, Category: ${o.category}]: ${o.description}`);
        }
    }

    // Recommended Actions & Rationales
    if (reasoning.recommendedActions.length > 0) {
        parts.push(`\n[Ranked Recommended Actions]`);
        for (let i = 0; i < reasoning.recommendedActions.length; i++) {
            const action = reasoning.recommendedActions[i];
            parts.push(`  ${i + 1}. ${action.title} [Impact: ${action.impact.toUpperCase()}, Urgency: ${action.urgency.toUpperCase()}]`);
            parts.push(`     Action: ${action.description}`);
            parts.push(`     RATIONALE (WHY): ${action.rationale}`);
        }
    }

    // Missing Information Gaps
    if (reasoning.missingInformation.length > 0) {
        parts.push(`\n[Missing Business Information Gaps]`);
        for (const m of reasoning.missingInformation) {
            parts.push(`  * Field '${m.field}': ${m.message} (Impact: ${m.impactOnGuidance})`);
        }
    }

    return parts.join("\n");
}

/**
 * Build system rules, boundaries, and action tag guidelines.
 */
function buildSystemRules(): string {
    return `=== CONVERSATIONAL DELIVERY RULES ===
1. STRATEGIC BOUNDARY: The Strategic Reasoning above has already been analyzed and decided by PAL's Reasoning Engine. You MUST preserve these priorities, risks, and recommended action rationales EXACTLY. Never invent conflicting advice, contradict the reasoning, or drop the stated rationales.
2. NATURAL PROSE FORMATTING: Talk naturally like a human. DO NOT use markdown bold stars (like **text**) or list bullet dashes (-) or asterisks (*) anywhere in your response. Simply write natural paragraph prose as if you are talking over a human chat thread.
3. REASONING TRANSPARENCY: Explain WHY recommendations are given using the rationales provided in the Strategic Reasoning.

=== ACTION TAG PROTOCOLS ===
- If the user asks to "create", "generate", or "send" an invoice, generate a structured action tag at the very end:
  ||ACTION:{"type":"create_invoice","client":"Client Name","amount":"1200","service":"Service Description"}||

- If the user shares a business idea, asks to launch a business/project, or requests a roadmap/plan:
  ||ROADMAP:{"title":"Project Title","description":"Project Description","goal":"Project Goal","priority":"High"|"Medium"|"Low","due_date":"YYYY-MM-DD","tasks":[{"title":"Task Title","description":"Task Description","priority":"high"|"medium"|"low","due_date":"YYYY-MM-DD"}]}||

- If a strategic or technical decision is agreed upon during chat:
  ||DECISION:{"project_id":"project_id_from_active_list","title":"Decision Title","description":"Decision description details"}||`;
}

/**
 * Helper to parse base64 image strings.
 */
function parseBase64(dataUrl: string) {
    const matches = dataUrl.match(/^data:([a-zA-Z0-9]+\/[a-zA-Z0-9-.+]+);base64,(.*)$/);
    if (!matches || matches.length < 3) return null;
    return {
        mimeType: matches[1],
        data: matches[2],
    };
}

/**
 * Format message history and current user message into Gemini contents format.
 */
function buildMessageContents(
    userMessage: string,
    options?: ComposeOptions
): LLMMessageContent[] {
    const contents: LLMMessageContent[] = [];

    // Add prior message history (up to last 8 messages)
    if (options?.history && options.history.length > 0) {
        const historySlice = options.history.slice(-8);
        for (const msg of historySlice) {
            let msgText = msg.text || "";
            if (msg.attachments && msg.attachments.length > 0) {
                const attNames = msg.attachments.map((a: any) => `${a.type}: ${a.name}`).join(", ");
                msgText += `\n[Attached files: ${attNames}]`;
            }

            const parts: LLMMessagePart[] = [{ text: msgText }];
            if (msg.image) {
                const imgData = parseBase64(msg.image);
                if (imgData) {
                    parts.push({ inlineData: imgData });
                }
            }

            contents.push({
                role: msg.sender === "user" ? "user" : "model",
                parts,
            });
        }
    }

    // Append current user message with optional attachments/images
    let currentText = userMessage;
    if (options?.attachments && options.attachments.length > 0) {
        const attNames = options.attachments.map((a: any) => `${a.type}: ${a.name}`).join(", ");
        currentText += `\n[Attached files: ${attNames}]`;
    }

    const currentParts: LLMMessagePart[] = [{ text: currentText }];
    if (options?.image) {
        const imgData = parseBase64(options.image);
        if (imgData) {
            currentParts.push({ inlineData: imgData });
        }
    }

    contents.push({
        role: "user",
        parts: currentParts,
    });

    return contents;
}

// ---------------------------------------------------------------------------
// Public API Function
// ---------------------------------------------------------------------------

/**
 * Composes a complete LLMRequest payload from BusinessContext, ReasoningAnalysis, and user query.
 *
 * This function enforces PAL's architecture: PAL's engines perform all context aggregation and
 * strategic reasoning; Gemini receives structured intelligence and acts as the conversational voice.
 *
 * @param context - BusinessContext from Context Engine (Milestone 2A)
 * @param reasoning - ReasoningAnalysis from Reasoning Engine (Milestone 2B)
 * @param userMessage - Current message sent by the founder
 * @param options - Optional history, attachments, or image payload
 * @returns Formatted LLMRequest ready for Gemini API invocation
 */
export function composeLLMRequest(
    context: BusinessContext,
    reasoning: ReasoningAnalysis,
    userMessage: string,
    options?: ComposeOptions
): LLMRequest {
    const personaHeader = buildPersonaHeader(context);
    const contextBlock = buildContextBlock(context);
    const reasoningBlock = buildReasoningBlock(reasoning);
    const systemRules = buildSystemRules();

    const systemInstruction = [
        personaHeader,
        contextBlock,
        reasoningBlock,
        systemRules,
    ].join("\n\n");

    const contents = buildMessageContents(userMessage, options);

    return {
        systemInstruction,
        contents,
        rawContext: context,
        rawReasoning: reasoning,
    };
}
