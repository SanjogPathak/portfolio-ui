import type { ReactNode } from "react";
import Link from "next/link";

const resume = {
  name: "Sanjog Pathak",
  title: "Cloud / .NET Developer (Azure • AKS • DevOps)",
  summary:
    "I build cloud-native apps and deployment pipelines with Azure, Kubernetes, Docker, and .NET. I enjoy shipping reliable systems with clean CI/CD and production-ready patterns.",
  skills: [
    "Azure",
    "Azure Service Bus",
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

function Badge({ children }: { children: ReactNode }) {
  return (
    <span className="rounded-full border border-slate-200 bg-white px-3 py-1 text-sm font-medium text-slate-700 shadow-sm">
      {children}
    </span>
  );
}

function TechChip({ children }: { children: ReactNode }) {
  return (
    <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-700">
      {children}
    </span>
  );
}

export default function Home() {
  return (
    <main className="min-h-screen bg-slate-200 text-slate-900">
      <div className="pointer-events-none fixed inset-0 opacity-[0.08] [background-image:linear-gradient(to_right,rgba(15,23,42,0.08)_1px,transparent_1px),linear-gradient(to_bottom,rgba(15,23,42,0.08)_1px,transparent_1px)] [background-size:64px_64px]" />

      <div className="mx-auto max-w-6xl px-6 py-16">
        <header className="flex flex-col gap-6">
          <div className="flex flex-wrap items-center gap-2">
            <Badge>Azure • AKS • DevOps</Badge>
            <Badge>.NET • C#</Badge>
            <Badge>Modern Cloud Portfolio</Badge>
          </div>

          <h1 className="text-4xl font-semibold tracking-tight text-slate-950 sm:text-6xl">
            {resume.name}
          </h1>

          <p className="max-w-3xl text-lg text-slate-700 sm:text-xl">
            {resume.title}
            <span className="block pt-2">{resume.summary}</span>
          </p>

          <div className="flex flex-wrap gap-3">
            <Link
              href="#projects"
              className="rounded-xl bg-black px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-slate-800"
            >
              View Projects
            </Link>

            <a
              href="https://github.com/SanjogPathak"
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-xl border border-slate-300 bg-white px-5 py-3 text-sm font-semibold text-slate-900 shadow-sm transition hover:bg-slate-50"
            >
              GitHub
            </a>

            <a
              href="https://portfolio-ui-xi-five.vercel.app"
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-xl border border-slate-300 bg-white px-5 py-3 text-sm font-semibold text-slate-900 shadow-sm transition hover:bg-slate-50"
            >
              Live Portfolio
            </a>
            <Link href="/ai/job-match" className="rounded-xl border border-black/10 bg-white/60 px-5 py-3 text-sm font-semibold text-black shadow-sm backdrop-blur transition hover:bg-white/80" > AI Job Match </Link>
          </div>
        </header>

        <section className="mt-14">
          <h2 className="text-sm font-semibold tracking-wide text-slate-600">
            CORE SKILLS
          </h2>
          <div className="mt-4 flex flex-wrap gap-2">
            {resume.skills.map((skill) => (
              <Badge key={skill}>{skill}</Badge>
            ))}
          </div>
        </section>

        <section id="projects" className="mt-14">
          <div className="mb-6">
            <h2 className="text-2xl font-semibold tracking-tight text-slate-950">
              Projects
            </h2>
            <p className="text-sm text-slate-600">
              Real deployments + production patterns (not just demo apps).
            </p>
          </div>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition hover:shadow-md">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h3 className="text-lg font-semibold text-slate-950">
                    SmartOps Platform
                  </h3>
                  <p className="mt-1 text-xs text-slate-500">Portfolio</p>
                </div>
                <a
                  href="https://github.com/SanjogPathak/SmartOps/tree/master"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="rounded-full bg-black px-3 py-1 text-xs font-medium text-white transition hover:bg-slate-800"
                >
                  GitHub
                </a>
              </div>

              <p className="mt-4 text-sm text-slate-700">
                Cloud-native operations platform using microservices, AKS, and
                event-driven integration patterns.
              </p>

              <div className="mt-4 flex flex-wrap gap-2">
                {[
                  ".NET Core",
                  "Azure Kubernetes Service (AKS)",
                  "Azure Service Bus",
                  "Docker",
                  "Redis",
                ].map((tech) => (
                  <TechChip key={tech}>{tech}</TechChip>
                ))}
              </div>

              <ul className="mt-5 list-disc space-y-2 pl-5 text-sm text-slate-700">
                <li>Designed API + background jobs for operational workflows</li>
                <li>
                  Containerized in Docker for local development and Azure Container
                  Registry with Azure DevOps
                </li>
                <li>
                  Deployed on Kubernetes with CI/CD pipelines and Helm charts
                </li>
                <li>
                  Designed asynchronous messaging using Azure Service Bus to
                  decouple services and improve scalability
                </li>
              </ul>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition hover:shadow-md">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h3 className="text-lg font-semibold text-slate-950">
                    Healthcare Data Migration &amp; Integration Platform
                  </h3>
                  <p className="mt-1 text-xs text-slate-500">Professional</p>
                </div>
              </div>

              <p className="mt-4 text-sm text-slate-700">
                Led delivery for a healthcare client, including large-scale
                migration and system integrations.
              </p>

              <div className="mt-4 flex flex-wrap gap-2">
                {[
                  ".NET / .NET Core",
                  "Azure Functions",
                  "Azure Key Vault",
                  "CI/CD",
                  "SQL",
                ].map((tech) => (
                  <TechChip key={tech}>{tech}</TechChip>
                ))}
              </div>

              <ul className="mt-5 list-disc space-y-2 pl-5 text-sm text-slate-700">
                <li>Directed cross-functional team through SDLC and releases</li>
                <li>Migrated 500GB+ of healthcare data with zero loss</li>
                <li>Automated key processes to reduce manual effort</li>
              </ul>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition hover:shadow-md">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h3 className="text-lg font-semibold text-slate-950">
                    Portfolio App
                  </h3>
                  <p className="mt-1 text-xs text-slate-500">Personal</p>
                </div>
              </div>

              <p className="mt-4 text-sm text-slate-700">
                Built a personal portfolio to highlight projects, skills, and
                cloud engineering experience in a clean, recruiter-friendly format.
              </p>

              <div className="mt-4 flex flex-wrap gap-2">
                {[
                  "Next.js",
                  "TypeScript",
                  "Tailwind CSS",
                  "Vercel",
                  "OpenAI",
                ].map((tech) => (
                  <TechChip key={tech}>{tech}</TechChip>
                ))}
              </div>

              <ul className="mt-5 list-disc space-y-2 pl-5 text-sm text-slate-700">
                <li>Designed and developed a responsive React/Next.js UI</li>
                <li>
                  Added recruiter-focused sections for projects, skills, and live
                  portfolio access
                </li>
                <li>
                  Deployed to Vercel with GitHub integration for continuous delivery
                </li>
              </ul>
            </div>
          </div>
        </section>

        <footer className="mt-16 border-t border-slate-200 pt-8 text-sm text-slate-600">
          © {new Date().getFullYear()} {resume.name} — Built with Next.js
        </footer>
      </div>
    </main>
  );
}