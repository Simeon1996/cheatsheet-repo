import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Explore Cheatsheets",
  description:
    "Browse curated developer cheatsheets for Bash, Git, Docker, Kubernetes, Python, Pandas, NumPy, SQL, Regex, HTTP, OWASP, MCP, and more — all with syntax-highlighted, copy-ready code blocks.",
  keywords: [
    "developer cheatsheets",
    "bash commands",
    "git commands",
    "docker cheatsheet",
    "kubernetes cheatsheet",
    "python snippets",
    "sql reference",
    "regex guide",
    "http status codes",
    "linux commands",
    "cron expressions",
    "owasp top 10",
  ],
  openGraph: {
    title: "Explore Developer Cheatsheets",
    description:
      "Curated, syntax-highlighted cheatsheets for Bash, Git, Docker, Kubernetes, Python, SQL, Regex, and more.",
    type: "website",
  },
  alternates: {
    canonical: "/explore",
  },
};

export default function ExploreLayout({ children }: { children: React.ReactNode }) {
  return children;
}
