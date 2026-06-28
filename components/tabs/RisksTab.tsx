"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { cn } from "@/lib/utils";
import type { RiskContent } from "@/types";

const SEVERITY_CLASSES: Record<string, string> = {
  high: "bg-red-500/15 text-red-400 border-red-500/30",
  medium: "bg-amber-500/15 text-amber-400 border-amber-500/30",
  low: "bg-blue-500/15 text-blue-400 border-blue-500/30",
};

export default function RisksTab({ data }: { data: RiskContent }) {
  const categoryCounts = (data.risks ?? []).reduce<Record<string, number>>(
    (acc, r) => {
      acc[r.category] = (acc[r.category] ?? 0) + 1;
      return acc;
    },
    {}
  );

  const chartData = Object.entries(categoryCounts).map(([category, count]) => ({
    category: category.charAt(0).toUpperCase() + category.slice(1),
    count,
  }));

  const sortedRisks = [...(data.risks ?? [])].sort(
    (a, b) => b.impact - a.impact
  );

  const score = data.overallScore ?? 0;
  const scoreColor =
    score >= 66 ? "#ef4444" : score >= 33 ? "#f59e0b" : "#10b981";

  return (
    <div className="space-y-6">
      <div className="glass rounded-2xl p-6">
        <div className="mb-3 flex items-center justify-between">
          <h3 className="font-semibold">Overall risk score</h3>
          <span className="text-2xl font-bold" style={{ color: scoreColor }}>
            {score}/100
          </span>
        </div>
        <div className="h-2.5 w-full overflow-hidden rounded-full bg-surface-card">
          <div
            className="h-full rounded-full transition-all"
            style={{
              width: `${Math.min(100, Math.max(0, score))}%`,
              background:
                "linear-gradient(90deg, #10b981, #f59e0b, #ef4444)",
            }}
          />
        </div>
      </div>

      <div className="glass rounded-2xl p-6">
        <h3 className="mb-4 font-semibold">Risks by category</h3>
        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={chartData}
              margin={{ top: 10, right: 10, left: 10, bottom: 0 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
              <XAxis dataKey="category" stroke="#64748b" fontSize={12} />
              <YAxis stroke="#64748b" fontSize={12} allowDecimals={false} />
              <Tooltip
                contentStyle={{
                  background: "#1e293b",
                  border: "1px solid #334155",
                  borderRadius: 8,
                  color: "#f1f5f9",
                }}
              />
              <Bar dataKey="count" fill="#6366f1" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="space-y-3">
        {sortedRisks.map((risk, i) => (
          <div key={i} className="glass rounded-xl p-5">
            <div className="mb-2 flex flex-wrap items-center gap-2">
              <span className="rounded-full bg-surface-card px-2.5 py-1 text-xs font-medium uppercase tracking-wide text-slate-400">
                {risk.category}
              </span>
              <span
                className={cn(
                  "rounded-full border px-2.5 py-1 text-xs font-medium capitalize",
                  SEVERITY_CLASSES[risk.severity] ?? SEVERITY_CLASSES.medium
                )}
              >
                {risk.severity} severity
              </span>
              <span className="text-xs text-slate-500">
                Probability {risk.probability}/10 · Impact {risk.impact}/10
              </span>
            </div>
            <h4 className="mb-1.5 font-medium text-slate-100">
              {risk.title}
            </h4>
            <p className="mb-3 text-sm text-slate-400">{risk.description}</p>
            <div className="rounded-lg bg-emerald-500/10 px-4 py-3">
              <p className="text-xs font-medium uppercase tracking-wide text-emerald-400">
                Mitigation
              </p>
              <p className="mt-1 text-sm text-slate-300">
                {risk.mitigation}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
