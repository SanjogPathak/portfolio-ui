import { openai } from "@ai-sdk/openai";
import { generateText } from "ai";
import { projects } from "@/data/projects";

export const runtime = "nodejs";

export async function POST(req: Request) {
    try {
        const { title } = await req.json();

        const project = projects.find((p) => p.title === title);
        if (!project) {
            return new Response(JSON.stringify({ error: "Project not found" }), { status: 404 });
        }

        const prompt = `
Return ONLY valid JSON:
{
  "oneLiner": string,
  "resumeBullets": string[],
  "impactSummary": string
}

Rules:
- Ground strictly in provided project data
- Do NOT invent metrics or tools
- Keep resume bullets concise and professional

PROJECT:
Title: ${project.title}
Summary: ${project.summary}
Tech: ${project.tech.join(", ")}
Highlights: ${(project.highlights ?? []).join(" | ")}
Impact: ${(project.impact ?? []).join(" | ")}
`;

        const result = await generateText({
            model: openai("gpt-4.1-mini"),
            prompt,
            temperature: 0.2,
        });

        let text = result.text.trim();

        if (text.startsWith("```")) {
            text = text.replace(/```json/g, "").replace(/```/g, "").trim();
        }

        const match = text.match(/\{[\s\S]*\}/);
        if (match) text = match[0];

        const json = JSON.parse(text);

        return new Response(JSON.stringify(json), {
            headers: { "Content-Type": "application/json" },
        });
    } catch (err: any) {
        return new Response(
            JSON.stringify({ error: "Project summary failed", detail: err?.message }),
            { status: 500 }
        );
    }
}