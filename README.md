# recall

**Turn any PDF into smart flashcards. Study smarter with native spaced repetition.**

---

`recall` is a production-ready, mobile-first web application designed to natively transform unformatted PDF texts into localized spaced-repetition arrays using artificial intelligence. It incorporates intuitive mastery tracking natively within an elegant glassmorphism aesthetic tailored towards intense productivity bounds.

## Tech Stack
- **Framework:** Next.js 14 (App Router)
- **Styling:** Tailwind CSS & Framer Motion
- **Database:** Prisma (SQLite locally, extensible to Postgres via URL mapping)
- **AI Processing:** OpenRouter (Claude-3.5 Sonnet mapping via OpenAI Client)
- **Local Storage / Services:** Zustand
- **PDF Extraction:** `pdf-parse`

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

### 3. Environment Setup
Rename the `.env.example` file to `.env.local`:
```bash
cp .env.example .env.local
```
Add your explicit OpenRouter API Key internally:
```env
OPENROUTER_API_KEY=your_key_here
```

### 4. Database Boostrap
Synchronize your local SQLite schema constraints:
```bash
npx prisma generate
npx prisma db push
```

### 5. Run explicitly
```bash
npm run dev
```
The interface is now hosted smoothly at `http://localhost:3000`

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
