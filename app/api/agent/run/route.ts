import { NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { getSessionUser } from "@/lib/auth";
import {
  runResearchAgent,
  runPRDAgent,
  runStoriesAgent,
  runRoadmapAgent,
  runMarketAgent,
  runPersonaAgent,
  runRiskAgent,
} from "@/lib/agents";
import type { AgentStepId } from "@/types";

export const maxDuration = 300;

interface StepDefinition {
  id: AgentStepId;
  label: string;
}

const STEPS: StepDefinition[] = [
  { id: "research", label: "Market Research Agent" },
  { id: "prd", label: "PRD Writer Agent" },
  { id: "stories", label: "User Stories Agent" },
  { id: "roadmap", label: "Roadmap Planner Agent" },
  { id: "market", label: "Market Analysis Agent" },
  { id: "personas", label: "Persona Creator Agent" },
  { id: "risks", label: "Risk Analyst Agent" },
];

function sseFormat(event: string, data: unknown): string {
  return `event: ${event}\ndata: ${JSON.stringify(data)}\n\n`;
}

export async function POST(req: NextRequest) {
  const user = await getSessionUser(req);

  if (!user) {
    return new Response(
      JSON.stringify({ success: false, error: "Not authenticated" }),
      { status: 401, headers: { "Content-Type": "application/json" } }
    );
  }

  let body: { projectId?: string };
  try {
    body = await req.json();
  } catch {
    return new Response(
      JSON.stringify({ success: false, error: "Invalid request body" }),
      { status: 400, headers: { "Content-Type": "application/json" } }
    );
  }

  const { projectId } = body;

  if (!projectId) {
    return new Response(
      JSON.stringify({ success: false, error: "projectId is required" }),
      { status: 400, headers: { "Content-Type": "application/json" } }
    );
  }

  const project = await prisma.project.findUnique({
    where: { id: projectId },
  });

  if (!project || project.userId !== user.id) {
    return new Response(
      JSON.stringify({ success: false, error: "Project not found" }),
      { status: 404, headers: { "Content-Type": "application/json" } }
    );
  }

  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    async start(controller) {
      const send = (event: string, data: unknown) => {
        try {
          controller.enqueue(encoder.encode(sseFormat(event, data)));
        } catch {
          // controller may already be closed; ignore
        }
      };

      try {
        await prisma.project.update({
          where: { id: projectId },
          data: { status: "PROCESSING" },
        });

        // Shared context accumulated as agents complete, so later agents
        // can build on earlier results.
        let researchSummary = "";
        let marketSize = "";
        let features: Array<{
          id: string;
          name: string;
          description: string;
          priority: "P0" | "P1" | "P2";
          effort: "S" | "M" | "L" | "XL";
          acceptance: string[];
        }> = [];

        for (const step of STEPS) {
          send("step", { id: step.id, status: "running", label: step.label });

          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          let result: any;

          switch (step.id) {
            case "research": {
              result = await runResearchAgent(project.idea, project.industry ?? undefined);
              researchSummary = (result.summary as string) ?? "";
              marketSize = (result.marketSize as string) ?? "";

              await prisma.agentOutput.upsert({
                where: { projectId_type: { projectId, type: "RESEARCH" } },
                create: {
                  projectId,
                  type: "RESEARCH",
                  content: result,
                  tokens: result.tokens ?? 0,
                  duration: result.duration ?? 0,
                },
                update: {
                  content: result,
                  tokens: result.tokens ?? 0,
                  duration: result.duration ?? 0,
                },
              });

              const competitors = Array.isArray(result.competitors)
                ? (result.competitors as Array<Record<string, unknown>>)
                : [];

              if (competitors.length > 0) {
                await prisma.competitor.deleteMany({ where: { projectId } });
                await prisma.competitor.createMany({
                  data: competitors.map((c) => ({
                    projectId,
                    name: String(c.name ?? "Unknown"),
                    website: c.website ? String(c.website) : null,
                    strengths: Array.isArray(c.strengths)
                      ? (c.strengths as string[])
                      : [],
                    weaknesses: Array.isArray(c.weaknesses)
                      ? (c.weaknesses as string[])
                      : [],
                    pricing: c.pricing ? String(c.pricing) : null,
                  })),
                });
              }
              break;
            }

            case "prd": {
              result = await runPRDAgent(
                project.idea,
                project.targetUsers ?? undefined,
                researchSummary
              );

              features = Array.isArray(result.features)
                ? (result.features as typeof features)
                : [];

              await prisma.agentOutput.upsert({
                where: { projectId_type: { projectId, type: "PRD" } },
                create: {
                  projectId,
                  type: "PRD",
                  content: result,
                  tokens: result.tokens ?? 0,
                  duration: result.duration ?? 0,
                },
                update: {
                  content: result,
                  tokens: result.tokens ?? 0,
                  duration: result.duration ?? 0,
                },
              });
              break;
            }

            case "stories": {
              result = await runStoriesAgent(project.idea, features);

              await prisma.agentOutput.upsert({
                where: { projectId_type: { projectId, type: "STORIES" } },
                create: {
                  projectId,
                  type: "STORIES",
                  content: result,
                  tokens: result.tokens ?? 0,
                  duration: result.duration ?? 0,
                },
                update: {
                  content: result,
                  tokens: result.tokens ?? 0,
                  duration: result.duration ?? 0,
                },
              });

              const epics = Array.isArray(result.epics)
                ? (result.epics as Array<Record<string, unknown>>)
                : [];

              if (epics.length > 0) {
                await prisma.userStory.deleteMany({ where: { projectId } });
                const storyRows = epics.flatMap((epic) => {
                  const epicName = String(epic.name ?? "Epic");
                  const stories = Array.isArray(epic.stories)
                    ? (epic.stories as Array<Record<string, unknown>>)
                    : [];
                  return stories.map((s) => ({
                    projectId,
                    epicName,
                    title: String(s.title ?? ""),
                    asA: String(s.asA ?? ""),
                    iWant: String(s.iWant ?? ""),
                    soThat: String(s.soThat ?? ""),
                    priority: (["HIGH", "MEDIUM", "LOW"].includes(
                      String(s.priority)
                    )
                      ? s.priority
                      : "MEDIUM") as "HIGH" | "MEDIUM" | "LOW",
                    storyPoints:
                      typeof s.storyPoints === "number" ? s.storyPoints : 3,
                  }));
                });

                if (storyRows.length > 0) {
                  await prisma.userStory.createMany({ data: storyRows });
                }
              }
              break;
            }

            case "roadmap": {
              result = await runRoadmapAgent(project.idea, features);

              await prisma.agentOutput.upsert({
                where: { projectId_type: { projectId, type: "ROADMAP" } },
                create: {
                  projectId,
                  type: "ROADMAP",
                  content: result,
                  tokens: result.tokens ?? 0,
                  duration: result.duration ?? 0,
                },
                update: {
                  content: result,
                  tokens: result.tokens ?? 0,
                  duration: result.duration ?? 0,
                },
              });

              const phases = result.phases ?? [];

              await prisma.roadmap.upsert({
                where: { projectId },
                create: { projectId, phases: phases as object },
                update: { phases: phases as object },
              });
              break;
            }

            case "market": {
              result = await runMarketAgent(project.idea, marketSize);

              await prisma.agentOutput.upsert({
                where: { projectId_type: { projectId, type: "MARKET_ANALYSIS" } },
                create: {
                  projectId,
                  type: "MARKET_ANALYSIS",
                  content: result,
                  tokens: result.tokens ?? 0,
                  duration: result.duration ?? 0,
                },
                update: {
                  content: result,
                  tokens: result.tokens ?? 0,
                  duration: result.duration ?? 0,
                },
              });
              break;
            }

            case "personas": {
              result = await runPersonaAgent(
                project.idea,
                project.targetUsers ?? undefined
              );

              await prisma.agentOutput.upsert({
                where: { projectId_type: { projectId, type: "PERSONA" } },
                create: {
                  projectId,
                  type: "PERSONA",
                  content: result,
                  tokens: result.tokens ?? 0,
                  duration: result.duration ?? 0,
                },
                update: {
                  content: result,
                  tokens: result.tokens ?? 0,
                  duration: result.duration ?? 0,
                },
              });

              const personas = Array.isArray(result.personas)
                ? (result.personas as Array<Record<string, unknown>>)
                : [];

              if (personas.length > 0) {
                await prisma.persona.deleteMany({ where: { projectId } });
                await prisma.persona.createMany({
                  data: personas.map((p) => ({
                    projectId,
                    name: String(p.name ?? "Unknown"),
                    age: String(p.age ?? ""),
                    role: String(p.role ?? ""),
                    painPoints: Array.isArray(p.painPoints)
                      ? (p.painPoints as string[])
                      : [],
                    goals: Array.isArray(p.goals) ? (p.goals as string[]) : [],
                    techSavvy: String(p.techSavvy ?? "Medium"),
                  })),
                });
              }
              break;
            }

            case "risks": {
              result = await runRiskAgent(project.idea);

              await prisma.agentOutput.upsert({
                where: { projectId_type: { projectId, type: "RISK" } },
                create: {
                  projectId,
                  type: "RISK",
                  content: result,
                  tokens: result.tokens ?? 0,
                  duration: result.duration ?? 0,
                },
                update: {
                  content: result,
                  tokens: result.tokens ?? 0,
                  duration: result.duration ?? 0,
                },
              });

              const risks = Array.isArray(result.risks)
                ? (result.risks as Array<Record<string, unknown>>)
                : [];

              if (risks.length > 0) {
                await prisma.risk.deleteMany({ where: { projectId } });
                await prisma.risk.createMany({
                  data: risks.map((r) => ({
                    projectId,
                    category: String(r.category ?? "operational"),
                    title: String(r.title ?? ""),
                    description: String(r.description ?? ""),
                    severity: String(r.severity ?? "medium"),
                    mitigation: String(r.mitigation ?? ""),
                  })),
                });
              }
              break;
            }

            default:
              result = {};
          }

          send("step", { id: step.id, status: "done", data: result });
        }

        await prisma.project.update({
          where: { id: projectId },
          data: { status: "COMPLETED" },
        });

        send("complete", { projectId });
      } catch (err) {
        console.error("Agent orchestration error:", err);

        try {
          await prisma.project.update({
            where: { id: projectId },
            data: { status: "FAILED" },
          });
        } catch (updateErr) {
          console.error("Failed to mark project FAILED:", updateErr);
        }

        send("error", {
          message:
            err instanceof Error
              ? err.message
              : "An unexpected error occurred while running the agents",
        });
      } finally {
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    },
  });
}
