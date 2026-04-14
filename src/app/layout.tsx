import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Providers from "@/components/Providers";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
const SITE_NAME = "CheatSheet";
const SITE_DESCRIPTION =
  "A curated, searchable library of developer cheatsheets — Bash, Git, Docker, Kubernetes, Python, SQL, Regex, and more. Copy commands with one click.";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),

  title: {
    default: `${SITE_NAME} — Developer Command Reference`,
    template: `%s | ${SITE_NAME}`,
  },
  description: SITE_DESCRIPTION,
  keywords: [
    "cheatsheet",
    "developer cheatsheet",
    "command reference",
    "bash cheatsheet",
    "git cheatsheet",
    "docker cheatsheet",
    "kubernetes cheatsheet",
    "python cheatsheet",
    "sql cheatsheet",
    "linux commands",
    "regex cheatsheet",
    "code snippets",
    "devops reference",
    "programming reference",
  ],
  authors: [{ name: "Simeon Ivanov", url: "https://simeonivanov.dev" }],
  creator: "Simeon Ivanov",
  publisher: SITE_NAME,

  openGraph: {
    type: "website",
    siteName: SITE_NAME,
    title: `${SITE_NAME} — Developer Command Reference`,
    description: SITE_DESCRIPTION,
    url: SITE_URL,
    locale: "en_US",
  },

  twitter: {
    card: "summary_large_image",
    title: `${SITE_NAME} — Developer Command Reference`,
    description: SITE_DESCRIPTION,
    creator: "@simeonivanov",
  },

  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-snippet": -1,
      "max-image-preview": "large",
      "max-video-preview": -1,
    },
  },

  alternates: {
    canonical: SITE_URL,
  },
};

export const viewport: Viewport = {
  themeColor: "#0a0a0a",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased dark`}
    >
      <body className="min-h-full flex flex-col bg-zinc-950 text-zinc-50">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
