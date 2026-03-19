"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import * as React from "react";

import { Avatar, Button, Card, CardBody, CardHeader, Container, ErrorText, Input, Label, Page } from "@/components/ui";
import MobileNav from "@/components/mobile-nav";
import { ConfirmModal } from "@/components/confirm-modal";
import { useToast } from "@/components/toast";
import type { UserProfileRow } from "@/lib/db/user-profiles";
import { createSupabaseBrowserClient } from "@/lib/supabase/browser";

function extFromType(type: string) {
  if (type === "image/png") return "png";
  if (type === "image/webp") return "webp";
  if (type === "image/jpeg") return "jpg";
  return "bin";
}

export default function ProfileForm(props: {
  userId: string;
  email: string;
  initial: UserProfileRow | null;
}) {
  const router = useRouter();
  const toast = useToast();

  const [fullName, setFullName] = React.useState(props.initial?.full_name ?? "");
  const [avatarUrl, setAvatarUrl] = React.useState<string | null>(props.initial?.avatar_url ?? null);
  const [error, setError] = React.useState<string | null>(null);
  const [loading, setLoading] = React.useState(false);
  const [deleting, setDeleting] = React.useState(false);

  async function saveProfile(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const supabase = createSupabaseBrowserClient();
    const { error } = await supabase
      .from("user_profiles")
      .upsert({ user_id: props.userId, full_name: fullName.trim() || null }, { onConflict: "user_id" });

    setLoading(false);
    if (error) {
      setError(error.message);
      return;
    }

    toast.push({ type: "success", title: "Profile saved" });
    router.refresh();
  }

  async function onPickAvatar(file: File | null) {
    if (!file) return;
    setError(null);
    setLoading(true);

    if (file.size > 5 * 1024 * 1024) {
      setLoading(false);
      setError("Please upload an image up to 5MB.");
      return;
    }

    const supabase = createSupabaseBrowserClient();
    const ext = extFromType(file.type);
    const path = `${props.userId}/avatar.${ext}`;

    const { error: uploadError } = await supabase.storage.from("avatars").upload(path, file, {
      upsert: true,
      contentType: file.type,
      cacheControl: "3600",
    });

    if (uploadError) {
      setLoading(false);
      setError(uploadError.message);
      return;
    }

    const publicUrl = supabase.storage.from("avatars").getPublicUrl(path).data.publicUrl;
    const { error: upsertError } = await supabase
      .from("user_profiles")
      .upsert({ user_id: props.userId, avatar_path: path, avatar_url: publicUrl }, { onConflict: "user_id" });

    setLoading(false);
    if (upsertError) {
      setError(upsertError.message);
      return;
    }

    setAvatarUrl(publicUrl);
    toast.push({ type: "success", title: "Photo updated" });
    router.refresh();
  }

  async function deleteAccount() {
    setError(null);
    setDeleting(true);
    try {
      const res = await fetch("/api/delete-account", { method: "POST" });
      if (!res.ok) {
        const text = await res.text();
        throw new Error(text || "Failed to delete account.");
      }
      toast.push({ type: "success", title: "Account deleted" });
      router.replace("/signup");
      router.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to delete account.");
    } finally {
      setDeleting(false);
    }
  }

  return (
    <Page>
      <Container>
        <MobileNav />
        <div className="py-6 sm:py-10 pb-28 sm:pb-10 grid gap-6">
          <div className="mb-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-4">
            <Link href="/dashboard" className="text-sm font-medium">
              ← Back to dashboard
            </Link>
            <div className="text-sm text-zinc-600 dark:text-zinc-400">{props.email}</div>
          </div>

          <Card>
            <CardHeader title="Profile" subtitle="Add your name and profile picture." />
            <CardBody>
              <form onSubmit={saveProfile} className="space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                  <Avatar name={fullName || props.email} src={avatarUrl} />
                  <div className="space-y-2">
                    <Label htmlFor="avatar">Profile picture</Label>
                    <Input
                      id="avatar"
                      type="file"
                      accept="image/png,image/jpeg,image/webp"
                      onChange={(e) => void onPickAvatar(e.target.files?.item(0) ?? null)}
                    />
                    <div className="text-sm text-zinc-600 dark:text-zinc-400">PNG/JPG/WebP up to 5MB.</div>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="fullName">Name</Label>
                  <Input
                    id="fullName"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Your name"
                  />
                </div>

                {error ? <ErrorText>{error}</ErrorText> : null}

                <div className="flex gap-3">
                  <Button type="submit" disabled={loading || deleting}>
                    {loading ? "Saving..." : "Save profile"}
                  </Button>
                  <Button type="button" variant="secondary" disabled={loading || deleting} onClick={() => router.back()}>
                    Cancel
                  </Button>
                </div>
              </form>
            </CardBody>
          </Card>

          <Card className="mt-6">
            <CardHeader title="Danger zone" subtitle="Be careful: this cannot be undone." />
            <CardBody>
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
                <div>
                  <div className="font-medium">Delete account</div>
                  <div className="text-sm text-zinc-600 dark:text-zinc-400">
                    Permanently deletes your user and all data in this system.
                  </div>
                </div>
                <Button
                  type="button"
                  variant="secondary"
                  disabled={loading || deleting}
                  onClick={() => setDeleting(true)}
                  className="w-full sm:w-auto border-red-500/30 text-red-700 hover:bg-red-50 dark:text-red-300 dark:hover:bg-red-950/40"
                >
                  {deleting ? "Deleting..." : "Delete account"}
                </Button>
              </div>
            </CardBody>
          </Card>
        </div>
      </Container>

      <ConfirmModal
        open={deleting}
        title="Delete account permanently?"
        description="This will delete your user, profile, and all OJT data. This action cannot be undone."
        confirmLabel="Delete account"
        cancelLabel="Cancel"
        tone="danger"
        onCancel={() => setDeleting(false)}
        onConfirm={() => {
          void deleteAccount();
        }}
      />
    </Page>
  );
}

