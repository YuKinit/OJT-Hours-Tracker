import { createSupabaseServerClient } from "@/lib/supabase/server";

export type UserProfileRow = {
  user_id: string;
  full_name: string | null;
  avatar_path: string | null;
  avatar_url: string | null;
  created_at: string;
  updated_at: string;
};

export async function getUserProfileForUser(userId: string) {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase.from("user_profiles").select("*").eq("user_id", userId).maybeSingle();
  if (error) throw error;
  return data as UserProfileRow | null;
}

