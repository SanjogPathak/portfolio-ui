import { NextResponse } from "next/server";

export async function POST(req: Request) {
    const body = await req.json().catch(() => ({}));
    const jobDescription = String(body?.jobDescription ?? "").trim();

    if (!jobDescription) {
        return NextResponse.json({ error: "jobDescription is required" }, { status: 400 });
    }

    // For now (no OpenAI key yet), return a strong “demo” response.
    // We’ll wire real AI later (Vercel + OpenAI) without changing the UI.
    const result = {
        tailoredBullets: [
            "Built and deployed cloud-native .NET APIs to Kubernetes (AKS), enabling scalable microservice delivery.",
            "Designed CI/CD pipelines (Azure DevOps) to build/push container images and automate AKS deployments.",
            "Implemented ingress routing and service exposure patterns for reliable external access and API documentation.",
        ],
        keywords: [
            "AKS",
            "Kubernetes",
            "Azure DevOps",
            "Docker",
            "Helm",
            "Ingress (NGINX)",
            "CI/CD",
            ".NET 8",
            "Terraform (nice-to-have)",
        ],
        pitch:
            "I’m a cloud-focused .NET engineer who ships production workloads on AKS with automated pipelines, containerized builds, and clean deployment patterns. I can ramp quickly and deliver reliable, secure, observable services.",
    };

    return NextResponse.json(result);
}