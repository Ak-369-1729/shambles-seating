import { NextRequest, NextResponse } from "next/server";
import { encodeSessionCookie } from "@/lib/auth/session-cookie";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  try {
    const { user } = await request.json();
    if (!user) {
      return NextResponse.json({ error: "Missing user payload" }, { status: 400 });
    }

    const response = NextResponse.json({ success: true, user });
    response.cookies.set("shambles_user_session", encodeSessionCookie(user), {
      path: "/",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7,
    });
    return response;
  } catch (err: any) {
    return NextResponse.json({ error: err?.message }, { status: 500 });
  }
}

export async function DELETE() {
  const response = NextResponse.json({ success: true });
  response.cookies.delete("shambles_user_session");
  return response;
}
