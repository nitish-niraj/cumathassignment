import OpenAI from "openai";

// ── Client ────────────────────────────────────────────────────────────────────
// Instantiated at module scope so it is re-used across requests in the same
// Node process lifetime. The OPENROUTER_API_KEY env var is NEVER sent to the
// client — this file must only be imported from server-side code.
const openrouter = new OpenAI({
  baseURL: "https://openrouter.ai/api/v1",
  apiKey: process.env.OPENROUTER_API_KEY,
});

// ── Types ─────────────────────────────────────────────────────────────────────
export interface Flashcard {
  front: string;
  back: string;
  difficulty: "EASY" | "MEDIUM" | "HARD";
}

export type ProgressCallback = (update: {
  status: string;
  message: string;
  progress: number;
  cardCount?: number;
}) => void;

// ── Subject → Emoji ───────────────────────────────────────────────────────────
export function subjectToEmoji(subject?: string): string {
  const map: Record<string, string> = {
    Mathematics: "📐",
    Science: "🔬",
    History: "📜",
    Literature: "📚",
    Languages: "🌍",
  };
  return subject ? (map[subject] ?? "🧠") : "🧠";
}

// ── Card generation for a single chunk ───────────────────────────────────────
const SYSTEM_PROMPT = `You are an expert educator and curriculum designer. Create flashcards from the provided study material that promote deep understanding and long-term retention.

Generate flashcards covering ALL of these categories where applicable:
- CORE CONCEPTS: Test understanding of fundamental ideas, not just definitions
- DEFINITIONS: Key terms with clear, precise definitions
- RELATIONSHIPS: How concepts connect — cause-effect, compare-contrast, part-whole
- EDGE CASES: Tricky exceptions, common misconceptions, "what if" scenarios
- WORKED EXAMPLES: For quantitative subjects — problem on front, step-by-step solution on back
- APPLICATION: "When would you use this?", "What happens if...?", real-world connections
- COMMON MISTAKES: "What's wrong with this reasoning: [flawed statement]?"

Card quality rules:
- Front: Always a clear, specific question. Never vague. Never "What is X?" when you can ask "Why does X cause Y?"
- Back: Complete but concise. Include a brief explanation, not just a bare answer. 2-4 sentences ideal.
- One concept per card. If you need multiple points, make multiple cards.
- Vary question formats: "What...", "Why...", "How would you...", "Compare...", "True or false:...", "Solve:...", "What's wrong with..."
- For math/science: use proper notation. Wrap expressions in backticks for monospace rendering.
- Assign difficulty: EASY (recall/recognition), MEDIUM (understanding/application), HARD (analysis/synthesis/edge cases)
- Generate 8-15 cards per section depending on content density. Prefer more thorough coverage.

RESPOND WITH ONLY THIS JSON, NO OTHER TEXT:
{"cards":[{"front":"...","back":"...","difficulty":"EASY|MEDIUM|HARD"}]}`;

export async function generateFlashcardsFromChunk(
  chunk: string,
  deckTitle: string,
  subject: string,
  chunkIndex: number,
  totalChunks: number,
): Promise<Flashcard[]> {
  const userMessage = `Subject: ${subject || "General"}
Deck: ${deckTitle}
Section ${chunkIndex + 1} of ${totalChunks}

Content:
${chunk}`;

  let rawContent = "";

  try {
    const completion = await openrouter.chat.completions.create({
      model: "openai/gpt-oss-120b:free",
      temperature: 0.7,
      max_tokens: 4000,
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        { role: "user", content: userMessage },
      ],
    });

    rawContent = completion.choices[0]?.message?.content ?? "";
  } catch (err) {
    console.error(`[AI] API call failed for chunk ${chunkIndex}:`, err);
    throw err;
  }

  // Strip possible markdown code fences
  const jsonStr = rawContent
    .replace(/^```(?:json)?\s*/i, "")
    .replace(/\s*```\s*$/i, "")
    .trim();

  try {
    const parsed = JSON.parse(jsonStr) as { cards: Flashcard[] };
    return parsed.cards ?? [];
  } catch {
    // Try to extract the first { … } block
    const match = jsonStr.match(/\{[\s\S]*\}/);
    if (match) {
      try {
        const parsed = JSON.parse(match[0]) as { cards: Flashcard[] };
        return parsed.cards ?? [];
      } catch {
        // fall through
      }
    }
    console.error(
      `[AI] JSON parse failed for chunk ${chunkIndex}. Raw:`,
      rawContent.slice(0, 300),
    );
    return [];
  }
}

// ── Normalise a card front for deduplication ──────────────────────────────────
function normaliseFront(front: string): string {
  return front.toLowerCase().replace(/[^a-z0-9\s]/g, "").trim();
}

function isDuplicate(front: string, existing: Flashcard[]): boolean {
  const norm = normaliseFront(front).slice(0, 50);
  return existing.some((c) => normaliseFront(c.front).slice(0, 50) === norm);
}

// ── Full PDF → cards pipeline ─────────────────────────────────────────────────
const delay = (ms: number) => new Promise((res) => setTimeout(res, ms));

export async function generateFlashcardsFromPDF(
  chunks: string[],
  deckTitle: string,
  subject: string,
  onProgress: ProgressCallback,
): Promise<Flashcard[]> {
  const allCards: Flashcard[] = [];
  const N = chunks.length;

  for (let i = 0; i < N; i++) {
    onProgress({
      status: "generating",
      message: `Generating cards from section ${i + 1} of ${N}…`,
      progress: 10 + (i / N) * 75,
    });

    let chunkCards: Flashcard[] = [];

    try {
      chunkCards = await generateFlashcardsFromChunk(
        chunks[i],
        deckTitle,
        subject,
        i,
        N,
      );
    } catch {
      // Retry once after 3 seconds
      await delay(3000);
      try {
        chunkCards = await generateFlashcardsFromChunk(
          chunks[i],
          deckTitle,
          subject,
          i,
          N,
        );
      } catch (retryErr) {
        console.error(`[AI] Chunk ${i} failed after retry — skipping.`, retryErr);
        chunkCards = [];
      }
    }

    // Deduplicate against already-collected cards
    for (const card of chunkCards) {
      if (!isDuplicate(card.front, allCards)) {
        allCards.push(card);
      }
    }

    onProgress({
      status: "generating",
      message: `Generated ${allCards.length} cards so far…`,
      progress: 10 + ((i + 1) / N) * 75,
      cardCount: allCards.length,
    });

    // Pace requests to avoid free-tier rate limits (skip delay after last chunk)
    if (i < N - 1) {
      await delay(1000);
    }
  }

  return allCards;
}
