import { NextRequest } from "next/server";

import { db } from "@/lib/db";
import { generateFlashcardsFromPDF, subjectToEmoji } from "@/lib/ai";
import { parsePDF, chunkText } from "@/lib/pdf";

export const runtime = "nodejs";
// Allow up to 5 minutes — large PDFs + free-tier AI can be slow
export const maxDuration = 300;

type UploadStage =
  | "database_preflight"
  | "parsing"
  | "chunking"
  | "generating"
  | "saving";

function getPublicErrorMessage(err: unknown): string {
  const msg = err instanceof Error ? err.message : "";

  if (msg.includes("Missing OPENROUTER_API_KEY")) {
    return "AI generation is not configured. Please set OPENROUTER_API_KEY in the server environment and try again.";
  }

  if (
    msg.includes("rate limit") ||
    msg.includes("Rate limit") ||
    msg.includes("429")
  ) {
    return "AI rate limit reached. The free tier has usage caps — please wait a minute and try again.";
  }

  if (
    msg.includes("model") &&
    (msg.includes("not found") || msg.includes("not available") || msg.includes("does not exist"))
  ) {
    return "The AI model is currently unavailable. Please try again later.";
  }

  if (
    msg.includes("401") ||
    msg.includes("Invalid API key") ||
    msg.includes("Incorrect API key")
  ) {
    return "AI API key is invalid. Please check your OPENROUTER_API_KEY setting.";
  }

  if (
    msg.includes("500") ||
    msg.includes("502") ||
    msg.includes("503") ||
    msg.includes("overloaded")
  ) {
    return "The AI service is temporarily overloaded. Please try again in a moment.";
  }

  // Prisma often throws connection / auth errors when DATABASE_URL is missing or wrong.
  if (
    msg.toLowerCase().includes("database_url") ||
    msg.toLowerCase().includes("prisma") ||
    msg.toLowerCase().includes("p100") || // Prisma error codes: P1000.. etc
    msg.toLowerCase().includes("can't reach database server") ||
    msg.toLowerCase().includes("authentication failed")
  ) {
    return "Database connection failed. Please verify DATABASE_URL is set correctly in your deployment environment and try again.";
  }

  console.error("[upload] Unrecognized error:", msg);
  return "Something went wrong. Please try again.";
}

// ── Helper: write a JSON line to the stream ───────────────────────────────────
function encode(obj: object): Uint8Array {
  return new TextEncoder().encode(JSON.stringify(obj) + "\n");
}

// ── Rate Limiter Map ────────────────────────────────────────────────────────
const rateLimitMap = new Map<string, { count: number; expires: number }>();

function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const record = rateLimitMap.get(ip);
  if (!record || record.expires < now) {
    rateLimitMap.set(ip, { count: 1, expires: now + 60 * 1000 });
    return true;
  }
  if (record.count >= 5) return false;
  
  record.count++;
  return true;
}

export async function POST(req: NextRequest) {
  // ── Environment preflight (fail fast with useful message) ───────────────────
  if (!process.env.DATABASE_URL) {
    return new Response(
      JSON.stringify({
        error:
          "Server is missing DATABASE_URL. Set it in your deployment environment and redeploy.",
      }),
      { status: 500, headers: { "Content-Type": "application/json" } },
    );
  }

  if (!process.env.OPENROUTER_API_KEY) {
    return new Response(
      JSON.stringify({
        error:
          "Server is missing OPENROUTER_API_KEY. Set it in your deployment environment to enable AI generation.",
      }),
      { status: 500, headers: { "Content-Type": "application/json" } },
    );
  }

  // ── Rate Limiting ────────────────────────────────────────────────────────────
  const ip = req.ip ?? req.headers.get("x-forwarded-for") ?? "127.0.0.1";
  if (!checkRateLimit(ip)) {
    return new Response(JSON.stringify({ error: "Too many upload requests. Please wait a minute." }), {
      status: 429,
      headers: { "Content-Type": "application/json" },
    });
  }

  // ── Database preflight (fail fast before expensive AI work) ────────────────
  try {
    await db.$queryRawUnsafe("SELECT 1");
  } catch (err) {
    console.error("[upload] Database preflight failed:", err);
    return new Response(
      JSON.stringify({
        error: getPublicErrorMessage(err),
        stage: "database_preflight",
      }),
      { status: 503, headers: { "Content-Type": "application/json" } },
    );
  }

  // Parse multipart form data
  let formData: FormData;
  try {
    formData = await req.formData();
  } catch {
    return new Response(JSON.stringify({ error: "Invalid form data" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  const file = formData.get("file") as File | null;
  const title = (formData.get("title") as string | null)?.trim() ?? "";
  const subject = (formData.get("subject") as string | null)?.trim() ?? "";

  // ── Validation (before stream opens) ────────────────────────────────────────
  if (!file) {
    return new Response(JSON.stringify({ error: "No file provided" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }
  if (file.type !== "application/pdf") {
    return new Response(
      JSON.stringify({ error: "Only PDF files are supported" }),
      { status: 400, headers: { "Content-Type": "application/json" } },
    );
  }
  const MAX_SIZE = 20 * 1024 * 1024; // 20 MB ceiling (keep in sync with UI copy)
  if (file.size > MAX_SIZE) {
    return new Response(
      JSON.stringify({ error: "File too large. Maximum size is 20MB." }),
      { status: 400, headers: { "Content-Type": "application/json" } },
    );
  }
  if (!title) {
    return new Response(
      JSON.stringify({ error: "Deck title is required" }),
      { status: 400, headers: { "Content-Type": "application/json" } },
    );
  }

  // Read the file into a buffer before opening the stream so we don't hold
  // the request body open while streaming back.
  const arrayBuffer = await file.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);

  // ── Open streaming response ──────────────────────────────────────────────────
  const { readable, writable } = new TransformStream();
  const writer = writable.getWriter();

  // Run the pipeline asynchronously so we can return the response immediately
  (async () => {
    let stage: UploadStage = "parsing";
    try {
      // 1. Parsing
      stage = "parsing";
      writer.write(
        encode({ status: "parsing", message: "Reading your PDF…", progress: 5 }),
      );

      const { text, pageCount } = await parsePDF(buffer);
      console.log(`[upload] PDF parsed: ${pageCount} pages, ${text.length} chars`);

      if (text.length < 100) {
        writer.write(
          encode({
            status: "error",
            message:
              "This PDF doesn't contain enough readable text. It may be scanned or image-based.",
          }),
        );
        writer.close();
        return;
      }

      // 2. Chunking
      stage = "chunking";
      writer.write(
        encode({
          status: "chunking",
          message: "Analysing content structure…",
          progress: 10,
        }),
      );

      const chunks = chunkText(text);
      console.log(`[upload] ${chunks.length} chunks created`);

      // 3. AI generation (streaming progress)
      stage = "generating";
      const cards = await generateFlashcardsFromPDF(
        chunks,
        title,
        subject,
        (update) => writer.write(encode(update)),
      );

      // 4. Saving
      stage = "saving";
      writer.write(
        encode({
          status: "saving",
          message: "Finalising your deck…",
          progress: 90,
        }),
      );

      // Final dedup (belt-and-suspenders)
      const seen = new Set<string>();
      const uniqueCards = cards.filter((c) => {
        const key = c.front.toLowerCase().replace(/[^a-z0-9]/g, "").slice(0, 50);
        if (seen.has(key)) return false;
        seen.add(key);
        return true;
      });

      const emoji = subjectToEmoji(subject);
      const description = text.slice(0, 200).replace(/\n/g, " ");

      const deck = await db.deck.create({
        data: {
          title,
          subject: subject || null,
          emoji,
          description,
          cardCount: uniqueCards.length,
          cards: {
            create: uniqueCards.map((c) => ({
              front: c.front,
              back: c.back,
              difficulty: c.difficulty,
              status: "NEW",
              easeFactor: 2.5,
              interval: 0,
              nextReviewAt: new Date(),
            })),
          },
        },
      });

      console.log(
        `[upload] Deck ${deck.id} created with ${uniqueCards.length} cards`,
      );

      // 5. Done
      writer.write(
        encode({
          status: "complete",
          message: "Done!",
          deckId: deck.id,
          cardCount: uniqueCards.length,
          progress: 100,
        }),
      );
    } catch (err) {
      console.error(`[upload] Pipeline error at stage "${stage}":`, err);
      console.error("[upload] Pipeline error details:", {
        stage,
        errorType: err?.constructor?.name,
        message: err instanceof Error ? err.message : String(err),
        stack: err instanceof Error ? err.stack : undefined,
      });
      try {
        await writer.write(
          encode({
            status: "error",
            message: getPublicErrorMessage(err),
            stage,
          }),
        );
      } catch (writeErr) {
        console.error("[upload] Failed to write error to stream:", writeErr);
      }
    } finally {
      try {
        await writer.close();
      } catch (closeErr) {
        console.error("[upload] Failed to close stream writer:", closeErr);
      }
    }
  })();

  return new Response(readable, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Transfer-Encoding": "chunked",
      "X-Content-Type-Options": "nosniff",
      // Disable buffering in nginx / proxies so chunks arrive immediately
      "X-Accel-Buffering": "no",
    },
  });
}
