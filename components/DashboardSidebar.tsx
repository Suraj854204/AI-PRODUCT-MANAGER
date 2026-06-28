"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Brain, LayoutDashboard, FolderKanban, Sparkles, LogOut } from "lucide-react";
import { cn } from "@/lib/utils";
import type { User } from "@/types";

const NAV_LINKS = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/dashboard/projects", label: "All Projects", icon: FolderKanban },
  { href: "/dashboard/agents", label: "AI Agents", icon: Sparkles },
];

export default function DashboardSidebar({ user }: { user: User }) {
  const pathname = usePathname();
  const router = useRouter();

  async function handleSignOut() {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
    } finally {
      router.push("/");
    }
  }

  return (
    <aside className="glass fixed inset-y-0 left-0 z-30 flex w-64 flex-col border-r border-surface-border">
      <div className="flex items-center gap-2 px-6 py-6">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-brand to-neon-cyan">
          <Brain className="h-5 w-5 text-white" />
        </div>
        <span className="text-lg font-semibold">AI PM Agent</span>
      </div>

      <nav className="flex-1 space-y-1 px-4">
        {NAV_LINKS.map((link) => {
          const active = pathname === link.href;
          const Icon = link.icon;
          return (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                "focus-ring flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                active
                  ? "bg-brand/15 text-brand-light"
                  : "text-slate-400 hover:bg-surface-card hover:text-slate-200"
              )}
            >
              <Icon className="h-4 w-4" />
              {link.label}
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-surface-border p-4">
        <div className="flex items-center gap-3 rounded-lg px-2 py-2">
          <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-brand/20 text-sm font-semibold text-brand-light">
            {(user.name || user.email).charAt(0).toUpperCase()}
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium text-slate-200">
              {user.name || user.email}
            </p>
            <span className="inline-flex items-center rounded-full bg-brand/15 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide text-brand-light">
              {user.plan}
            </span>
          </div>
        </div>
        <button
          onClick={handleSignOut}
          className="focus-ring mt-2 flex w-full items-center gap-2 rounded-lg px-2 py-2 text-sm text-slate-400 hover:bg-surface-card hover:text-slate-200"
        >
          <LogOut className="h-4 w-4" />
          Sign out
        </button>
      </div>
    </aside>
  );
}