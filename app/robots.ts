// app/robots.ts
import { NextResponse } from "next/server";

export async function GET() {
  const robots = `
User-agent: *
Allow: /

Sitemap: https://promptdoc-ai.vercel.app/sitemap.xml

# Block sensitive paths
Disallow: /api/
Disallow: /dashboard/
Disallow: /signin
Disallow: /signup

# Block common crawlers from heavy paths (optional)
User-agent: MJ12bot
Disallow: /

User-agent: AhrefsBot
Disallow: /

User-agent: SemrushBot
Disallow: /
`.trim();

  return new NextResponse(robots, {
    status: 200,
    headers: {
      "Content-Type": "text/plain",
      "Cache-Control": "public, max-age=86400, stale-while-revalidate=3600",
    },
  });
}
