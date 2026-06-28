"use client";

import { useState } from "react";
import { ChevronDown, ListChecks, Layers, Hash } from "lucide-react";
import { cn } from "@/lib/utils";
import type { StoriesContent } from "@/types";

const PRIORITY_LETTER: Record<string, { letter: string; classes: string }> = {
  HIGH: { letter: "H", classes: "bg-red-500/15 text-red-400" },
  MEDIUM: { letter: "M", classes: "bg-amber-500/15 text-amber-400" },
  LOW: { letter: "L", classes: "bg-blue-500/15 text-blue-400" },
};

export default function StoriesTab({ data }: { data: StoriesContent }) {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-3 gap-4">
        <StatBlock
          icon={Layers}
          label="Epics"
          value={data.epics?.length ?? 0}
        />
        <StatBlock
          icon={ListChecks}
          label="Stories"
          value={data.totalStories ?? 0}
        />
        <StatBlock icon={Hash} label="Points" value={data.totalPoints ?? 0} />
      </div>

      <div className="space-y-3">
        {data.epics?.map((epic, i) => {
          const isOpen = openIndex === i;
          return (
            <div key={i} className="glass overflow-hidden rounded-xl">
              <button
                onClick={() => setOpenIndex(isOpen ? null : i)}
                className="focus-ring flex w-full items-center justify-between gap-3 px-5 py-4 text-left"
              >
                <div>
                  <h4 className="font-medium text-slate-100">{epic.name}</h4>
                  <p className="mt-0.5 text-xs text-slate-500">
                    {epic.stories?.length ?? 0} stories
                  </p>
                </div>
                <ChevronDown
                  className={cn(
                    "h-4 w-4 flex-shrink-0 text-slate-500 transition-transform",
                    isOpen && "rotate-180"
                  )}
                />
              </button>

              {isOpen && (
                <div className="border-t border-surface-border px-5 py-4">
                  <p className="mb-4 text-sm text-slate-400">
                    {epic.description}
                  </p>
                  <div className="space-y-3">
                    {epic.stories?.map((story, idx) => {
                      const p =
                        PRIORITY_LETTER[story.priority] ??
                        PRIORITY_LETTER.MEDIUM;
                      return (
                        <div
                          key={idx}
                          className="flex items-start gap-3 rounded-lg bg-surface-card p-4"
                        >
                          <span
                            className={cn(
                              "flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full text-xs font-bold",
                              p.classes
                            )}
                          >
                            {p.letter}
                          </span>
                          <div className="flex-1">
                            <p className="text-sm font-medium text-slate-200">
                              {story.title}
                            </p>
                            <p className="mt-1 text-xs text-slate-500">
                              As a <strong>{story.asA}</strong>, I want to{" "}
                              {story.iWant}, so that {story.soThat}
                            </p>
                          </div>
                          <span className="flex-shrink-0 rounded-full bg-brand/15 px-2.5 py-1 text-xs font-medium text-brand-light">
                            {story.storyPoints} pts
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function StatBlock({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof Layers;
  label: string;
  value: number;
}) {
  return (
    <div className="glass rounded-xl p-4 text-center">
      <Icon className="mx-auto mb-2 h-4 w-4 text-brand-light" />
      <p className="text-2xl font-bold">{value}</p>
      <p className="text-xs text-slate-500">{label}</p>
    </div>
  );
}
