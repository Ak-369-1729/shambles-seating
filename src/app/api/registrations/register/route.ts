import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { z } from "zod";
import { DEMO_EVENT } from "@/lib/constants";

export const dynamic = "force-dynamic";

const registerSchema = z.object({
  crewName: z.string().min(2, "Crew name must be at least 2 characters"),
  captainName: z.string().min(2, "Captain name must be at least 2 characters"),
  captainEmail: z.string().email("Invalid email address"),
  captainPhone: z.string().min(8, "Valid phone number required"),
  collegeId: z.string().min(2, "College ID required"),
  crewMembers: z
    .array(
      z.object({
        name: z.string().min(2, "Member name required"),
        email: z.string().email("Valid email required").optional().or(z.literal("")),
        collegeId: z.string().optional().or(z.literal("")),
        role: z.string().default("Crew Member"),
      })
    )
    .min(2, "At least 2 additional crew members required (Total 3-4 members)")
    .max(3, "Maximum 3 additional crew members allowed (Total 4 members)"),
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const validated = registerSchema.parse(body);
    const supabase = await createClient();

    // 1. Get Event ID
    const { data: event } = await supabase
      .from("events")
      .select("id")
      .eq("slug", DEMO_EVENT.SLUG)
      .maybeSingle();

    const eventRecord = event as any;
    if (!eventRecord?.id) {
      // Mock response if DB is not yet migrated
      return NextResponse.json({
        success: true,
        data: {
          id: "mock-reg-id",
          status: "CONFIRMED",
          queue_position: null,
          crew_name: validated.crewName,
        },
      });
    }

    // 2. Total crew size = captain (1) + additional members
    const totalCrewSize = 1 + validated.crewMembers.length;

    // 3. Invoke atomic register_crew stored procedure
    const { data, error } = await (supabase as any).rpc("register_crew", {
      p_event_id: eventRecord.id,
      p_crew_name: validated.crewName,
      p_captain_name: validated.captainName,
      p_captain_email: validated.captainEmail,
      p_captain_phone: validated.captainPhone,
      p_college_id: validated.collegeId,
      p_crew_size: totalCrewSize,
      p_members: validated.crewMembers as any,
    });

    if (error) {
      return NextResponse.json({ success: false, error: error.message }, { status: 400 });
    }

    return NextResponse.json({
      success: true,
      data,
    });
  } catch (err: any) {
    if (err instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: err.errors[0]?.message || "Validation failed" },
        { status: 422 }
      );
    }
    return NextResponse.json(
      { success: false, error: err.message || "Failed to submit registration" },
      { status: 500 }
    );
  }
}
