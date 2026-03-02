import { streamText } from "ai";
import { openai } from "@ai-sdk/openai";
import { projects } from "@/data/projects";

export const runtime = "nodejs";

const SYSTEM_PROMPT = `
You are an AI Portfolio Copilot.

IMPORTANT RULES:
- Only reference projects provided in the PROJECT DATA section.
- When listing projects, use exact project titles.
- Never invent new projects.
- Be concise and professional.
`;

export async function POST(req: Request) {
    try {
        const { messages } = await req.json();

        // Build project context INSIDE the request
        const PROJECT_CONTEXT = `
PROJECT DATA:

${projects
                .map(
                    (p) => `Project: ${p.title}
Summary: ${p.summary}
Tech Stack: ${p.tech.join(", ")}
Highlights: ${(p.highlights ?? []).join(" | ")}
Links: ${(p.links ?? [])
                            .map((l) => `${l.label}: ${l.url}`)
                            .join(" | ")}`
                )
                .join("\n\n")}
`;

        const result = streamText({
            model: openai("gpt-4.1-mini"),
            system: SYSTEM_PROMPT + "\n\n" + PROJECT_CONTEXT,
            messages,
        });

        return result.toTextStreamResponse();
    } catch (err: any) {
        console.error("Copilot error:", err);

        const msg = err?.message ?? String(err);
        const isQuota =
            msg.toLowerCase().includes("insufficient_quota") ||
            msg.toLowerCase().includes("exceeded your current quota");

        return new Response(
            JSON.stringify({
                error: isQuota ? "AI quota exceeded" : "Copilot failed",
                detail: msg,
            }),
            { status: isQuota ? 429 : 500, headers: { "Content-Type": "application/json" } }
        );
    }
}