"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import Navbar from "@/components/Navbar";
import { User, Mail, Shield } from "lucide-react";

export default function ProfilePage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    }
  }, [status, router]);

  if (status === "loading" || !session) {
    return (
      <div className="flex min-h-screen flex-col">
        <Navbar />
        <main className="flex flex-1 items-center justify-center">
          <div className="text-zinc-400">Loading...</div>
        </main>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="flex-1 px-4 py-12">
        <div className="mx-auto max-w-lg">
          <h1 className="text-2xl font-bold text-zinc-100 mb-8">Profile</h1>

          <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-6 space-y-6">
            <div className="flex items-center gap-4">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-indigo-500/10 text-indigo-400">
                <User className="h-8 w-8" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-zinc-100">
                  {session.user.name}
                </h2>
                <p className="text-sm text-zinc-400">
                  {session.user.role === "ADMIN" ? "Administrator" : "User"}
                </p>
              </div>
            </div>

            <div className="space-y-4 border-t border-zinc-800 pt-6">
              <div className="flex items-center gap-3">
                <Mail className="h-4 w-4 text-zinc-500" />
                <div>
                  <p className="text-xs text-zinc-500 uppercase tracking-wider">
                    Email
                  </p>
                  <p className="text-sm text-zinc-200">{session.user.email}</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <Shield className="h-4 w-4 text-zinc-500" />
                <div>
                  <p className="text-xs text-zinc-500 uppercase tracking-wider">
                    Role
                  </p>
                  <p className="text-sm text-zinc-200">{session.user.role}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
