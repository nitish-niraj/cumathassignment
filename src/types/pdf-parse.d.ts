declare module "pdf-parse/lib/pdf-parse.js" {
  export interface PDFParseResult {
    numpages: number;
    numrender: number;
    info: Record<string, unknown>;
    metadata: unknown;
    text: string;
    version: string;
  }

  export default function pdfParse(
    dataBuffer: Buffer | Uint8Array,
    options?: Record<string, unknown>,
  ): Promise<PDFParseResult>;
}

declare module "pdf-parse" {
  import pdfParse from "pdf-parse/lib/pdf-parse.js";
  export default pdfParse;
}
