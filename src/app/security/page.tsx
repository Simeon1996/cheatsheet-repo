import type { Metadata } from "next";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import { Shield, Lock, Key, Server, AlertTriangle, Eye } from "lucide-react";
import { SITE_NAME, SITE_URL } from "@/lib/site";

export const metadata: Metadata = {
  title: "Security",
  description: `How ${SITE_NAME} protects your account and data.`,
  alternates: { canonical: `${SITE_URL}/security` },
};

const PRACTICES = [
  {
    icon: Key,
    title: "Password Hashing",
    description:
      "Passwords are hashed with bcrypt (cost factor 12) before storage. Plain-text passwords are never written to disk or logs.",
  },
  {
    icon: Lock,
    title: "Encrypted Transit",
    description:
      "All traffic between your browser and our servers is encrypted with TLS 1.2+. We enforce HTTPS and set HSTS headers.",
  },
  {
    icon: Shield,
    title: "HTTP-Only Session Cookies",
    description:
      "Authentication cookies are HTTP-only and Secure-flagged, preventing JavaScript access and reducing XSS exposure.",
  },
  {
    icon: Eye,
    title: "Private Workspaces",
    description:
      "All user-created categories and snippets are scoped to the authenticated owner. API routes verify session ownership on every write operation.",
  },
  {
    icon: Server,
    title: "Rate Limiting",
    description:
      "API endpoints are rate-limited per user to prevent abuse. Authentication attempts are throttled to slow brute-force attacks.",
  },
  {
    icon: AlertTriangle,
    title: "Input Validation",
    description:
      "All user input is validated server-side before being processed or stored. Content-type headers are verified on file uploads.",
  },
];

export default function SecurityPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />

      <main className="flex-1">
        {/* Header */}
        <section className="relative overflow-hidden border-b border-zinc-800">
          <div className="absolute inset-0 bg-gradient-to-b from-indigo-500/5 to-transparent" />
          <div className="relative mx-auto max-w-3xl px-4 py-16 sm:py-24">
            <p className="text-sm text-indigo-400 font-medium mb-3">Trust &amp; Safety</p>
            <h1 className="text-4xl font-bold text-zinc-50 mb-4">Security</h1>
            <p className="text-zinc-400 leading-relaxed max-w-xl">
              Security is a first-class concern at {SITE_NAME}. This page documents the technical
              controls in place to protect your account and data.
            </p>
          </div>
        </section>

        {/* Practices grid */}
        <section className="mx-auto max-w-5xl px-4 py-16">
          <h2 className="text-2xl font-bold text-zinc-100 mb-10">Security Practices</h2>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {PRACTICES.map((item) => (
              <div
                key={item.title}
                className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-6 hover:border-zinc-700 transition-colors"
              >
                <div className="mb-4 inline-flex rounded-lg bg-indigo-500/10 p-2.5">
                  <item.icon className="h-5 w-5 text-indigo-400" />
                </div>
                <h3 className="text-base font-semibold text-zinc-100 mb-2">{item.title}</h3>
                <p className="text-sm text-zinc-400 leading-relaxed">{item.description}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Infrastructure */}
        <section className="border-t border-zinc-800">
          <div className="mx-auto max-w-3xl px-4 py-16">
            <h2 className="text-2xl font-bold text-zinc-100 mb-8">Infrastructure</h2>
            <div className="space-y-6 text-sm text-zinc-400 leading-relaxed">
              <div>
                <h3 className="text-zinc-200 font-semibold mb-1">Hosting</h3>
                <p>
                  The application runs on <strong className="text-zinc-300">Vercel</strong>&apos;s
                  edge network. Static assets are served from Vercel&apos;s global CDN. Serverless
                  functions run in isolated execution environments.
                </p>
              </div>
              <div>
                <h3 className="text-zinc-200 font-semibold mb-1">Database</h3>
                <p>
                  User data is stored in a <strong className="text-zinc-300">Neon PostgreSQL</strong>{" "}
                  database. Connections use TLS. Database credentials are stored as environment
                  variables and never exposed to the client.
                </p>
              </div>
              <div>
                <h3 className="text-zinc-200 font-semibold mb-1">File Storage</h3>
                <p>
                  Uploaded images are stored in{" "}
                  <strong className="text-zinc-300">Cloudflare R2</strong>. Access to upload
                  endpoints requires an authenticated session. File types and sizes are validated
                  server-side before acceptance.
                </p>
              </div>
              <div>
                <h3 className="text-zinc-200 font-semibold mb-1">Secrets Management</h3>
                <p>
                  All secrets (database credentials, API keys, auth secrets) are stored as
                  encrypted environment variables in Vercel. They are never committed to source
                  control or logged.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Responsible Disclosure */}
        <section className="border-t border-zinc-800">
          <div className="mx-auto max-w-3xl px-4 py-16">
            <h2 className="text-2xl font-bold text-zinc-100 mb-4">Responsible Disclosure</h2>
            <p className="text-zinc-400 text-sm leading-relaxed mb-6">
              If you discover a security vulnerability in {SITE_NAME}, please report it
              responsibly. We ask that you:
            </p>
            <ul className="space-y-2 text-sm text-zinc-400 list-disc list-inside mb-6">
              <li>Do not publicly disclose the issue until we have had a chance to address it.</li>
              <li>Do not access, modify, or delete data that is not yours.</li>
              <li>Provide enough detail to reproduce and understand the vulnerability.</li>
            </ul>
            <p className="text-zinc-400 text-sm leading-relaxed">
              Report vulnerabilities by email to{" "}
              <a
                href="mailto:security@referential-sheet.com"
                className="text-indigo-400 hover:text-indigo-300 underline"
              >
                security@referential-sheet.com
              </a>
              . We aim to acknowledge reports within 48 hours and resolve critical issues within
              14 days.
            </p>
          </div>
        </section>
      </main>

      <footer className="border-t border-zinc-800 py-6 text-center text-sm text-zinc-500">
        <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2">
          <span>
            Built by{" "}
            <a href="https://simeonivanov.dev" className="underline hover:text-zinc-300 transition-colors">
              simeon.dev
            </a>
          </span>
          <Link href="/privacy" className="hover:text-zinc-300 transition-colors">Privacy</Link>
          <Link href="/terms" className="hover:text-zinc-300 transition-colors">Terms</Link>
          <Link href="/security" className="hover:text-zinc-300 transition-colors">Security</Link>
        </div>
      </footer>
    </div>
  );
}
