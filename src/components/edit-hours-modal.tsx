"use client";

import * as React from "react";

import { Button, Card, CardBody, CardHeader, ErrorText, Input, Label } from "@/components/ui";

function sanitizeDecimalInput(value: string) {
  // Allow digits + at most one dot so users can type freely.
  const sanitized = value.replace(/[^0-9.]/g, "");
  const parts = sanitized.split(".");
  if (parts.length <= 1) return sanitized;
  return `${parts[0]}.${parts.slice(1).join("")}`;
}

export function EditHoursModal(props: {
  open: boolean;
  title: string;
  description?: string;
  initialHours: number;
  confirmLabel?: string;
  cancelLabel?: string;
  disabled?: boolean;
  onCancel: () => void;
  onConfirm: (hoursWorked: number) => Promise<void>;
}) {
  const [hoursText, setHoursText] = React.useState<string>(String(props.initialHours));
  const [error, setError] = React.useState<string | null>(null);
  const [submitting, setSubmitting] = React.useState(false);

  React.useEffect(() => {
    if (!props.open) return;
    setHoursText(String(props.initialHours));
    setError(null);
    setSubmitting(false);
  }, [props.open, props.initialHours]);

  async function submit() {
    if (props.disabled || submitting) return;
    const hoursWorkedNum = Number(hoursText);

    if (!hoursText.trim()) {
      setError("Please enter hours worked.");
      return;
    }
    if (!Number.isFinite(hoursWorkedNum) || hoursWorkedNum < 0.5 || hoursWorkedNum > 24) {
      setError("Hours worked must be between 0.5 and 24.");
      return;
    }

    setError(null);
    setSubmitting(true);
    try {
      await props.onConfirm(hoursWorkedNum);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to save.");
      // Let parent decide whether to close.
    } finally {
      setSubmitting(false);
    }
  }

  if (!props.open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4 sm:px-0">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={props.onCancel} />
      <div className="relative w-full max-w-md">
        <Card>
          <CardHeader title={props.title} subtitle={props.description} />
          <CardBody className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="editHours">Hours worked</Label>
              <Input
                id="editHours"
                type="text"
                inputMode="decimal"
                value={hoursText}
                onChange={(e) => setHoursText(sanitizeDecimalInput(e.target.value))}
                placeholder="e.g. 8 or 7.5"
              />
              {error ? <ErrorText>{error}</ErrorText> : null}
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <Button type="button" variant="secondary" onClick={props.onCancel} disabled={props.disabled || submitting}>
                {props.cancelLabel ?? "Cancel"}
              </Button>
              <Button
                type="button"
                onClick={() => void submit()}
                disabled={props.disabled || submitting}
                className={submitting || props.disabled ? "opacity-90" : undefined}
              >
                {submitting ? "Saving..." : props.confirmLabel ?? "Save"}
              </Button>
            </div>
          </CardBody>
        </Card>
      </div>
    </div>
  );
}

