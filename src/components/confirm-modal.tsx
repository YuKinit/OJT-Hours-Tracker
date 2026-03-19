"use client";

import * as React from "react";

import { Button, Card, CardBody, CardHeader } from "@/components/ui";

type Props = {
  open: boolean;
  title: string;
  description?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  tone?: "default" | "danger";
  onConfirm: () => void;
  onCancel: () => void;
};

export function ConfirmModal({
  open,
  title,
  description,
  confirmLabel = "Continue",
  cancelLabel = "Cancel",
  tone = "default",
  onConfirm,
  onCancel,
}: Props) {
  if (!open) return null;

  const confirmVariant = tone === "danger" ? "secondary" : "primary";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4 sm:px-0">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onCancel} />
      <div className="relative w-full max-w-md">
        <Card>
          <CardHeader title={title} subtitle={description} />
          <CardBody className="flex justify-end gap-3">
            <Button type="button" variant="secondary" onClick={onCancel}>
              {cancelLabel}
            </Button>
            <Button
              type="button"
              variant={confirmVariant}
              className={tone === "danger" ? "border-red-500/40 text-red-700 dark:text-red-300" : undefined}
              onClick={onConfirm}
            >
              {confirmLabel}
            </Button>
          </CardBody>
        </Card>
      </div>
    </div>
  );
}

