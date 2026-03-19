"use client";

import * as React from "react";

type ToastType = "success" | "error" | "info";

type Toast = {
  id: string;
  type: ToastType;
  title: string;
  message?: string;
};

type ToastContextValue = {
  push: (t: Omit<Toast, "id"> & { id?: string }) => void;
};

const ToastContext = React.createContext<ToastContextValue | null>(null);

function randomId() {
  return Math.random().toString(36).slice(2);
}

export function ToastProvider(props: { children: React.ReactNode }) {
  const [toasts, setToasts] = React.useState<Toast[]>([]);

  const push = React.useCallback((t: Omit<Toast, "id"> & { id?: string }) => {
    const toast: Toast = { id: t.id ?? randomId(), type: t.type, title: t.title, message: t.message };
    setToasts((prev) => [...prev, toast]);
    window.setTimeout(() => {
      setToasts((prev) => prev.filter((x) => x.id !== toast.id));
    }, 3200);
  }, []);

  return (
    <ToastContext.Provider value={{ push }}>
      {props.children}
      <div className="fixed bottom-4 right-4 z-50 flex w-[min(92vw,380px)] flex-col gap-2">
        {toasts.map((t) => {
          const styles =
            t.type === "success"
              ? "border-emerald-500/30 bg-emerald-50 text-emerald-950 dark:bg-emerald-950/40 dark:text-emerald-50"
              : t.type === "error"
                ? "border-red-500/30 bg-red-50 text-red-950 dark:bg-red-950/40 dark:text-red-50"
                : "border-black/10 bg-white text-zinc-950 dark:border-white/10 dark:bg-zinc-950 dark:text-zinc-50";

          return (
            <div
              key={t.id}
              className={`rounded-2xl border p-4 shadow-lg backdrop-blur ${styles}`}
              role="status"
              aria-live="polite"
            >
              <div className="font-semibold">{t.title}</div>
              {t.message ? <div className="text-sm opacity-80 mt-1">{t.message}</div> : null}
              <button
                type="button"
                className="absolute top-2 right-2 rounded-lg px-2 py-1 text-sm opacity-70 hover:opacity-100"
                onClick={() => setToasts((prev) => prev.filter((x) => x.id !== t.id))}
                aria-label="Dismiss"
              >
                ×
              </button>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = React.useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used within ToastProvider");
  return ctx;
}

