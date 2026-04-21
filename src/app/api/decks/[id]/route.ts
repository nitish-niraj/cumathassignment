import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { title, description, emoji, subject } = await req.json();

    const deck = await db.deck.update({
      where: { id: params.id },
      data: {
        title,
        description,
        emoji,
        subject,
      },
    });

    return NextResponse.json(deck);
  } catch (error) {
    console.error("[DECK_PUT]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await db.deck.delete({
      where: { id: params.id },
    });

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error("[DECK_DELETE]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
