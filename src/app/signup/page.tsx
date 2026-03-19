"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import * as React from "react";

import AuthShell from "@/components/auth-shell";
import { Button, Card, CardBody, CardHeader, ErrorText, Input, Label } from "@/components/ui";
import { useToast } from "@/components/toast";
import { createSupabaseBrowserClient } from "@/lib/supabase/browser";

export default function SignupPage() {
  const router = useRouter();
  const toast = useToast();

  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [showPassword, setShowPassword] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [loading, setLoading] = React.useState(false);

  async function signInWithGoogle() {
    setError(null);
    setLoading(true);
    const supabase = createSupabaseBrowserClient();
    const origin = window.location.origin;
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${origin}/auth/callback`,
      },
    });
    setLoading(false);
    if (error) setError(error.message);
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const supabase = createSupabaseBrowserClient();
    const { data, error } = await supabase.auth.signUp({ email, password });
    setLoading(false);
    if (error) {
      const msg = error.message.toLowerCase();
      if (msg.includes("already registered") || msg.includes("already") || msg.includes("exists")) {
        const friendly =
          "This email is already registered (likely via Google sign-in). Please use “Continue with Google” on the login page.";
        setError(friendly);
        toast.push({ type: "error", title: "Email already in use", message: "Try logging in with Google instead." });
      } else {
        setError(error.message);
      }
      return;
    }

    // Supabase may return a "success" response but with no identities when the email already exists
    // (to avoid leaking whether an account exists).
    if (data.user && Array.isArray(data.user.identities) && data.user.identities.length === 0) {
      const friendly =
        "This email is already associated with an account. Please log in instead (use Google if that’s how you created it).";
      setError(friendly);
      toast.push({ type: "error", title: "Email already in use", message: "Go to Login and sign in." });
      router.replace(`/login?email=${encodeURIComponent(email)}`);
      router.refresh();
      return;
    }

    // If email confirmation is enabled, there is no session yet.
    if (!data.session) {
      toast.push({
        type: "info",
        title: "Confirm your email",
        message: "We sent you a confirmation link. Confirm your email, then log in.",
      });
      router.replace(`/login?checkEmail=1&email=${encodeURIComponent(email)}`);
      router.refresh();
      return;
    }

    toast.push({ type: "success", title: "Account created", message: "Let’s set up your OJT schedule." });
    router.replace("/setup");
    router.refresh();
  }

  return (
    <AuthShell title="Create your account" subtitle="Start tracking your OJT hours in minutes.">
      <Card className="w-full">
        <CardHeader title="Create your account" subtitle="Use Google or email/password." />
        <CardBody>
          <form onSubmit={onSubmit} className="space-y-4">
                <Button type="button" variant="secondary" className="w-full" disabled={loading} onClick={signInWithGoogle}>
                  <span className="inline-flex items-center gap-2">
                    <svg width="18" height="18" viewBox="0 0 48 48" aria-hidden="true">
                      <path
                        fill="#FFC107"
                        d="M43.611 20.083H42V20H24v8h11.303C33.654 32.657 29.243 36 24 36c-6.627 0-12-5.373-12-12s5.373-12 12-12c3.059 0 5.842 1.154 7.965 3.035l5.657-5.657C34.048 6.053 29.268 4 24 4 12.955 4 4 12.955 4 24s8.955 20 20 20 20-8.955 20-20c0-1.341-.138-2.65-.389-3.917Z"
                      />
                      <path
                        fill="#FF3D00"
                        d="M6.306 14.691l6.571 4.819C14.655 16.108 18.961 12 24 12c3.059 0 5.842 1.154 7.965 3.035l5.657-5.657C34.048 6.053 29.268 4 24 4c-7.682 0-14.35 4.327-17.694 10.691Z"
                      />
                      <path
                        fill="#4CAF50"
                        d="M24 44c5.166 0 9.86-1.977 13.409-5.197l-6.19-5.238C29.211 35.091 26.715 36 24 36c-5.222 0-9.618-3.317-11.287-7.946l-6.52 5.025C9.505 39.556 16.227 44 24 44Z"
                      />
                      <path
                        fill="#1976D2"
                        d="M43.611 20.083H42V20H24v8h11.303a12.05 12.05 0 0 1-4.087 5.565l.002-.001 6.19 5.238C36.97 39.205 44 34 44 24c0-1.341-.138-2.65-.389-3.917Z"
                      />
                    </svg>
                    Continue with Google
                  </span>
                </Button>

                <div className="relative py-1">
                  <div className="h-px bg-black/10 dark:bg-white/10" />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-xs px-2 bg-white/70 dark:bg-zinc-950/60 text-zinc-600 dark:text-zinc-400">
                      or
                    </span>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    required
                    autoComplete="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      required
                      autoComplete="new-password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="At least 6 characters"
                      className="pr-12"
                    />
                    <button
                      type="button"
                      className="absolute right-2 top-1/2 -translate-y-1/2 h-9 w-9 grid place-items-center rounded-lg hover:bg-black/5 dark:hover:bg-white/10"
                      onClick={() => setShowPassword((v) => !v)}
                      aria-label={showPassword ? "Hide password" : "Show password"}
                      title={showPassword ? "Hide password" : "Show password"}
                    >
                      <svg
                        viewBox="0 0 24 24"
                        width="18"
                        height="18"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                        className="text-zinc-700 dark:text-zinc-200"
                      >
                        {showPassword ? (
                          <>
                            <path
                              d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12Z"
                              stroke="currentColor"
                              strokeWidth="1.8"
                            />
                            <path
                              d="M12 15.5A3.5 3.5 0 1 0 12 8.5a3.5 3.5 0 0 0 0 7Z"
                              stroke="currentColor"
                              strokeWidth="1.8"
                            />
                          </>
                        ) : (
                          <>
                            <path
                              d="M3 12s3.5-7 9-7 9 7 9 7-3.5 7-9 7-9-7-9-7Z"
                              stroke="currentColor"
                              strokeWidth="1.8"
                            />
                            <path
                              d="M4 4l16 16"
                              stroke="currentColor"
                              strokeWidth="1.8"
                              strokeLinecap="round"
                            />
                            <path
                              d="M12 15.5A3.5 3.5 0 0 1 8.7 10.6"
                              stroke="currentColor"
                              strokeWidth="1.8"
                              strokeLinecap="round"
                            />
                          </>
                        )}
                      </svg>
                    </button>
                  </div>
                </div>
                {error ? <ErrorText>{error}</ErrorText> : null}
                <Button type="submit" disabled={loading} className="w-full">
                  {loading ? "Creating account..." : "Sign up"}
                </Button>
          </form>

          <div className="mt-6 text-sm text-zinc-600 dark:text-zinc-400">
            Already have an account?{" "}
            <Link href="/login" className="font-medium text-black dark:text-white">
              Log in
            </Link>
          </div>
        </CardBody>
      </Card>
    </AuthShell>
  );
}

