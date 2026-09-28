import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { cookies } from "next/headers";
import { decodeSessionCookie } from "@/lib/auth/session-cookie";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (user) {
      // Fetch profile row
      const { data: profile } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .maybeSingle();

      const profileRecord = profile as any;
      return NextResponse.json({
        authenticated: true,
        user: {
          id: user.id,
          email: user.email,
          full_name:
            profileRecord?.full_name ||
            (user.user_metadata?.full_name as string) ||
            "Voyager",
          college_id:
            profileRecord?.college_id ||
            (user.user_metadata?.college_id as string) ||
            "UNREGISTERED",
          role:
            profileRecord?.role ||
            (user.user_metadata?.role as string) ||
            "participant",
        },
      });
    }

    // Fallback: Check local dev session cookie
    const cookieStore = await cookies();
    const devSession = cookieStore.get("shambles_user_session");
    if (devSession?.value) {
      const parsed = decodeSessionCookie(devSession.value);
      if (parsed) {
        return NextResponse.json({
          authenticated: true,
          user: parsed,
        });
      }
    }

    return NextResponse.json({
      authenticated: false,
      user: null,
    });
  } catch (err) {
    console.error("[AUTH ME CHECK ERROR]", err);
    return NextResponse.json({
      authenticated: false,
      user: null,
    });
  }
}
