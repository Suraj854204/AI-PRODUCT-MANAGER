"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  FolderOpen,
  CheckCircle2,
  Loader2,
  CreditCard,
  Plus,
  Sparkles,
} from "lucide-react";
import { toast } from "sonner";
import StatusBadge from "@/components/StatusBadge";
import NewProjectModal from "@/components/NewProjectModal";
import DashboardSidebar from "@/components/DashboardSidebar";
import { formatDate, cn } from "@/lib/utils";
import type { Project, User } from "@/types";

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);

  useEffect(() => {
    async function load() {
      try {
        const meRes = await fetch("/api/auth/me");
        if (!meRes.ok) {
          router.push("/login");
          return;
        }
        const meJson = await meRes.json();
        if (!meJson.success) {
          router.push("/login");
          return;
        }
        setUser(meJson.data);

        const projectsRes = await fetch("/api/projects");
        const projectsJson = await projectsRes.json();
        if (projectsJson.success) {
          setProjects(projectsJson.data);
        }
      } catch {
        toast.error("Failed to load your dashboard");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [router]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-brand" />
      </div>
    );
  }

  if (!user) return null;

  const stats = {
    total: projects.length,
    completed: projects.filter((p) => p.status === "COMPLETED").length,
    processing: projects.filter((p) => p.status === "PROCESSING").length,
  };

  return (
    <div className="min-h-screen">
      <DashboardSidebar user={user} />

      <main className="ml-64 min-h-screen px-8 py-8">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">
              Welcome back{user.name ? `, ${user.name.split(" ")[0]}` : ""}
            </h1>
            <p className="mt-1 text-sm text-slate-400">
              Here&apos;s what your agents have been building.
            </p>
          </div>
          <button
            onClick={() => setModalOpen(true)}
            className="focus-ring glow flex items-center gap-2 rounded-lg bg-brand px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-brand-dark"
          >
            <Plus className="h-4 w-4" />
            New Project
          </button>
        </div>

        <div className="mb-8 grid grid-cols-2 gap-4 sm:grid-cols-4">
          <StatCard icon={FolderOpen} label="Total Projects" value={stats.total} color="text-brand-light" />
          <StatCard icon={CheckCircle2} label="Completed" value={stats.completed} color="text-neon-green" />
          <StatCard icon={Loader2} label="Processing" value={stats.processing} color="text-amber-400" spin={stats.processing > 0} />
          <StatCard icon={CreditCard} label="Plan" value={user.plan} color="text-neon-cyan" isText />
        </div>

        <div className="glass rounded-2xl">
          <div className="border-b border-surface-border px-6 py-4">
            <h2 className="font-semibold">Your projects</h2>
          </div>

          {projects.length === 0 ? (
            <div className="flex flex-col items-center justify-center px-6 py-16 text-center">
              <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-brand/15">
                <Sparkles className="h-6 w-6 text-brand-light" />
              </div>
              <h3 className="font-medium text-slate-200">No projects yet</h3>
              <p className="mt-1 max-w-sm text-sm text-slate-400">
                Describe your idea and let seven AI agents build your first product plan.
              </p>
              <button
                onClick={() => setModalOpen(true)}
                className="focus-ring mt-6 flex items-center gap-2 rounded-lg bg-brand px-4 py-2.5 text-sm font-medium text-white hover:bg-brand-dark"
              >
                <Plus className="h-4 w-4" />
                New Project
              </button>
            </div>
          ) : (
            <ul className="divide-y divide-surface-border">
              {projects.map((project) => (
                <li key={project.id}>
                  <Link
                    href={`/project/${project.id}`}
                    className="flex items-center justify-between gap-4 px-6 py-4 transition-colors hover:bg-surface-card/50"
                  >
                    <div className="min-w-0 flex-1">
                      <p className="truncate font-medium text-slate-100">{project.title}</p>
                      <p className="mt-0.5 truncate text-sm text-slate-500">{project.idea}</p>
                    </div>
                    <div className="flex flex-shrink-0 items-center gap-4">
                      <span className="hidden text-xs text-slate-500 sm:block">{formatDate(project.createdAt)}</span>
                      <StatusBadge status={project.status} />
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>
      </main>

      <NewProjectModal open={modalOpen} onClose={() => setModalOpen(false)} />
    </div>
  );
}

function StatCard({
  icon: Icon,
  label,
  value,
  color,
  spin,
  isText,
}: {
  icon: typeof FolderOpen;
  label: string;
  value: number | string;
  color: string;
  spin?: boolean;
  isText?: boolean;
}) {
  return (
    <div className="glass rounded-xl p-4">
      <div className="flex items-center justify-between">
        <span className="text-xs text-slate-500">{label}</span>
        <Icon className={cn("h-4 w-4", color, spin && "animate-spin")} />
      </div>
      <p className={cn("mt-2 text-2xl font-bold", isText && "text-lg")}>{value}</p>
    </div>
  );
}