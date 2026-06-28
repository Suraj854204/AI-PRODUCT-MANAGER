// ─────────────────────────────────────────────────────────────────────────
// Database-backed entities (mirrors prisma/schema.prisma)
// ─────────────────────────────────────────────────────────────────────────

export type Plan = "FREE" | "PRO" | "ENTERPRISE";
export type ProjectStatus = "PENDING" | "PROCESSING" | "COMPLETED" | "FAILED";
export type AgentType =
  | "RESEARCH"
  | "PRD"
  | "STORIES"
  | "ROADMAP"
  | "MARKET_ANALYSIS"
  | "PERSONA"
  | "RISK";
export type StoryPriority = "HIGH" | "MEDIUM" | "LOW";
export type StoryStatus = "TODO" | "IN_PROGRESS" | "DONE";

export interface User {
  id: string;
  email: string;
  name: string | null;
  plan: Plan;
  projectCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface AgentOutput {
  id: string;
  projectId: string;
  type: AgentType;
  content: Record<string, unknown>;
  tokens: number;
  duration: number;
  createdAt: string;
}

export interface UserStory {
  id: string;
  projectId: string;
  epicName: string;
  title: string;
  asA: string;
  iWant: string;
  soThat: string;
  priority: StoryPriority;
  storyPoints: number;
  status: StoryStatus;
  jiraKey: string | null;
  createdAt: string;
}

export interface Roadmap {
  id: string;
  projectId: string;
  phases: RoadmapPhase[];
  createdAt: string;
}

export interface Competitor {
  id: string;
  projectId: string;
  name: string;
  website: string | null;
  strengths: string[];
  weaknesses: string[];
  pricing: string | null;
  createdAt: string;
}

export interface Persona {
  id: string;
  projectId: string;
  name: string;
  age: string;
  role: string;
  painPoints: string[];
  goals: string[];
  techSavvy: string;
  createdAt: string;
}

export interface Risk {
  id: string;
  projectId: string;
  category: string;
  title: string;
  description: string;
  severity: string;
  mitigation: string;
  createdAt: string;
}

export interface Project {
  id: string;
  userId: string;
  title: string;
  idea: string;
  industry: string | null;
  targetUsers: string | null;
  status: ProjectStatus;
  createdAt: string;
  updatedAt: string;
  outputs?: AgentOutput[];
  userStories?: UserStory[];
  roadmap?: Roadmap | null;
  competitors?: Competitor[];
  personas?: Persona[];
  risks?: Risk[];
  _count?: {
    userStories: number;
  };
}

// ─────────────────────────────────────────────────────────────────────────
// Agent output content shapes (what each agent returns as JSON)
// ─────────────────────────────────────────────────────────────────────────

export interface ResearchContent {
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

export interface PRDFeature {
  id: string;
  name: string;
  description: string;
  priority: "P0" | "P1" | "P2";
  effort: "S" | "M" | "L" | "XL";
  acceptance: string[];
}

export interface PRDContent {
  overview: string;
  problemStatement: string;
  goals: string[];
  nonGoals: string[];
  targetAudience: string;
  features: PRDFeature[];
  successMetrics: Array<{
    name: string;
    target: string;
    measurement: string;
  }>;
  constraints: string[];
  assumptions: string[];
  timeline: string;
}

export interface StoriesContent {
  epics: Array<{
    name: string;
    description: string;
    stories: Array<{
      title: string;
      asA: string;
      iWant: string;
      soThat: string;
      priority: StoryPriority;
      storyPoints: number;
    }>;
  }>;
  totalStories: number;
  totalPoints: number;
}

export interface RoadmapPhase {
  phase: number;
  name: string;
  duration: string;
  status: "active" | "planned" | "completed";
  goals: string[];
  features: string[];
  milestone: string;
  color: string;
}

export interface RoadmapContent {
  phases: RoadmapPhase[];
}

export interface MarketContent {
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

export interface PersonaContent {
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

export interface RiskContent {
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

// ─────────────────────────────────────────────────────────────────────────
// UI-only types
// ─────────────────────────────────────────────────────────────────────────

export type AgentStepStatus = "idle" | "running" | "done" | "error";

export type AgentStepId =
  | "research"
  | "prd"
  | "stories"
  | "roadmap"
  | "market"
  | "personas"
  | "risks";

export interface AgentStep {
  id: AgentStepId;
  label: string;
  status: AgentStepStatus;
  data?: unknown;
}

export interface ApiResponse<T> {
  data?: T;
  error?: string;
  success: boolean;
}

export interface SSEStepEvent {
  id: AgentStepId;
  status: AgentStepStatus;
  label?: string;
  data?: unknown;
}

export interface SSECompleteEvent {
  projectId: string;
}

export interface SSEErrorEvent {
  message: string;
}
