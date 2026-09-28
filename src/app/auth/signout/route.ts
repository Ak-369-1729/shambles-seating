import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { cookies } from "next/headers";
import { logTechnicalAuthError } from "@/lib/auth/errors";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  // CRITICAL: Ignore Next.js background prefetch requests so prefetching does NOT log out the user!
  const isPrefetch =
    request.headers.get("purpose") === "prefetch" ||
    request.headers.get("x-purpose") === "prefetch" ||
    request.headers.get("next-router-prefetch") === "1" ||
    request.headers.get("rsc") === "1" ||
    request.nextUrl.searchParams.has("_rsc");

  if (isPrefetch) {
    return new NextResponse(null, { status: 204 });
  }

  try {
    const supabase = await createClient();
    await supabase.auth.signOut();
  } catch (err) {
    logTechnicalAuthError("signout", err);
  }

  // Clear session cookies
  const cookieStore = await cookies();
  cookieStore.delete("shambles_user_session");

  const url = request.nextUrl.clone();
  url.pathname = "/login";
  url.search = "";
  const response = NextResponse.redirect(url);
  response.cookies.delete("shambles_user_session");
  return response;
}

export async function POST(request: NextRequest) {
  return GET(request);
}
