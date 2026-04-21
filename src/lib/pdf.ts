import {
  getDocument,
  type DocumentInitParameters,
  type PDFDocumentProxy,
} from "pdfjs-dist/legacy/build/pdf.mjs";

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
  const data = new Uint8Array(buffer);

  const documentInit: DocumentInitParameters & { disableWorker?: boolean } = {
    data,
    // Serverless runtime: avoid external worker file resolution issues.
    disableWorker: true,
    useSystemFonts: true,
    isEvalSupported: false,
    disableAutoFetch: true,
  };

  const doc: PDFDocumentProxy = await getDocument(documentInit).promise;

  const pageCount = doc.numPages;
  const pageTexts: string[] = [];

  for (let i = 1; i <= pageCount; i++) {
    const page = await doc.getPage(i);
    const content = await page.getTextContent();
    const items = content.items;
    let lastY: number | null = null;
    let line = "";
    const lines: string[] = [];

    for (const item of items) {
      if (!("str" in item)) continue;
      const y = item.transform[5];
      if (lastY !== null && Math.abs(y - lastY) > 2) {
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
