# Short write-up (copy to Google Doc)

## Links

- **Live URL**: [cumaths.vercel.app](https://cumaths.vercel.app/)
- **Video walkthrough (2–5 min)**: [Google Drive video](https://drive.google.com/file/d/1RQI395YE5LgkQMzWzmOhyrcAGP4Be31a/view?usp=sharing)
- **GitHub repo**: [nitish-niraj/cumathassignment](https://github.com/nitish-niraj/cumathassignment)

## What I built (and the problem)

I built **recall**, a mobile-first web app that turns **PDFs into spaced-repetition flashcards**. The problem I picked: it’s hard to convert dense study material (notes, textbooks, handouts) into an effective daily review system—so recall automates flashcard creation and schedules reviews using SM-2.

## Does it work? (how to evaluate quickly)

- Upload a PDF at `/upload` and watch **streaming progress** while the server parses the document and generates flashcards.
- Open the generated deck and start a study session:
  - Rate each card to log a review and update the next review date (SM-2).
- Visit `/stats` to see progress/maturity and upcoming reviews.

## Smart choices (decisions + tradeoffs)

- **Next.js App Router (full-stack)**: kept the product deployable as a single app (UI + API routes) with server-side AI calls.
  - **Tradeoff**: streaming/background work needs careful timeouts and runtime constraints.
- **Postgres (Supabase) instead of SQLite**: required for a serverless deployment target (Vercel) where filesystem persistence is not guaranteed.
  - **Tradeoff**: adds setup steps (DB provisioning + migrations).
- **Chunked PDF → AI generation pipeline**: improves reliability and keeps requests within model limits.
  - **Tradeoff**: large PDFs can take time; free-tier AI rate limits require pacing + retries.
- **SM-2 spaced repetition**: proven algorithm; updates happen at review-time without cron jobs.
  - **Tradeoff**: harder to “explain” than fixed schedules, but better long-term behavior.

## Delight (UX details)

- Streaming progress during upload (feels responsive during long-running work).
- Mobile-first layout with a focused study flow.
- Micro-interactions (animations/confetti) that reinforce completion without blocking the workflow.
- Friendly, actionable error messages for missing config, rate limits, or temporary model issues.

## Process thinking (what I tried, what broke, what I’d do differently)

- **What I tried first**: a simpler local DB setup (SQLite) for fast iteration.
- **What broke**: deployment on Vercel (ephemeral filesystem) made SQLite unsuitable for production persistence.
- **How I solved it**: moved persistence to **Postgres via Supabase**, updated Prisma config, and documented the setup steps.
- **With more time**:
  - Add OCR for image-based PDFs (currently text extraction works best on text-based PDFs).
  - Add stronger abuse protection (per-user quotas, file-type heuristics, and better rate limiting).
  - Expand evaluation tooling: better analytics, deck quality controls, and editing workflows.

## Security (what I did to keep secrets safe)

- **No secrets in the repo**: API keys and database URLs are provided via environment variables.
- **No exposed AI keys in the browser**: AI generation happens server-side in API route handlers.
- **Basic rate limiting** on uploads to reduce abuse and protect upstream AI services.

## Tech stack

- **Next.js 14 (App Router)**, React 18, TypeScript
- **Tailwind CSS**, Radix UI, Framer Motion
- **Prisma + PostgreSQL (Supabase)**
- **OpenRouter** (via `openai` SDK)
- **pdf-parse / pdfjs-dist** for PDF extraction
