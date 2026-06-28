import { Loader2, CheckCircle2, XCircle, Circle } from "lucide-react";
import { cn } from "@/lib/utils";
import type { ProjectStatus } from "@/types";

const CONFIG: Record<
  ProjectStatus,
  { label: string; classes: string; icon: typeof Circle; spin?: boolean }
> = {
  PENDING: {
    label: "Pending",
    classes: "bg-slate-500/15 text-slate-400 border-slate-500/30",
    icon: Circle,
  },
  PROCESSING: {
    label: "Processing",
    classes: "bg-amber-500/15 text-amber-400 border-amber-500/30",
    icon: Loader2,
    spin: true,
  },
  COMPLETED: {
    label: "Completed",
    classes: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30",
    icon: CheckCircle2,
  },
  FAILED: {
    label: "Failed",
    classes: "bg-red-500/15 text-red-400 border-red-500/30",
    icon: XCircle,
  },
};

export default function StatusBadge({ status }: { status: ProjectStatus }) {
  const config = CONFIG[status];
  const Icon = config.icon;

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium",
        config.classes
      )}
    >
      <Icon className={cn("h-3 w-3", config.spin && "animate-spin")} />
      {config.label}
    </span>
  );
}
