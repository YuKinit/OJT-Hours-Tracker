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
    return NextResponse.json({ error: userError.message }, { status: 401 });
  }
  if (!user) {
    return NextResponse.json({ error: "Not logged in." }, { status: 401 });
  }

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY ?? "";
  if (!url || !serviceKey) {
    return NextResponse.json(
      {
        error:
          "Server is missing SUPABASE_SERVICE_ROLE_KEY. Add it in Vercel → Settings → Environment Variables, then redeploy.",
      },
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
    return NextResponse.json({ error: deleteError.message }, { status: 500 });
  }

  // Clear session cookies. Do NOT use redirect here — fetch() following redirects after POST can
  // re-POST to /signup and get 405, so the client treats delete as failed.
  await supabase.auth.signOut();
  return NextResponse.json({ ok: true });
}

