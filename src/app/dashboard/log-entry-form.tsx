"use client";

import * as React from "react";
import { useRouter } from "next/navigation";

import { Button, ErrorText, Input, Label } from "@/components/ui";
import { ConfirmModal } from "@/components/confirm-modal";
import { useToast } from "@/components/toast";
import { createSupabaseBrowserClient } from "@/lib/supabase/browser";
import { formatISODate } from "@/lib/ojt/calc";

export default function LogEntryForm() {
  const router = useRouter();
  const toast = useToast();
  const dateRef = React.useRef<HTMLInputElement | null>(null);
  const [entryDate, setEntryDate] = React.useState(() => formatISODate(new Date()));
  const [hoursWorked, setHoursWorked] = React.useState<number>(8);
  const [note, setNote] = React.useState("");
  const [error, setError] = React.useState<string | null>(null);
  const [loading, setLoading] = React.useState(false);
  const [showResetConfirm, setShowResetConfirm] = React.useState(false);

  async function clearRecentDays() {
    setError(null);
    setLoading(true);

    const supabase = createSupabaseBrowserClient();
    const { data: auth } = await supabase.auth.getUser();
    const userId = auth.user?.id;
    if (!userId) {
      setLoading(false);
      setError("Not logged in.");
      return;
    }

    const { data: recent, error: recentError } = await supabase
      .from("ojt_entries")
      .select("id")
      .eq("user_id", userId)
      .order("entry_date", { ascending: false })
      .limit(14);

    if (recentError) {
      setLoading(false);
      setError(recentError.message);
      return;
    }

    const ids = (recent ?? []).map((r) => r.id).filter((id): id is number => typeof id === "number");
    if (ids.length === 0) {
      setLoading(false);
      toast.push({ type: "info", title: "Nothing to reset", message: "No recent day logs found." });
      return;
    }

    const { error: delError } = await supabase.from("ojt_entries").delete().in("id", ids);
    setLoading(false);
    if (delError) {
      setError(delError.message);
      return;
    }

    toast.push({ type: "success", title: "Recent days cleared", message: `Deleted ${ids.length} day log(s).` });
    router.refresh();
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    if (!entryDate) {
      setLoading(false);
      setError("Please choose a date.");
      return;
    }
    if (!Number.isFinite(hoursWorked) || hoursWorked <= 0 || hoursWorked > 24) {
      setLoading(false);
      setError("Hours worked must be between 0.5 and 24.");
      return;
    }

    const supabase = createSupabaseBrowserClient();
    const { data: auth } = await supabase.auth.getUser();
    const userId = auth.user?.id;
    if (!userId) {
      setLoading(false);
      setError("Not logged in.");
      return;
    }

    const { error } = await supabase
      .from("ojt_entries")
      .upsert(
        {
          user_id: userId,
          entry_date: entryDate,
          hours_worked: hoursWorked,
          note: note.trim() || null,
        },
        { onConflict: "user_id,entry_date" },
      );

    setLoading(false);
    if (error) {
      setError(error.message);
      return;
    }

    setNote("");
    toast.push({ type: "success", title: "Saved", message: `Logged ${hoursWorked}h for ${entryDate}.` });
    router.refresh();
  }

  return (
    <>
      <form onSubmit={onSubmit} className="space-y-4">
      <div className="grid gap-3 sm:grid-cols-5">
        <div className="space-y-2 sm:col-span-2">
          <Label htmlFor="entryDate">Date</Label>
          <Input
            id="entryDate"
            type="date"
            value={entryDate}
            onChange={(e) => setEntryDate(e.target.value)}
            ref={(el) => {
              dateRef.current = el;
            }}
          />
        </div>
        <div className="space-y-2 sm:col-span-3">
          <Label htmlFor="hoursWorked">Hours worked</Label>
          <Input
            id="hoursWorked"
            type="number"
            min={0.5}
            max={24}
            step={0.5}
            value={hoursWorked}
            onChange={(e) => setHoursWorked(Number(e.target.value))}
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="note">What did you do? (optional)</Label>
        <textarea
          id="note"
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder="Example: Assisted with inventory, updated Excel logs..."
          rows={3}
          suppressHydrationWarning
          className="w-full resize-none rounded-xl border border-black/10 bg-white/70 px-3 py-2 text-sm outline-none transition focus:border-black/30 focus:bg-white dark:border-white/10 dark:bg-zinc-950/60 dark:focus:border-white/30"
        />
        <div className="text-xs text-zinc-600 dark:text-zinc-400">
          Tip: logging notes makes your weekly report easier later.
        </div>
      </div>

      {error ? <ErrorText>{error}</ErrorText> : null}

      <div className="grid gap-2 sm:grid-cols-2">
        <Button type="submit" disabled={loading} className="w-full">
          {loading ? "Saving..." : "Log hours"}
        </Button>
        <Button
          type="button"
          variant="secondary"
          disabled={loading}
          className="w-full"
          onClick={() => {
            const today = formatISODate(new Date());
            setEntryDate(today);
            setHoursWorked(8);
            setNote("");
            setError(null);
            setShowResetConfirm(true);
            window.setTimeout(() => dateRef.current?.focus(), 0);
          }}
        >
          Reset
        </Button>
      </div>
      </form>

      <ConfirmModal
        open={showResetConfirm}
        title="Reset recent days?"
        description="This will delete the most recent day logs shown on the dashboard (up to 14 entries). This cannot be undone."
        confirmLabel="Delete logs"
        cancelLabel="Cancel"
        tone="danger"
        onCancel={() => setShowResetConfirm(false)}
        onConfirm={() => {
          setShowResetConfirm(false);
          void clearRecentDays();
        }}
      />
    </>
  );
}

