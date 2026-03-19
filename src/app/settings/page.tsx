import { redirect } from "next/navigation";

import { requireUser } from "@/lib/auth/require-user";
import { getOjtProfileForUser } from "@/lib/db/ojt-profiles";

import SettingsForm from "./settings-form";

export default async function SettingsPage() {
  const { user } = await requireUser();
  const profile = await getOjtProfileForUser(user.id);
  if (!profile) redirect("/setup");

  return <SettingsForm userId={user.id} initial={profile} />;
}

