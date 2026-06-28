import { Quote } from "lucide-react";
import { cn } from "@/lib/utils";
import type { PersonaContent } from "@/types";

const TECH_SAVVY_CLASSES: Record<string, string> = {
  High: "bg-emerald-500/15 text-emerald-400",
  Medium: "bg-amber-500/15 text-amber-400",
  Low: "bg-red-500/15 text-red-400",
};

export default function PersonasTab({ data }: { data: PersonaContent }) {
  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      {data.personas?.map((p, i) => (
        <div key={i} className="glass flex flex-col rounded-2xl p-6">
          <div className="mb-4 flex items-center gap-3">
            <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-brand to-neon-cyan text-lg font-bold text-white">
              {p.name?.charAt(0).toUpperCase()}
            </div>
            <div>
              <h4 className="font-semibold text-slate-100">{p.name}</h4>
              <p className="text-xs text-slate-500">
                {p.age} · {p.role}
              </p>
            </div>
          </div>

          <span
            className={cn(
              "mb-4 inline-flex w-fit items-center rounded-full px-2.5 py-1 text-xs font-medium",
              TECH_SAVVY_CLASSES[p.techSavvy] ?? TECH_SAVVY_CLASSES.Medium
            )}
          >
            {p.techSavvy} tech-savvy
          </span>

          {p.quote && (
            <div className="mb-4 flex items-start gap-2 rounded-lg bg-surface-card p-3">
              <Quote className="mt-0.5 h-3.5 w-3.5 flex-shrink-0 text-brand-light" />
              <p className="text-sm italic text-slate-300">
                &ldquo;{p.quote}&rdquo;
              </p>
            </div>
          )}

          <p className="mb-4 text-sm text-slate-400">{p.background}</p>

          <div className="mt-auto grid grid-cols-2 gap-4 border-t border-surface-border pt-4 text-xs">
            <div>
              <p className="mb-1.5 font-medium text-red-400">Pain points</p>
              <ul className="space-y-1 text-slate-400">
                {p.painPoints?.map((pt, idx) => (
                  <li key={idx}>• {pt}</li>
                ))}
              </ul>
            </div>
            <div>
              <p className="mb-1.5 font-medium text-emerald-400">Goals</p>
              <ul className="space-y-1 text-slate-400">
                {p.goals?.map((g, idx) => (
                  <li key={idx}>• {g}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
