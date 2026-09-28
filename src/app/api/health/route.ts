import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET() {
  return NextResponse.json({
    status: "healthy",
    product: "SHAMBLES SEATING",
    event: "FRONTEND ROULETTE 1.0",
    theme: "GRAN TESORO VIP GALA × WORLD GOVERNMENT REVERIE SUMMIT",
    timestamp: new Date().toISOString(),
  });
}
