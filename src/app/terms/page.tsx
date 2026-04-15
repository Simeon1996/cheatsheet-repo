import type { Metadata } from "next";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import { SITE_NAME, SITE_URL } from "@/lib/site";

export const metadata: Metadata = {
  title: "Terms of Service",
  description: `Terms and conditions governing your use of ${SITE_NAME}.`,
  alternates: { canonical: `${SITE_URL}/terms` },
};

const LAST_UPDATED = "April 15, 2025";

export default function TermsPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />

      <main className="flex-1">
        <div className="mx-auto max-w-3xl px-4 py-16 sm:py-24">
          <div className="mb-12">
            <p className="text-sm text-indigo-400 font-medium mb-3">Legal</p>
            <h1 className="text-4xl font-bold text-zinc-50 mb-4">Terms of Service</h1>
            <p className="text-zinc-400">Last updated: {LAST_UPDATED}</p>
          </div>

          <div className="space-y-10">
            <Section title="Acceptance of Terms">
              <p>
                By accessing or using {SITE_NAME} (&ldquo;the Service&rdquo;), you agree to be
                bound by these Terms of Service. If you do not agree, you may not use the Service.
              </p>
              <p>
                These terms apply to all visitors, registered users, and anyone else who accesses
                the Service.
              </p>
            </Section>

            <Section title="Description of Service">
              <p>
                {SITE_NAME} is a web application that lets developers store, organize, and browse
                command-line snippets and code cheatsheets. The Service includes:
              </p>
              <ul>
                <li>A public explore section with curated cheatsheets.</li>
                <li>A private workspace where registered users create their own snippets.</li>
                <li>Image attachments for snippet cards.</li>
                <li>A full-text search over your snippets.</li>
              </ul>
            </Section>

            <Section title="Account Registration">
              <p>
                You must provide a valid email address and a password to create an account. You are
                responsible for keeping your credentials confidential and for all activity that
                occurs under your account.
              </p>
              <p>
                You must be at least 13 years old to create an account. Accounts created with false
                information may be terminated without notice.
              </p>
            </Section>

            <Section title="Acceptable Use">
              <p>You agree not to:</p>
              <ul>
                <li>Upload content that is illegal, harmful, or infringes third-party rights.</li>
                <li>Attempt to gain unauthorized access to any part of the Service or other users&apos; accounts.</li>
                <li>Use automated means (scrapers, bots) to access the Service in ways that exceed normal human usage.</li>
                <li>Introduce malware, viruses, or other malicious code.</li>
                <li>Use the Service to store or transmit sensitive personal data belonging to others.</li>
                <li>Resell or sublicense the Service without written permission.</li>
              </ul>
            </Section>

            <Section title="User Content">
              <p>
                You retain ownership of the snippets and categories you create. By storing content
                on the Service, you grant us a limited, non-exclusive license to store, display, and
                process that content solely for the purpose of providing the Service to you.
              </p>
              <p>
                You represent that you have the right to upload any content you submit, and that
                such content does not violate any applicable law or third-party rights.
              </p>
            </Section>

            <Section title="Public Content">
              <p>
                Cheatsheets visible in the public Explore section are curated by us. Users cannot
                directly create public cheatsheets. If you believe public content infringes your
                rights, contact us at the address below.
              </p>
            </Section>

            <Section title="Intellectual Property">
              <p>
                The Service&apos;s design, code, branding, and curated public content are the
                intellectual property of {SITE_NAME} and its creator. You may not copy, modify, or
                distribute them without permission.
              </p>
            </Section>

            <Section title="Availability &amp; Modifications">
              <p>
                We make no guarantee of uptime or availability. We may modify, suspend, or
                discontinue the Service (or any part of it) at any time without notice.
              </p>
              <p>
                We may also update these Terms from time to time. The &ldquo;Last updated&rdquo;
                date at the top will reflect any changes. Continued use after a change constitutes
                acceptance.
              </p>
            </Section>

            <Section title="Termination">
              <p>
                We reserve the right to suspend or terminate your account at our discretion,
                including for violation of these Terms. Upon termination, your access to the
                Service and your stored data will be removed.
              </p>
              <p>
                You may delete your account at any time by contacting us. See our{" "}
                <Link href="/privacy" className="text-indigo-400 hover:text-indigo-300 underline">
                  Privacy Policy
                </Link>{" "}
                for details on data deletion.
              </p>
            </Section>

            <Section title="Disclaimer of Warranties">
              <p>
                The Service is provided &ldquo;as is&rdquo; and &ldquo;as available&rdquo; without
                warranties of any kind, either express or implied, including but not limited to
                fitness for a particular purpose, merchantability, or non-infringement.
              </p>
            </Section>

            <Section title="Limitation of Liability">
              <p>
                To the maximum extent permitted by law, {SITE_NAME} and its creator shall not be
                liable for any indirect, incidental, special, or consequential damages arising out
                of or related to your use of the Service, even if advised of the possibility of
                such damages.
              </p>
            </Section>

            <Section title="Governing Law">
              <p>
                These Terms are governed by the laws of the jurisdiction in which the creator
                resides, without regard to conflict-of-law principles.
              </p>
            </Section>

            <Section title="Contact">
              <p>
                Questions about these Terms? Email{" "}
                <a
                  href="mailto:legal@referential-sheet.com"
                  className="text-indigo-400 hover:text-indigo-300 underline"
                >
                  legal@referential-sheet.com
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
