import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { DEMO_EVENT } from "@/lib/constants";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const supabase = await createClient();

    // 1. Get Event
    const { data: event } = await supabase
      .from("events")
      .select("id")
      .eq("slug", DEMO_EVENT.SLUG)
      .maybeSingle();

    const eventRecord = event as any;
    if (!eventRecord?.id) {
      return NextResponse.json({
        queue: [],
        confirmed: [],
      });
    }

    // 2. Fetch Waitlist ordered authoritatively by queue_position
    const { data: queue, error: queueError } = await supabase
      .from("registrations")
      .select("*, crew_members(*)")
      .eq("event_id", eventRecord.id)
      .eq("status", "WAITLISTED")
      .order("queue_position", { ascending: true });

    // 3. Fetch Confirmed crews
    const { data: confirmed, error: confError } = await supabase
      .from("registrations")
      .select("*, crew_members(*)")
      .eq("event_id", eventRecord.id)
      .eq("status", "CONFIRMED")
      .order("confirmed_at", { ascending: false });

    // 4. Fetch Offered crews
    const { data: offered } = await supabase
      .from("registrations")
      .select("*, crew_members(*), berth_offers(*)")
      .eq("event_id", eventRecord.id)
      .eq("status", "OFFERED");

    return NextResponse.json({
      queue: queue || [],
      confirmed: confirmed || [],
      offered: offered || [],
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || "Failed to fetch queue" },
      { status: 500 }
    );
  }
}
