import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { front, back } = await req.json();

    if (!front || !back) {
      return new NextResponse("Missing fields", { status: 400 });
    }

    const card = await db.card.create({
      data: {
        deckId: params.id,
        front,
        back,
        difficulty: "MEDIUM",
        status: "NEW",
        easeFactor: 2.5,
        interval: 0,
        repetitionCount: 0,
      },
    });

    // Update deck card count
    await db.deck.update({
      where: { id: params.id },
      data: { cardCount: { increment: 1 } },
    });

    return NextResponse.json(card);
  } catch (error) {
    console.error("[DECK_CARDS_POST]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
