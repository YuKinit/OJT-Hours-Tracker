"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

function Item(props: { href: string; label: string; icon: React.ReactNode }) {
  const pathname = usePathname();
  const active = pathname === props.href;
  return (
    <Link
      href={props.href}
      className={`flex flex-col items-center justify-center gap-1 px-3 py-2 rounded-2xl transition ${
        active
          ? "text-zinc-950 dark:text-white"
          : "text-zinc-600 hover:text-zinc-950 dark:text-zinc-400 dark:hover:text-white"
      }`}
      aria-current={active ? "page" : undefined}
    >
      <div
        className={`h-9 w-14 rounded-2xl grid place-items-center ${
          active ? "bg-black/5 dark:bg-white/10" : "bg-transparent"
        }`}
      >
        {props.icon}
      </div>
      <div className={`text-[11px] font-medium ${active ? "" : "opacity-90"}`}>{props.label}</div>
    </Link>
  );
}

export default function MobileNav() {
  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 sm:hidden">
      <div className="mx-auto w-full max-w-6xl px-4 sm:px-6">
        <div className="mb-3 rounded-3xl border border-black/10 dark:border-white/10 bg-white/70 dark:bg-zinc-950/60 backdrop-blur shadow-sm px-2 py-2">
          <div className="grid grid-cols-3">
            <Item
              href="/dashboard"
              label="Dashboard"
              icon={
                <svg viewBox="0 0 24 24" width="18" height="18" fill="none" aria-hidden="true">
                  <path
                    d="M4 13.5V6.5A2.5 2.5 0 0 1 6.5 4h2A2.5 2.5 0 0 1 11 6.5v7A2.5 2.5 0 0 1 8.5 16h-2A2.5 2.5 0 0 1 4 13.5Z"
                    stroke="currentColor"
                    strokeWidth="1.8"
                  />
                  <path
                    d="M13 17.5v-11A2.5 2.5 0 0 1 15.5 4h2A2.5 2.5 0 0 1 20 6.5v11A2.5 2.5 0 0 1 17.5 20h-2A2.5 2.5 0 0 1 13 17.5Z"
                    stroke="currentColor"
                    strokeWidth="1.8"
                  />
                </svg>
              }
            />
            <Item
              href="/profile"
              label="Profile"
              icon={
                <svg viewBox="0 0 24 24" width="18" height="18" fill="none" aria-hidden="true">
                  <path
                    d="M12 12a4 4 0 1 0-4-4 4 4 0 0 0 4 4Z"
                    stroke="currentColor"
                    strokeWidth="1.8"
                  />
                  <path
                    d="M4 20a8 8 0 0 1 16 0"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                  />
                </svg>
              }
            />
            <Item
              href="/settings"
              label="Setup"
              icon={
                <svg viewBox="0 0 24 24" width="18" height="18" fill="none" aria-hidden="true">
                  <path
                    d="M12 15.5a3.5 3.5 0 1 0-3.5-3.5 3.5 3.5 0 0 0 3.5 3.5Z"
                    stroke="currentColor"
                    strokeWidth="1.8"
                  />
                  <path
                    d="M19.4 15a8 8 0 0 0 .1-2l2-1.2-2-3.4-2.2.8a7.9 7.9 0 0 0-1.7-1l-.3-2.3h-4l-.3 2.3a7.9 7.9 0 0 0-1.7 1l-2.2-.8-2 3.4 2 1.2a8 8 0 0 0 0 2l-2 1.2 2 3.4 2.2-.8a7.9 7.9 0 0 0 1.7 1l.3 2.3h4l.3-2.3a7.9 7.9 0 0 0 1.7-1l2.2.8 2-3.4-2-1.2Z"
                    stroke="currentColor"
                    strokeWidth="1.6"
                    strokeLinejoin="round"
                  />
                </svg>
              }
            />
          </div>
        </div>
        <div style={{ height: "env(safe-area-inset-bottom)" }} />
      </div>
    </div>
  );
}

