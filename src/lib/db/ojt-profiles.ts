import { createSupabaseServerClient } from "@/lib/supabase/server";

export type OjtProfileRow = {
  user_id: string;
  total_required_hours: number;
  hours_per_day: number;
  selected_weekdays: number[]; // 0..6
  start_date: string; // YYYY-MM-DD
  created_at: string;
  updated_at: string;
};

export async function getOjtProfileForUser(userId: string) {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("ojt_profiles")
    .select("*")
    .eq("user_id", userId)
    .maybeSingle();

  if (error) throw error;
  return data as OjtProfileRow | null;
}

