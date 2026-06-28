"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Plus, Search, Loader2, Sparkles } from "lucide-react";
import { toast } from "sonner";
import StatusBadge from "@/components/StatusBadge";
import NewProjectModal from "@/components/NewProjectModal";
import DashboardSidebar from "@/components/DashboardSidebar";
import { formatDate, cn } from "@/lib/utils";
import type { Project, ProjectStatus, User } from "@/types";

const FILTERS: Array<{ label: string; value: ProjectStatus | "ALL" }> = [
  { label: "All", value: "ALL" },
  { label: "Pending", value: "PENDING" },
  { label: "Processing", value: "PROCESSING" },
  { label: "Completed", value: "COMPLETED" },
  { label: "Failed", value: "FAILED" },
];

export default function AllProjectsPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<ProjectStatus | "ALL">("ALL");

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
        toast.error("Failed to load your projects");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [router]);

  const filtered = useMemo(() => {
    return projects.filter((p) => {
      const matchesFilter = filter === "ALL" || p.status === filter;
      const matchesQuery =
        !query.trim() ||
        p.title.toLowerCase().includes(query.toLowerCase()) ||
        p.idea.toLowerCase().includes(query.toLowerCase());
      return matchesFilter && matchesQuery;
    });
  }, [projects, query, filter]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-brand" />
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="min-h-screen">
      <DashboardSidebar user={user} />

      <main className="ml-64 min-h-screen px-8 py-8">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">All Projects</h1>
            <p className="mt-1 text-sm text-slate-400">
              {projects.length} project{projects.length === 1 ? "" : "s"} total.
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

        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="relative max-w-sm flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search projects..."
              className="focus-ring w-full rounded-lg border border-surface-border bg-surface-card py-2.5 pl-9 pr-4 text-sm text-slate-100 placeholder:text-slate-500"
            />
          </div>

          <div className="flex flex-wrap gap-2">
            {FILTERS.map((f) => (
              <button
                key={f.value}
                onClick={() => setFilter(f.value)}
                className={cn(
                  "focus-ring rounded-full border px-3 py-1.5 text-xs font-medium transition-colors",
                  filter === f.value
                    ? "border-brand bg-brand/15 text-brand-light"
                    : "border-surface-border text-slate-400 hover:bg-surface-card"
                )}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>

        <div className="glass rounded-2xl">
          {filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center px-6 py-16 text-center">
              <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-brand/15">
                <Sparkles className="h-6 w-6 text-brand-light" />
              </div>
              <h3 className="font-medium text-slate-200">
                {projects.length === 0 ? "No projects yet" : "No projects match your filters"}
              </h3>
              <p className="mt-1 max-w-sm text-sm text-slate-400">
                {projects.length === 0
                  ? "Describe your idea and let seven AI agents build your first product plan."
                  : "Try a different search term or status filter."}
              </p>
              {projects.length === 0 && (
                <button
                  onClick={() => setModalOpen(true)}
                  className="focus-ring mt-6 flex items-center gap-2 rounded-lg bg-brand px-4 py-2.5 text-sm font-medium text-white hover:bg-brand-dark"
                >
                  <Plus className="h-4 w-4" />
                  New Project
                </button>
              )}
            </div>
          ) : (
            <ul className="divide-y divide-surface-border">
              {filtered.map((project) => (
                <li key={project.id}>
                  <Link
                    href={`/project/${project.id}`}
                    className="flex items-center justify-between gap-4 px-6 py-4 transition-colors hover:bg-surface-card/50"
                  >
                    <div className="min-w-0 flex-1">
                      <p className="truncate font-medium text-slate-100">{project.title}</p>
                      <p className="mt-0.5 truncate text-sm text-slate-500">{project.idea}</p>
                      {project.industry && (
                        <span className="mt-1.5 inline-block rounded-full bg-surface-card px-2 py-0.5 text-[11px] text-slate-500">
                          {project.industry}
                        </span>
                      )}
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