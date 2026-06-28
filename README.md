# AI PM Agent

An autonomous Product Manager powered by Claude AI. Describe a product idea
and seven specialized AI agents research, write, and plan a complete product
strategy — streamed live to the browser and persisted to Postgres.

## Agents

1. **Market Research** — competitors, trends, opportunities, threats
2. **PRD Writer** — full product requirements document
3. **User Stories** — epics broken into story-pointed stories
4. **Roadmap Planner** — four-phase roadmap with milestones
5. **Market Analysis** — TAM/SAM/SOM, revenue projections, GTM
6. **Persona Creator** — three user personas
7. **Risk Analyst** — risk register with mitigation plans

## Stack

- Next.js 14 (App Router) + TypeScript
- Neon Postgres + Prisma ORM
- google Gemini (`@googlegemini, model `model 2.5`)
- Custom JWT auth (`jose` + `bcryptjs`, http-only cookies)
- Tailwind CSS + Framer Motion
- Server-Sent Events for live agent streaming

## Local setup

```bash
npm install

cp .env.example .env.local
# fill in DATABASE_URL, DIRECT_URL, ANTHROPIC_API_KEY, NEXTAUTH_SECRET

npx prisma generate
npx prisma db push

npm run dev
```

Open http://localhost:3000.

## Environment variables

| Variable | Description |
|---|---|
| `DATABASE_URL` | Neon pooled Postgres connection string |
| `DIRECT_URL` | Neon direct (non-pooled) connection string, used for migrations |
| `ANTHROPIC_API_KEY` | Claude API key from console.anthropic.com |
| `NEXTAUTH_SECRET` | Random string, 32+ characters, used to sign JWTs |
| `NEXTAUTH_URL` | App URL (e.g. `http://localhost:3000`) |
| `NEXT_PUBLIC_APP_URL` | Public-facing app URL |

## Deploying to Vercel

1. Push this repository to GitHub.
2. Import the repo in Vercel.
3. Add all environment variables from `.env.example` in the Vercel project
   settings, pointing `NEXTAUTH_URL` and `NEXT_PUBLIC_APP_URL` at your
   production domain.
4. Deploy. The agent-run route is already configured with
   `export const maxDuration = 300` to allow time for all seven agents to
   complete sequentially.

## Project structure

```
app/                 Routes (pages + API)
  api/auth/           Register, login, logout, session
  api/projects/       Create/list/fetch projects
  api/agent/run/       SSE orchestrator that runs all 7 agents
  dashboard/          Projects list
  project/[id]/       Project detail with 7 result tabs
components/          Shared UI + one component per agent tab
lib/
  agents/             The 7 Claude-powered agent functions
  auth.ts             Password hashing, JWT, session helpers
  db.ts               Prisma client singleton
prisma/schema.prisma  Database schema
types/index.ts        Shared TypeScript types
```
