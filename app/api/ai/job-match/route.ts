import { openai } from "@ai-sdk/openai";
import { generateText } from "ai";
import { projects } from "@/data/projects";

export const runtime = "nodejs";

export async function POST(req: Request) {
    try {
        const { jobDescription, role, company, focus } = await req.json();

        if (!jobDescription || String(jobDescription).trim().length < 50) {
            return new Response(
                JSON.stringify({ error: "Please paste a longer job description (50+ characters)." }),
                { status: 400, headers: { "Content-Type": "application/json" } }
            );
        }

        const projectData = projects
            .map(
                (p) => `Project: ${p.title}
Summary: ${p.summary}
Tech: ${p.tech.join(", ")}
Highlights: ${(p.highlights ?? []).join(" | ")}`
            )
            .join("\n\n");

        const prompt = `
Return ONLY valid JSON with this exact shape:
{
  "matchScore": number,
  "bestProjects": [{"title": string, "reason": string}],
  "tailoredBullets": string[],
  "gaps": string[],
  "keywordAnalysis": [
    {
      "keyword": string,
      "status": "strong" | "partial" | "missing",
      "evidence": string[],
      "suggestion": string
    }
  ]
}

Rules:
- Choose ONLY from the projects in PROJECT DATA.
- Use exact project titles from PROJECT DATA.
- Tailored bullets must be grounded in selected project(s) only (no invented metrics).
- Gaps are tools/skills in the JD that do not appear in PROJECT DATA.
- KeywordAnalysis:
  - Extract 10–15 high-signal keywords from the JOB DESCRIPTION (tools, cloud, CI/CD, IaC, monitoring, languages, frameworks).
  - For each keyword, compare against PROJECT DATA only.
  - status meanings:
    - strong: clearly present and relevant (multiple mentions or central to a project)
    - partial: mentioned once or indirectly related
    - missing: not present in PROJECT DATA
  - evidence: 1–3 short quotes/phrases from PROJECT DATA that show where it appears (empty array if missing).
  - suggestion: for partial/missing, say where to add it (e.g., "Add to Core Skills", "Mention in SmartOps bullets"), but do NOT invent experience.

Scoring:
- matchScore is 0-100.
- 80-100: strong alignment
- 60-79: good alignment (some gaps)
- 40-59: partial alignment
- 0-39: weak alignment
- Base the score ONLY on JOB DESCRIPTION vs PROJECT DATA (no guessing).

ROLE (optional): ${role ?? ""}
COMPANY (optional): ${company ?? ""}
ANALYSIS FOCUS: ${focus ?? "General"}

PROJECT DATA:
${projectData}

JOB DESCRIPTION:
${jobDescription}
`;

        const result = await generateText({
            model: openai("gpt-4.1-mini"),
            prompt,
            temperature: 0.2,
        });

        // Try to parse to ensure we return valid JSON
        let text = result.text.trim();

        // Remove ```json wrappers if present
        if (text.startsWith("```")) {
            text = text.replace(/```json/g, "").replace(/```/g, "").trim();
        }

        // Extract first JSON object
        const jsonMatch = text.match(/\{[\s\S]*\}/);
        if (jsonMatch) text = jsonMatch[0];

        const json = JSON.parse(text);

        return new Response(JSON.stringify(json), {
            headers: { "Content-Type": "application/json" },
        });
    } catch (err: any) {
        const msg = err?.message ?? String(err);

        // If model returned non-JSON, surface it (helps debugging)
        return new Response(
            JSON.stringify({ error: "Job match failed", detail: msg }),
            { status: 500, headers: { "Content-Type": "application/json" } }
        );
    }
}