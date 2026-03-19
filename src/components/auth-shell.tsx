"use client";

import * as React from "react";

import { Container, Page } from "@/components/ui";

export default function AuthShell(props: {
  title: string;
  subtitle: string;
  children: React.ReactNode;
}) {
  return (
    <Page>
      <Container>
        <div className="min-h-[calc(100vh-0px)] py-10 sm:py-16 grid items-center">
          <div className="grid gap-8 lg:grid-cols-2 lg:gap-10">
            {/* Desktop-only side panel */}
            <div className="hidden lg:block">
              <div className="rounded-3xl border border-black/10 dark:border-white/10 bg-white/40 dark:bg-zinc-950/40 backdrop-blur p-10">
                <div className="text-sm text-zinc-600 dark:text-zinc-400">OJT Hours Tracker</div>
                <div className="mt-2 text-3xl font-semibold tracking-tight">{props.title}</div>
                <div className="mt-3 text-base text-zinc-600 dark:text-zinc-400 leading-7">{props.subtitle}</div>

                <div className="mt-8 grid gap-4">
                  <div className="rounded-2xl border border-black/10 dark:border-white/10 bg-white/60 dark:bg-zinc-950/50 p-4">
                    <div className="text-sm font-medium">Predict your end date</div>
                    <div className="text-sm text-zinc-600 dark:text-zinc-400 mt-1">
                      Set your schedule once, then keep an accurate estimate as you log hours.
                    </div>
                  </div>
                  <div className="rounded-2xl border border-black/10 dark:border-white/10 bg-white/60 dark:bg-zinc-950/50 p-4">
                    <div className="text-sm font-medium">Simple daily logging</div>
                    <div className="text-sm text-zinc-600 dark:text-zinc-400 mt-1">
                      Track hours per day and see remaining hours instantly.
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Form area */}
            <div className="flex items-center justify-center">
              <div className="w-full max-w-md space-y-6">
                {props.children}

                {/* Mobile-only info cards (same content as desktop panel, but below the form) */}
                <div className="lg:hidden space-y-3">
                  <div className="text-sm text-zinc-600 dark:text-zinc-400">OJT Hours Tracker</div>
                  <div className="text-xl font-semibold tracking-tight">{props.title}</div>
                  <div className="text-sm text-zinc-600 dark:text-zinc-400 leading-6">{props.subtitle}</div>

                  <div className="grid gap-3 mt-2">
                    <div className="rounded-2xl border border-black/10 dark:border-white/10 bg-white/70 dark:bg-zinc-950/60 p-3">
                      <div className="text-sm font-medium">Predict your end date</div>
                      <div className="text-xs text-zinc-600 dark:text-zinc-400 mt-1">
                        Set your schedule once, then keep an accurate estimate as you log hours.
                      </div>
                    </div>
                    <div className="rounded-2xl border border-black/10 dark:border-white/10 bg-white/70 dark:bg-zinc-950/60 p-3">
                      <div className="text-sm font-medium">Simple daily logging</div>
                      <div className="text-xs text-zinc-600 dark:text-zinc-400 mt-1">
                        Track hours per day and see remaining hours instantly.
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Container>
    </Page>
  );
}

