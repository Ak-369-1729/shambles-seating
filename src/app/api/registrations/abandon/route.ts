import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const { registrationId } = await request.json();

    if (!registrationId) {
      return NextResponse.json(
        { success: false, error: "Registration ID is required" },
        { status: 400 }
      );
    }

    const supabase = await createClient();

    // Call atomic procedure abandon_voyage
    const { data, error } = await (supabase as any).rpc("abandon_voyage", {
      p_registration_id: registrationId,
    });

    if (error) {
      return NextResponse.json({ success: false, error: error.message }, { status: 400 });
    }

    return NextResponse.json({
      success: true,
      message: "Voyage abandoned. Berth released and offered to next eligible crew.",
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message || "Failed to abandon voyage" },
      { status: 500 }
    );
  }
}
