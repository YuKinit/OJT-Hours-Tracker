"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import * as React from "react";

import { Button, Card, CardBody, CardHeader, Container, ErrorText, Input, Label, Page } from "@/components/ui";
import MobileNav from "@/components/mobile-nav";
import { useToast } from "@/components/toast";
import type { OjtProfileRow } from "@/lib/db/ojt-profiles";
import { WEEKDAY_LABELS, type Weekday } from "@/lib/ojt/calc";
import { createSupabaseBrowserClient } from "@/lib/supabase/browser";

const ALL_WEEKDAYS: Weekday[] = [1, 2, 3, 4, 5, 6, 0];

export default function SettingsForm(props: { userId: string; initial: OjtProfileRow }) {
  const router = useRouter();
  const toast = useToast();

  const [totalRequiredHours, setTotalRequiredHours] = React.useState<string>(String(props.initial.total_required_hours));
  const [hoursPerDay, setHoursPerDay] = React.useState<string>(String(props.initial.hours_per_day));
  const [selectedDays, setSelectedDays] = React.useState<Weekday[]>(
    (props.initial.selected_weekdays ?? []) as Weekday[],
  );
  const [startDate, setStartDate] = React.useState<string>(props.initial.start_date);
  const [error, setError] = React.useState<string | null>(null);
  const [loading, setLoading] = React.useState(false);

  function toggleDay(day: Weekday) {
    setSelectedDays((prev) => (prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day]));
  }

  function sanitizeDecimalInput(value: string) {
    const sanitized = value.replace(/[^0-9.]/g, "");
    const parts = sanitized.split(".");
    if (parts.length <= 1) return sanitized;
    return `${parts[0]}.${parts.slice(1).join("")}`;
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const supabase = createSupabaseBrowserClient();

    const totalRequiredHoursNum = Number(totalRequiredHours);
    if (!totalRequiredHours.trim() || !Number.isFinite(totalRequiredHoursNum) || totalRequiredHoursNum <= 0) {
      setLoading(false);
      setError("Total required hours must be greater than 0.");
      return;
    }
    const hoursPerDayNum = Number(hoursPerDay);
    if (!hoursPerDay.trim() || !Number.isFinite(hoursPerDayNum) || hoursPerDayNum <= 0 || hoursPerDayNum > 24) {
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
      total_required_hours: Math.round(totalRequiredHoursNum),
      hours_per_day: hoursPerDayNum,
      selected_weekdays: Array.from(new Set(selectedDays)).sort(),
      start_date: startDate,
    };

    const { error } = await supabase.from("ojt_profiles").upsert(payload, { onConflict: "user_id" });
    setLoading(false);

    if (error) {
      setError(error.message);
      return;
    }

    toast.push({ type: "success", title: "Setup updated" });
    router.replace("/dashboard");
    router.refresh();
  }

  return (
    <Page>
      <Container>
        <MobileNav />
        <div className="py-6 sm:py-10 pb-28 sm:pb-10 grid gap-6">
            <div className="mb-4">
              <Link href="/dashboard" className="text-sm font-medium">
                ← Back to dashboard
              </Link>
            </div>
            <Card>
              <CardHeader title="Edit your OJT setup" subtitle="Changes here will update your predicted end date." />
              <CardBody>
                <form onSubmit={onSubmit} className="space-y-6">
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="totalHours">Total required hours</Label>
                      <Input
                        id="totalHours"
                        type="text"
                        inputMode="decimal"
                        placeholder="e.g. 486"
                        value={totalRequiredHours}
                        onChange={(e) => setTotalRequiredHours(sanitizeDecimalInput(e.target.value))}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="hoursPerDay">Hours per day</Label>
                      <Input
                        id="hoursPerDay"
                        type="text"
                        inputMode="decimal"
                        placeholder="e.g. 8 or 7.5"
                        value={hoursPerDay}
                        onChange={(e) => setHoursPerDay(sanitizeDecimalInput(e.target.value))}
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
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="startDate">Start date</Label>
                    <Input
                      id="startDate"
                      type="date"
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                    />
                  </div>

                  {error ? <ErrorText>{error}</ErrorText> : null}

                  <div className="flex gap-3">
                    <Button type="submit" disabled={loading}>
                      {loading ? "Saving..." : "Save changes"}
                    </Button>
                    <Button type="button" variant="secondary" disabled={loading} onClick={() => router.back()}>
                      Cancel
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

