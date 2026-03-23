"use client";

import * as React from "react";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui";
import { ConfirmModal } from "@/components/confirm-modal";
import { EditHoursModal } from "@/components/edit-hours-modal";
import { useToast } from "@/components/toast";
import type { OjtEntryRow } from "@/lib/db/ojt-entries";

function EditIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M12 20h9"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 18l-4 1 1-4 12.5-11.5Z"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function TrashIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M3 6h18"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M8 6V4h8v2"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M6 6l1 16h10l1-16"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M10 11v6"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M14 11v6"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export default function RecentEntriesList(props: { entries: OjtEntryRow[] }) {
  const router = useRouter();
  const toast = useToast();

  const [editing, setEditing] = React.useState<OjtEntryRow | null>(null);
  const [deleting, setDeleting] = React.useState<OjtEntryRow | null>(null);
  const [editSubmitting, setEditSubmitting] = React.useState(false);
  const [deleteSubmitting, setDeleteSubmitting] = React.useState(false);

  async function saveHours(hoursWorked: number) {
    if (!editing || editSubmitting) return;
    setEditSubmitting(true);
    try {
      const res = await fetch("/api/ojt-entries/update-hours", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: editing.id, hours_worked: hoursWorked }),
      });

      const data: unknown = await res.json().catch(() => ({}));
      if (!res.ok) {
        const msg =
          typeof data === "object" && data !== null && "error" in data && typeof (data as { error?: unknown }).error === "string"
            ? (data as { error: string }).error
            : "Failed to update hours.";
        throw new Error(msg);
      }

      toast.push({ type: "success", title: "Hours updated", message: `${editing.entry_date}: ${hoursWorked}h` });
      setEditing(null);
      router.refresh();
    } catch (e) {
      toast.push({
        type: "error",
        title: "Update failed",
        message: e instanceof Error ? e.message : "Failed to update hours.",
      });
    } finally {
      setEditSubmitting(false);
    }
  }

  async function deleteById() {
    if (!deleting || deleteSubmitting) return;
    setDeleteSubmitting(true);
    try {
      const res = await fetch("/api/ojt-entries/delete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: deleting.id }),
      });

      const data: unknown = await res.json().catch(() => ({}));
      if (!res.ok) {
        const msg =
          typeof data === "object" && data !== null && "error" in data && typeof (data as { error?: unknown }).error === "string"
            ? (data as { error: string }).error
            : "Failed to delete log.";
        throw new Error(msg);
      }

      toast.push({ type: "success", title: "Log deleted", message: deleting.entry_date });
      setDeleting(null);
      router.refresh();
    } catch (e) {
      toast.push({
        type: "error",
        title: "Delete failed",
        message: e instanceof Error ? e.message : "Failed to delete log.",
      });
    } finally {
      setDeleteSubmitting(false);
    }
  }

  return (
    <>
      <div className="mt-3 space-y-2">
        {props.entries.length === 0 ? (
          <div className="text-sm text-zinc-600 dark:text-zinc-400">No logs yet. Add your first day above.</div>
        ) : (
          props.entries.map((e) => (
            <div key={e.id} className="flex items-center justify-between gap-3">
              <div className="min-w-0">
                <div className="text-sm font-medium">{e.entry_date}</div>
                {e.note ? <div className="text-xs text-zinc-600 dark:text-zinc-400 truncate">{e.note}</div> : null}
              </div>

              <div className="flex items-center gap-2">
                <div className="text-sm font-semibold tabular-nums">{Number(e.hours_worked).toFixed(1)}h</div>

                <div className="flex items-center gap-1">
                  <Button
                    type="button"
                    variant="ghost"
                    className="h-9 w-9 px-0"
                    aria-label={`Edit ${e.entry_date}`}
                    onClick={() => setEditing(e)}
                  >
                    <EditIcon />
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    className="h-9 w-9 px-0"
                    aria-label={`Delete ${e.entry_date}`}
                    onClick={() => setDeleting(e)}
                  >
                    <TrashIcon />
                  </Button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      <EditHoursModal
        open={!!editing}
        title={`Edit hours (${editing?.entry_date ?? ""})`}
        description="Update the hours for this date."
        initialHours={editing?.hours_worked ?? 0}
        disabled={editSubmitting}
        confirmLabel="Save hours"
        cancelLabel="Cancel"
        onCancel={() => setEditing(null)}
        onConfirm={async (hoursWorked) => {
          await saveHours(hoursWorked);
        }}
      />

      <ConfirmModal
        open={!!deleting}
        title="Delete this log?"
        description={deleting ? `This will permanently delete ${deleting.entry_date}. This cannot be undone.` : undefined}
        confirmLabel={deleteSubmitting ? "Deleting..." : "Delete"}
        cancelLabel="Cancel"
        tone="danger"
        onCancel={() => setDeleting(null)}
        onConfirm={() => {
          void deleteById();
        }}
      />
    </>
  );
}

