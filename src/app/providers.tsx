"use client";

import * as React from "react";

import { ToastProvider } from "@/components/toast";

export default function Providers(props: { children: React.ReactNode }) {
  return <ToastProvider>{props.children}</ToastProvider>;
}

