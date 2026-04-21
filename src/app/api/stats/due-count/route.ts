import { NextResponse } from "next/server";

import { getDueCount } from "@/lib/stats";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const count = await getDueCount();
    return NextResponse.json({ count });
  } catch {
    return NextResponse.json({ count: 0 }, { status: 500 });
  }
}
