import { createSupabaseServerClient } from "@/lib/supabase/server";

export type OjtEntryRow = {
  id: number;
  user_id: string;
  entry_date: string; // YYYY-MM-DD
  hours_worked: number;
  note: string | null;
  created_at: string;
  updated_at: string;
};

export async function listRecentOjtEntries(userId: string, limit = 14) {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("ojt_entries")
    .select("*")
    .eq("user_id", userId)
    .order("entry_date", { ascending: false })
    .limit(limit);

  if (error) throw error;
  return (data ?? []) as OjtEntryRow[];
}

/** All day logs for the user, newest first. Paginated to bypass PostgREST default row caps. */
export async function listAllOjtEntries(userId: string) {
  const supabase = await createSupabaseServerClient();
  const pageSize = 1000;
  const all: OjtEntryRow[] = [];

  for (let from = 0; ; from += pageSize) {
    const { data, error } = await supabase
      .from("ojt_entries")
      .select("*")
      .eq("user_id", userId)
      .order("entry_date", { ascending: false })
      .range(from, from + pageSize - 1);

    if (error) throw error;
    const rows = (data ?? []) as OjtEntryRow[];
    all.push(...rows);
    if (rows.length < pageSize) break;
  }

  return all;
}

export async function getTotalLoggedHours(userId: string) {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase.from("ojt_entries").select("hours_worked").eq("user_id", userId);

  if (error) throw error;
  const total = (data ?? []).reduce((sum, row) => sum + Number(row.hours_worked ?? 0), 0);
  return total;
}

export async function upsertOjtEntry(params: {
  user_id: string;
  entry_date: string;
  hours_worked: number;
  note?: string | null;
}) {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("ojt_entries")
    .upsert(
      {
        user_id: params.user_id,
        entry_date: params.entry_date,
        hours_worked: params.hours_worked,
        note: params.note ?? null,
      },
      { onConflict: "user_id,entry_date" },
    )
    .select("*")
    .single();

  if (error) throw error;
  return data as OjtEntryRow;
}

export async function deleteOjtEntryById(userId: string, id: number) {
  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.from("ojt_entries").delete().eq("id", id).eq("user_id", userId);
  if (error) throw error;
}

