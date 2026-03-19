"use client";

import * as React from "react";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui";
import { useToast } from "@/components/toast";
import { createSupabaseBrowserClient } from "@/lib/supabase/browser";

export default function LogoutButton(props: { className?: string; variant?: "primary" | "secondary" | "ghost" }) {
  const router = useRouter();
  const toast = useToast();
  const [loading, setLoading] = React.useState(false);

  async function logout() {
    setLoading(true);
    const supabase = createSupabaseBrowserClient();
    await supabase.auth.signOut();
    setLoading(false);
    toast.push({ type: "success", title: "Logged out" });
    router.replace("/login");
    router.refresh();
  }

  return (
    <Button
      type="button"
      variant={props.variant ?? "ghost"}
      className={props.className}
      disabled={loading}
      onClick={logout}
    >
      {loading ? "Logging out..." : "Log out"}
    </Button>
  );
}

