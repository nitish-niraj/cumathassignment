import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { processReview, type CardForReview } from "@/lib/spaced-repetition";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json() as {
      cardId: string;
      deckId: string;
      quality: number;
    };

    const { cardId, deckId, quality } = body;

    if (!cardId || !deckId || quality === undefined) {
      return NextResponse.json({ error: "Missing fields" }, { status: 400 });
    }
    if (quality < 0 || quality > 5) {
      return NextResponse.json({ error: "Quality must be 0-5" }, { status: 400 });
    }

    // Load the card
    const card = await db.card.findUnique({ where: { id: cardId } });
    if (!card) {
      return NextResponse.json({ error: "Card not found" }, { status: 404 });
    }

    // Run SM-2
    const cardForReview: CardForReview = {
      id: card.id,
      front: card.front,
      back: card.back,
      difficulty: card.difficulty,
      status: card.status,
      easeFactor: card.easeFactor,
      interval: card.interval,
      repetitionCount: card.repetitionCount,
      nextReviewAt: card.nextReviewAt.toISOString(),
      lastReviewedAt: card.lastReviewedAt?.toISOString() ?? null,
    };

    const update = processReview(cardForReview, quality);

    // Persist card update + review log atomically
    await db.$transaction([
      db.card.update({
        where: { id: cardId },
        data: {
          easeFactor: update.easeFactor,
          interval: update.interval,
          repetitionCount: update.repetitionCount,
          nextReviewAt: new Date(update.nextReviewAt),
          status: update.status,
          lastReviewedAt: new Date(),
        },
      }),
      db.reviewLog.create({
        data: {
          cardId,
          deckId,
          rating: quality.toString(),
        },
      }),
      db.deck.update({
        where: { id: deckId },
        data: { lastStudiedAt: new Date() },
      }),
    ]);

    return NextResponse.json({ ok: true, update });
  } catch (err) {
    console.error("[review] Error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
