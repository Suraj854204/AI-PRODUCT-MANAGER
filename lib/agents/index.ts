import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

const model = genAI.getGenerativeModel({
  model: "gemini-2.5-flash",
});

/**
 * Extract a JSON object from a Claude text response. Handles responses
 * wrapped in ```json fences, plain JSON, or JSON with surrounding prose.
 * Never throws — returns an empty object on failure so the caller can
 * decide how to degrade gracefully.
 */
function parseJSON<T = Record<string, unknown>>(raw: string): T {
  try {
    let cleaned = raw.trim();

    // Strip ```json ... ``` or ``` ... ``` fences
    const fenceMatch = cleaned.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
    if (fenceMatch) {
      cleaned = fenceMatch[1].trim();
    }

    // If there's leading/trailing prose, isolate the outermost JSON object
    const firstBrace = cleaned.indexOf("{");
    const lastBrace = cleaned.lastIndexOf("}");
    if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
      cleaned = cleaned.slice(firstBrace, lastBrace + 1);
    }

    return JSON.parse(cleaned) as T;
  } catch (err) {
    console.error("Failed to parse agent JSON response:", err);
    return {} as T;
  }
}

interface AgentRunResult {
  tokens: number;
  duration: number;
}

/**
 * Call Claude with a system prompt + user prompt, returning the parsed
 * JSON body plus token usage and wall-clock duration in milliseconds.
 */
async function callAgent<T>(
  system: string,
  userPrompt: string
): Promise<T & { tokens: number; duration: number }> {
  const start = Date.now();

  const prompt = `${system}\n\n${userPrompt}`;

  const result = await model.generateContent(prompt);

  const response = await result.response;

  const text = response.text();

  const duration = Date.now() - start;

  const parsed = parseJSON<T>(text);

  return {
    ...parsed,
    tokens: 0,
    duration,
  };
}
// ─────────────────────────────────────────────────────────────────────────
// AGENT 1 — Market Research
// ─────────────────────────────────────────────────────────────────────────

export interface ResearchAgentResult extends AgentRunResult {
  summary: string;
  marketSize: string;
  trends: string[];
  opportunities: string[];
  threats: string[];
  competitors: Array<{
    name: string;
    website: string;
    description: string;
    strengths: string[];
    weaknesses: string[];
    pricing: string;
    targetMarket: string;
  }>;
}

export async function runResearchAgent(
  idea: string,
  industry?: string
): Promise<ResearchAgentResult> {
  const system =
    "You are an expert market research analyst. Return ONLY valid JSON, with no preamble, no markdown formatting, and no explanation outside the JSON object.";

  const userPrompt = `Conduct market research for this product idea:

IDEA: ${idea}
${industry ? `INDUSTRY: ${industry}` : ""}

Return ONLY a JSON object with this exact shape:
{
  "summary": "string - 3-4 sentence overview of the market landscape",
  "marketSize": "string - e.g. '$4.2B globally, growing to $9.1B by 2029'",
  "trends": ["string", "..."],
  "opportunities": ["string", "..."],
  "threats": ["string", "..."],
  "competitors": [
    {
      "name": "string",
      "website": "string - real domain if known, else best guess",
      "description": "string",
      "strengths": ["string", "..."],
      "weaknesses": ["string", "..."],
      "pricing": "string",
      "targetMarket": "string"
    }
  ]
}

Identify 4-5 real, specific competitors with accurate names. Be specific with
market size figures and cite realistic growth rates. Include 4-6 trends,
4-6 opportunities, and 3-5 threats.`;

  return callAgent<ResearchAgentResult>(system, userPrompt)
}

// ─────────────────────────────────────────────────────────────────────────
// AGENT 2 — PRD Writer
// ─────────────────────────────────────────────────────────────────────────

export interface PRDAgentResult extends AgentRunResult {
  overview: string;
  problemStatement: string;
  goals: string[];
  nonGoals: string[];
  targetAudience: string;
  features: Array<{
    id: string;
    name: string;
    description: string;
    priority: "P0" | "P1" | "P2";
    effort: "S" | "M" | "L" | "XL";
    acceptance: string[];
  }>;
  successMetrics: Array<{
    name: string;
    target: string;
    measurement: string;
  }>;
  constraints: string[];
  assumptions: string[];
  timeline: string;
}

export async function runPRDAgent(
  idea: string,
  targetUsers?: string,
  researchSummary?: string
): Promise<PRDAgentResult> {
  const system =
    "You are a senior Product Manager. Return ONLY valid JSON, with no preamble, no markdown formatting, and no explanation outside the JSON object.";

  const userPrompt = `Write a complete Product Requirements Document for this idea:

IDEA: ${idea}
${targetUsers ? `TARGET USERS: ${targetUsers}` : ""}
${researchSummary ? `MARKET CONTEXT: ${researchSummary}` : ""}

Return ONLY a JSON object with this exact shape:
{
  "overview": "string",
  "problemStatement": "string",
  "goals": ["string", "..."],
  "nonGoals": ["string", "..."],
  "targetAudience": "string",
  "features": [
    {
      "id": "F001",
      "name": "string",
      "description": "string",
      "priority": "P0" | "P1" | "P2",
      "effort": "S" | "M" | "L" | "XL",
      "acceptance": ["string", "..."]
    }
  ],
  "successMetrics": [
    { "name": "string", "target": "string", "measurement": "string" }
  ],
  "constraints": ["string", "..."],
  "assumptions": ["string", "..."],
  "timeline": "string"
}

Include a minimum of 8 features with sequential ids (F001, F002, ...),
realistic priority and effort ratings, and 2-4 acceptance criteria each.
Include 4-6 success metrics.`;

  return callAgent<PRDAgentResult>(system, userPrompt);
}

// ─────────────────────────────────────────────────────────────────────────
// AGENT 3 — User Stories
// ─────────────────────────────────────────────────────────────────────────

export interface StoriesAgentResult extends AgentRunResult {
  epics: Array<{
    name: string;
    description: string;
    stories: Array<{
      title: string;
      asA: string;
      iWant: string;
      soThat: string;
      priority: "HIGH" | "MEDIUM" | "LOW";
      storyPoints: number;
    }>;
  }>;
  totalStories: number;
  totalPoints: number;
}

export async function runStoriesAgent(
  idea: string,
  features: PRDAgentResult["features"]
): Promise<StoriesAgentResult> {
  const system =
    "You are an Agile Product Owner. Return ONLY valid JSON, with no preamble, no markdown formatting, and no explanation outside the JSON object.";

  const userPrompt = `Break this product down into epics and user stories:

IDEA: ${idea}
FEATURES: ${JSON.stringify(features ?? [])}

Return ONLY a JSON object with this exact shape:
{
  "epics": [
    {
      "name": "string",
      "description": "string",
      "stories": [
        {
          "title": "string",
          "asA": "string - the persona/role",
          "iWant": "string - the capability",
          "soThat": "string - the benefit",
          "priority": "HIGH" | "MEDIUM" | "LOW",
          "storyPoints": 1
        }
      ]
    }
  ],
  "totalStories": 0,
  "totalPoints": 0
}

Create 4-5 epics, each with 4-6 stories. Use Fibonacci-like story points
(1, 2, 3, 5, 8, 13). Compute totalStories and totalPoints accurately as the
sum across all epics.`;

  return callAgent<StoriesAgentResult>(system, userPrompt);
}

// ─────────────────────────────────────────────────────────────────────────
// AGENT 4 — Roadmap Planner
// ─────────────────────────────────────────────────────────────────────────

export interface RoadmapAgentResult extends AgentRunResult {
  phases: Array<{
    phase: number;
    name: string;
    duration: string;
    status: "active" | "planned" | "completed";
    goals: string[];
    features: string[];
    milestone: string;
    color: string;
  }>;
}

export async function runRoadmapAgent(
  idea: string,
  features: PRDAgentResult["features"]
): Promise<RoadmapAgentResult> {
  const system =
    "You are a strategic product planner. Return ONLY valid JSON, with no preamble, no markdown formatting, and no explanation outside the JSON object.";

  const userPrompt = `Create a phased product roadmap for this idea:

IDEA: ${idea}
FEATURES: ${JSON.stringify(features ?? [])}

Return ONLY a JSON object with this exact shape:
{
  "phases": [
    {
      "phase": 1,
      "name": "string",
      "duration": "string - e.g. '4 weeks'",
      "status": "active" | "planned" | "completed",
      "goals": ["string", "..."],
      "features": ["string", "..."],
      "milestone": "string",
      "color": "#hex"
    }
  ]
}

Always produce exactly 4 phases. Phase 1 must have status "active"; phases
2-4 must have status "planned". Use a distinct, visually pleasing hex color
per phase (e.g. indigo, cyan, purple, emerald tones). Each phase should
reference 3-6 features by name from the FEATURES list where relevant.`;

  return callAgent<RoadmapAgentResult>(system, userPrompt);
}

// ─────────────────────────────────────────────────────────────────────────
// AGENT 5 — Market Analysis
// ─────────────────────────────────────────────────────────────────────────

export interface MarketAgentResult extends AgentRunResult {
  tam: string;
  sam: string;
  som: string;
  cagr: string;
  revenueProjections: Array<{
    year: string;
    revenue: number;
    users: number;
    mrr: number;
  }>;
  pricingStrategy: string;
  gtmStrategy: string;
  channels: string[];
}

export async function runMarketAgent(
  idea: string,
  marketSize?: string
): Promise<MarketAgentResult> {
  const system =
    "You are a financial analyst. Return ONLY valid JSON, with no preamble, no markdown formatting, and no explanation outside the JSON object.";

  const userPrompt = `Produce a market and financial analysis for this idea:

IDEA: ${idea}
${marketSize ? `KNOWN MARKET SIZE: ${marketSize}` : ""}

Return ONLY a JSON object with this exact shape:
{
  "tam": "string - total addressable market with $ figure",
  "sam": "string - serviceable addressable market with $ figure",
  "som": "string - serviceable obtainable market with $ figure",
  "cagr": "string - e.g. '18.4% CAGR'",
  "revenueProjections": [
    { "year": "Year 1", "revenue": 0, "users": 0, "mrr": 0 }
  ],
  "pricingStrategy": "string",
  "gtmStrategy": "string",
  "channels": ["string", "..."]
}

Always provide exactly 3 years of revenueProjections (Year 1, Year 2,
Year 3) with realistic, gradually increasing revenue (in INR), user counts,
and MRR (monthly recurring revenue, also in INR) figures as raw numbers
(no currency symbols or commas). Include 4-6 growth channels.`;

  return callAgent<MarketAgentResult>(system, userPrompt);
}

// ─────────────────────────────────────────────────────────────────────────
// AGENT 6 — Persona Creator
// ─────────────────────────────────────────────────────────────────────────

export interface PersonaAgentResult extends AgentRunResult {
  personas: Array<{
    name: string;
    age: string;
    role: string;
    background: string;
    painPoints: string[];
    goals: string[];
    techSavvy: "High" | "Medium" | "Low";
    quote: string;
  }>;
}

export async function runPersonaAgent(
  idea: string,
  targetUsers?: string
): Promise<PersonaAgentResult> {
  const system =
    "You are a UX researcher. Return ONLY valid JSON, with no preamble, no markdown formatting, and no explanation outside the JSON object.";

  const userPrompt = `Create user personas for this product idea:

IDEA: ${idea}
${targetUsers ? `TARGET USERS: ${targetUsers}` : ""}

Return ONLY a JSON object with this exact shape:
{
  "personas": [
    {
      "name": "string - a realistic full name",
      "age": "string - e.g. '29'",
      "role": "string - job title",
      "background": "string - 2-3 sentences",
      "painPoints": ["string", "..."],
      "goals": ["string", "..."],
      "techSavvy": "High" | "Medium" | "Low",
      "quote": "string - a short first-person quote capturing their mindset"
    }
  ]
}

Always create exactly 3 distinct personas with varied demographics, roles,
and tech-savviness levels relevant to this product. Include 3-4 pain
points and 3-4 goals per persona.`;

  return callAgent<PersonaAgentResult>(system, userPrompt);
}

// ─────────────────────────────────────────────────────────────────────────
// AGENT 7 — Risk Analyst
// ─────────────────────────────────────────────────────────────────────────

export interface RiskAgentResult extends AgentRunResult {
  risks: Array<{
    category: "technical" | "market" | "financial" | "operational" | "legal";
    title: string;
    description: string;
    severity: "high" | "medium" | "low";
    probability: number;
    impact: number;
    mitigation: string;
  }>;
  overallScore: number;
}

export async function runRiskAgent(idea: string): Promise<RiskAgentResult> {
  const system =
    "You are a risk consultant. Return ONLY valid JSON, with no preamble, no markdown formatting, and no explanation outside the JSON object.";

  const userPrompt = `Conduct a risk assessment for this product idea:

IDEA: ${idea}

Return ONLY a JSON object with this exact shape:
{
  "risks": [
    {
      "category": "technical" | "market" | "financial" | "operational" | "legal",
      "title": "string",
      "description": "string",
      "severity": "high" | "medium" | "low",
      "probability": 1,
      "impact": 1,
      "mitigation": "string"
    }
  ],
  "overallScore": 0
}

Include 8-10 risks spread across all five categories (technical, market,
financial, operational, legal). probability and impact are integers from
1-10. overallScore is an integer 0-100 representing overall project risk
(higher = riskier), derived from the severity and probability/impact of
the listed risks.`;

  return callAgent<RiskAgentResult>(system, userPrompt);
}
