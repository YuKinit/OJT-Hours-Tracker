import { NextResponse } from "next/server";

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

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  if (!body || typeof body !== "object") {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  const { id, hours_worked } = body as { id?: unknown; hours_worked?: unknown };
  const entryId = typeof id === "number" ? id : Number(id);
  const hoursNum = typeof hours_worked === "number" ? hours_worked : Number(hours_worked);

  if (!Number.isFinite(entryId)) {
    return NextResponse.json({ error: "Missing or invalid entry id." }, { status: 400 });
  }
  if (!Number.isFinite(hoursNum) || hoursNum < 0.5 || hoursNum > 24) {
    return NextResponse.json({ error: "Hours worked must be between 0.5 and 24." }, { status: 400 });
  }

  const { error } = await supabase
    .from("ojt_entries")
    .update({ hours_worked: hoursNum })
    .eq("id", entryId)
    .eq("user_id", user.id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}

