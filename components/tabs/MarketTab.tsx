"use client";

import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { formatINR } from "@/lib/utils";
import type { MarketContent } from "@/types";

export default function MarketTab({ data }: { data: MarketContent }) {
  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard label="TAM" value={data.tam} sub="Total addressable market" />
        <StatCard
          label="SAM"
          value={data.sam}
          sub="Serviceable addressable market"
        />
        <StatCard
          label="SOM"
          value={data.som}
          sub="Serviceable obtainable market"
        />
      </div>

      <div className="glass rounded-2xl p-6">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="font-semibold">Revenue projections</h3>
          <span className="rounded-full bg-brand/15 px-3 py-1 text-xs font-medium text-brand-light">
            {data.cagr}
          </span>
        </div>
        <div className="h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart
              data={data.revenueProjections}
              margin={{ top: 10, right: 10, left: 10, bottom: 0 }}
            >
              <defs>
                <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#6366f1" stopOpacity={0.5} />
                  <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
              <XAxis dataKey="year" stroke="#64748b" fontSize={12} />
              <YAxis
                stroke="#64748b"
                fontSize={12}
                tickFormatter={(v) => formatINR(Number(v))}
              />
              <Tooltip
                contentStyle={{
                  background: "#1e293b",
                  border: "1px solid #334155",
                  borderRadius: 8,
                  color: "#f1f5f9",
                }}
                formatter={(value: number) => formatINR(Number(value))}
              />
              <Area
                type="monotone"
                dataKey="revenue"
                stroke="#6366f1"
                strokeWidth={2}
                fill="url(#revenueGradient)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div className="mt-4 grid grid-cols-3 gap-3 text-center text-xs text-slate-500">
          {data.revenueProjections?.map((p) => (
            <div key={p.year}>
              <p className="font-medium text-slate-300">{p.year}</p>
              <p>{formatINR(p.users)} users</p>
              <p>{formatINR(p.mrr)} MRR</p>
            </div>
          ))}
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <div className="glass rounded-2xl p-6">
          <h3 className="mb-3 font-semibold">Pricing strategy</h3>
          <p className="text-sm leading-relaxed text-slate-300">
            {data.pricingStrategy}
          </p>
        </div>
        <div className="glass rounded-2xl p-6">
          <h3 className="mb-3 font-semibold">Go-to-market strategy</h3>
          <p className="text-sm leading-relaxed text-slate-300">
            {data.gtmStrategy}
          </p>
        </div>
      </div>

      <div className="glass rounded-2xl p-6">
        <h3 className="mb-4 font-semibold">Channels</h3>
        <div className="flex flex-wrap gap-2">
          {data.channels?.map((c, i) => (
            <span
              key={i}
              className="rounded-full border border-surface-border bg-surface-card px-3 py-1.5 text-xs text-slate-300"
            >
              {c}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}

function StatCard({
  label,
  value,
  sub,
}: {
  label: string;
  value: string;
  sub: string;
}) {
  return (
    <div className="glass rounded-2xl p-6">
      <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
        {label}
      </p>
      <p className="gradient-text mt-2 text-2xl font-bold">{value}</p>
      <p className="mt-1 text-xs text-slate-500">{sub}</p>
    </div>
  );
}
