"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Brain, Eye, EyeOff, Loader2, AlertCircle, Check } from "lucide-react";

export default function SignupPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password }),
      });

      const json = await res.json();

      if (!res.ok || !json.success) {
        setError(json.error || "Unable to create your account.");
        setLoading(false);
        return;
      }

      router.push("/dashboard");
    } catch {
      setError("Something went wrong. Please check your connection.");
      setLoading(false);
    }
  }

  return (
    <div className="relative flex min-h-screen items-center justify-center px-6 py-12">
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute top-1/4 left-1/2 h-96 w-96 -translate-x-1/2 rounded-full bg-brand/20 blur-[120px]" />
      </div>

      <div className="relative w-full max-w-md">
        <Link
          href="/"
          className="mb-8 flex items-center justify-center gap-2"
        >
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-brand to-neon-cyan">
            <Brain className="h-5 w-5 text-white" />
          </div>
          <span className="text-lg font-semibold">AI PM Agent</span>
        </Link>

        <div className="glass rounded-2xl p-8">
          <h1 className="text-2xl font-bold">Create your account</h1>
          <p className="mt-1 text-sm text-slate-400">
            Start turning ideas into product plans today.
          </p>

          {error && (
            <div className="mt-6 flex items-start gap-2 rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">
              <AlertCircle className="mt-0.5 h-4 w-4 flex-shrink-0" />
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            <div>
              <label
                htmlFor="name"
                className="mb-1.5 block text-sm font-medium text-slate-300"
              >
                Full name
              </label>
              <input
                id="name"
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Jordan Patel"
                className="focus-ring w-full rounded-lg border border-surface-border bg-surface-card px-4 py-2.5 text-sm text-slate-100 placeholder:text-slate-500"
              />
            </div>

            <div>
              <label
                htmlFor="email"
                className="mb-1.5 block text-sm font-medium text-slate-300"
              >
                Email
              </label>
              <input
                id="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@company.com"
                className="focus-ring w-full rounded-lg border border-surface-border bg-surface-card px-4 py-2.5 text-sm text-slate-100 placeholder:text-slate-500"
              />
            </div>

            <div>
              <label
                htmlFor="password"
                className="mb-1.5 block text-sm font-medium text-slate-300"
              >
                Password
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  required
                  minLength={8}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="At least 8 characters"
                  className="focus-ring w-full rounded-lg border border-surface-border bg-surface-card px-4 py-2.5 pr-11 text-sm text-slate-100 placeholder:text-slate-500"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="focus-ring absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="focus-ring flex w-full items-center justify-center gap-2 rounded-lg bg-brand py-2.5 text-sm font-medium text-white transition-colors hover:bg-brand-dark disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading && <Loader2 className="h-4 w-4 animate-spin" />}
              {loading ? "Creating account..." : "Create account"}
            </button>
          </form>

          <ul className="mt-6 space-y-2">
            {[
              "3 projects free per month",
              "No credit card required",
              "Cancel anytime",
            ].map((item) => (
              <li
                key={item}
                className="flex items-center gap-2 text-sm text-slate-400"
              >
                <Check className="h-4 w-4 text-neon-green" />
                {item}
              </li>
            ))}
          </ul>

          <p className="mt-6 text-center text-sm text-slate-400">
            Already have an account?{" "}
            <Link href="/login" className="text-brand-light hover:underline">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
