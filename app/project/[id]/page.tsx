"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Brain,
  Circle,
  CheckCircle2,
  XCircle,
  Loader2,
  Sparkles,
  RotateCcw,
  Search,
  FileText,
  ListChecks,
  Map as MapIcon,
  TrendingUp,
  Users,
  ShieldAlert,
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import ResearchTab from "@/components/tabs/ResearchTab";
import PRDTab from "@/components/tabs/PRDTab";
import StoriesTab from "@/components/tabs/StoriesTab";
import RoadmapTab from "@/components/tabs/RoadmapTab";
import MarketTab from "@/components/tabs/MarketTab";
import PersonasTab from "@/components/tabs/PersonasTab";
import RisksTab from "@/components/tabs/RisksTab";
import type {
  AgentStep,
  AgentStepId,
  AgentStepStatus,
  AgentType,
  Project,
} from "@/types";

const STEP_DEFS: Array<{
  id: AgentStepId;
  label: string;
  icon: typeof Search;
}> = [
  { id: "research", label: "Market Research", icon: Search },
  { id: "prd", label: "PRD Writer", icon: FileText },
  { id: "stories", label: "User Stories", icon: ListChecks },
  { id: "roadmap", label: "Roadmap Planner", icon: MapIcon },
  { id: "market", label: "Market Analysis", icon: TrendingUp },
  { id: "personas", label: "Persona Creator", icon: Users },
  { id: "risks", label: "Risk Analyst", icon: ShieldAlert },
];

const AGENT_TYPE_TO_STEP: Record<AgentType, AgentStepId> = {
  RESEARCH: "research",
  PRD: "prd",
  STORIES: "stories",
  ROADMAP: "roadmap",
  MARKET_ANALYSIS: "market",
  PERSONA: "personas",
  RISK: "risks",
};

function initialSteps(): AgentStep[] {
  return STEP_DEFS.map((s) => ({ id: s.id, label: s.label, status: "idle" }));
}

export default function ProjectDetailPage() {
  const router = useRouter();
  const params = useParams();
  const projectId = params.id as string;

  const [project, setProject] = useState<Project | null>(null);
  const [steps, setSteps] = useState<AgentStep[]>(initialSteps());
  const [activeTab, setActiveTab] = useState<AgentStepId | null>(null);
  const [running, setRunning] = useState(false);
  const [completed, setCompleted] = useState(false);
  const [pageLoading, setPageLoading] = useState(true);
  const abortRef = useRef<AbortController | null>(null);

  const loadProject = useCallback(async () => {
    try {
      const res = await fetch(`/api/projects/${projectId}`);
      if (res.status === 401) {
        router.push("/login");
        return;
      }
      const json = await res.json();
      if (!json.success) {
        toast.error(json.error || "Project not found");
        router.push("/dashboard");
        return;
      }

      const proj: Project = json.data;
      setProject(proj);

      if (proj.status === "COMPLETED" && proj.outputs?.length) {
        const loadedSteps = initialSteps();
        let firstDoneId: AgentStepId | null = null;

        for (const output of proj.outputs) {
          const stepId = AGENT_TYPE_TO_STEP[output.type as AgentType];
          const idx = loadedSteps.findIndex((s) => s.id === stepId);
          if (idx !== -1) {
            loadedSteps[idx] = {
              ...loadedSteps[idx],
              status: "done",
              data: output.content,
            };
            if (!firstDoneId) firstDoneId = stepId;
          }
        }

        setSteps(loadedSteps);
        setCompleted(true);
        setActiveTab(firstDoneId ?? "research");
      }
    } catch {
      toast.error("Failed to load project");
    } finally {
      setPageLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [projectId, router]);

  useEffect(() => {
    loadProject();
  }, [loadProject]);

  function updateStep(id: AgentStepId, patch: Partial<AgentStep>) {
    setSteps((prev) =>
      prev.map((s) => (s.id === id ? { ...s, ...patch } : s))
    );
  }

  async function handleRunAgents() {
    setRunning(true);
    setCompleted(false);
    setSteps(initialSteps());
    setActiveTab(null);

    const controller = new AbortController();
    abortRef.current = controller;

    try {
      const res = await fetch("/api/agent/run", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ projectId }),
        signal: controller.signal,
      });

      if (!res.ok || !res.body) {
        const json = await res.json().catch(() => ({}));
        throw new Error(json.error || "Failed to start agents");
      }

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });

        const events = buffer.split("\n\n");
        buffer = events.pop() ?? "";

        for (const rawEvent of events) {
          if (!rawEvent.trim()) continue;

          const eventLine = rawEvent
            .split("\n")
            .find((l) => l.startsWith("event:"));
          const dataLine = rawEvent
            .split("\n")
            .find((l) => l.startsWith("data:"));

          if (!eventLine || !dataLine) continue;

          const eventName = eventLine.replace("event:", "").trim();
          const dataRaw = dataLine.replace("data:", "").trim();

          let payload: any;
          try {
            payload = JSON.parse(dataRaw);
          } catch {
            continue;
          }

          if (eventName === "step") {
            const status = payload.status as AgentStepStatus;
            updateStep(payload.id, {
              status,
              data: payload.data ?? undefined,
            });
            if (status === "done") {
              setActiveTab(payload.id);
            }
          } else if (eventName === "complete") {
            setCompleted(true);
            toast.success("All agents finished!");
          } else if (eventName === "error") {
            toast.error(payload.message || "Agent run failed");
          }
        }
      }
    } catch (err) {
      if (err instanceof Error && err.name !== "AbortError") {
        toast.error(err.message || "Something went wrong running the agents");
      }
    } finally {
      setRunning(false);
    }
  }

  if (pageLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-brand" />
      </div>
    );
  }

  if (!project) return null;

  const doneCount = steps.filter((s) => s.status === "done").length;
  const activeStep = steps.find((s) => s.id === activeTab);
  const hasStarted = steps.some((s) => s.status !== "idle");

  return (
    <div className="min-h-screen">
      {/* LEFT PANEL */}
      <aside className="glass fixed inset-y-0 left-0 z-30 flex w-72 flex-col border-r border-surface-border">
        <div className="px-6 py-6">
          <Link
            href="/dashboard"
            className="focus-ring mb-4 flex items-center gap-2 text-sm text-slate-400 hover:text-slate-200"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            Back to dashboard
          </Link>
          <h1 className="truncate text-lg font-semibold">{project.title}</h1>
          <p className="mt-1 line-clamp-2 text-xs text-slate-500">
            {project.idea}
          </p>

          <div className="mt-4">
            <div className="mb-1.5 flex items-center justify-between text-xs text-slate-500">
              <span>Progress</span>
              <span>{doneCount}/7</span>
            </div>
            <div className="h-1.5 w-full overflow-hidden rounded-full bg-surface-card">
              <div
                className="h-full rounded-full bg-gradient-to-r from-brand to-neon-cyan transition-all duration-500"
                style={{ width: `${(doneCount / 7) * 100}%` }}
              />
            </div>
          </div>
        </div>

        <nav className="flex-1 space-y-1 overflow-y-auto px-4">
          {steps.map((step) => {
            const def = STEP_DEFS.find((d) => d.id === step.id)!;
            const Icon = def.icon;
            const clickable = step.status === "done";

            return (
              <button
                key={step.id}
                disabled={!clickable}
                onClick={() => clickable && setActiveTab(step.id)}
                className={cn(
                  "focus-ring flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm transition-colors",
                  activeTab === step.id && clickable
                    ? "bg-brand/15 text-brand-light"
                    : clickable
                    ? "text-slate-300 hover:bg-surface-card"
                    : "cursor-not-allowed text-slate-500"
                )}
              >
                <StepStatusIcon status={step.status} />
                <Icon className="h-4 w-4 flex-shrink-0" />
                <span className="flex-1 truncate">{step.label}</span>
              </button>
            );
          })}
        </nav>

        <div className="border-t border-surface-border p-4">
          {!hasStarted || !completed ? (
            <button
              onClick={handleRunAgents}
              disabled={running}
              className="focus-ring glow flex w-full items-center justify-center gap-2 rounded-lg bg-brand py-2.5 text-sm font-medium text-white transition-colors hover:bg-brand-dark disabled:cursor-not-allowed disabled:opacity-70"
            >
              {running ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Running agents...
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4" />
                  Run All Agents
                </>
              )}
            </button>
          ) : (
            <div className="space-y-2">
              <div className="flex items-center justify-center gap-2 rounded-lg bg-emerald-500/15 py-2.5 text-sm font-medium text-emerald-400">
                <CheckCircle2 className="h-4 w-4" />
                All agents complete
              </div>
              <button
                onClick={handleRunAgents}
                className="focus-ring flex w-full items-center justify-center gap-2 rounded-lg border border-surface-border py-2 text-sm text-slate-400 hover:bg-surface-card hover:text-slate-200"
              >
                <RotateCcw className="h-3.5 w-3.5" />
                Re-run
              </button>
            </div>
          )}
        </div>
      </aside>

      {/* RIGHT PANEL */}
      <main className="ml-72 flex min-h-screen flex-col">
        {/* TAB BAR */}
        <div className="glass sticky top-0 z-20 flex gap-1 overflow-x-auto border-b border-surface-border px-6">
          {steps.map((step) => {
            const def = STEP_DEFS.find((d) => d.id === step.id)!;
            const enabled = step.status === "done";
            const active = activeTab === step.id;

            return (
              <button
                key={step.id}
                disabled={!enabled}
                onClick={() => enabled && setActiveTab(step.id)}
                className={cn(
                  "focus-ring relative flex flex-shrink-0 items-center gap-1.5 border-b-2 px-4 py-3.5 text-sm font-medium transition-colors",
                  active
                    ? "border-brand text-white"
                    : "border-transparent text-slate-500",
                  enabled && !active && "hover:text-slate-300",
                  !enabled && "cursor-not-allowed opacity-50"
                )}
              >
                {def.label}
                {step.status === "done" && (
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                )}
              </button>
            );
          })}
        </div>

        {/* CONTENT */}
        <div className="flex-1 px-6 py-8">
          {!hasStarted && (
            <div className="flex h-full min-h-[60vh] flex-col items-center justify-center text-center">
              <div className="mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-brand/15">
                <Brain className="h-7 w-7 text-brand-light" />
              </div>
              <h2 className="text-lg font-semibold text-slate-200">
                Ready to plan {project.title}
              </h2>
              <p className="mt-2 max-w-sm text-sm text-slate-500">
                Launch seven AI agents to research, write, and plan your
                product end to end.
              </p>
              <button
                onClick={handleRunAgents}
                className="focus-ring glow mt-6 flex items-center gap-2 rounded-lg bg-brand px-5 py-2.5 text-sm font-medium text-white hover:bg-brand-dark"
              >
                <Sparkles className="h-4 w-4" />
                Launch Agents
              </button>
            </div>
          )}

          {hasStarted && running && !activeStep?.data && (
            <div className="flex h-full min-h-[60vh] flex-col items-center justify-center text-center">
              <Brain className="mb-5 h-10 w-10 animate-pulse-glow rounded-full text-brand-light" />
              <p className="text-sm text-slate-400">
                {steps.find((s) => s.status === "running")?.label ??
                  "Working..."}
              </p>
            </div>
          )}

          {activeStep?.data ? (
            <TabContent stepId={activeStep.id} data={activeStep.data} />
          ) : null}
        </div>
      </main>
    </div>
  );
}

function StepStatusIcon({ status }: { status: AgentStepStatus }) {
  if (status === "running")
    return (
      <Loader2 className="h-3.5 w-3.5 flex-shrink-0 animate-spin text-amber-400" />
    );
  if (status === "done")
    return (
      <CheckCircle2 className="h-3.5 w-3.5 flex-shrink-0 text-emerald-400" />
    );
  if (status === "error")
    return <XCircle className="h-3.5 w-3.5 flex-shrink-0 text-red-400" />;
  return <Circle className="h-3.5 w-3.5 flex-shrink-0 text-slate-600" />;
}

function TabContent({ stepId, data }: { stepId: AgentStepId; data: any }) {
  switch (stepId) {
    case "research":
      return <ResearchTab data={data} />;
    case "prd":
      return <PRDTab data={data} />;
    case "stories":
      return <StoriesTab data={data} />;
    case "roadmap":
      return <RoadmapTab data={data} />;
    case "market":
      return <MarketTab data={data} />;
    case "personas":
      return <PersonasTab data={data} />;
    case "risks":
      return <RisksTab data={data} />;
    default:
      return null;
  }
}
