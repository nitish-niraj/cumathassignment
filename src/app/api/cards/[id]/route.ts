import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { front, back } = await req.json();

    const card = await db.card.update({
      where: { id: params.id },
      data: {
        front,
        back,
      },
    });

    return NextResponse.json(card);
  } catch (error) {
    console.error("[CARD_PUT]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const card = await db.card.delete({
      where: { id: params.id },
    });

    // Decrement deck count
    await db.deck.update({
      where: { id: card.deckId },
      data: { cardCount: { decrement: 1 } },
    });

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error("[CARD_DELETE]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
