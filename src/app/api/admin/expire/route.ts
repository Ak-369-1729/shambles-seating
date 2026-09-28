import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { DEMO_EVENT } from "@/lib/constants";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const supabase = await createClient();

    // 1. Get Event
    const { data: event } = await supabase
      .from("events")
      .select("id")
      .eq("slug", DEMO_EVENT.SLUG)
      .single();

    const eventRecord = event as any;
    if (!eventRecord?.id) {
      return NextResponse.json({ success: false, error: "Event not found" }, { status: 404 });
    }

    // 2. Find currently ACTIVE offer
    const { data: activeOffer } = await supabase
      .from("berth_offers")
      .select("id, registrations(crew_name)")
      .eq("event_id", eventRecord.id)
      .eq("status", "ACTIVE")
      .maybeSingle();

    const offerRecord = activeOffer as any;
    if (!offerRecord?.id) {
      return NextResponse.json(
        { success: false, error: "No active berth offer currently in flight to expire." },
        { status: 400 }
      );
    }

    // 3. Atomically expire offer and cascade promotion
    const { error } = await (supabase as any).rpc("expire_berth_offer", {
      p_offer_id: offerRecord.id,
    });

    if (error) {
      return NextResponse.json({ success: false, error: error.message }, { status: 400 });
    }

    return NextResponse.json({
      success: true,
      message: "Active offer forcefully expired. Next eligible crew in waitlist promoted.",
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message || "Failed to expire offer" },
      { status: 500 }
    );
  }
}
