"use client";

import * as React from "react";

import { useToast } from "@/components/toast";

export default function SetupToasts(props: { welcome?: string; oauth?: string }) {
  const toast = useToast();

  React.useEffect(() => {
    if (props.welcome !== "1") return;

    const key = "ojt-toast-setup-welcome-shown";
    if (window.sessionStorage.getItem(key) === "1") return;
    window.sessionStorage.setItem(key, "1");

    toast.push({
      type: "success",
      title: "Welcome!",
      message: props.oauth === "1" ? "Signed in with Google. Complete your OJT setup to continue." : "Complete your OJT setup to continue.",
    });
  }, [props.welcome, props.oauth, toast]);

  return null;
}

