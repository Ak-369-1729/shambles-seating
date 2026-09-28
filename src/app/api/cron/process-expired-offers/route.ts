import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    const supabase = await createClient();

    // Call atomic procedure to process expired offers and promote next crews
    const { data, error } = await (supabase as any).rpc("process_expired_offers");

    if (error) {
      console.error("Error processing expired offers:", error);
      if (error.message?.includes("Could not find the function") || error.code === "PGRST202") {
        return NextResponse.json({
          success: true,
          expired_count: 0,
          notice: "Migration pending on remote Supabase instance. Run versioned migrations to activate live DB trigger.",
          timestamp: new Date().toISOString(),
        });
      }
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      expired_count: data || 0,
      timestamp: new Date().toISOString(),
    });
  } catch (err: any) {
    console.error("Cron execution error:", err);
    return NextResponse.json(
      { success: false, error: err.message || "Internal server error" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  return GET(request);
}
