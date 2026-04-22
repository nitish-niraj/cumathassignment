# recall (cumaths)

**Turn any PDF into smart flashcards. Study using native spaced repetition (SM-2) with progress + analytics.**

## Submission links (for evaluators)

- **Live URL**: [cumaths.vercel.app](https://cumaths.vercel.app/)
- **Video walkthrough (2–5 min)**: [Google Drive video](https://drive.google.com/file/d/1RQI395YE5LgkQMzWzmOhyrcAGP4Be31a/view?usp=sharing)
- **Short write-up (Google Doc, open access)**: `<PASTE_GOOGLE_DOC_URL>`
- **GitHub repo (public)**: [nitish-niraj/cumathassignment](https://github.com/nitish-niraj/cumathassignment)

## What this is

`recall` is a full-stack, mobile-first web app that:

- **Uploads a PDF** and extracts text server-side
- **Generates flashcards with AI** (OpenRouter) from the document content
- **Schedules reviews with SM-2** (spaced repetition) so you study what’s due
- **Tracks progress and stats** (mastery, activity, upcoming reviews)

## How to use (demo script)

- **Upload**: go to `/upload`, choose a PDF, and watch streaming progress updates until a deck is created.
- **Study**: open a deck and rate cards; each rating updates the next review date via SM-2.
- **Stats**: visit `/stats` to see mastery and review insights.

## Tech stack

- **Framework**: Next.js 14 (App Router)
- **UI**: Tailwind CSS, Radix UI, Framer Motion
- **State**: Zustand
- **Database**: Prisma + PostgreSQL (Supabase)
- **AI**: OpenRouter (via `openai` SDK)
- **PDF parsing**: `pdf-parse` (+ `pdfjs-dist`)
- **Deployment**: Vercel

## Security notes

- **No API keys in the client**: AI calls happen server-side in route handlers.
- **Secrets are environment variables**: `DATABASE_URL`, `OPENROUTER_API_KEY`, and Supabase keys are never committed.
- **Rate limiting**: basic IP-based throttling on PDF uploads to protect upstream services.

## Local development

### Prerequisites

- Node.js 18+ (recommended)
- A Supabase Postgres database (free tier is fine)
- An OpenRouter API key

### Setup

1. Install dependencies

```bash
npm install
```

1. Configure environment variables

```bash
cp .env.example .env.local
```

Fill in `.env.local`:

- `DATABASE_URL`
- `OPENROUTER_API_KEY`
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`

1. Create tables

```bash
npm run prisma:migrate
```

1. Run the app

```bash
npm run dev
```

Open `http://localhost:3000`.

## Supabase setup (required)

This app requires PostgreSQL via Supabase. **SQLite does not work on Vercel** (ephemeral filesystem).

- **Setup guide**: see [`SUPABASE_SETUP.md`](./SUPABASE_SETUP.md) (5 minutes).

## Deployment (Vercel)

1. Set env vars in Vercel:

- `DATABASE_URL`
- `OPENROUTER_API_KEY`
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`

1. Deploy:

```bash
npx vercel deploy --prod --yes
```

## Documentation

- **Short write-up template (paste into Google Doc)**: see [`docs/SHORT_WRITEUP.md`](./docs/SHORT_WRITEUP.md)

---
*Built to be demonstrable, secure, and pleasant to use.*
