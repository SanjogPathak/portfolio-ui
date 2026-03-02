import Link from "next/link";
import AiResumeAssistant from "../components/AiResumeAssistant";
import { projects } from "../data/projects";

const resume = {
  name: "Sanjog Pathak",
  title: "Cloud / .NET Developer (Azure • AKS • DevOps)",
  summary:
    "I build cloud-native apps and deployment pipelines with Azure, Kubernetes, Docker, and .NET. I enjoy shipping reliable systems with clean CI/CD and production-ready patterns.",
  skills: [
    "Azure",
    "AKS",
    "Docker",
    "Kubernetes",
    "Helm",
    "Azure DevOps",
    "CI/CD",
    ".NET",
    "C#",
    "SQL Server",
    "Redis",
    "NGINX",
  ],
  experience: [
    {
      company: "Your Company",
      title: "Software / Cloud Engineer",
      dates: "YYYY – Present",
      bullets: [
        "Built and deployed containerized services to Kubernetes with automated CI/CD pipelines.",
        "Implemented health checks, ingress routing, and environment-based configuration for production readiness.",
        "Improved developer workflow with repeatable deployments and infrastructure patterns.",
      ],
    },
  ],
};

function Badge({ children }: { children: React.ReactNode }) {
  return (
    <span className="rounded-full border border-black/10 bg-white/60 px-3 py-1 text-sm text-black/80 shadow-sm backdrop-blur dark:border-white/10 dark:bg-white/5 dark:text-white/80">
      {children}
    </span>
  );
}

export default function Home() {
  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top,rgba(56,189,248,0.18),transparent_55%),radial-gradient(circle_at_bottom,rgba(167,139,250,0.20),transparent_55%)] text-[var(--foreground)]">
      {/* Subtle grid overlay */}
      <div className="pointer-events-none fixed inset-0 opacity-[0.10] [background-image:linear-gradient(to_right,rgba(0,0,0,0.10)_1px,transparent_1px),linear-gradient(to_bottom,rgba(0,0,0,0.10)_1px,transparent_1px)] [background-size:64px_64px] dark:opacity-[0.12] dark:[background-image:linear-gradient(to_right,rgba(255,255,255,0.12)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.12)_1px,transparent_1px)]" />

      <div className="mx-auto max-w-6xl px-6 py-16">
        {/* Header */}
        <header className="flex flex-col gap-6">
          <div className="flex flex-wrap items-center gap-2">
            <Badge>Azure • AKS • DevOps</Badge>
            <Badge>.NET • C#</Badge>
            <Badge>Modern Cloud Portfolio</Badge>
          </div>

          <h1 className="text-4xl font-semibold tracking-tight sm:text-6xl">
            {resume.name}
          </h1>

          <p className="max-w-3xl text-lg text-black/70 dark:text-white/70 sm:text-xl">
            {resume.title}
            <span className="block pt-2">{resume.summary}</span>
          </p>

          <div className="flex flex-wrap gap-3">
            <Link
              href="#projects"
              className="rounded-xl bg-black px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:opacity-90"
            >
              View Projects
            </Link>

            <Link
              href="#experience"
              className="rounded-xl border border-black/10 bg-white/60 px-5 py-3 text-sm font-semibold text-black shadow-sm backdrop-blur transition hover:bg-white/80"
            >
              View Experience
            </Link>

            <Link
              href="#ai"
              className="rounded-xl border border-black/10 bg-white/60 px-5 py-3 text-sm font-semibold text-black shadow-sm backdrop-blur transition hover:bg-white/80"
            >
              Try AI Features
            </Link>

            <Link
              href="/ai/job-match"
              className="rounded-xl border border-black/10 bg-white/60 px-5 py-3 text-sm font-semibold text-black shadow-sm backdrop-blur transition hover:bg-white/80"
            >
              AI Job Match
            </Link>
          </div>
        </header>

        {/* Skills */}
        <section className="mt-14">
          <h2 className="text-sm font-semibold tracking-wide text-black/60 dark:text-white/60">
            CORE SKILLS
          </h2>
          <div className="mt-4 flex flex-wrap gap-2">
            {resume.skills.map((s) => (
              <Badge key={s}>{s}</Badge>
            ))}
          </div>
        </section>

        {/* Projects */}
        <section className="mx-auto max-w-6xl px-6 py-12">
          <div className="mb-6">
            <h2 className="text-2xl font-semibold tracking-tight">Projects</h2>
            <p className="text-sm text-neutral-600">
              Real deployments + production patterns (not just demo apps).
            </p>
          </div>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {/* Project Card 1 */}
            <div className="rounded-2xl border bg-white p-6 shadow-sm">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h3 className="text-lg font-semibold">SmartOps Platform</h3>
                  <p className="mt-1 text-xs text-neutral-500">Portfolio</p>
                </div>
                <a
                  href="#"
                  className="rounded-full bg-black px-3 py-1 text-xs font-medium text-white"
                >
                  GitHub
                </a>
              </div>

              <p className="mt-4 text-sm text-neutral-700">
                Cloud-native operations platform using microservices and AKS.
              </p>

              <div className="mt-4 flex flex-wrap gap-2">
                {[".NET Core", "Azure Kubernetes Service (AKS)", "Docker", "Redis"].map(
                  (t) => (
                    <span
                      key={t}
                      className="rounded-full border px-3 py-1 text-xs text-neutral-700"
                    >
                      {t}
                    </span>
                  )
                )}
              </div>

              <ul className="mt-5 list-disc space-y-2 pl-5 text-sm text-neutral-700">
                <li>Designed API + background jobs for operational workflows</li>
                <li>Containerized in Docker for local and Azure Container Registry along with Azure DevOps</li>
                <li>Deployed on Kubernetes with CI/CD pipeline and Helm Charts</li>
              </ul>
            </div>

            {/* Project Card 2 */}
            <div className="rounded-2xl border bg-white p-6 shadow-sm">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h3 className="text-lg font-semibold">
                    Healthcare Data Migration & Integration Platform
                  </h3>
                  <p className="mt-1 text-xs text-neutral-500">Professional</p>
                </div>
              </div>

              <p className="mt-4 text-sm text-neutral-700">
                Led delivery for a healthcare client, including large-scale migration and
                system integrations.
              </p>

              <div className="mt-4 flex flex-wrap gap-2">
                {[".NET / .NET Core", "Azure Functions", "Azure Key Vault", "CI/CD", "SQL"].map(
                  (t) => (
                    <span
                      key={t}
                      className="rounded-full border px-3 py-1 text-xs text-neutral-700"
                    >
                      {t}
                    </span>
                  )
                )}
              </div>

              <ul className="mt-5 list-disc space-y-2 pl-5 text-sm text-neutral-700">
                <li>Directed cross-functional team through SDLC and releases</li>
                <li>Migrated 500GB+ of healthcare data with zero loss</li>
                <li>Automated key processes to reduce manual effort</li>
              </ul>
            </div>
            {/* Project Card 3 */}
            <div className="rounded-2xl border bg-white p-6 shadow-sm">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h3 className="text-lg font-semibold">
                    Portfolio App
                  </h3>
                  <p className="mt-1 text-xs text-neutral-500">Professional</p>
                </div>
              </div>

              <p className="mt-4 text-sm text-neutral-700">
                Created a fortfolio for self, emphasizing on personal achievements and projects.
              </p>

              <div className="mt-4 flex flex-wrap gap-2">
                {[".NET / .NET Core", "Azure Functions", "Azure Key Vault", "CI/CD", "SQL"].map(
                  (t) => (
                    <span
                      key={t}
                      className="rounded-full border px-3 py-1 text-xs text-neutral-700"
                    >
                      {t}
                    </span>
                  )
                )}
              </div>

              <ul className="mt-5 list-disc space-y-2 pl-5 text-sm text-neutral-700">
                <li>Designed and Developed react based UI</li>
                <li>Enabled Chatbot using OpenAI for user to know more about me</li>
                <li>Added AI job match functionality that will generate resume with specific keywords from job description</li>
              </ul>
            </div>
            {/* Add more cards as needed */}
          </div>
        </section>

        {/* Experience 
        <section id="experience" className="mt-16">
          <div className="flex items-end justify-between gap-6">
            <div>
              <h2 className="text-2xl font-semibold">Experience</h2>
              <p className="mt-2 text-black/70 dark:text-white/70">
                Snapshot of responsibilities and delivery impact.
              </p>
            </div>
          </div>

          <div className="mt-6 rounded-2xl border border-black/10 bg-white/70 p-6 shadow-sm backdrop-blur dark:border-white/10 dark:bg-white/5">
            <div className="space-y-6">
              {resume.experience.map((e) => (
                <div key={`${e.company}-${e.title}`}>
                  <div className="flex flex-wrap items-baseline justify-between gap-2">
                    <div className="font-semibold">{e.title}</div>
                    <div className="text-sm text-black/60 dark:text-white/60">
                      {e.dates}
                    </div>
                  </div>
                  <div className="text-sm text-black/70 dark:text-white/70">
                    {e.company}
                  </div>
                  <ul className="mt-3 list-disc space-y-2 pl-5 text-sm text-black/70 dark:text-white/70">
                    {e.bullets.map((b) => (
                      <li key={b}>{b}</li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        </section>
        -->*/}
        {/* AI Section 
        <section id="ai" className="mt-16">
          <h2 className="text-2xl font-semibold">AI Features</h2>
          <p className="mt-2 max-w-3xl text-black/70 dark:text-white/70">
            Portfolio-friendly AI utilities: resume bullets, job-fit scoring, keyword gaps, and
            project pitch summaries.
          </p>

          <div className="mt-6 rounded-2xl border border-black/10 bg-white/70 p-6 shadow-sm backdrop-blur dark:border-white/10 dark:bg-white/5">
            <AiResumeAssistant resume={resume} />
          </div>

          <div className="mt-6 rounded-2xl border border-black/10 bg-white/70 p-6 text-sm text-black/70 shadow-sm backdrop-blur dark:border-white/10 dark:bg-white/5 dark:text-white/70">
            <div className="font-semibold text-black/80 dark:text-white/80">
              Tip:
            </div>
            <ul className="mt-2 list-disc space-y-1 pl-5">
              <li>
                A scoped chatbot works best: “Ask about my projects / experience / skills”.
              </li>
              <li>
                Even better: “Ask about this project” inside each project card (higher signal).
              </li>
            </ul>
          </div>
        </section>*/}

        {/* Footer */}
        <footer className="mt-16 border-t border-black/10 pt-8 text-sm text-black/60 dark:border-white/10 dark:text-white/60">
          © {new Date().getFullYear()} {resume.name} — Built with Next.js
        </footer>
      </div>
    </main>
  );
}