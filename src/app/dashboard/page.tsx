import Link from "next/link";
import { redirect } from "next/navigation";

import { Avatar, Button, Card, CardBody, CardHeader, Container, Page, TopBar } from "@/components/ui";
import LogoutButton from "@/components/logout-button";
import MobileNav from "@/components/mobile-nav";
import { requireUser } from "@/lib/auth/require-user";
import { listRecentOjtEntries, getTotalLoggedHours } from "@/lib/db/ojt-entries";
import { getOjtProfileForUser } from "@/lib/db/ojt-profiles";
import { getUserProfileForUser } from "@/lib/db/user-profiles";
import {
  computeEstimatedWeeks,
  computeOjtDaysNeeded,
  computePredictedEndDate,
  computeWeeklyCapacityHours,
  nextOjtDateOnOrAfter,
  WEEKDAY_LABELS,
  type Weekday,
} from "@/lib/ojt/calc";

import LogEntryForm from "./log-entry-form";
import DashboardToasts from "./dashboard-toasts";
import RecentEntriesList from "./recent-entries-list";

function formatHuman(d: Date) {
  return d.toLocaleDateString(undefined, { year: "numeric", month: "short", day: "2-digit" });
}

export default async function DashboardPage() {
  const { user } = await requireUser();
  const profile = await getOjtProfileForUser(user.id);
  if (!profile) redirect("/setup");
  const userProfile = await getUserProfileForUser(user.id);
  const displayName = userProfile?.full_name?.trim() || null;

  const [recentEntries, totalLogged] = await Promise.all([
    listRecentOjtEntries(user.id, 14),
    getTotalLoggedHours(user.id),
  ]);

  const remainingHours = Math.max(0, profile.total_required_hours - totalLogged);

  const selected = (profile.selected_weekdays ?? []) as Weekday[];
  const startDate = new Date(profile.start_date);
  const predictedEnd = computePredictedEndDate({
    startDate,
    selectedDays: selected,
    totalRequiredHours: profile.total_required_hours,
    hoursPerDay: profile.hours_per_day,
  });

  const nextDate = nextOjtDateOnOrAfter(new Date(), selected, { includeToday: false });
  const weeklyCap = computeWeeklyCapacityHours(profile.hours_per_day, selected);
  const daysNeeded = computeOjtDaysNeeded(profile.total_required_hours, profile.hours_per_day);
  const estWeeks = computeEstimatedWeeks(profile.total_required_hours, profile.hours_per_day, selected);

  return (
    <Page>
      <DashboardToasts />
      <MobileNav />
      <TopBar
        title="OJT Hours Tracker"
        subtitle={displayName ?? user.email ?? ""}
        right={
          <>
            <Link href="/profile" aria-label="Profile" title="Profile" className="hidden sm:block">
              <div className="rounded-full hover:bg-black/5 dark:hover:bg-white/10 p-1 transition">
                <Avatar name={userProfile?.full_name ?? user.email} src={userProfile?.avatar_url} />
              </div>
            </Link>
            <Link href="/settings" className="hidden sm:block">
              <Button variant="secondary">Edit setup</Button>
            </Link>
            <LogoutButton variant="ghost" className="h-10 px-3 text-xs sm:h-11 sm:px-4 sm:text-sm whitespace-nowrap" />
          </>
        }
      >
        {displayName && user.email ? <div className="text-sm text-zinc-600 dark:text-zinc-400">{user.email}</div> : null}
      </TopBar>

      <Container>
        <div className="py-6 sm:py-10 pb-28 sm:pb-10 grid gap-4 sm:gap-6 lg:grid-cols-3">
          <Card className="lg:col-span-2">
            <CardHeader title="Your plan" subtitle="Based on your schedule and hours per day." />
            <CardBody className="space-y-5">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="rounded-xl border border-black/10 dark:border-white/10 p-4">
                  <div className="text-sm text-zinc-600 dark:text-zinc-400">Total logged</div>
                  <div className="text-lg font-semibold">{totalLogged.toFixed(1)} hrs</div>
                </div>
                <div className="rounded-xl border border-black/10 dark:border-white/10 p-4">
                  <div className="text-sm text-zinc-600 dark:text-zinc-400">Remaining</div>
                  <div className="text-lg font-semibold">{remainingHours.toFixed(1)} hrs</div>
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="rounded-xl border border-black/10 dark:border-white/10 p-4">
                  <div className="text-sm text-zinc-600 dark:text-zinc-400">Start date</div>
                  <div className="text-lg font-semibold">{formatHuman(startDate)}</div>
                </div>
                <div className="rounded-xl border border-black/10 dark:border-white/10 p-4">
                  <div className="text-sm text-zinc-600 dark:text-zinc-400">Predicted end date</div>
                  <div className="text-lg font-semibold">{predictedEnd ? formatHuman(predictedEnd) : "—"}</div>
                </div>
                <div className="rounded-xl border border-black/10 dark:border-white/10 p-4">
                  <div className="text-sm text-zinc-600 dark:text-zinc-400">Total required hours</div>
                  <div className="text-lg font-semibold">{profile.total_required_hours}</div>
                </div>
                <div className="rounded-xl border border-black/10 dark:border-white/10 p-4">
                  <div className="text-sm text-zinc-600 dark:text-zinc-400">Hours per day</div>
                  <div className="text-lg font-semibold">{profile.hours_per_day}</div>
                </div>
              </div>

              <div className="rounded-xl border border-black/10 dark:border-white/10 p-4">
                <div className="text-sm text-zinc-600 dark:text-zinc-400">Weekly schedule</div>
                <div className="mt-2 flex flex-wrap gap-2">
                  {([1, 2, 3, 4, 5, 6, 0] as Weekday[]).map((d) => {
                    const active = selected.includes(d);
                    return (
                      <div
                        key={d}
                        className={`h-9 px-3 rounded-xl border text-sm flex items-center ${
                          active
                            ? "bg-black text-white border-black dark:bg-white dark:text-black dark:border-white"
                            : "border-black/10 bg-white dark:border-white/10 dark:bg-zinc-950 opacity-60"
                        }`}
                      >
                        {WEEKDAY_LABELS[d]}
                      </div>
                    );
                  })}
                </div>
              </div>
            </CardBody>
          </Card>

          {/* Mobile: show the log card first for quick entry */}
          <div className="lg:contents">
            <Card className="order-first lg:order-none lg:col-span-1">
              <CardHeader title="Log hours" subtitle="Mobile-first: quick add, quick review." />
              <CardBody className="space-y-4">
                <div className="rounded-xl border border-black/10 dark:border-white/10 p-4">
                  <LogEntryForm />
                </div>

                <div className="rounded-xl border border-black/10 dark:border-white/10 p-4">
                  <div className="text-sm text-zinc-600 dark:text-zinc-400">Recent days</div>
                  <RecentEntriesList entries={recentEntries} />
                </div>

                {/* Desktop: keep stats compact in the side column */}
                <div className="hidden lg:block rounded-xl border border-black/10 dark:border-white/10 p-4">
                  <div className="text-sm text-zinc-600 dark:text-zinc-400">Plan stats</div>
                  <div className="mt-3 grid gap-3">
                    <div className="rounded-xl border border-black/10 dark:border-white/10 p-3">
                      <div className="text-xs text-zinc-600 dark:text-zinc-400">Weekly capacity</div>
                      <div className="text-sm font-semibold">
                        {Number.isFinite(weeklyCap) ? `${weeklyCap} hrs/week` : "—"}
                      </div>
                    </div>
                    <div className="rounded-xl border border-black/10 dark:border-white/10 p-3">
                      <div className="text-xs text-zinc-600 dark:text-zinc-400">OJT days needed</div>
                      <div className="text-sm font-semibold">{Number.isFinite(daysNeeded) ? daysNeeded : "—"}</div>
                    </div>
                    <div className="rounded-xl border border-black/10 dark:border-white/10 p-3">
                      <div className="text-xs text-zinc-600 dark:text-zinc-400">Estimated weeks</div>
                      <div className="text-sm font-semibold">
                        {Number.isFinite(estWeeks) ? `${estWeeks.toFixed(1)} weeks` : "—"}
                      </div>
                    </div>
                    <div className="rounded-xl border border-black/10 dark:border-white/10 p-3">
                      <div className="text-xs text-zinc-600 dark:text-zinc-400">Next OJT day</div>
                      <div className="text-sm font-semibold">{nextDate ? formatHuman(nextDate) : "—"}</div>
                    </div>
                  </div>
                </div>
              </CardBody>
            </Card>

            {/* Mobile: stats block appears after main cards */}
            <Card className="lg:hidden">
              <CardHeader title="Plan stats" subtitle="Quick overview for mobile." />
              <CardBody className="grid gap-3 sm:grid-cols-2">
                <div className="rounded-xl border border-black/10 dark:border-white/10 p-4">
                  <div className="text-xs text-zinc-600 dark:text-zinc-400">Weekly capacity</div>
                  <div className="text-base font-semibold">
                    {Number.isFinite(weeklyCap) ? `${weeklyCap} hrs/week` : "—"}
                  </div>
                </div>
                <div className="rounded-xl border border-black/10 dark:border-white/10 p-4">
                  <div className="text-xs text-zinc-600 dark:text-zinc-400">OJT days needed</div>
                  <div className="text-base font-semibold">{Number.isFinite(daysNeeded) ? daysNeeded : "—"}</div>
                </div>
                <div className="rounded-xl border border-black/10 dark:border-white/10 p-4">
                  <div className="text-xs text-zinc-600 dark:text-zinc-400">Estimated weeks</div>
                  <div className="text-base font-semibold">
                    {Number.isFinite(estWeeks) ? `${estWeeks.toFixed(1)} weeks` : "—"}
                  </div>
                </div>
                <div className="rounded-xl border border-black/10 dark:border-white/10 p-4">
                  <div className="text-xs text-zinc-600 dark:text-zinc-400">Next OJT day</div>
                  <div className="text-base font-semibold">{nextDate ? formatHuman(nextDate) : "—"}</div>
                </div>
              </CardBody>
            </Card>
          </div>
        </div>
      </Container>
    </Page>
  );
}

