// app/api/chat/route.ts
import { openai } from "@ai-sdk/openai";
import { streamText } from "ai";
import { z } from "zod";

export const runtime = "edge";

const GetPortfolioProjectsSchema = z.object({
    filter: z.string().optional(),
});

const ScoreAtsSchema = z.object({
    text: z.string(),
    keywords: z.array(z.string()).default([]),
});

export async function POST(req: Request) {
    const { messages } = await req.json();

    const result = streamText({
        model: openai("gpt-4.1-mini"),
        messages,
        system:
            "You are an AI assistant embedded in a portfolio website. Be concise, recruiter-friendly, and technically sharp. Use tools when helpful and summarize tool results clearly.",

        tools: {
            getPortfolioProjects: {
                description: "Fetch portfolio projects (optionally filtered).",
                inputSchema: GetPortfolioProjectsSchema,
                execute: async (rawArgs: unknown) => {
                    const { filter } = GetPortfolioProjectsSchema.parse(rawArgs);

                    const projects = [
                        {
                            name: "SmartOps",
                            stack: ["C#", ".NET", "AKS", "Redis"],
                            highlights: ["Kubernetes deployment", "SQL init job", "Redis caching"],
                        },
                        {
                            name: "AI Resume Assistant",
                            stack: ["Next.js", "OpenAI", "Tailwind"],
                            highlights: ["Streaming chat", "ATS scoring", "Tool-based AI"],
                        },
                    ];

                    if (!filter) return { projects };

                    const q = filter.toLowerCase();
                    return {
                        projects: projects.filter(
                            (p) =>
                                p.name.toLowerCase().includes(q) ||
                                p.stack.join(" ").toLowerCase().includes(q)
                        ),
                    };
                },
            },

            scoreAts: {
                description: "Score resume text against keywords for ATS coverage.",
                inputSchema: ScoreAtsSchema,
                execute: async (rawArgs: unknown) => {
                    const { text, keywords } = ScoreAtsSchema.parse(rawArgs);

                    const lower = text.toLowerCase();
                    const hits = keywords.filter((k) => lower.includes(k.toLowerCase()));
                    const coverage = keywords.length ? hits.length / keywords.length : 1;
                    const score = Math.round(60 + coverage * 40);

                    return {
                        score,
                        hits,
                        missing: keywords.filter((k) => !hits.includes(k)),
                    };
                },
            },
        },
    });

    // Response helper compatibility across ai@6 minor versions
    const anyResult = result as any;

    if (typeof anyResult.toDataStreamResponse === "function") {
        return anyResult.toDataStreamResponse();
    }
    if (typeof anyResult.toTextStreamResponse === "function") {
        return anyResult.toTextStreamResponse();
    }

    return new Response("Streaming helper not found on result.", { status: 500 });
}