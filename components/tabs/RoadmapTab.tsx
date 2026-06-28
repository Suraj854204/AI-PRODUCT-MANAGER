import { Flag, Target } from "lucide-react";
import type { RoadmapContent } from "@/types";

export default function RoadmapTab({ data }: { data: RoadmapContent }) {
  return (
    <div className="space-y-4">
      {data.phases?.map((phase) => (
        <div
          key={phase.phase}
          className="glass rounded-2xl border-l-4 p-6"
          style={{ borderLeftColor: phase.color || "#6366f1" }}
        >
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <span
                className="flex h-8 w-8 items-center justify-center rounded-full text-sm font-bold text-white"
                style={{ backgroundColor: phase.color || "#6366f1" }}
              >
                {phase.phase}
              </span>
              <h3 className="font-semibold">{phase.name}</h3>
              {phase.status === "active" && (
                <span className="rounded-full bg-emerald-500/15 px-2.5 py-1 text-xs font-medium text-emerald-400">
                  Active
                </span>
              )}
            </div>
            <span className="rounded-full bg-surface-card px-3 py-1 text-xs text-slate-400">
              {phase.duration}
            </span>
          </div>

          <div className="grid gap-6 sm:grid-cols-2">
            <div>
              <h4 className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
                Goals
              </h4>
              <ul className="space-y-1.5">
                {phase.goals?.map((g, i) => (
                  <li
                    key={i}
                    className="flex items-start gap-2 text-sm text-slate-300"
                  >
                    <Target className="mt-0.5 h-3.5 w-3.5 flex-shrink-0 text-brand-light" />
                    {g}
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h4 className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
                Features
              </h4>
              <div className="flex flex-wrap gap-2">
                {phase.features?.map((f, i) => (
                  <span
                    key={i}
                    className="rounded-full border border-surface-border bg-surface-card px-2.5 py-1 text-xs text-slate-300"
                  >
                    {f}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {phase.milestone && (
            <div className="mt-5 flex items-start gap-2 rounded-lg bg-surface-card p-4">
              <Flag className="mt-0.5 h-4 w-4 flex-shrink-0 text-neon-cyan" />
              <div>
                <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
                  Milestone
                </p>
                <p className="text-sm text-slate-300">{phase.milestone}</p>
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
