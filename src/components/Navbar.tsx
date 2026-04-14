"use client";

import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import { Terminal, LogOut, User, Compass, LayoutDashboard } from "lucide-react";
import Button from "./ui/Button";

export default function Navbar() {
  const { data: session } = useSession();

  return (
    <nav className="sticky top-0 z-40 border-b border-zinc-800 bg-zinc-950/80 backdrop-blur-md">
      <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-4">
        <Link href="/" className="flex items-center gap-2 text-zinc-100 hover:text-white transition-colors">
          <Terminal className="h-5 w-5 text-indigo-400" />
          <span className="font-bold text-lg">CheatSheet</span>
        </Link>

        <div className="flex items-center gap-2">
          <Link href="/explore">
            <Button variant="ghost" size="sm">
              <Compass className="h-4 w-4" />
              Explore
            </Button>
          </Link>

          {session ? (
            <>
              <Link href="/workspace">
                <Button variant="ghost" size="sm">
                  <LayoutDashboard className="h-4 w-4" />
                  Workspace
                </Button>
              </Link>
              <Link href="/profile">
                <Button variant="ghost" size="sm">
                  <User className="h-4 w-4" />
                  Profile
                </Button>
              </Link>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => signOut({ callbackUrl: "/" })}
              >
                <LogOut className="h-4 w-4" />
                Sign Out
              </Button>
            </>
          ) : (
            <>
              <Link href="/login">
                <Button variant="ghost" size="sm">Sign In</Button>
              </Link>
              <Link href="/register">
                <Button variant="primary" size="sm">Get Started</Button>
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
