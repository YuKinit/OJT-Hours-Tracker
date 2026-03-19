import { redirect } from "next/navigation";

import { requireUser } from "@/lib/auth/require-user";
import { getOjtProfileForUser } from "@/lib/db/ojt-profiles";

import SetupForm from "./setup-form";
import SetupToasts from "./setup-toasts";

export default async function SetupPage(props: { searchParams?: Promise<Record<string, string | string[] | undefined>> }) {
  const searchParams = (await props.searchParams) ?? {};
  const { user } = await requireUser();
  const existing = await getOjtProfileForUser(user.id);

  // If already configured, go straight to dashboard.
  if (existing) redirect("/dashboard");

  return (
    <>
      <SetupToasts
        welcome={typeof searchParams.welcome === "string" ? searchParams.welcome : undefined}
        oauth={typeof searchParams.oauth === "string" ? searchParams.oauth : undefined}
      />
      <SetupForm userId={user.id} />
    </>
  );
}

