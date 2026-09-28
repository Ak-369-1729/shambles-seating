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

    // 2. Select any confirmed registration to release
    const { data: confirmedReg } = await supabase
      .from("registrations")
      .select("id, crew_name")
      .eq("event_id", eventRecord.id)
      .eq("status", "CONFIRMED")
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    const confirmedRegRecord = confirmedReg as any;
    if (!confirmedRegRecord?.id) {
      return NextResponse.json(
        { success: false, error: "No confirmed registrations available to release." },
        { status: 400 }
      );
    }

    // 3. Atomically abandon voyage and promote next waitlisted crew
    const { error } = await (supabase as any).rpc("abandon_voyage", {
      p_registration_id: confirmedRegRecord.id,
    });

    if (error) {
      return NextResponse.json({ success: false, error: error.message }, { status: 400 });
    }

    return NextResponse.json({
      success: true,
      released_crew: confirmedRegRecord.crew_name,
      message: `Berth for crew "${confirmedRegRecord.crew_name}" released. Next eligible waitlisted crew offered berth.`,
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message || "Failed to release berth" },
      { status: 500 }
    );
  }
}
