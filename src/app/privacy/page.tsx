import type { Metadata } from "next";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import { SITE_NAME, SITE_URL } from "@/lib/site";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: `How ${SITE_NAME} collects, uses, and protects your personal information.`,
  alternates: { canonical: `${SITE_URL}/privacy` },
};

const LAST_UPDATED = "April 15, 2025";

export default function PrivacyPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />

      <main className="flex-1">
        <div className="mx-auto max-w-3xl px-4 py-16 sm:py-24">
          <div className="mb-12">
            <p className="text-sm text-indigo-400 font-medium mb-3">Legal</p>
            <h1 className="text-4xl font-bold text-zinc-50 mb-4">Privacy Policy</h1>
            <p className="text-zinc-400">Last updated: {LAST_UPDATED}</p>
          </div>

          <div className="prose-custom space-y-10">
            <Section title="Overview">
              <p>
                {SITE_NAME} (&ldquo;we&rdquo;, &ldquo;us&rdquo;, or &ldquo;our&rdquo;) is a personal
                developer tool for organizing command-line snippets and cheatsheets. This policy
                explains what data we collect when you use the service, why we collect it, and how
                it is stored.
              </p>
              <p>
                By creating an account or using the service, you agree to the practices described
                here. If you do not agree, please do not use {SITE_NAME}.
              </p>
            </Section>

            <Section title="Information We Collect">
              <SubSection title="Account data">
                When you register, we store your <strong>email address</strong> and a{" "}
                <strong>bcrypt-hashed password</strong>. We never store your password in plain text.
                You may optionally set a display name.
              </SubSection>
              <SubSection title="Content you create">
                Categories, snippets, and commands you create in your workspace are stored in our
                database and are private to your account by default.
              </SubSection>
              <SubSection title="Usage data">
                We use Vercel Analytics — a privacy-focused, cookieless analytics tool — to
                understand aggregate page traffic. No personal identifiers are attached to these
                events.
              </SubSection>
              <SubSection title="Session data">
                Authenticated sessions are managed via NextAuth.js using a secure, HTTP-only cookie.
                Sessions expire after 30 days of inactivity.
              </SubSection>
            </Section>

            <Section title="How We Use Your Data">
              <ul>
                <li>To authenticate you and serve your private workspace.</li>
                <li>To store and retrieve the snippets you create.</li>
                <li>To understand aggregate usage patterns and improve the service.</li>
              </ul>
              <p>
                We do not sell, rent, or share your personal data with third parties for
                advertising or marketing purposes.
              </p>
            </Section>

            <Section title="Data Storage &amp; Security">
              <p>
                Your data is stored on servers hosted by Vercel and Neon (PostgreSQL). Data in
                transit is encrypted with TLS. Passwords are hashed with bcrypt before storage.
              </p>
              <p>
                See our <Link href="/security" className="text-indigo-400 hover:text-indigo-300 underline">Security page</Link> for
                a detailed breakdown of the technical safeguards in place.
              </p>
            </Section>

            <Section title="Data Retention">
              <p>
                Your account data is retained for as long as your account is active. You may
                request deletion of your account and all associated data by contacting us at the
                address below. We will process the request within 30 days.
              </p>
            </Section>

            <Section title="Third-Party Services">
              <p>We use the following third-party services:</p>
              <ul>
                <li><strong>Vercel</strong> — hosting and edge network</li>
                <li><strong>Neon</strong> — PostgreSQL database</li>
                <li><strong>Vercel Analytics</strong> — cookieless page analytics</li>
              </ul>
              <p>
                Each provider has its own privacy policy. We encourage you to review them if you
                have concerns about how they handle data.
              </p>
            </Section>

            <Section title="Cookies">
              <p>
                We use a single session cookie set by NextAuth.js to keep you logged in. We do not
                use tracking or advertising cookies. Vercel Analytics does not set cookies.
              </p>
            </Section>

            <Section title="Your Rights">
              <p>You have the right to:</p>
              <ul>
                <li>Access the personal data we hold about you.</li>
                <li>Request correction of inaccurate data.</li>
                <li>Request deletion of your account and data.</li>
                <li>Object to processing of your data.</li>
              </ul>
              <p>
                To exercise any of these rights, contact us at{" "}
                <a href="mailto:privacy@referential-sheet.com" className="text-indigo-400 hover:text-indigo-300 underline">
                  privacy@referential-sheet.com
                </a>
                .
              </p>
            </Section>

            <Section title="Children">
              <p>
                {SITE_NAME} is not directed at children under 13. We do not knowingly collect
                personal data from children. If you believe a child has provided us with personal
                data, please contact us and we will delete it promptly.
              </p>
            </Section>

            <Section title="Changes to This Policy">
              <p>
                We may update this policy from time to time. When we do, we will update the
                &ldquo;Last updated&rdquo; date at the top. Continued use of the service after a
                change constitutes acceptance of the revised policy.
              </p>
            </Section>

            <Section title="Contact">
              <p>
                Questions about this policy? Email us at{" "}
                <a href="mailto:privacy@referential-sheet.com" className="text-indigo-400 hover:text-indigo-300 underline">
                  privacy@referential-sheet.com
                </a>
                .
              </p>
            </Section>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section>
      <h2 className="text-xl font-semibold text-zinc-100 mb-4 pb-2 border-b border-zinc-800">
        {title}
      </h2>
      <div className="space-y-3 text-zinc-400 leading-relaxed text-sm">{children}</div>
    </section>
  );
}

function SubSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h3 className="text-zinc-300 font-medium mb-1">{title}</h3>
      <p>{children}</p>
    </div>
  );
}

function Footer() {
  return (
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
  );
}
