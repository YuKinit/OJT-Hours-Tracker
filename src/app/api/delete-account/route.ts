import { NextResponse } from "next/server";

import { createClient } from "@supabase/supabase-js";

import { createSupabaseServerClient } from "@/lib/supabase/server";

export async function POST(request: Request) {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError) {
    return new NextResponse(userError.message, { status: 401 });
  }
  if (!user) {
    return new NextResponse("Not logged in.", { status: 401 });
  }

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY ?? "";
  if (!url || !serviceKey) {
    return new NextResponse(
      "Server is missing SUPABASE_SERVICE_ROLE_KEY env var. Add it to .env.local / Vercel env vars.",
      { status: 500 },
    );
  }

  // Service role client: required to delete auth users.
  const admin = createClient(url, serviceKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  // 1) Delete saved user data (explicit), then:
  // 2) Delete avatar files (best-effort), then:
  // 3) Delete auth user (also cascades).

  // Delete table rows first (service role bypasses RLS).
  await admin.from("ojt_entries").delete().eq("user_id", user.id);
  await admin.from("ojt_profiles").delete().eq("user_id", user.id);
  await admin.from("user_profiles").delete().eq("user_id", user.id);

  // Best-effort: delete avatar files under <user_id>/...
  const { data: objects } = await admin.storage.from("avatars").list(user.id, { limit: 100 });
  if (objects?.length) {
    const paths = objects
      .filter((o) => !!o.name)
      .map((o) => `${user.id}/${o.name}`);
    if (paths.length) await admin.storage.from("avatars").remove(paths);
  }

  // Delete the auth user. This cascades to tables referencing auth.users (ojt_profiles/user_profiles).
  const { error: deleteError } = await admin.auth.admin.deleteUser(user.id);
  if (deleteError) {
    return new NextResponse(deleteError.message, { status: 500 });
  }

  // Session cookie may still exist; attempt sign-out and then redirect.
  await supabase.auth.signOut();
  return NextResponse.redirect(new URL("/signup", request.url));
}

