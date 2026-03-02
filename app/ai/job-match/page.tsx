"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
type Result = {
  matchScore: number;
  bestProjects: { title: string; reason: string }[];
  tailoredBullets: string[];
  gaps: string[];
  keywordAnalysis: {
    keyword: string;
    status: "strong" | "partial" | "missing";
    evidence: string[];
    suggestion: string;
  }[];
};



function CopyButton({ text }: { text: string }) {
  return (
    <button
      type="button"
      onClick={() => navigator.clipboard.writeText(text)}
      className="text-xs px-3 py-1 border rounded-lg hover:bg-black hover:text-white transition"
    >
      Copy
    </button>
  );
}

export default function JobMatchPage() {
  const [resumeText, setResumeText] = useState("");
  const [jd, setJd] = useState("");
  const [role, setRole] = useState("");
  const [company, setCompany] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<Result | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [focus, setFocus] = useState("DevOps");
  const [resumeFile, setResumeFile] = useState<File | null>(null);

  useEffect(() => {
    try {
      const saved = localStorage.getItem("full_resume_text_v1");
      if (saved) setResumeText(saved);
    } catch { }
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem("full_resume_text_v1", resumeText);
    } catch { }
  }, [resumeText]);

  const canRun = useMemo(() => jd.trim().length > 50 && !loading, [jd, loading]);
  const abortRef = useRef<AbortController | null>(null);

  async function downloadTailoredResumePdfFromDocx() {
    setError(null);

    if (!resumeFile) {
      setError("Please upload your resume (.docx).");
      return;
    }
    if (!jd || jd.trim().length < 50) {
      setError("Please paste a job description (50+ characters).");
      return;
    }

    try {
      setLoading(true);

      const form = new FormData();
      form.append("resume", resumeFile);
      form.append("jobDescription", jd);
      form.append("role", role);
      form.append("company", company);
      form.append("focus", focus);

      const res = await fetch("/api/ai/tailored-resume-pdf-docx", {
        method: "POST",
        body: form,
      });

      if (!res.ok) {
        const text = await res.text();
        throw new Error(text);
      }

      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "Sanjog_Pathak_Tailored_Resume.pdf";
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    } catch (e: any) {
      setError(e?.message ?? "Failed to download PDF.");
    } finally {
      setLoading(false);
    }
  }
  async function run() {
    setError(null);
    setLoading(true);
    setResult(null);

    abortRef.current?.abort();
    abortRef.current = new AbortController();

    try {
      const res = await fetch("/api/ai/job-match", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        signal: abortRef.current.signal,
        body: JSON.stringify({ jobDescription: jd, role, company, focus }),
      });

      const text = await res.text();
      if (!res.ok) throw new Error(text);

      setResult(JSON.parse(text));
    } catch (e: any) {
      if (e?.name !== "AbortError") setError(e?.message ?? "Failed");
    } finally {
      setLoading(false);
    }
  }


  async function downloadTailoredResumePdf() {
    setError(null);

    if (!resumeText || resumeText.trim().length < 200) {
      setError("Please paste your full resume (at least ~200 characters).");
      return;
    }
    if (!jd || jd.trim().length < 50) {
      setError("Please paste a job description (50+ characters).");
      return;
    }

    try {
      setLoading(true);

      const res = await fetch("/api/ai/tailored-resume-pdf", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ resumeText, jobDescription: jd, role, company, focus }),
      });

      if (!res.ok) {
        const text = await res.text();
        throw new Error(text);
      }

      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      const safe = (s: string) => s.replace(/[^a-z0-9]+/gi, "_").replace(/^_+|_+$/g, "");
      const name = `Sanjog_Pathak_Tailored_Resume${role ? "_" + safe(role) : ""}${company ? "_" + safe(company) : ""}.pdf`;

      a.href = url;
      a.download = name;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    } catch (e: any) {
      setError(e?.message ?? "Failed to download PDF.");
    } finally {
      setLoading(false);
    }
  }

  return (

    <main className="max-w-3xl mx-auto px-6 py-12">

      <div className="mb-6 flex items-center gap-3">
        <Link
          href="/"
          className="rounded-xl border border-black/10 bg-white/60 px-4 py-2 text-sm font-semibold shadow-sm backdrop-blur hover:bg-white/80"
        >
          ← Back to Portfolio
        </Link>
      </div>
      <input
        type="file"
        accept=".docx"
        className="border rounded-xl px-3 py-2"
        onChange={(e) => setResumeFile(e.target.files?.[0] ?? null)}
      />

      <p className="text-xs opacity-60">
        Upload your resume (.docx). We’ll extract text and generate a tailored PDF.
      </p>
      <h1 className="text-3xl font-bold">AI Job Match</h1>
      <p className="mt-2 text-sm opacity-70">
        Paste a job description. I’ll match it to your best project(s) and generate tailored bullets.
      </p>

      <div className="mt-8 grid gap-4">
        <div className="grid md:grid-cols-2 gap-4">
          <input
            className="border rounded-xl px-3 py-2"
            placeholder="Role (optional)"
            value={role}
            onChange={(e) => setRole(e.target.value)}
          />
          <input
            className="border rounded-xl px-3 py-2"
            placeholder="Company (optional)"
            value={company}
            onChange={(e) => setCompany(e.target.value)}
          />

        </div>
        <select
          className="border rounded-xl px-3 py-2"
          value={focus}
          onChange={(e) => setFocus(e.target.value)}
        >
          <option>DevOps</option>
          <option>Backend (.NET)</option>
          <option>Cloud (Azure)</option>
          <option>General</option>
        </select>
        <textarea
          className="border rounded-xl px-3 py-2 min-h-[220px]"
          placeholder="Paste job description here (50+ characters)…"
          value={jd}
          onChange={(e) => setJd(e.target.value)}
        />

        <button
          onClick={run}
          disabled={!canRun}
          className="w-fit px-4 py-2 rounded-xl bg-black text-white disabled:opacity-50"
        >
          {loading ? "Analyzing..." : "Analyze"}
        </button>
        <button
          onClick={downloadTailoredResumePdfFromDocx}
          disabled={loading || jd.trim().length < 50 || !resumeFile}
          className="w-fit px-4 py-2 rounded-xl border border-black/10 bg-white/60 shadow-sm backdrop-blur disabled:opacity-50"
        >
          Download Tailored Resume (PDF)
        </button>
        {error && <div className="text-sm text-red-600">{error}</div>}
      </div>

      {result && (

        <div className="mt-10 space-y-8">
          <section className="border rounded-2xl p-4">
            <div className="flex items-center justify-between">
              <div className="text-sm opacity-70">Match Score</div>
              <div className="text-2xl font-bold">{result.matchScore}/100</div>
              <section>
                <h2 className="text-xl font-semibold">Keyword match</h2>
                <div className="mt-3 space-y-3">
                  {result.keywordAnalysis?.map((k) => (
                    <div key={k.keyword} className="border rounded-2xl p-4">
                      <div className="flex items-center justify-between gap-3">
                        <div className="font-medium">{k.keyword}</div>
                        <span
                          className={[
                            "text-xs px-2 py-1 rounded-full border",
                            k.status === "strong" ? "bg-black text-white border-black" : "",
                            k.status === "partial" ? "bg-white border-black/20" : "",
                            k.status === "missing" ? "bg-red-50 border-red-200 text-red-700" : "",
                          ].join(" ")}
                        >
                          {k.status === "strong"
                            ? "✅ Strong"
                            : k.status === "partial"
                              ? "⚠️ Partial"
                              : "❌ Missing"}
                        </span>
                      </div>

                      {k.evidence?.length > 0 && (
                        <div className="mt-2 text-sm opacity-80">
                          <div className="text-xs opacity-60 mb-1">Evidence</div>
                          <ul className="list-disc pl-5 space-y-1">
                            {k.evidence.slice(0, 3).map((e, i) => (
                              <li key={i}>{e}</li>
                            ))}
                          </ul>
                        </div>
                      )}

                      <div className="mt-3 text-sm">
                        <div className="text-xs opacity-60 mb-1">Suggestion</div>
                        <div className="opacity-90">{k.suggestion}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            </div>
            <div className="mt-2 h-2 w-full rounded-full bg-black/10 overflow-hidden">
              <div
                className="h-full bg-black"
                style={{ width: `${Math.max(0, Math.min(100, result.matchScore))}%` }}
              />
            </div>
          </section>
          <section>
            <h2 className="text-xl font-semibold">Best matching project(s)</h2>
            <div className="mt-3 space-y-3">
              {result.bestProjects.map((p) => (
                <div key={p.title} className="border rounded-2xl p-4">
                  <div className="font-medium">{p.title}</div>
                  <div className="text-sm opacity-80 mt-1">{p.reason}</div>
                </div>
              ))}
            </div>
          </section>

          <section>
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold">Tailored resume bullets</h2>
              <CopyButton text={result.tailoredBullets.join("\n")} />
            </div>

            <ul className="mt-3 list-disc pl-6 space-y-2">
              {result.tailoredBullets.map((b, i) => (
                <li key={i}>{b}</li>
              ))}
            </ul>
          </section>

          <section>
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold">Potential gaps</h2>
              <CopyButton text={result.gaps.join("\n")} />
            </div>

            {result.gaps.length === 0 ? (
              <div className="mt-2 text-sm opacity-80">No obvious gaps found.</div>
            ) : (
              <ul className="mt-3 list-disc pl-6 space-y-2">
                {result.gaps.map((g, i) => (
                  <li key={i}>{g}</li>
                ))}
              </ul>
            )}
          </section>
        </div>
      )}
    </main>
  );
}