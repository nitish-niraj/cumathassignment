import { PrismaClient } from "@prisma/client";

declare global {
  // eslint-disable-next-line no-var
  var prismaGlobal: PrismaClient | undefined;
}

function pickDatabaseUrl(): string | undefined {
  const isProd = process.env.NODE_ENV === "production";

  // In production, prefer the platform-provided Prisma URL (pooling-friendly)
  // over a user-provided DATABASE_URL which may point at a non-pooled endpoint.
  const candidates = (
    isProd
      ? [
          process.env.POSTGRES_PRISMA_URL,
          process.env.POSTGRES_URL_NON_POOLING,
          process.env.POSTGRES_URL,
          process.env.DATABASE_URL,
        ]
      : [
          process.env.DATABASE_URL,
          process.env.POSTGRES_PRISMA_URL,
          process.env.POSTGRES_URL_NON_POOLING,
          process.env.POSTGRES_URL,
        ]
  ).filter(Boolean) as string[];

  if (candidates.length === 0) return undefined;

  // If DATABASE_URL accidentally points to sqlite (file:...), prefer a Postgres candidate.
  const primary = candidates[0];
  if (primary.startsWith("file:")) {
    const pg = candidates.find((u) => u.startsWith("postgres://") || u.startsWith("postgresql://"));
    return pg ?? primary;
  }

  return primary;
}

function ensureSslmodeRequire(url: string): string {
  // Supabase Postgres expects SSL in serverless environments.
  // If already set, keep as-is.
  if (url.includes("sslmode=")) return url;
  const sep = url.includes("?") ? "&" : "?";
  return `${url}${sep}sslmode=require`;
}

const rawUrl = pickDatabaseUrl();

export const db =
  globalThis.prismaGlobal ??
  new PrismaClient(
    rawUrl
      ? {
          datasources: {
            db: {
              url: ensureSslmodeRequire(rawUrl),
            },
          },
        }
      : undefined,
  );

if (process.env.NODE_ENV !== "production") {
  globalThis.prismaGlobal = db;
}
