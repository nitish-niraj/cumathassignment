#!/usr/bin/env node
/**
 * Quick setup script to configure Supabase DATABASE_URL in Vercel
 * Run this after you've created your Supabase project and obtained the connection string
 * 
 * Usage: npx tsx scripts/setup-db.ts <connection-string>
 * Example: npx tsx scripts/setup-db.ts "postgresql://postgres.xxx:password@db.supabase.co:5432/postgres"
 */

import { execSync } from "child_process";

const connectionString = process.argv[2];

if (!connectionString) {
  console.error("❌ Missing connection string");
  console.error(
    "Usage: npx tsx scripts/setup-db.ts <connection-string>",
  );
  console.error(
    'Example: npx tsx scripts/setup-db.ts "postgresql://postgres.xxx:password@db.supabase.co:5432/postgres"',
  );
  process.exit(1);
}

// Validate it looks like a PostgreSQL URL
if (!connectionString.includes("postgresql://")) {
  console.error("❌ Invalid connection string format");
  console.error('Must start with "postgresql://"');
  process.exit(1);
}

console.log("🔗 Setting DATABASE_URL in Vercel production environment...");

try {
  // Use echo to pipe the connection string to vercel env add (non-interactive)
  if (process.platform === "win32") {
    // Windows PowerShell
    execSync(
      `powershell -Command "Write-Host '${connectionString}' | npx vercel env add DATABASE_URL production"`,
      { stdio: "inherit" },
    );
  } else {
    // macOS/Linux
    execSync(`echo "${connectionString}" | npx vercel env add DATABASE_URL production`, {
      stdio: "inherit",
    });
  }

  console.log("✅ DATABASE_URL set successfully!");
  console.log("🚀 Run: npx vercel deploy --prod --yes");
} catch (error) {
  console.error("❌ Failed to set DATABASE_URL");
  console.error(
    "Try running manually: npx vercel env add DATABASE_URL production",
  );
  process.exit(1);
}
