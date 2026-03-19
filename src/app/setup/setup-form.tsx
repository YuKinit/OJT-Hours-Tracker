"use client";

import { useRouter } from "next/navigation";
import * as React from "react";

import { Button, Card, CardBody, CardHeader, Container, ErrorText, Input, Label, Page } from "@/components/ui";
import { useToast } from "@/components/toast";
import { createSupabaseBrowserClient } from "@/lib/supabase/browser";
import { formatISODate, WEEKDAY_LABELS, type Weekday } from "@/lib/ojt/calc";

const ALL_WEEKDAYS: Weekday[] = [1, 2, 3, 4, 5, 6, 0]; // Mon..Sun display

export default function SetupForm(props: { userId: string }) {
  const router = useRouter();
  const toast = useToast();

  const [totalRequiredHours, setTotalRequiredHours] = React.useState<number>(486);
  const [hoursPerDay, setHoursPerDay] = React.useState<number>(8);
  const [selectedDays, setSelectedDays] = React.useState<Weekday[]>([1, 2, 3, 4, 5]); // Mon-Fri default
  const [startDate, setStartDate] = React.useState<string>(formatISODate(new Date()));
  const [error, setError] = React.useState<string | null>(null);
  const [loading, setLoading] = React.useState(false);

  function toggleDay(day: Weekday) {
    setSelectedDays((prev) => (prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day]));
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const supabase = createSupabaseBrowserClient();

    if (!Number.isFinite(totalRequiredHours) || totalRequiredHours <= 0) {
      setLoading(false);
      setError("Total required hours must be greater than 0.");
      return;
    }
    if (!Number.isFinite(hoursPerDay) || hoursPerDay <= 0 || hoursPerDay > 24) {
      setLoading(false);
      setError("Hours per day must be between 1 and 24.");
      return;
    }
    if (selectedDays.length === 0) {
      setLoading(false);
      setError("Please select at least one OJT day.");
      return;
    }
    if (!startDate) {
      setLoading(false);
      setError("Please choose a start date.");
      return;
    }

    const payload = {
      user_id: props.userId,
      total_required_hours: Math.round(totalRequiredHours),
      hours_per_day: hoursPerDay,
      selected_weekdays: Array.from(new Set(selectedDays)).sort(),
      start_date: startDate,
    };

    const { error } = await supabase.from("ojt_profiles").upsert(payload, { onConflict: "user_id" });
    setLoading(false);

    if (error) {
      setError(error.message);
      return;
    }

    toast.push({ type: "success", title: "Setup saved", message: "Your dashboard is ready." });
    router.replace("/dashboard");
    router.refresh();
  }

  return (
    <Page>
      <Container>
        <div className="py-6 sm:py-10 grid gap-6">
          <Card>
            <CardHeader title="OJT setup" subtitle="Tell us your schedule so we can predict your end date." />
            <CardBody>
              <form onSubmit={onSubmit} className="space-y-6">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="totalHours">Total required hours</Label>
                    <Input
                      id="totalHours"
                      type="number"
                      min={1}
                      step={1}
                      value={totalRequiredHours}
                      onChange={(e) => setTotalRequiredHours(Number(e.target.value))}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="hoursPerDay">Hours per day</Label>
                    <Input
                      id="hoursPerDay"
                      type="number"
                      min={1}
                      max={24}
                      step={0.5}
                      value={hoursPerDay}
                      onChange={(e) => setHoursPerDay(Number(e.target.value))}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>OJT days each week</Label>
                  <div className="flex flex-wrap gap-2">
                    {ALL_WEEKDAYS.map((d) => {
                      const active = selectedDays.includes(d);
                      return (
                        <button
                          key={d}
                          type="button"
                          onClick={() => toggleDay(d)}
                          className={`h-10 px-3 rounded-xl border text-sm transition ${
                            active
                              ? "bg-black text-white border-black dark:bg-white dark:text-black dark:border-white"
                              : "border-black/10 bg-white hover:bg-zinc-50 dark:border-white/10 dark:bg-zinc-950 dark:hover:bg-zinc-900"
                          }`}
                        >
                          {WEEKDAY_LABELS[d]}
                        </button>
                      );
                    })}
                  </div>
                  <div className="text-sm text-zinc-600 dark:text-zinc-400">
                    Choose the days you usually go to OJT (ex: Mon–Fri).
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="startDate">Start date</Label>
                  <Input id="startDate" type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
                  <div className="text-sm text-zinc-600 dark:text-zinc-400">
                    If you already started, select your actual start date.
                  </div>
                </div>

                {error ? <ErrorText>{error}</ErrorText> : null}

                <div className="flex gap-3">
                  <Button type="submit" disabled={loading}>
                    {loading ? "Saving..." : "Save & continue"}
                  </Button>
                  <Button
                    type="button"
                    variant="secondary"
                    disabled={loading}
                    onClick={async () => {
                      const supabase = createSupabaseBrowserClient();
                      await supabase.auth.signOut();
                      toast.push({ type: "success", title: "Logged out" });
                      router.replace("/login");
                      router.refresh();
                    }}
                  >
                    Log out
                  </Button>
                </div>
              </form>
            </CardBody>
          </Card>
        </div>
      </Container>
    </Page>
  );
}

