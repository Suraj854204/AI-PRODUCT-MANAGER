"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import {
  Brain,
  Search,
  FileText,
  ListChecks,
  Map,
  TrendingUp,
  ShieldAlert,
  ArrowRight,
  Check,
  Zap,
  Play,
} from "lucide-react";

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0 },
};

const features = [
  {
    icon: Search,
    title: "Market Research",
    description:
      "Competitor landscape, trends, opportunities, and threats, pulled together in minutes instead of days.",
  },
  {
    icon: FileText,
    title: "PRD Generator",
    description:
      "A complete product requirements document with prioritized features, acceptance criteria, and success metrics.",
  },
  {
    icon: ListChecks,
    title: "User Stories",
    description:
      "Epics and story-pointed user stories, organized and ready to drop straight into your sprint board.",
  },
  {
    icon: Map,
    title: "Roadmap Planner",
    description:
      "A four-phase roadmap with goals, milestones, and feature sequencing based on your PRD.",
  },
  {
    icon: TrendingUp,
    title: "Market Analysis",
    description:
      "TAM, SAM, SOM, revenue projections, pricing strategy, and go-to-market channels.",
  },
  {
    icon: ShieldAlert,
    title: "Risk Assessment",
    description:
      "Technical, market, financial, operational, and legal risks, scored and ready to mitigate.",
  },
];

const pricingTiers = [
  {
    name: "Free",
    price: "₹0",
    period: "/month",
    description: "Try the agents on real ideas.",
    features: [
      "3 projects",
      "Basic PRD generation",
      "Market research agent",
      "Community support",
    ],
    cta: "Start for free",
    href: "/signup",
    highlighted: false,
  },
  {
    name: "Pro",
    price: "₹2,999",
    period: "/month",
    description: "For teams shipping product every week.",
    features: [
      "Unlimited projects",
      "All 7 AI agents",
      "Jira export",
      "PDF & Markdown export",
      "Priority generation queue",
    ],
    cta: "Start for free",
    href: "/signup",
    highlighted: true,
  },
  {
    name: "Enterprise",
    price: "Custom",
    period: "",
    description: "For organizations with multiple teams.",
    features: [
      "Multi-team workspaces",
      "API access",
      "White-label reports",
      "Dedicated support",
    ],
    cta: "Talk to us",
    href: "/signup",
    highlighted: false,
  },
];

const steps = [
  {
    n: "01",
    title: "Describe your idea",
    description:
      "Takes about 30 seconds — a title, a one-paragraph idea, and optionally your industry and target users.",
  },
  {
    n: "02",
    title: "AI agents run",
    description:
      "Seven specialized agents research, write, and plan sequentially, streaming results live as they finish.",
  },
  {
    n: "03",
    title: "Get your plan",
    description:
      "Browse PRD, stories, roadmap, market sizing, personas, and risks — share or export when you're ready.",
  },
];

export default function LandingPage() {
  return (
    <div className="relative min-h-screen overflow-x-hidden">
      {/* Ambient glow orbs */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -top-40 left-1/4 h-96 w-96 rounded-full bg-brand/20 blur-[120px]" />
        <div className="absolute top-1/3 -right-20 h-96 w-96 rounded-full bg-neon-cyan/10 blur-[120px]" />
      </div>

      {/* NAVBAR */}
      <nav className="glass fixed top-0 z-50 w-full">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-brand to-neon-cyan">
              <Brain className="h-5 w-5 text-white" />
            </div>
            <span className="text-lg font-semibold">AI PM Agent</span>
          </div>

          <div className="hidden items-center gap-8 text-sm text-slate-300 md:flex">
            <a href="#features" className="hover:text-white transition-colors">
              Features
            </a>
            <a href="#pricing" className="hover:text-white transition-colors">
              Pricing
            </a>
            <a href="#how-it-works" className="hover:text-white transition-colors">
              How it works
            </a>
          </div>

          <div className="flex items-center gap-4">
            <Link
              href="/login"
              className="text-sm text-slate-300 hover:text-white transition-colors"
            >
              Sign in
            </Link>
            <Link
              href="/signup"
              className="focus-ring rounded-lg bg-brand px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-brand-dark"
            >
              Get started free
            </Link>
          </div>
        </div>
      </nav>

      {/* HERO */}
      <section className="relative px-6 pt-40 pb-24">
        <div className="mx-auto max-w-4xl text-center">
          <motion.div
            initial="hidden"
            animate="visible"
            variants={fadeUp}
            transition={{ duration: 0.5 }}
            className="glass mx-auto mb-6 inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-sm text-brand-light"
          >
            <Zap className="h-3.5 w-3.5" />
            7 AI agents working in parallel
          </motion.div>

          <motion.h1
            initial="hidden"
            animate="visible"
            variants={fadeUp}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-4xl font-bold leading-tight sm:text-5xl md:text-6xl"
          >
            Your idea becomes a{" "}
            <span className="gradient-text">complete product plan</span> in 5
            minutes
          </motion.h1>

          <motion.p
            initial="hidden"
            animate="visible"
            variants={fadeUp}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="mx-auto mt-6 max-w-2xl text-lg text-slate-400"
          >
            Describe what you want to build. AI PM Agent researches the
            market, writes your PRD, breaks it into user stories, plans a
            roadmap, sizes the opportunity, builds personas, and flags risks —
            automatically, end to end.
          </motion.p>

          <motion.div
            initial="hidden"
            animate="visible"
            variants={fadeUp}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row"
          >
            <Link
              href="/signup"
              className="focus-ring glow flex items-center gap-2 rounded-lg bg-brand px-6 py-3 font-medium text-white transition-transform hover:scale-105 hover:bg-brand-dark"
            >
              Start for free
              <ArrowRight className="h-4 w-4" />
            </Link>
            <a
              href="#how-it-works"
              className="focus-ring glass flex items-center gap-2 rounded-lg px-6 py-3 font-medium text-slate-200 transition-colors hover:bg-surface-card"
            >
              <Play className="h-4 w-4" />
              Watch demo
            </a>
          </motion.div>

          <motion.div
            initial="hidden"
            animate="visible"
            variants={fadeUp}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="mx-auto mt-16 grid max-w-2xl grid-cols-3 gap-8"
          >
            {[
              { stat: "5 min", label: "Full plan ready" },
              { stat: "80%", label: "Time saved" },
              { stat: "7+", label: "AI agents" },
            ].map((item) => (
              <div key={item.label}>
                <div className="gradient-text text-3xl font-bold">
                  {item.stat}
                </div>
                <div className="mt-1 text-sm text-slate-500">
                  {item.label}
                </div>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section id="how-it-works" className="relative px-6 py-24">
        <div className="mx-auto max-w-6xl">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.3 }}
            variants={fadeUp}
            transition={{ duration: 0.5 }}
            className="mb-16 text-center"
          >
            <h2 className="text-3xl font-bold sm:text-4xl">How it works</h2>
            <p className="mt-3 text-slate-400">
              Three steps from idea to a plan you can act on.
            </p>
          </motion.div>

          <div className="grid gap-8 md:grid-cols-3">
            {steps.map((step, i) => (
              <motion.div
                key={step.n}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, amount: 0.3 }}
                variants={fadeUp}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                className="glass rounded-2xl p-8"
              >
                <div className="gradient-text mb-4 text-4xl font-bold">
                  {step.n}
                </div>
                <h3 className="mb-2 text-xl font-semibold">{step.title}</h3>
                <p className="text-slate-400">{step.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* FEATURES GRID */}
      <section id="features" className="relative px-6 py-24">
        <div className="mx-auto max-w-6xl">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.3 }}
            variants={fadeUp}
            transition={{ duration: 0.5 }}
            className="mb-16 text-center"
          >
            <h2 className="text-3xl font-bold sm:text-4xl">
              Seven agents. One complete plan.
            </h2>
            <p className="mt-3 text-slate-400">
              Each agent specializes in one part of product planning, run
              sequentially against your idea.
            </p>
          </motion.div>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {features.map((feature, i) => (
              <motion.div
                key={feature.title}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, amount: 0.3 }}
                variants={fadeUp}
                transition={{ duration: 0.5, delay: i * 0.08 }}
                className="glass rounded-2xl p-6 transition-colors hover:bg-surface-card/60"
              >
                <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-lg bg-brand/15">
                  <feature.icon className="h-5 w-5 text-brand-light" />
                </div>
                <h3 className="mb-2 font-semibold">{feature.title}</h3>
                <p className="text-sm text-slate-400">
                  {feature.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* PRICING */}
      <section id="pricing" className="relative px-6 py-24">
        <div className="mx-auto max-w-6xl">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.3 }}
            variants={fadeUp}
            transition={{ duration: 0.5 }}
            className="mb-16 text-center"
          >
            <h2 className="text-3xl font-bold sm:text-4xl">
              Simple, transparent pricing
            </h2>
            <p className="mt-3 text-slate-400">
              Start free. Upgrade when you need unlimited projects.
            </p>
          </motion.div>

          <div className="grid gap-6 md:grid-cols-3">
            {pricingTiers.map((tier, i) => (
              <motion.div
                key={tier.name}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, amount: 0.3 }}
                variants={fadeUp}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                className={`relative rounded-2xl p-8 ${
                  tier.highlighted
                    ? "glow border-2 border-brand bg-surface-card"
                    : "glass"
                }`}
              >
                {tier.highlighted && (
                  <div className="absolute -top-3 right-8 rounded-full bg-brand px-3 py-1 text-xs font-medium text-white">
                    Most popular
                  </div>
                )}
                <h3 className="text-lg font-semibold">{tier.name}</h3>
                <p className="mt-1 text-sm text-slate-400">
                  {tier.description}
                </p>
                <div className="mt-6 flex items-baseline gap-1">
                  <span className="text-3xl font-bold">{tier.price}</span>
                  <span className="text-slate-500">{tier.period}</span>
                </div>
                <ul className="mt-6 space-y-3">
                  {tier.features.map((f) => (
                    <li
                      key={f}
                      className="flex items-start gap-2 text-sm text-slate-300"
                    >
                      <Check className="mt-0.5 h-4 w-4 flex-shrink-0 text-neon-green" />
                      {f}
                    </li>
                  ))}
                </ul>
                <Link
                  href={tier.href}
                  className={`focus-ring mt-8 block rounded-lg px-4 py-2.5 text-center text-sm font-medium transition-colors ${
                    tier.highlighted
                      ? "bg-brand text-white hover:bg-brand-dark"
                      : "glass text-slate-200 hover:bg-surface-card"
                  }`}
                >
                  {tier.cta}
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="relative px-6 py-24">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.3 }}
          variants={fadeUp}
          transition={{ duration: 0.5 }}
          className="glass mx-auto max-w-4xl rounded-3xl p-12 text-center"
        >
          <h2 className="text-3xl font-bold sm:text-4xl">
            Ready to build smarter?
          </h2>
          <p className="mx-auto mt-3 max-w-xl text-slate-400">
            Your next product plan is one idea away. No credit card required.
          </p>
          <Link
            href="/signup"
            className="focus-ring glow mt-8 inline-flex items-center gap-2 rounded-lg bg-brand px-8 py-3 font-medium text-white transition-transform hover:scale-105 hover:bg-brand-dark"
          >
            Start free
            <ArrowRight className="h-4 w-4" />
          </Link>
        </motion.div>
      </section>

      {/* FOOTER */}
      <footer className="border-t border-surface-border px-6 py-8 text-center text-sm text-slate-500">
        © {new Date().getFullYear()} AI PM Agent. All rights reserved.
      </footer>
    </div>
  );
}
