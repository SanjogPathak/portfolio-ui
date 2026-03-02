import { openai } from "@ai-sdk/openai";
import { generateText } from "ai";
import mammoth from "mammoth";
import { PDFDocument, StandardFonts, rgb } from "pdf-lib";
import {
    PDFName,
    PDFNumber,
    PDFString,
    PDFArray,
    PDFDict,
} from "pdf-lib";
export const runtime = "nodejs";
type ParsedHeader = {
    name?: string;
    headline?: string;
    email?: string;
    phone?: string;
    links: string[]; // urls
};

function parseHeaderFromResumeText(resumeText: string): ParsedHeader {
    const lines = resumeText
        .split(/\r?\n/)
        .map((l) => l.trim())
        .filter(Boolean);

    // Guess name/headline from first lines
    const name = lines[0];
    const headline =
        lines.length > 1 && !looksLikeContact(lines[1]) ? lines[1] : undefined;

    const email = resumeText.match(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/i)?.[0];

    // Basic phone match (US-ish + international-ish)
    const phone =
        resumeText.match(
            /(\+?\d{1,3}[\s.-]?)?(\(?\d{3}\)?[\s.-]?)\d{3}[\s.-]?\d{4}/
        )?.[0] ||
        resumeText.match(/\+\d{1,3}[\s.-]?\d[\d\s.-]{6,}/)?.[0];

    // Pull URLs (LinkedIn/GitHub/portfolio/etc.)
    const links = Array.from(
        new Set(
            (resumeText.match(/https?:\/\/[^\s)]+/g) ?? [])
                .map((u) => u.replace(/[.,;]+$/, "")) // trim trailing punctuation
        )
    );

    return {
        name: name && name.length <= 60 ? name : undefined,
        headline: headline && headline.length <= 100 ? headline : undefined,
        email,
        phone,
        links,
    };
}

function looksLikeContact(line: string) {
    return (
        /@/.test(line) ||
        /https?:\/\//i.test(line) ||
        /\d{3}.*\d{3}.*\d{4}/.test(line)
    );
}

function addUriLinkAnnotation(
    page: any,
    pdfDoc: any,
    rect: { x: number; y: number; w: number; h: number },
    url: string
) {
    const { x, y, w, h } = rect;

    const annot = pdfDoc.context.register(
        pdfDoc.context.obj({
            Type: "Annot",
            Subtype: "Link",
            Rect: [x, y, x + w, y + h],
            Border: [0, 0, 0],
            A: {
                Type: "Action",
                S: "URI",
                URI: PDFString.of(url),
            },
        })
    );

    let annots = page.node.lookup(PDFName.of("Annots"), PDFArray);
    if (!annots) {
        annots = pdfDoc.context.obj([]) as any;
        page.node.set(PDFName.of("Annots"), annots);
    }
    annots.push(annot);
}

// Next.js App Router: required so we can receive a file via FormData
export async function POST(req: Request) {
    try {
        const form = await req.formData();

        const file = form.get("resume") as File | null;
        const jobDescription = String(form.get("jobDescription") ?? "");
        const role = String(form.get("role") ?? "");
        const company = String(form.get("company") ?? "");
        const focus = String(form.get("focus") ?? "General");

        if (!file) {
            return jsonError(400, "Please upload a .docx resume file.");
        }
        if (!file.name.toLowerCase().endsWith(".docx")) {
            return jsonError(400, "Only .docx files are supported.");
        }
        if (!jobDescription || jobDescription.trim().length < 50) {
            return jsonError(400, "Please paste a job description (50+ characters).");
        }

        // Read DOCX -> ArrayBuffer -> Buffer
        const arrayBuffer = await file.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);

        // Extract text from DOCX
        const extracted = await mammoth.extractRawText({ buffer });
        const resumeText = (extracted.value ?? "").trim();
        const header = parseHeaderFromResumeText(resumeText);
        if (resumeText.length < 200) {
            return jsonError(400, "Could not extract enough text from the DOCX (too short).");
        }

        // Ask model for tailored resume text (ATS-friendly)
        const prompt = `
Return ONLY valid JSON:
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

Formatting rules for tailoredResumeText:
- Use ALL CAPS section headings on their own line:
  SUMMARY
  CORE SKILLS
  EXPERIENCE
  PROJECTS
  EDUCATION
  CERTIFICATIONS
- Under headings:
  - Use short paragraphs for SUMMARY.
  - For lists, use bullet lines starting with "- " (dash + space).
  - For EXPERIENCE entries, prefer:
    Company / Role (or Role - Company) | Dates (if present in resume)
    - bullet
    - bullet
- Do NOT invent employers, dates, degrees, certifications, or metrics.
- ATS-friendly, clean text.

Scoring:
- matchScore is 0-100.

Focus: ${focus}
ROLE: ${role}
COMPANY: ${company}

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

        const json = safeJsonParse(result.text);
        const title = `Tailored Resume${role ? ` — ${role}` : ""}${company ? ` @ ${company}` : ""}`;

        const pdf = await buildPdfBuffer({
            titleFallback: title,
            matchScore: json.matchScore,
            tailoredResumeText: json.tailoredResumeText,
            header,
        });

        return new Response(pdf, {
            status: 200,
            headers: {
                "Content-Type": "application/pdf",
                "Content-Disposition": `attachment; filename="Sanjog_Pathak_Tailored_Resume.pdf"`,
            },
        });
    } catch (err: any) {
        console.error("tailored-resume-pdf-docx error:", err);
        return jsonError(500, "PDF generation failed", err?.message ?? String(err));
    }
}

function jsonError(status: number, error: string, detail?: string) {
    return new Response(JSON.stringify({ error, detail }), {
        status,
        headers: { "Content-Type": "application/json" },
    });
}

function safeJsonParse(text: string) {
    let t = String(text ?? "").trim();

    // Remove ```json wrappers if present
    if (t.startsWith("```")) {
        t = t.replace(/```json/g, "").replace(/```/g, "").trim();
    }

    // Extract first {...} block if extra text exists
    const match = t.match(/\{[\s\S]*\}/);
    if (match) t = match[0];

    return JSON.parse(t) as { tailoredResumeText: string; matchScore: number };
}

async function buildPdfBuffer(args: {
    titleFallback: string;
    matchScore: number;
    tailoredResumeText: string;
    header: ParsedHeader;
}) {
    const { titleFallback, matchScore, tailoredResumeText, header } = args;

    const pdfDoc = await PDFDocument.create();
    const fontRegular = await pdfDoc.embedFont(StandardFonts.Helvetica);
    const fontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

    const pageSize: [number, number] = [612, 792]; // Letter
    const margin = 54;
    const lineGap = 4;

    const fontSizeName = 18;
    const fontSizeHeadline = 11;
    const fontSizeMeta = 10;
    const fontSizeHeading = 11;
    const fontSizeBody = 10.5;

    const bulletIndent = 14;
    const bulletSymbol = "•";

    let page = pdfDoc.addPage(pageSize);
    let { width, height } = page.getSize();
    const maxWidth = width - margin * 2;

    let y = height - margin;

    const ensureSpace = (needed: number) => {
        if (y - needed < margin) {
            page = pdfDoc.addPage(pageSize);
            ({ width, height } = page.getSize());
            y = height - margin;
        }
    };

    const wrapText = (text: string, font: any, size: number, maxW: number) => {
        const words = text.split(/\s+/).filter(Boolean);
        const lines: string[] = [];
        let line = "";

        for (const w of words) {
            const test = line ? `${line} ${w}` : w;
            const wWidth = font.widthOfTextAtSize(test, size);
            if (wWidth <= maxW) line = test;
            else {
                if (line) lines.push(line);
                line = w;
            }
        }
        if (line) lines.push(line);
        return lines;
    };

    const drawLine = (text: string, opts: { x: number; size: number; font: any }) => {
        page.drawText(text, { x: opts.x, y, size: opts.size, font: opts.font });
        y -= opts.size + lineGap;
    };

    const drawDivider = () => {
        ensureSpace(12);
        const yLine = y - 2;
        page.drawLine({
            start: { x: margin, y: yLine },
            end: { x: width - margin, y: yLine },
            thickness: 1,
            opacity: 0.12,
        });
        y -= 10;
    };

    // ---------------- Header (Step 1) ----------------
    const displayName = header.name ?? titleFallback;

    ensureSpace(fontSizeName + 24);
    page.drawText(displayName, { x: margin, y, size: fontSizeName, font: fontBold });
    y -= fontSizeName + 6;

    if (header.headline) {
        ensureSpace(fontSizeHeadline + 10);
        page.drawText(header.headline, { x: margin, y, size: fontSizeHeadline, font: fontRegular });
        y -= fontSizeHeadline + 8;
    }

    // Contact line: email | phone
    const contactParts = [header.email, header.phone].filter(Boolean) as string[];
    if (contactParts.length > 0) {
        ensureSpace(fontSizeMeta + 10);
        page.drawText(contactParts.join("  |  "), {
            x: margin,
            y,
            size: fontSizeMeta,
            font: fontRegular,
        });
        y -= fontSizeMeta + 8;
    }

    // Links line (clickable) (Step 3)
    const links = (header.links ?? []).slice(0, 3); // keep it tidy
    if (links.length > 0) {
        ensureSpace(fontSizeMeta + 10);

        let x = margin;
        const linkHeight = fontSizeMeta + 2;

        for (const url of links) {
            const label = url.replace(/^https?:\/\//i, "");
            const w = fontRegular.widthOfTextAtSize(label, fontSizeMeta);

            // Draw text
            page.drawText(label, { x, y, size: fontSizeMeta, font: fontRegular });

            // Clickable area
            addUriLinkAnnotation(page, pdfDoc, { x, y: y - 2, w, h: linkHeight }, url);

            x += w + 14; // spacing between links
            if (x > width - margin - 80) break; // avoid overflow
        }

        y -= fontSizeMeta + 10;
    }

    // Match score
    ensureSpace(fontSizeMeta + 10);
    page.drawText(`Match Score: ${matchScore}/100`, {
        x: margin,
        y,
        size: fontSizeMeta,
        font: fontBold,
    });
    y -= fontSizeMeta + 10;

    drawDivider();

    // ---------------- Body formatting ----------------
    const text = tailoredResumeText.trim();
    const rawLines = text.split("\n").map((l) => l.replace(/\r/g, ""));

    const isHeading = (s: string) => {
        const t = s.trim();
        if (!t) return false;
        const isAllCaps = t === t.toUpperCase() && /[A-Z]/.test(t);
        return isAllCaps && t.length <= 30;
    };

    // Step 2: CORE SKILLS two-column rendering
    const renderSkillsTwoColumns = (skills: string[]) => {
        const colGap = 24;
        const colWidth = (maxWidth - colGap) / 2;
        const leftX = margin;
        const rightX = margin + colWidth + colGap;

        // Render as wrapped lines per column (row by row)
        let i = 0;
        while (i < skills.length) {
            const left = skills[i++] ?? "";
            const right = skills[i++] ?? "";

            const leftLines = wrapText(left, fontRegular, fontSizeBody, colWidth);
            const rightLines = wrapText(right, fontRegular, fontSizeBody, colWidth);

            const rowLines = Math.max(leftLines.length, rightLines.length);
            for (let k = 0; k < rowLines; k++) {
                ensureSpace(fontSizeBody + 6);

                if (leftLines[k]) {
                    page.drawText(leftLines[k], {
                        x: leftX,
                        y,
                        size: fontSizeBody,
                        font: fontRegular,
                    });
                }
                if (rightLines[k]) {
                    page.drawText(rightLines[k], {
                        x: rightX,
                        y,
                        size: fontSizeBody,
                        font: fontRegular,
                    });
                }

                y -= fontSizeBody + lineGap;
            }
        }

        y -= 6;
    };

    for (let idx = 0; idx < rawLines.length; idx++) {
        const t = rawLines[idx]?.trim() ?? "";

        if (!t) {
            y -= 6;
            continue;
        }

        // Heading
        if (isHeading(t)) {
            ensureSpace(fontSizeHeading + 14);
            y -= 6;
            page.drawText(t, { x: margin, y, size: fontSizeHeading, font: fontBold });
            y -= fontSizeHeading + 6;

            // Step 2: if CORE SKILLS, collect following lines until next heading/blank block
            if (t === "CORE SKILLS") {
                const collected: string[] = [];
                let j = idx + 1;
                while (j < rawLines.length) {
                    const next = rawLines[j].trim();
                    if (!next) { j++; continue; }
                    if (isHeading(next)) break;

                    // accept "- skill" or "skill, skill" or plain
                    collected.push(next);
                    j++;
                }

                // Move main index forward (skip consumed lines)
                idx = j - 1;

                // Normalize skills
                const skills = collected
                    .flatMap((line) => {
                        if (line.startsWith("- ")) return [line.slice(2).trim()];
                        return line.split(",").map((s) => s.trim()).filter(Boolean);
                    })
                    .filter(Boolean);

                if (skills.length > 0) {
                    renderSkillsTwoColumns(skills);
                }
            }

            continue;
        }

        // Bullets "- "
        if (t.startsWith("- ")) {
            const bulletText = t.slice(2).trim();
            const available = maxWidth - bulletIndent;
            const wrapped = wrapText(bulletText, fontRegular, fontSizeBody, available);

            for (let i = 0; i < wrapped.length; i++) {
                ensureSpace(fontSizeBody + 6);

                if (i === 0) {
                    page.drawText(bulletSymbol, { x: margin, y, size: fontSizeBody, font: fontRegular });
                }
                page.drawText(wrapped[i], {
                    x: margin + bulletIndent,
                    y,
                    size: fontSizeBody,
                    font: fontRegular,
                });

                y -= fontSizeBody + lineGap;
            }
            continue;
        }

        // Paragraph
        const wrapped = wrapText(t, fontRegular, fontSizeBody, maxWidth);
        for (const wLine of wrapped) {
            ensureSpace(fontSizeBody + 6);
            drawLine(wLine, { x: margin, size: fontSizeBody, font: fontRegular });
        }
    }

    const bytes = await pdfDoc.save();
    return Buffer.from(bytes);
}
