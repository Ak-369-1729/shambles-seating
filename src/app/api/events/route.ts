import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { DEMO_EVENT } from "@/lib/constants";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const supabase = await createClient();

    // 1. Fetch Event
    let { data: event, error: eventError } = await supabase
      .from("events")
      .select("*")
      .eq("slug", DEMO_EVENT.SLUG)
      .single();

    const eventRecord = event as any;

    // Fallback if database hasn't been migrated yet
    if (eventError || !eventRecord?.id) {
      return NextResponse.json({
        id: "demo-event-id",
        slug: DEMO_EVENT.SLUG,
        name: DEMO_EVENT.NAME,
        description: "The ultimate algorithmic and UI challenge of the Grand Line.",
        date: DEMO_EVENT.DATE,
        start_time: "09:30:00",
        end_time: "16:10:00",
        venue: DEMO_EVENT.VENUE,
        capacity: DEMO_EVENT.TOTAL_CAPACITY,
        status: "UPCOMING",
        theme: DEMO_EVENT.THEME_TITLE,
        confirmed_count: DEMO_EVENT.DEMO_CONFIRMED,
        available_capacity: DEMO_EVENT.DEMO_REMAINING,
        waitlist_count: DEMO_EVENT.DEMO_WAITLIST,
        active_offer: null,
      });
    }

    // 2. Fetch Confirmed count
    const { count: confirmedCount } = await supabase
      .from("registrations")
      .select("*", { count: "exact", head: true })
      .eq("event_id", eventRecord.id)
      .eq("status", "CONFIRMED");

    // 3. Fetch Active Offer
    const { data: activeOffer } = await supabase
      .from("berth_offers")
      .select("*, registrations(*)")
      .eq("event_id", eventRecord.id)
      .eq("status", "ACTIVE")
      .gt("expires_at", new Date().toISOString())
      .maybeSingle();

    // 4. Fetch Waitlist count
    const { count: waitlistCount } = await supabase
      .from("registrations")
      .select("*", { count: "exact", head: true })
      .eq("event_id", eventRecord.id)
      .eq("status", "WAITLISTED");

    const totalConfirmed = confirmedCount ?? DEMO_EVENT.DEMO_CONFIRMED;
    const availableCapacity = Math.max(0, eventRecord.capacity - totalConfirmed - (activeOffer ? 1 : 0));

    return NextResponse.json({
      ...eventRecord,
      confirmed_count: totalConfirmed,
      available_capacity: availableCapacity,
      waitlist_count: waitlistCount ?? DEMO_EVENT.DEMO_WAITLIST,
      active_offer: activeOffer || null,
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || "Failed to fetch event state" },
      { status: 500 }
    );
  }
}
