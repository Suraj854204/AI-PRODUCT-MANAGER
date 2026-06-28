import { Check, X, Target } from "lucide-react";
import { cn } from "@/lib/utils";
import type { PRDContent } from "@/types";

const PRIORITY_CLASSES: Record<string, string> = {
  P0: "bg-red-500/15 text-red-400 border-red-500/30",
  P1: "bg-amber-500/15 text-amber-400 border-amber-500/30",
  P2: "bg-blue-500/15 text-blue-400 border-blue-500/30",
};

const EFFORT_CLASSES =
  "bg-surface-card text-slate-400 border-surface-border";

export default function PRDTab({ data }: { data: PRDContent }) {
  return (
    <div className="space-y-8">
      <div className="glass rounded-2xl p-6">
        <h3 className="mb-3 font-semibold">Overview</h3>
        <p className="text-sm leading-relaxed text-slate-300">
          {data.overview}
        </p>
      </div>

      <div className="glass rounded-2xl p-6">
        <h3 className="mb-3 font-semibold">Problem statement</h3>
        <p className="text-sm leading-relaxed text-slate-300">
          {data.problemStatement}
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <div className="glass rounded-2xl p-6">
          <h3 className="mb-4 font-semibold text-emerald-400">Goals</h3>
          <ul className="space-y-2.5">
            {data.goals?.map((g, i) => (
              <li
                key={i}
                className="flex items-start gap-2 text-sm text-slate-300"
              >
                <Check className="mt-0.5 h-4 w-4 flex-shrink-0 text-emerald-400" />
                {g}
              </li>
            ))}
          </ul>
        </div>

        <div className="glass rounded-2xl p-6">
          <h3 className="mb-4 font-semibold text-red-400">Non-goals</h3>
          <ul className="space-y-2.5">
            {data.nonGoals?.map((g, i) => (
              <li
                key={i}
                className="flex items-start gap-2 text-sm text-slate-300"
              >
                <X className="mt-0.5 h-4 w-4 flex-shrink-0 text-red-400" />
                {g}
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div>
        <h3 className="mb-4 font-semibold">
          Features{" "}
          <span className="text-sm font-normal text-slate-500">
            ({data.features?.length ?? 0})
          </span>
        </h3>
        <div className="space-y-3">
          {data.features?.map((f) => (
            <div key={f.id} className="glass rounded-xl p-5">
              <div className="mb-2 flex flex-wrap items-center gap-2">
                <span className="font-mono text-xs text-slate-500">
                  {f.id}
                </span>
                <h4 className="font-medium text-slate-100">{f.name}</h4>
                <span
                  className={cn(
                    "rounded-full border px-2 py-0.5 text-xs font-medium",
                    PRIORITY_CLASSES[f.priority] ?? PRIORITY_CLASSES.P2
                  )}
                >
                  {f.priority}
                </span>
                <span
                  className={cn(
                    "rounded-full border px-2 py-0.5 text-xs font-medium",
                    EFFORT_CLASSES
                  )}
                >
                  {f.effort}
                </span>
              </div>
              <p className="mb-3 text-sm text-slate-400">{f.description}</p>
              {f.acceptance?.length > 0 && (
                <ul className="space-y-1.5 border-t border-surface-border pt-3">
                  {f.acceptance.map((a, idx) => (
                    <li
                      key={idx}
                      className="flex items-start gap-2 text-xs text-slate-500"
                    >
                      <Check className="mt-0.5 h-3 w-3 flex-shrink-0 text-slate-600" />
                      {a}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          ))}
        </div>
      </div>

      <div className="glass rounded-2xl p-6">
        <h3 className="mb-4 font-semibold">Success metrics</h3>
        <div className="grid gap-3 sm:grid-cols-2">
          {data.successMetrics?.map((m, i) => (
            <div
              key={i}
              className="flex items-start gap-3 rounded-lg bg-surface-card p-4"
            >
              <Target className="mt-0.5 h-4 w-4 flex-shrink-0 text-brand-light" />
              <div>
                <p className="text-sm font-medium text-slate-200">
                  {m.name}
                </p>
                <p className="text-xs text-slate-500">
                  Target: {m.target} · {m.measurement}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <div className="glass rounded-2xl p-6">
          <h3 className="mb-3 font-semibold">Constraints</h3>
          <ul className="space-y-2 text-sm text-slate-400">
            {data.constraints?.map((c, i) => (
              <li key={i}>• {c}</li>
            ))}
          </ul>
        </div>
        <div className="glass rounded-2xl p-6">
          <h3 className="mb-3 font-semibold">Assumptions</h3>
          <ul className="space-y-2 text-sm text-slate-400">
            {data.assumptions?.map((a, i) => (
              <li key={i}>• {a}</li>
            ))}
          </ul>
        </div>
      </div>

      <div className="glass rounded-2xl p-6">
        <h3 className="mb-2 font-semibold">Timeline</h3>
        <p className="text-sm text-slate-300">{data.timeline}</p>
      </div>
    </div>
  );
}
