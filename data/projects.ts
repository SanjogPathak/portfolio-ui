export type Project = {
    title: string;
    summary: string;
    tech: string[];
    highlights?: string[];
    links?: { label: string; url: string }[];
    category?: "Portfolio" | "Professional";
    impact?: string[];
};

export const projects: Project[] = [
    // ✅ Portfolio project (keep)
    {
        title: "SmartOps Platform",
        summary: "Cloud-native operations platform using microservices and AKS.",
        tech: [".NET Core", "Azure Kubernetes Service (AKS)", "Docker", "Redis"],
        highlights: [
            "Designed API + background jobs for operational workflows",
            "Deployed on Kubernetes with CI/CD pipeline",
        ],
        category: "Portfolio",
        links: [{ label: "GitHub", url: "https://github.com/..." }],
    },

    // ✅ Resume-based (Professional)
    {
        title: "Healthcare Data Migration & Integration Platform",
        summary:
            "Led delivery for a healthcare client, including large-scale data migration and system integrations across releases.",
        tech: [".NET / .NET Core", "Azure Functions", "Azure Key Vault", "CI/CD", "SQL"],
        highlights: [
            "Directed cross-functional team through SDLC and delivered major releases on time",
            "Implemented data migration strategy and migrated 500GB+ of healthcare data with zero data loss",
            "Automated key processes to reduce manual effort and improve data accuracy",
        ],
        category: "Professional",
    },

    {
        title: "SSIS Modernization to Azure Data Factory",
        summary:
            "Modernized ETL by converting SSIS packages to Azure Data Factory using Copilot and agentic AI-assisted workflows.",
        tech: ["SSIS", "Azure Data Factory", "Azure", "CI/CD"],
        highlights: [
            "Converted SSIS packages to Azure Data Factory using Copilot + agentic AI",
            "Improved maintainability of data workflows through cloud-native patterns",
        ],
        category: "Professional",
    },

    {
        title: "Retail Web Services & ETL Delivery",
        summary:
            "Built and supported retail web applications and backend services with strong SQL + ETL foundations.",
        tech: ["C#", "ASP.NET MVC", "Web API", "REST/SOAP", "SQL Server", "SSIS", "Splunk"],
        highlights: [
            "Designed web apps and services using C#, ASP.NET, MVC, Web API, and SOAP/REST services",
            "Built SSIS packages for ETL development to improve integration workflows",
            "Diagnosed and debugged backend issues using Splunk and supported sprint planning/JAD sessions",
        ],
        category: "Professional",
    },

    {
        title: "User Management + CMS Delivery",
        summary:
            "Built user management and delivered CMS implementations with UI improvements and strong SQL support.",
        tech: ["WordPress", "Drupal", "HTML5", "CSS3", "JavaScript", "Bootstrap", "jQuery", "SQL"],
        highlights: [
            "Created a user management system with administrator and site user roles",
            "Implemented and maintained CMS platforms (WordPress, some Drupal)",
            "Built UI screens and validation with HTML/CSS/JS and supported SQL objects for application features",
        ],
        category: "Professional",
    },

    {
        title: "Database Systems & Stored Procedure Engineering",
        summary:
            "Designed and implemented database systems with strong data quality and performance focus.",
        tech: ["SQL", "Stored Procedures", "Views", "Triggers"],
        highlights: [
            "Designed database systems and prepared design/spec documentation",
            "Implemented tables/dictionaries and ensured data quality and integrity",
            "Built complex functions, stored procedures, views, and triggers for application support",
        ],
        category: "Professional",
    },
];