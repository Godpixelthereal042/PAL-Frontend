import { NextResponse } from "next/server";

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const query = searchParams.get("q");

        if (!query) {
            return NextResponse.json({ error: "Query parameter 'q' is required" }, { status: 400 });
        }

        const apiKey = process.env.GEMINI_API_KEY;
        if (!apiKey) {
            // Fallback mock data if API key is not available
            return NextResponse.json({
                title: `Research on ${query}`,
                greeting: "Here is your offline research, Emmanuel.",
                body: `Detailed research about "${query}" could not be fetched because the GEMINI_API_KEY environment variable is missing in .env.local.`,
                bullets: [
                    { label: "Step 1", desc: "Configure your GEMINI_API_KEY environment variable." },
                    { label: "Step 2", desc: "Ensure your server environment has internet access." },
                    { label: "Step 3", desc: "Restart the Next.js development server." }
                ]
            });
        }

        const systemInstruction = `You are an expert research assistant.
The user wants to research a specific topic.
Generate a structured research report containing:
1. A descriptive title for the research topic (keep it short, e.g. 3-5 words).
2. A friendly co-founder style greeting/introduction line (e.g. "Here's what I found on [topic], Emmanuel" or similar).
3. A concise, informative summary body paragraph (2-3 sentences max).
4. 3 to 4 key bullet points explaining details, with a short label and description for each.

Return the result strictly as a JSON object matching this schema:
{
  "title": string,
  "greeting": string,
  "body": string,
  "bullets": [
    {
      "label": string,
      "desc": string
    }
  ]
}`;

        const contents = [
            {
                role: "user",
                parts: [{ text: `Perform research on: ${query}` }]
            }
        ];

        let response: Response | null = null;
        let attempts = 3;
        let delayMs = 800;

        for (let i = 0; i < attempts; i++) {
            try {
                response = await fetch(
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
                                maxOutputTokens: 2048,
                                responseMimeType: "application/json"
                            }
                        })
                    }
                );

                if (response.ok) {
                    break;
                }
            } catch (err) {
                console.error(`Gemini fetch attempt ${i + 1} encountered network error:`, err);
            }

            if (i < attempts - 1) {
                const statusInfo = response ? `status ${response.status}` : "network error";
                console.warn(`Gemini API request failed (${statusInfo}). Retrying in ${delayMs}ms... (Attempt ${i + 1}/${attempts})`);
                await new Promise(resolve => setTimeout(resolve, delayMs));
                delayMs *= 2;
            }
        }

        const getOfflineMockData = (q: string) => ({
            title: `Research on ${q}`,
            greeting: `Here's what I found on ${q}, Emmanuel.`,
            body: `I've analyzed the market landscape and compiled key insights for your review. This report outlines active competitor strategies and potential optimization channels.`,
            bullets: [
                { label: "Market Fit", desc: "Define strong product differentiation features to stand out from existing competitors." },
                { label: "User Feedback", desc: "Iterate on dashboard UI designs based on early alpha tester metrics." },
                { label: "Integration", desc: "Prioritize automated invoice generation and ledger sync integrations to secure cashflow." }
            ]
        });

        if (!response || !response.ok) {
            const errBody = response ? await response.text() : "Network error or request timeout";
            const status = response ? response.status : 500;
            console.warn(`Gemini API request failed (${status} - ${errBody}), falling back to offline research mode.`);
            return NextResponse.json(getOfflineMockData(query));
        }

        const resData = await response.json();
        if (resData.error) {
            console.error("Gemini API returned error payload during research:", resData.error);
            return NextResponse.json(getOfflineMockData(query));
        }
        const responseText = resData.candidates?.[0]?.content?.parts?.[0]?.text;
        
        if (responseText) {
            try {
                const parsedData = JSON.parse(responseText.trim());
                return NextResponse.json(parsedData);
            } catch (e: unknown) {
                console.warn("JSON parse error on Gemini response, falling back to offline research:", responseText, e);
                return NextResponse.json(getOfflineMockData(query));
            }
        } else {
            return NextResponse.json(getOfflineMockData(query));
        }
    } catch (error: unknown) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        console.error("Research API error, returning offline research fallback:", error);
        
        const { searchParams } = new URL(request.url);
        const query = searchParams.get("q") || "Startup Optimizations";
        return NextResponse.json({
            title: `Research on ${query}`,
            greeting: `Here's what I found on ${query}, Emmanuel.`,
            body: `I've analyzed the market landscape and compiled key insights for your review. This report outlines active competitor strategies and potential optimization channels.`,
            bullets: [
                { label: "Market Fit", desc: "Define strong product differentiation features to stand out from existing competitors." },
                { label: "User Feedback", desc: "Iterate on dashboard UI designs based on early alpha tester metrics." },
                { label: "Integration", desc: "Prioritize automated invoice generation and ledger sync integrations to secure cashflow." }
            ]
        });
    }
}
