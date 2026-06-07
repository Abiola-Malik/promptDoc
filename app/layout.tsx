// app/layout.tsx
import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css" assert { type: "css" };
import { ThemeProvider } from "next-themes";
import AOSInit from "@/components/AOSinit";
import { Analytics } from "@vercel/analytics/next";
import { QueryProvider } from "./providers/query-provider";
import { SpeedInsights } from "@vercel/speed-insights/next";
import Navbar from "./(home)/components/homepage/navbar";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  display: "swap",
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    template: "%s | Promptdoc - AI Documentation for Your Codebase",
    default: "Promptdoc - AI Documentation That Writes Itself",
  },
  description:
    "Upload your codebase. Chat with it. Get perfect, production-ready documentation instantly. Private, secure, and built for developers.",
  keywords: [
    "AI documentation",
    "code documentation tool",
    "AI developer assistant",
    "automatic docs generator",
    "chat with codebase",
    "Next.js documentation",
    "React documentation tool",
    "developer AI",
    "technical documentation",
    "codebase analysis",
  ],
  authors: [{ name: "Abiola Malik" }],
  creator: "Abiola Malik",
  publisher: "Promptdoc",
  metadataBase: new URL("https://promptdoc-ai.vercel.app"),
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "Promptdoc - AI Documentation That Writes Itself",
    description:
      "Upload your code. Ask questions. Get beautiful, accurate documentation in seconds. Private, fast, developer-first.",
    url: "https://promptdoc-ai.vercel.app",
    siteName: "Promptdoc",
    images: [
      {
        url: "/opengraph-image.png",
        width: 1200,
        height: 630,
        alt: "Promptdoc - AI-powered documentation for developers",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#000000" },
  ],
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* Only preload truly critical above-the-fold images */}
        <link
          rel="preload"
          href="/hero-image.webp"
          as="image"
          type="image/webp"
          crossOrigin=""
        />
        {/* No OG preload, no manual icons — Next.js handles them via file convention */}
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-promptdoc-bg-base text-promptdoc-text-primary`}
      >
        <AOSInit />
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          <QueryProvider>
            <Navbar />
            {children}
          </QueryProvider>
          <Analytics />
          <SpeedInsights />
        </ThemeProvider>
      </body>
    </html>
  );
}
