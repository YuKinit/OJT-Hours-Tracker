import { requireUser } from "@/lib/auth/require-user";
import { getUserProfileForUser } from "@/lib/db/user-profiles";

import ProfileForm from "./profile-form";

export default async function ProfilePage() {
  const { user } = await requireUser();
  const profile = await getUserProfileForUser(user.id);

  return <ProfileForm userId={user.id} email={user.email ?? ""} initial={profile} />;
}

