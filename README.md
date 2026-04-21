# recall

**Turn any PDF into smart flashcards. Study smarter with native spaced repetition.**

---

`recall` is a production-ready, mobile-first web application designed to natively transform unformatted PDF texts into localized spaced-repetition arrays using artificial intelligence. It incorporates intuitive mastery tracking natively within an elegant glassmorphism aesthetic tailored towards intense productivity bounds.

## Tech Stack
- **Framework:** Next.js 14 (App Router)
- **Styling:** Tailwind CSS & Framer Motion
- **Database:** Prisma + PostgreSQL (Supabase)
- **AI Processing:** OpenRouter (Claude-3.5 Sonnet mapping via OpenAI Client)
- **Local Storage / Services:** Zustand
- **PDF Extraction:** `pdf-parse`
- **Deployment:** Vercel

## ⚠️ Important: Database Setup Required

This app requires PostgreSQL via Supabase. **SQLite does NOT work on Vercel** (ephemeral filesystem).

👉 **See [SUPABASE_SETUP.md](./SUPABASE_SETUP.md) for complete setup instructions** (takes 5 minutes)

## Setup Instructions

### 1. Clone the repository
```bash
git clone https://github.com/your-username/recall.git
cd recall
```

### 2. Install dependencies
```bash
npm install
```

### 3. Database Setup (REQUIRED - see SUPABASE_SETUP.md)
Follow the guide in [SUPABASE_SETUP.md](./SUPABASE_SETUP.md) to:
1. Create a free Supabase PostgreSQL project
2. Get your connection string
3. Set `DATABASE_URL` in `.env.local`

```bash
# Example .env.local after Supabase setup:
DATABASE_URL="postgresql://postgres.xxx:password@db.supabase.co:5432/postgres?schema=public"
OPENROUTER_API_KEY=your_key_here
```

### 4. Run Migrations
```bash
npm run prisma:migrate
```

### 5. Run the app
```bash
npm run dev
```

## Deployment to Vercel

After setup, deploy with:
```bash
npx vercel deploy --prod --yes
```

**Note:** Ensure `DATABASE_URL` is set in Vercel environment before deploying (see SUPABASE_SETUP.md Step 3)
The interface is now hosted smoothly at `http://localhost:3000`

## MCP (Cursor) Setup

This repo includes a project-local MCP config at `.cursor/mcp.json` with:
- **Vercel MCP**: `https://mcp.vercel.com` (OAuth login in Cursor)
- **Supabase MCP**: `@supabase/mcp-server-supabase` (local `npx` server)

### Vercel MCP
- Open Cursor → **Settings** → **Tools & MCP**
- You should see `vercel` and a **Needs login** prompt
- Click it and complete the OAuth flow

### Supabase MCP
Set these environment variables (Windows PowerShell):

```powershell
$env:SUPABASE_ACCESS_TOKEN="your_supabase_personal_access_token"
$env:SUPABASE_PROJECT_REF="your_project_ref"
```

Then restart Cursor so it can start the `supabase` MCP server.

## Design Decisions
- **SM-2 Algorithm Integration**: We leverage the industry-standard SM-2 algorithm mapping intervals dynamically adjusting ease-factors per review session natively ensuring maximum retention probabilities explicitly overriding fixed arrays without database heavy cron jobs.
- **Micro-Interaction UI philosophy**: The design system heavily maps dark background components tracking minimal scale modifiers upon actions maintaining intensive focus for learners while retaining aesthetic brilliance. CSS confetti bursts map to perfection rating constraints reinforcing gamified habits effortlessly.
- **Server-Side Rendered Intelligence**: Using heavily chunked prompts and recursive stream handling internally parsing PDFs asynchronously limits overhead natively while protecting explicitly secure constraints preventing keys from exposing within localized React DOM contexts globally. Rate limiting automatically caps uploads ensuring token ceilings are respected natively against IP triggers.

## What'd I do with more time
- PostgreSql transition hooking to Vercel Postgres natively supporting authentication constraints.
- Native React-Native PWA extraction allowing offline syncing capacities natively across mobile devices directly utilizing local `AsyncStorage` mechanics.
- OCR implementation wrapping the backend parser extending image parsing directly.

---
*Built thoughtfully for performance.*
