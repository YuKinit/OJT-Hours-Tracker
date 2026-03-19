import { NextResponse } from "next/server";

import { createSupabaseServerClient } from "@/lib/supabase/server";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const code = url.searchParams.get("code");

  const supabase = await createSupabaseServerClient();

  if (code) {
    // Exchange code for a session cookie
    await supabase.auth.exchangeCodeForSession(code);
  }

  // If this is a first-time user (no setup yet), send to setup instead of dashboard.
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) {
    const { data: hasSetup } = await supabase
      .from("ojt_profiles")
      .select("user_id")
      .eq("user_id", user.id)
      .maybeSingle();

    if (!hasSetup) {
      const setupUrl = new URL("/setup", request.url);
      setupUrl.searchParams.set("welcome", "1");
      setupUrl.searchParams.set("oauth", "1");
      return NextResponse.redirect(setupUrl);
    }
  }

  const dashUrl = new URL("/dashboard", request.url);
  dashUrl.searchParams.set("oauth", "1");
  return NextResponse.redirect(dashUrl);
}

