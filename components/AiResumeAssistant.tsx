"use client";

import React, { useMemo, useRef, useState } from "react";

type Role = "user" | "assistant";

type ChatMessage = {
  id: string;
  role: Role;
  content: string;
  timestamp: number;
};

type ResumeData = {
  name: string;
  title: string;
  location?: string;
  summary: string;
  skills: string[];
  experience: Array<{
    company: string;
    title: string;
    dates: string;
    bullets: string[];
  }>;
  projects?: Array<{
    name: string;
    stack: string[];
    highlights: string[];
    link?: string;
  }>;
  certifications?: string[];
};

function uid(prefix = "m") {
  return `${prefix}_${Math.random().toString(16).slice(2)}_${Date.now()}`;
}

function scoreAts(text: string, keywords: string[]) {
  // Simple heuristic: keyword coverage + structure checks
  const lower = text.toLowerCase();
  const hits = keywords.filter((k) => lower.includes(k.toLowerCase()));
  const coverage = keywords.length ? hits.length / keywords.length : 0;

  const hasBullets = /•|\n- |\n\* /g.test(text);
  const hasMetrics =
    /\b(\d+%|\d+\+|\d+x|\$\d+|\d+\s?(ms|s|mins|hours|days))\b/i.test(text);
  const hasSections =
    /(summary|experience|projects|skills|education|certification)/i.test(text);

  // Weighted score (0-100)
  let score = Math.round(coverage * 70);
  if (hasBullets) score += 10;
  if (hasMetrics) score += 10;
  if (hasSections) score += 10;

  score = Math.max(0, Math.min(100, score));
  return { score, hits };
}

function extractTopKeywords(jobDesc: string) {
  // Lightweight keyword extraction (no AI) — still impressive for portfolio
  const stop = new Set([
    "and",
    "the",
    "a",
    "an",
    "to",
    "of",
    "in",
    "for",
    "with",
    "on",
    "as",
    "is",
    "are",
    "be",
    "you",
    "we",
    "our",
    "your",
    "will",
    "this",
    "that",
    "from",
    "or",
    "at",
    "by",
    "it",
    "not",
    "have",
    "has",
    "had",
    "they",
    "them",
    "their",
    "i",
  ]);

  const cleaned = jobDesc
    .replace(/[^a-zA-Z0-9+#.\s-]/g, " ")
    .replace(/\s+/g, " ")
    .trim();

  const tokens = cleaned
    .split(" ")
    .map((t) => t.trim())
    .filter((t) => t.length >= 3 && !stop.has(t.toLowerCase()));

  const freq = new Map<string, number>();
  for (const t of tokens) {
    const key = t.toLowerCase();
    freq.set(key, (freq.get(key) ?? 0) + 1);
  }

  // Prefer tech-like tokens
  const boosted = Array.from(freq.entries()).map(([k, v]) => {
    const boost =
      /kubernetes|docker|azure|aks|devops|terraform|helm|c#|\.net|sql|react|next|api|microservice|ci\/cd|pipeline|ingress|nginx|monitor|logging|redis/i.test(
        k
      )
        ? 2
        : 1;
    return [k, v * boost] as const;
  });

  boosted.sort((a, b) => b[1] - a[1]);
  const top = boosted.slice(0, 18).map(([k]) => k);

  // Add common phrases if present
  const phrases: string[] = [];
  const lower = jobDesc.toLowerCase();
  const commonPhrases = [
    "ci/cd",
    "azure devops",
    "kubernetes",
    "docker",
    "helm",
    "aks",
    "microservices",
    "rest api",
    "monitoring",
    "logging",
    "oauth",
    "jwt",
    "sql server",
    "redis",
    "nginx",
    "terraform",
  ];
  for (const p of commonPhrases) {
    if (lower.includes(p) && !phrases.includes(p)) phrases.push(p);
  }

  // Merge without duplicates
  const merged = Array.from(new Set([...phrases, ...top]));
  return merged.slice(0, 20);
}

function buildTailoredBullets(resume: ResumeData, keywords: string[]) {
  // Tailor bullets by weaving keywords (without lying) — keeps it ethical & safe
  const lines: string[] = [];
  for (const exp of resume.experience) {
    for (const b of exp.bullets) {
      // If bullet already strong, keep; otherwise lightly enhance
      const hasKw = keywords.some((k) => b.toLowerCase().includes(k.toLowerCase()));
      if (hasKw) {
        lines.push(`• ${b}`);
      } else {
        const sprinkle = keywords
          .filter((k) =>
            /kubernetes|docker|azure|aks|devops|helm|ci\/cd|pipeline|api|sql|redis|nginx/i.test(
              k
            )
          )
          .slice(0, 1)[0];
        lines.push(sprinkle ? `• ${b} (${sprinkle})` : `• ${b}`);
      }
    }
  }
  return lines.slice(0, 10);
}

export default function AiResumeAssistant({
  resume,
  smartOpsUrl,
}: {
  resume: ResumeData;
  smartOpsUrl?: string;
}) {
  const hasProjects = (resume.projects?.length ?? 0) > 0;

  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: uid("msg"),
      role: "assistant",
      content:
        `Hi! I’m your AI Resume Assistant.\n\n` +
        `Try one of these:\n` +
        `• Paste a job description and I’ll extract keywords + score your resume\n` +
        `• Ask me to generate a tailored “About me”\n` +
        `• Ask for a project pitch you can paste into your portfolio\n`,
      timestamp: Date.now(),
    },
  ]);

  const [jobDesc, setJobDesc] = useState("");
  const [resumeText, setResumeText] = useState("");
  const [loading, setLoading] = useState(false);

  const scrollRef = useRef<HTMLDivElement | null>(null);

  // ✅ IMPORTANT: Default resume text now includes ONLY summary/skills/experience
  // (prevents “duplicate / repetitive snapshot” feeling)
  const defaultResumeText = useMemo(() => {
    const exp = resume.experience
      .map(
        (e) =>
          `${e.title} — ${e.company} (${e.dates})\n${e.bullets
            .map((b) => `- ${b}`)
            .join("\n")}`
      )
      .join("\n\n");

    return `${resume.name}\n${resume.title}\n\nSummary\n${resume.summary}\n\nSkills\n${resume.skills.join(
      ", "
    )}\n\nExperience\n${exp}\n`;
  }, [resume]);

  const resumeTextEffective = resumeText.trim().length ? resumeText : defaultResumeText;

  function pushMessage(role: Role, content: string) {
    setMessages((prev) => [
      ...prev,
      { id: uid("msg"), role, content, timestamp: Date.now() },
    ]);
    setTimeout(() => {
      scrollRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
    }, 50);
  }

  async function handleQuickAction(action: "score" | "about" | "smartops" | "cover") {
    setLoading(true);
    try {
      if (action === "score") {
        if (!jobDesc.trim()) {
          pushMessage(
            "assistant",
            "Paste a Job Description first (left panel), then click **Score & Keywords**."
          );
          return;
        }
        const keywords = extractTopKeywords(jobDesc);
        const { score, hits } = scoreAts(resumeTextEffective, keywords);

        const missing = keywords.filter((k) => !hits.includes(k)).slice(0, 10);
        pushMessage(
          "assistant",
          `**ATS Match Score (quick heuristic): ${score}/100**\n\n` +
          `**Top Keywords Found:** ${hits.slice(0, 12).join(", ") || "None yet"}\n\n` +
          `**Suggested Keywords to Add (if true):** ${missing.join(", ") || "Looks good!"}\n\n` +
          `If you want, I can generate **tailored bullets** using these keywords.`
        );
      }

      if (action === "about") {
        pushMessage(
          "assistant",
          `Here’s a polished **About Me** (portfolio-ready):\n\n` +
          `I’m ${resume.name}, a ${resume.title} focused on building reliable cloud-native systems and clean developer experiences. ` +
          `I work across API development, containerization, and Kubernetes deployments, and I enjoy turning complex infrastructure into repeatable pipelines and simple dashboards. ` +
          `I’m especially interested in production-ready patterns: secure configuration, health checks, observability, and scalable deployment workflows.\n\n` +
          `Want it more “engineering” or more “product” in tone?`
        );
      }

      if (action === "smartops") {
        if (!hasProjects) {
          pushMessage(
            "assistant",
            "No projects found in the resume data. Add projects to enable project pitch generation."
          );
          return;
        }

        const urlLine = smartOpsUrl ? `\n\nLive link: ${smartOpsUrl}` : "";
        pushMessage(
          "assistant",
          `Here’s a strong **Project Pitch** for your portfolio:\n\n` +
          `This project demonstrates end-to-end delivery: building, deploying, and operating cloud-native services with production-oriented patterns. ` +
          `It highlights practical DevOps and platform engineering skills—CI/CD automation, containerization, and deployment workflows—while emphasizing reliability (health checks, rollouts, configuration).` +
          urlLine +
          `\n\nIf you paste your resume bullets here, I can tailor this pitch to match your exact wording.`
        );
      }

      if (action === "cover") {
        if (!jobDesc.trim()) {
          pushMessage(
            "assistant",
            "Paste a Job Description first (left panel), then click **Cover Letter Draft**."
          );
          return;
        }
        const keywords = extractTopKeywords(jobDesc);
        const tailoredBullets = buildTailoredBullets(resume, keywords);

        pushMessage(
          "assistant",
          `Here’s a **cover letter draft** (short, clean, paste-ready):\n\n` +
          `Hello,\n\n` +
          `I’m excited to apply for this role. My background includes building and deploying cloud-native services with a focus on reliability and automation. ` +
          `I’ve delivered production-oriented workflows using CI/CD pipelines, containerization, and Kubernetes, and I enjoy making systems observable, maintainable, and easy to operate.\n\n` +
          `Highlights relevant to your needs:\n` +
          `${tailoredBullets.join("\n")}\n\n` +
          `I’d love to discuss how I can contribute to your team.\n\n` +
          `Best regards,\n${resume.name}`
        );
      }
    } finally {
      setLoading(false);
    }
  }

  function handleSendChat(prompt: string) {
    const text = prompt.trim();
    if (!text) return;

    pushMessage("user", text);

    // Simple “AI-like” routing (no external calls)
    setLoading(true);
    setTimeout(() => {
      try {
        const lower = text.toLowerCase();

        if (lower.includes("keyword") || lower.includes("ats") || lower.includes("score")) {
          handleQuickAction("score");
          return;
        }

        if (lower.includes("about") || lower.includes("bio") || lower.includes("summary")) {
          handleQuickAction("about");
          return;
        }

        if (
          lower.includes("smartops") ||
          lower.includes("project pitch") ||
          lower.includes("project description")
        ) {
          handleQuickAction("smartops");
          return;
        }

        if (lower.includes("cover") || lower.includes("letter")) {
          handleQuickAction("cover");
          return;
        }

        pushMessage(
          "assistant",
          `I can help with:\n` +
          `• ATS scoring + keywords (paste job description)\n` +
          `• About Me / summary\n` +
          `• Project pitch\n` +
          `• Cover letter draft\n\n` +
          `Tell me which one you want, or click a quick button.`
        );
      } finally {
        setLoading(false);
      }
    }, 300);
  }

  return (
    <div className="w-full">
      <div className="rounded-3xl border border-white/10 bg-white/5 backdrop-blur-xl shadow-xl overflow-hidden">
        {/* Header */}
        <div className="px-6 py-5 border-b border-white/10 bg-gradient-to-r from-white/10 to-transparent">
          <div className="flex flex-col gap-1">
            <div className="text-lg font-semibold text-white">
              AI Resume Assistant
              <span className="ml-2 text-xs font-medium px-2 py-1 rounded-full bg-white/10 text-white/80">
                Demo Mode (no API key)
              </span>
            </div>
            <div className="text-sm text-white/70">
              Paste a job description → get keywords, ATS match score, tailored pitch, and cover letter.
            </div>
          </div>
        </div>

        {/* Body */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-0">
          {/* Left: Inputs */}
          <div className="lg:col-span-1 p-6 border-b lg:border-b-0 lg:border-r border-white/10">
            <div className="space-y-4">
              <div>
                <div className="text-sm font-semibold text-white mb-2">Job Description</div>
                <textarea
                  value={jobDesc}
                  onChange={(e) => setJobDesc(e.target.value)}
                  placeholder="Paste the job description here..."
                  className="w-full min-h-[160px] rounded-2xl bg-black/20 border border-white/10 text-white/90 placeholder:text-white/40 p-4 outline-none focus:border-white/30"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <div className="text-sm font-semibold text-white">Resume Text (optional)</div>
                  <button
                    type="button"
                    onClick={() => setResumeText("")}
                    className="text-xs text-white/70 hover:text-white underline underline-offset-4"
                  >
                    Reset to default
                  </button>
                </div>
                <textarea
                  value={resumeText}
                  onChange={(e) => setResumeText(e.target.value)}
                  placeholder="Optional: paste your resume text to score against the job description (otherwise uses built-in resume data)."
                  className="w-full min-h-[160px] rounded-2xl bg-black/20 border border-white/10 text-white/90 placeholder:text-white/40 p-4 outline-none focus:border-white/30"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  disabled={loading}
                  onClick={() => handleQuickAction("score")}
                  className="rounded-2xl px-4 py-3 text-sm font-semibold bg-white text-black hover:bg-white/90 disabled:opacity-60"
                >
                  Score & Keywords
                </button>
                <button
                  type="button"
                  disabled={loading}
                  onClick={() => handleQuickAction("cover")}
                  className="rounded-2xl px-4 py-3 text-sm font-semibold bg-white/10 text-white hover:bg-white/15 border border-white/10 disabled:opacity-60"
                >
                  Cover Letter Draft
                </button>
                <button
                  type="button"
                  disabled={loading}
                  onClick={() => handleQuickAction("about")}
                  className="rounded-2xl px-4 py-3 text-sm font-semibold bg-white/10 text-white hover:bg-white/15 border border-white/10 disabled:opacity-60"
                >
                  About Me
                </button>
                <button
                  type="button"
                  disabled={loading || !hasProjects}
                  onClick={() => handleQuickAction("smartops")}
                  className="rounded-2xl px-4 py-3 text-sm font-semibold bg-white/10 text-white hover:bg-white/15 border border-white/10 disabled:opacity-60"
                >
                  SmartOps Pitch
                </button>
              </div>

              <div className="rounded-2xl bg-black/20 border border-white/10 p-4 text-xs text-white/70 leading-relaxed">
                <div className="font-semibold text-white/80 mb-1">What makes this “AI” (for portfolio)?</div>
                <ul className="list-disc ml-4 space-y-1">
                  <li>Keyword extraction from job descriptions</li>
                  <li>ATS-style scoring + improvement hints</li>
                  <li>Auto-generated About Me / project pitch / cover letter</li>
                  <li>Ready to upgrade to real AI later (OpenAI) without redesign</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Right: Chat */}
          <div className="lg:col-span-2 p-6">
            <div className="flex flex-col h-[520px]">
              <div className="flex-1 overflow-y-auto pr-2 space-y-3">
                {messages.map((m) => (
                  <div
                    key={m.id}
                    className={
                      m.role === "user"
                        ? "ml-auto max-w-[85%] rounded-2xl bg-white text-black px-4 py-3 text-sm whitespace-pre-wrap"
                        : "mr-auto max-w-[85%] rounded-2xl bg-white/10 text-white px-4 py-3 text-sm whitespace-pre-wrap border border-white/10"
                    }
                  >
                    {m.content}
                  </div>
                ))}
                <div ref={scrollRef} />
              </div>

              <div className="mt-4 flex gap-3">
                <input
                  type="text"
                  placeholder='Try: "Score my resume against this job" or "Write SmartOps project pitch"'
                  className="flex-1 rounded-2xl bg-black/20 border border-white/10 text-white/90 placeholder:text-white/40 px-4 py-3 outline-none focus:border-white/30"
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      const target = e.target as HTMLInputElement;
                      handleSendChat(target.value);
                      target.value = "";
                    }
                  }}
                />
                <button
                  type="button"
                  disabled={loading}
                  onClick={() => {
                    // For button-send, we read from the previous sibling input
                    const input =
                      ((document.activeElement?.parentElement?.querySelector("input") ??
                        document.querySelector("input")) as HTMLInputElement | null) ?? null;
                    if (!input) return;
                    const value = input.value;
                    handleSendChat(value);
                    input.value = "";
                  }}
                  className="rounded-2xl px-5 py-3 text-sm font-semibold bg-white text-black hover:bg-white/90 disabled:opacity-60"
                >
                  Send
                </button>
              </div>

              {loading && (
                <div className="mt-3 text-xs text-white/60">
                  Working… (this is instant demo logic — we’ll swap to real AI later if you want)
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}