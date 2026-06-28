"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { X, Loader2, Rocket } from "lucide-react";
import { toast } from "sonner";

interface NewProjectModalProps {
  open: boolean;
  onClose: () => void;
}

export default function NewProjectModal({
  open,
  onClose,
}: NewProjectModalProps) {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [idea, setIdea] = useState("");
  const [industry, setIndustry] = useState("");
  const [targetUsers, setTargetUsers] = useState("");
  const [loading, setLoading] = useState(false);

  if (!open) return null;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim() || !idea.trim()) return;

    setLoading(true);
    try {
      const res = await fetch("/api/projects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: title.trim(),
          idea: idea.trim(),
          industry: industry.trim() || undefined,
          targetUsers: targetUsers.trim() || undefined,
        }),
      });

      const json = await res.json();

      if (!res.ok || !json.success) {
        toast.error(json.error || "Failed to create project");
        setLoading(false);
        return;
      }

      toast.success("Project created");
      router.push(`/project/${json.data.id}`);
    } catch {
      toast.error("Something went wrong. Please try again.");
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4 backdrop-blur-sm">
      <div className="glass animate-slide-up w-full max-w-lg rounded-2xl p-6">
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-lg font-semibold">New project</h2>
          <button
            onClick={onClose}
            className="focus-ring text-slate-500 hover:text-slate-300"
            aria-label="Close"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label
              htmlFor="title"
              className="mb-1.5 block text-sm font-medium text-slate-300"
            >
              Title <span className="text-red-400">*</span>
            </label>
            <input
              id="title"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Smart expense tracker for freelancers"
              className="focus-ring w-full rounded-lg border border-surface-border bg-surface-card px-4 py-2.5 text-sm text-slate-100 placeholder:text-slate-500"
            />
          </div>

          <div>
            <label
              htmlFor="idea"
              className="mb-1.5 block text-sm font-medium text-slate-300"
            >
              Idea <span className="text-red-400">*</span>
            </label>
            <textarea
              id="idea"
              required
              rows={3}
              value={idea}
              onChange={(e) => setIdea(e.target.value)}
              placeholder="Describe what you want to build and the problem it solves..."
              className="focus-ring w-full resize-none rounded-lg border border-surface-border bg-surface-card px-4 py-2.5 text-sm text-slate-100 placeholder:text-slate-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label
                htmlFor="industry"
                className="mb-1.5 block text-sm font-medium text-slate-300"
              >
                Industry
              </label>
              <input
                id="industry"
                value={industry}
                onChange={(e) => setIndustry(e.target.value)}
                placeholder="Fintech"
                className="focus-ring w-full rounded-lg border border-surface-border bg-surface-card px-4 py-2.5 text-sm text-slate-100 placeholder:text-slate-500"
              />
            </div>
            <div>
              <label
                htmlFor="targetUsers"
                className="mb-1.5 block text-sm font-medium text-slate-300"
              >
                Target users
              </label>
              <input
                id="targetUsers"
                value={targetUsers}
                onChange={(e) => setTargetUsers(e.target.value)}
                placeholder="Freelancers"
                className="focus-ring w-full rounded-lg border border-surface-border bg-surface-card px-4 py-2.5 text-sm text-slate-100 placeholder:text-slate-500"
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="focus-ring rounded-lg px-4 py-2.5 text-sm font-medium text-slate-300 hover:bg-surface-card"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || !title.trim() || !idea.trim()}
              className="focus-ring flex items-center gap-2 rounded-lg bg-brand px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-brand-dark disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Rocket className="h-4 w-4" />
              )}
              {loading ? "Launching..." : "Launch Agents"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
