import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET() {
  try {
    const decks = await db.deck.findMany({
      select: {
        id: true,
        title: true,
        cards: {
          select: {
            status: true,
            nextReviewAt: true,
          },
        },
      },
    });

    const now = new Date();

    const minimalDecks = decks.map((deck) => {
      const dueCount = deck.cards.filter(
        (c) => c.status !== "NEW" && c.nextReviewAt <= now
      ).length;
      
      return {
        id: deck.id,
        title: deck.title,
        dueCount,
      };
    });

    return NextResponse.json(minimalDecks);
  } catch (err) {
    console.error("[decks-minimal] Error fetching decks", err);
    return NextResponse.json({ error: "Failed to fetch decks" }, { status: 500 });
  }
}
