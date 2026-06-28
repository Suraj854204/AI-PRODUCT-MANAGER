import { Globe, TrendingUp, ShieldAlert, Tag } from "lucide-react";
import type { ResearchContent } from "@/types";

export default function ResearchTab({ data }: { data: ResearchContent }) {
  return (
    <div className="space-y-8">
      <div className="glass rounded-2xl p-6">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <h3 className="font-semibold">Market summary</h3>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/15 px-3 py-1 text-xs font-medium text-emerald-400">
            <TrendingUp className="h-3 w-3" />
            {data.marketSize}
          </span>
        </div>
        <p className="text-sm leading-relaxed text-slate-300">
          {data.summary}
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <div className="glass rounded-2xl p-6">
          <h3 className="mb-4 flex items-center gap-2 font-semibold text-emerald-400">
            <TrendingUp className="h-4 w-4" />
            Opportunities
          </h3>
          <ul className="space-y-2.5">
            {data.opportunities?.map((o, i) => (
              <li
                key={i}
                className="flex items-start gap-2 text-sm text-slate-300"
              >
                <span className="mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-emerald-400" />
                {o}
              </li>
            ))}
          </ul>
        </div>

        <div className="glass rounded-2xl p-6">
          <h3 className="mb-4 flex items-center gap-2 font-semibold text-red-400">
            <ShieldAlert className="h-4 w-4" />
            Threats
          </h3>
          <ul className="space-y-2.5">
            {data.threats?.map((t, i) => (
              <li
                key={i}
                className="flex items-start gap-2 text-sm text-slate-300"
              >
                <span className="mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-red-400" />
                {t}
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="glass rounded-2xl p-6">
        <h3 className="mb-4 flex items-center gap-2 font-semibold">
          <Tag className="h-4 w-4 text-neon-cyan" />
          Trends
        </h3>
        <div className="flex flex-wrap gap-2">
          {data.trends?.map((t, i) => (
            <span
              key={i}
              className="rounded-full border border-surface-border bg-surface-card px-3 py-1.5 text-xs text-slate-300"
            >
              {t}
            </span>
          ))}
        </div>
      </div>

      <div>
        <h3 className="mb-4 font-semibold">Competitors</h3>
        <div className="grid gap-4 md:grid-cols-2">
          {data.competitors?.map((c, i) => (
            <div key={i} className="glass rounded-2xl p-5">
              <div className="mb-3 flex items-start justify-between gap-2">
                <div>
                  <h4 className="font-medium text-slate-100">{c.name}</h4>
                  {c.website && (
                    <a
                      href={
                        c.website.startsWith("http")
                          ? c.website
                          : `https://${c.website}`
                      }
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1 text-xs text-brand-light hover:underline"
                    >
                      <Globe className="h-3 w-3" />
                      {c.website}
                    </a>
                  )}
                </div>
                {c.pricing && (
                  <span className="flex-shrink-0 rounded-full bg-surface-card px-2.5 py-1 text-xs text-slate-400">
                    {c.pricing}
                  </span>
                )}
              </div>
              <p className="mb-3 text-sm text-slate-400">{c.description}</p>
              {c.targetMarket && (
                <p className="mb-3 text-xs text-slate-500">
                  Targets: {c.targetMarket}
                </p>
              )}
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div>
                  <p className="mb-1.5 font-medium text-emerald-400">
                    Strengths
                  </p>
                  <ul className="space-y-1 text-slate-400">
                    {c.strengths?.map((s, idx) => (
                      <li key={idx}>• {s}</li>
                    ))}
                  </ul>
                </div>
                <div>
                  <p className="mb-1.5 font-medium text-red-400">
                    Weaknesses
                  </p>
                  <ul className="space-y-1 text-slate-400">
                    {c.weaknesses?.map((w, idx) => (
                      <li key={idx}>• {w}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
