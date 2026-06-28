"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Search,
  FileText,
  ListChecks,
  Map as MapIcon,
  TrendingUp,
  Users,
  ShieldAlert,
  Loader2,
  Plus,
  ArrowRight,
} from "lucide-react";
import { toast } from "sonner";
import NewProjectModal from "@/components/NewProjectModal";
import DashboardSidebar from "@/components/DashboardSidebar";
import type { User } from "@/types";

const AGENTS = [
  {
    icon: Search,
    name: "Market Research Agent",
    tagline: "Scans the competitive landscape",
    description: "Identifies 4-5 real competitors, current market size, growth trends, and the opportunities and threats specific to your idea.",
    color: "text-brand-light",
    bg: "bg-brand/15",
  },
  {
    icon: FileText,
    name: "PRD Writer Agent",
    tagline: "Writes the requirements doc",
    description: "Produces a full PRD: problem statement, goals and non-goals, 8+ prioritized features with acceptance criteria, and success metrics.",
    color: "text-blue-400",
    bg: "bg-blue-500/15",
  },
  {
    icon: ListChecks,
    name: "User Stories Agent",
    tagline: "Breaks features into sprints",
    description: "Organizes the PRD into 4-5 epics, each with story-pointed user stories ready to import into your sprint board.",
    color: "text-purple-400",
    bg: "bg-purple-500/15",
  },
  {
    icon: MapIcon,
    name: "Roadmap Planner Agent",
    tagline: "Sequences the build",
    description: "Plans a four-phase roadmap with goals, feature sequencing, and a milestone for each phase, starting from what ships first.",
    color: "text-neon-cyan",
    bg: "bg-neon-cyan/15",
  },
  {
    icon: TrendingUp,
    name: "Market Analysis Agent",
    tagline: "Sizes the opportunity",
    description: "Estimates TAM, SAM, and SOM, projects 3 years of revenue and users, and recommends a pricing and go-to-market strategy.",
    color: "text-emerald-400",
    bg: "bg-emerald-500/15",
  },
  {
    icon: Users,
    name: "Persona Creator Agent",
    tagline: "Gives the product a face",
    description: "Builds 3 detailed user personas with goals, pain points, tech-savviness, and a quote that captures how they think.",
    color: "text-pink-400",
    bg: "bg-pink-500/15",
  },
  {
    icon: ShieldAlert,
    name: "Risk Analyst Agent",
    tagline: "Flags what could go wrong",
    description: "Scores 8-10 risks across technical, market, financial, operational, and legal categories, each with a mitigation plan.",
    color: "text-red-400",
    bg: "bg-red-500/15",
  },
];

export default function AgentsPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
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
      } catch {
        toast.error("Failed to load your account");
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

  return (
    <div className="min-h-screen">
      <DashboardSidebar user={user} />

      <main className="ml-64 min-h-screen px-8 py-8">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">AI Agents</h1>
            <p className="mt-1 text-sm text-slate-400">
              Seven specialists that run sequentially against every project.
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

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {AGENTS.map((agent, i) => (
            <div key={agent.name} className="glass rounded-2xl p-6">
              <div className="mb-4 flex items-center gap-3">
                <div className={`flex h-11 w-11 items-center justify-center rounded-lg ${agent.bg}`}>
                  <agent.icon className={`h-5 w-5 ${agent.color}`} />
                </div>
                <span className="text-xs font-medium text-slate-500">Step {i + 1}</span>
              </div>
              <h3 className="font-semibold text-slate-100">{agent.name}</h3>
              <p className={`mt-0.5 text-xs font-medium ${agent.color}`}>{agent.tagline}</p>
              <p className="mt-3 text-sm text-slate-400">{agent.description}</p>
            </div>
          ))}
        </div>

        <div className="glass mt-8 flex flex-col items-center justify-between gap-4 rounded-2xl p-8 text-center sm:flex-row sm:text-left">
          <div>
            <h3 className="font-semibold">Ready to run all seven?</h3>
            <p className="mt-1 text-sm text-slate-400">
              Start a new project and watch every agent stream its results live.
            </p>
          </div>
          <button
            onClick={() => setModalOpen(true)}
            className="focus-ring glow flex flex-shrink-0 items-center gap-2 rounded-lg bg-brand px-5 py-2.5 text-sm font-medium text-white hover:bg-brand-dark"
          >
            New Project
            <ArrowRight className="h-4 w-4" />
          </button>
        </div>
      </main>

      <NewProjectModal open={modalOpen} onClose={() => setModalOpen(false)} />
    </div>
  );
}