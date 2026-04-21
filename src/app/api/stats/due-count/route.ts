import { NextResponse } from "next/server";

import { getDueCount } from "@/lib/stats";

export async function GET() {
  try {
    const count = await getDueCount();
    return NextResponse.json({ count });
  } catch {
    return NextResponse.json({ count: 0 }, { status: 500 });
  }
}
