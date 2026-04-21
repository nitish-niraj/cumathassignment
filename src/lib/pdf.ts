import { getDocument, GlobalWorkerOptions, type PDFDocumentProxy } from "pdfjs-dist";

// Disable the web worker for Node.js / serverless environments.
// Without this, pdfjs-dist tries to spawn a worker thread whose file
// path doesn't exist inside Vercel's bundled function output.
// We set workerSrc to empty string and workerPort to null per-call
// to avoid "Invalid URL" / "fake worker" errors from pdfjs URL validation.
if (typeof window === "undefined") {
  GlobalWorkerOptions.workerSrc = "";
  if ("workerPort" in GlobalWorkerOptions) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (GlobalWorkerOptions as any).workerPort = null;
  }
}

export interface PDFResult {
  text: string;
  pageCount: number;
  charCount: number;
}

/**
 * Parse a PDF buffer and return cleaned text with metadata.
 * Uses pdfjs-dist directly (no native canvas dependency) so it works
 * reliably in Vercel serverless functions.
 */
export async function parsePDF(buffer: Buffer): Promise<PDFResult> {
  // Ensure worker is disabled before every call (defense against any module-level reset)
  GlobalWorkerOptions.workerSrc = "";
  if ("workerPort" in GlobalWorkerOptions) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (GlobalWorkerOptions as any).workerPort = null;
  }

  const data = new Uint8Array(buffer);

  const getDocOptions = {
    data,
    useSystemFonts: true,
    useWorkerFetch: false,
    isEvalSupported: false,
    disableAutoFetch: true,
  };

  let doc: PDFDocumentProxy;
  try {
    doc = await getDocument(getDocOptions).promise;
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    // If the error is related to "Invalid URL" or "fake worker", retry with a
    // maximally constrained fallback configuration on the main thread.
    if (msg.includes("Invalid URL") || msg.includes("fake worker")) {
      const fallbackData = new Uint8Array(buffer);
      doc = await getDocument({
        data: fallbackData,
        useWorkerFetch: false,
        isEvalSupported: false,
        useSystemFonts: false,
        disableAutoFetch: true,
        disableFontFace: true,
      }).promise;
    } else {
      throw err;
    }
  }

  const pageCount = doc.numPages;
  const pageTexts: string[] = [];

  for (let i = 1; i <= pageCount; i++) {
    const page = await doc.getPage(i);
    const content = await page.getTextContent();
    // Concatenate text items with spaces; respect line breaks via transform y-coordinates
    const items = content.items;
    let lastY: number | null = null;
    let line = "";
    const lines: string[] = [];

    for (const item of items) {
      if (!("str" in item)) continue;
      const y = item.transform[5]; // vertical position
      if (lastY !== null && Math.abs(y - lastY) > 2) {
        // New line
        lines.push(line);
        line = item.str;
      } else {
        line += (line ? " " : "") + item.str;
      }
      lastY = y;
    }
    if (line) lines.push(line);

    pageTexts.push(lines.join("\n"));
  }

  let text = pageTexts.join("\n\n");

  // Remove page number patterns like "Page 1 of 10", "1 / 10", "- 1 -"
  text = text.replace(/\bPage\s+\d+\s+of\s+\d+\b/gi, "");
  text = text.replace(/\b\d+\s*\/\s*\d+\b/g, "");
  text = text.replace(/^-\s*\d+\s*-$/gm, "");

  // Remove lines that are just a number (lone page numbers)
  text = text.replace(/^\s*\d+\s*$/gm, "");

  // Collapse 3+ newlines into double newline
  text = text.replace(/\n{3,}/g, "\n\n");

  // Trim each line (removes trailing spaces / carriage returns)
  text = text
    .split("\n")
    .map((l: string) => l.trimEnd())
    .join("\n");

  // Final trim
  text = text.trim();

  return {
    text,
    pageCount,
    charCount: text.length,
  };
}

/**
 * Split text into overlapping chunks suitable for AI processing.
 * Tries to split at paragraph boundaries (double newline).
 */
export function chunkText(text: string, maxChunkSize = 3000): string[] {
  const OVERLAP = 300;
  const MIN_CHUNK = 200;

  const paragraphs = text.split(/\n\n+/);
  const chunks: string[] = [];
  let current = "";

  for (const para of paragraphs) {
    const candidate = current ? current + "\n\n" + para : para;

    if (candidate.length <= maxChunkSize) {
      current = candidate;
    } else {
      // Current chunk is ready — flush it
      if (current.length >= MIN_CHUNK) {
        chunks.push(current.trim());
      }

      // Start new chunk with overlap from tail of previous chunk
      if (current.length > OVERLAP) {
        const tail = current.slice(-OVERLAP);
        current = tail + "\n\n" + para;
      } else {
        current = para;
      }

      // If a single paragraph exceeds maxChunkSize, hard-split it
      while (current.length > maxChunkSize) {
        const slice = current.slice(0, maxChunkSize);
        if (slice.length >= MIN_CHUNK) {
          chunks.push(slice.trim());
        }
        current = current.slice(maxChunkSize - OVERLAP);
      }
    }
  }

  // Flush the last chunk
  if (current.trim().length >= MIN_CHUNK) {
    chunks.push(current.trim());
  }

  return chunks;
}
