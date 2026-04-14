"use client";

import Link from "next/link";
import { useSession } from "next-auth/react";
import Navbar from "@/components/Navbar";
import {
  Terminal,
  Copy,
  FolderOpen,
  Sparkles,
  Shield,
  Zap,
} from "lucide-react";
import Button from "@/components/ui/Button";

const FEATURES = [
  {
    icon: FolderOpen,
    title: "Organize by Category",
    description:
      "Group your commands into categories like AWS, Kubernetes, Docker, and more with custom colors and icons.",
  },
  {
    icon: Copy,
    title: "One-Click Copy",
    description:
      "Copy any command to your clipboard instantly. No more digging through docs or history.",
  },
  {
    icon: Sparkles,
    title: "AI Assistant",
    description:
      "Let AI generate entire cheatsheets for you. Just describe what you need and it creates organized snippets.",
  },
  {
    icon: Shield,
    title: "Private Workspace",
    description:
      "Categories you create are private to you — only you can see and manage them. Public cheatsheets are curated and cannot be created by users.",
  },
  {
    icon: Zap,
    title: "Fast & Lightweight",
    description:
      "Built for speed. SQLite database means zero latency, instant search, and offline capability.",
  },
  {
    icon: Terminal,
    title: "Multi-Language",
    description:
      "Support for Bash, Python, SQL, YAML, HCL, and many more languages with proper syntax labeling.",
  },
];

export default function HomePage() {
  const { data: session } = useSession();

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />

      <main className="flex-1">
        <section className="relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-b from-indigo-500/5 to-transparent" />
          <div className="relative mx-auto max-w-5xl px-4 py-24 text-center">
            <div className="inline-flex items-center gap-2 rounded-full border border-indigo-500/20 bg-indigo-500/5 px-4 py-1.5 text-sm text-indigo-400 mb-8">
              <Terminal className="h-4 w-4" />
              Your personal command reference
            </div>

            <h1 className="text-5xl font-bold tracking-tight text-zinc-50 sm:text-6xl">
              Never forget a{" "}
              <span className="bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">
                command
              </span>{" "}
              again
            </h1>

            <p className="mx-auto mt-6 max-w-2xl text-lg text-zinc-400">
              Organize your most-used commands and code snippets in one
              beautiful, searchable place. Create categories, add notes, and
              copy with a single click.
            </p>

            <div className="mt-10 flex items-center justify-center gap-4">
              {session ? (
                <Link href="/workspace">
                  <Button size="lg">
                    <Zap className="h-5 w-5" />
                    Go to Workspace
                  </Button>
                </Link>
              ) : (
                <Link href="/register">
                  <Button size="lg">
                    <Zap className="h-5 w-5" />
                    Get Started Free
                  </Button>
                </Link>
              )}
              <Link href="/explore">
                <Button variant="secondary" size="lg">
                  Browse Public Cheatsheets
                </Button>
              </Link>
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-6xl px-4 py-20">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-zinc-100">
              Everything you need
            </h2>
            <p className="mt-3 text-zinc-400">
              A complete toolkit for managing your command-line knowledge.
            </p>
          </div>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {FEATURES.map((feature) => (
              <div
                key={feature.title}
                className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-6 hover:border-zinc-700 transition-colors"
              >
                <div className="mb-4 inline-flex rounded-lg bg-indigo-500/10 p-2.5">
                  <feature.icon className="h-5 w-5 text-indigo-400" />
                </div>
                <h3 className="text-lg font-semibold text-zinc-100">
                  {feature.title}
                </h3>
                <p className="mt-2 text-sm text-zinc-400 leading-relaxed">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </section>

        <section className="border-t border-zinc-800">
          <div className="mx-auto max-w-3xl px-4 py-20 text-center">
            <h2 className="text-3xl font-bold text-zinc-100">
              Ready to get organized?
            </h2>
            <p className="mt-4 text-zinc-400">
              Start building your personal cheatsheet library today.
            </p>
            <div className="mt-8">
              {session ? (
                <Link href="/workspace">
                  <Button size="lg">Open Workspace</Button>
                </Link>
              ) : (
                <Link href="/register">
                  <Button size="lg">Create Free Account</Button>
                </Link>
              )}
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-zinc-800 py-6 text-center text-sm text-zinc-500">
        CheatSheet &mdash; 
      </footer>
    </div>
  );
}
