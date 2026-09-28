import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export async function POST() {
  try {
    const supabase = await createClient();

    // Call atomic procedure reset_demo_event
    const { error } = await (supabase as any).rpc("reset_demo_event");

    if (error) {
      return NextResponse.json({ success: false, error: error.message }, { status: 400 });
    }

    return NextResponse.json({
      success: true,
      message: "Frontend Roulette 1.0 demo state has been reset (47 Confirmed, 3 Available, 8 Waitlisted).",
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message || "Failed to reset demo" },
      { status: 500 }
    );
  }
}
