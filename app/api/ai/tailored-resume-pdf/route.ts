import { openai } from "@ai-sdk/openai";
import { generateText } from "ai";
import PDFDocument from "pdfkit";

export const runtime = "nodejs";

function extractJson(text: string) {
    let t = text.trim();
    if (t.startsWith("```")) {
        t = t.replace(/```json/g, "").replace(/```/g, "").trim();
    }
    const match = t.match(/\{[\s\S]*\}/);
    return match ? match[0] : t;
}

async function buildPdfBuffer(title: string, bodyText: string) {
    const doc = new PDFDocument({
        size: "LETTER",
        margins: { top: 54, bottom: 54, left: 54, right: 54 },
    });

    const chunks: Buffer[] = [];
    doc.on("data", (c) => chunks.push(c));

    // Header
    doc.fontSize(18).text(title, { align: "left" });
    doc.moveDown(0.75);

    // Body (simple, ATS-friendly)
    doc.fontSize(11).text(bodyText, {
        align: "left",
        lineGap: 3,
    });

    doc.end();

    await new Promise<void>((resolve) => doc.on("end", resolve));
    return Buffer.concat(chunks);
}

export async function POST(req: Request) {
    try {
        const { resumeText, jobDescription, role, company, focus } = await req.json();

        if (!resumeText || String(resumeText).trim().length < 200) {
            return new Response(
                JSON.stringify({ error: "Please paste your full resume (at least ~200 characters)." }),
                { status: 400, headers: { "Content-Type": "application/json" } }
            );
        }
        if (!jobDescription || String(jobDescription).trim().length < 50) {
            return new Response(
                JSON.stringify({ error: "Please paste a job description (50+ characters)." }),
                { status: 400, headers: { "Content-Type": "application/json" } }
            );
        }

        const prompt = `
Return ONLY valid JSON:
{
  "tailoredResumeText": string,
  "matchScore": number
}

Rules:
- Do NOT invent employers, dates, degrees, certifications, or metrics.
- Keep it ATS-friendly (simple sections, clear bullets).
- matchScore: 0-100 based on alignment after tailoring.
- Use role/company to tailor tone if provided.
- Focus: ${focus ?? "General"}

ROLE: ${role ?? ""}
COMPANY: ${company ?? ""}

RESUME (source of truth):
${resumeText}

JOB DESCRIPTION:
${jobDescription}
`;

        const result = await generateText({
            model: openai("gpt-4.1-mini"),
            prompt,
            temperature: 0.2,
        });

        const jsonText = extractJson(result.text);
        const json = JSON.parse(jsonText) as { tailoredResumeText: string; matchScore: number };

        const title = `Tailored Resume${role ? ` — ${role}` : ""}${company ? ` @ ${company}` : ""}`;
        const pdf = await buildPdfBuffer(title, json.tailoredResumeText);

        return new Response(pdf, {
            status: 200,
            headers: {
                "Content-Type": "application/pdf",
                "Content-Disposition": `attachment; filename="Tailored_Resume.pdf"`,
            },
        });
    } catch (err: any) {
        return new Response(
            JSON.stringify({ error: "PDF generation failed", detail: err?.message ?? String(err) }),
            { status: 500, headers: { "Content-Type": "application/json" } }
        );
    }
}