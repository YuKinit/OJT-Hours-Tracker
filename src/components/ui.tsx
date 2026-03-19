import * as React from "react";

export function Container(props: { children: React.ReactNode }) {
  return <div className="w-full max-w-6xl px-4 sm:px-6 lg:px-8 mx-auto">{props.children}</div>;
}

export function Avatar(props: { name?: string | null; src?: string | null }) {
  const initials = (props.name ?? "")
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase())
    .join("") || "U";

  return (
    <div className="h-10 w-10 rounded-full border border-black/10 dark:border-white/10 bg-white/70 dark:bg-zinc-950/70 overflow-hidden flex items-center justify-center backdrop-blur">
      {props.src ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={props.src} alt="Profile" className="h-full w-full object-cover" />
      ) : (
        <div className="text-sm font-semibold text-zinc-700 dark:text-zinc-200">{initials}</div>
      )}
    </div>
  );
}

export function Card(props: { children: React.ReactNode; className?: string }) {
  return (
    <div
      className={`rounded-2xl border border-black/10 bg-white/70 shadow-sm backdrop-blur dark:border-white/10 dark:bg-zinc-950/60 ${props.className ?? ""}`}
    >
      {props.children}
    </div>
  );
}

export function CardHeader(props: { title: string; subtitle?: string }) {
  return (
    <div className="p-6 border-b border-black/10 dark:border-white/10">
      <div className="text-lg font-semibold tracking-tight">{props.title}</div>
      {props.subtitle ? <div className="text-sm text-zinc-600 dark:text-zinc-400 mt-1">{props.subtitle}</div> : null}
    </div>
  );
}

export function CardBody(props: { children: React.ReactNode; className?: string }) {
  return <div className={`p-6 ${props.className ?? ""}`}>{props.children}</div>;
}

export function Label(props: React.LabelHTMLAttributes<HTMLLabelElement>) {
  return <label {...props} className={`text-sm font-medium ${props.className ?? ""}`} />;
}

export const Input = React.forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>(
  function InputInner(props, ref) {
    return (
      <input
        {...props}
        ref={ref}
        suppressHydrationWarning
        className={`h-11 w-full rounded-xl border border-black/10 bg-white/70 px-3 text-sm outline-none ring-0 transition focus:border-black/30 focus:bg-white dark:border-white/10 dark:bg-zinc-950/60 dark:focus:border-white/30 ${props.className ?? ""}`}
      />
    );
  },
);

export function Button(
  props: React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: "primary" | "secondary" | "ghost" },
) {
  const variant = props.variant ?? "primary";
  const base =
    "inline-flex h-11 items-center justify-center rounded-xl px-4 text-sm font-medium transition disabled:opacity-50 disabled:cursor-not-allowed active:translate-y-px";
  const styles =
    variant === "primary"
      ? "bg-zinc-950 text-white hover:bg-zinc-900 shadow-sm dark:bg-white dark:text-black dark:hover:bg-zinc-200"
      : variant === "secondary"
        ? "border border-black/10 bg-white/70 hover:bg-black/5 hover:border-black/20 dark:border-white/10 dark:bg-zinc-950/60 dark:hover:bg-white/10 dark:hover:border-white/20"
        : "border border-black/10 bg-transparent hover:bg-black/5 hover:border-black/20 dark:border-white/10 dark:hover:bg-white/10 dark:hover:border-white/20";

  return <button {...props} suppressHydrationWarning className={`${base} ${styles} ${props.className ?? ""}`} />;
}

export function ErrorText(props: { children: React.ReactNode }) {
  return <div className="text-sm text-red-600 dark:text-red-400">{props.children}</div>;
}

export function Page(props: { children: React.ReactNode }) {
  return <div className="flex-1 app-surface bg-zinc-50 dark:bg-black">{props.children}</div>;
}

export function TopBar(props: {
  title: string;
  subtitle?: string;
  right?: React.ReactNode;
  children?: React.ReactNode;
}) {
  return (
    <div className="sticky top-0 z-40 border-b border-black/10 dark:border-white/10 bg-white/60 dark:bg-black/30 backdrop-blur">
      <Container>
        <div className="py-4 flex items-start justify-between gap-3">
          <div className="min-w-0">
            <div className="text-sm text-zinc-600 dark:text-zinc-400">{props.title}</div>
            <div className="font-semibold tracking-tight truncate">{props.subtitle}</div>
          </div>
          {props.right ? (
            <div className="flex items-center gap-2 flex-wrap justify-end">{props.right}</div>
          ) : null}
        </div>
        {props.children ? <div className="pb-4">{props.children}</div> : null}
      </Container>
    </div>
  );
}

