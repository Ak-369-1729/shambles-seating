import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const { offerId } = await request.json();

    if (!offerId) {
      return NextResponse.json({ success: false, error: "Offer ID required" }, { status: 400 });
    }

    const supabase = await createClient();

    // Call atomic procedure claim_berth_offer
    const { data, error } = await (supabase as any).rpc("claim_berth_offer", {
      p_offer_id: offerId,
    });

    if (error) {
      return NextResponse.json({ success: false, error: error.message }, { status: 400 });
    }

    return NextResponse.json({
      success: true,
      message: "Berth successfully claimed and confirmed.",
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message || "Failed to claim berth" },
      { status: 500 }
    );
  }
}
