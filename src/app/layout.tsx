import { Inter } from "next/font/google";

import AppLayout from "@/components/layout/AppLayout";

import "@/styles/globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

import type { Metadata, Viewport } from "next";

export const viewport: Viewport = {
  themeColor: "#09090b", // zinc-950
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

export const metadata: Metadata = {
  title: "recall — Smart Flashcards",
  description: "Turn any PDF into smart flashcards. Study smarter with active recall and spaced repetition.",
  openGraph: {
    title: "recall — Smart Flashcards",
    description: "Turn any PDF into smart flashcards. Study smarter with active recall and spaced repetition.",
    url: "https://recall.example.com",
    siteName: "recall",
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "recall — Smart Flashcards",
    description: "Turn any PDF into smart flashcards. Study smarter with active recall and spaced repetition.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.variable}>
        <AppLayout>{children}</AppLayout>
      </body>
    </html>
  );
}
