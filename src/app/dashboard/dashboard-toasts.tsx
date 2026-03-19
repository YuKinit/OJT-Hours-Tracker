"use client";

import * as React from "react";
import { useRouter, useSearchParams } from "next/navigation";

import { useToast } from "@/components/toast";

export default function DashboardToasts() {
  const toast = useToast();
  const router = useRouter();
  const searchParams = useSearchParams();

  React.useEffect(() => {
    if (searchParams.get("oauth") !== "1") return;
    toast.push({ type: "success", title: "Logged in", message: "Signed in with Google." });

    // Remove the query param so it can trigger again next time.
    router.replace("/dashboard");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return null;
}

