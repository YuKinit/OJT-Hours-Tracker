export type Weekday = 0 | 1 | 2 | 3 | 4 | 5 | 6; // 0=Sun ... 6=Sat (JS Date)

export const WEEKDAY_LABELS: Record<Weekday, string> = {
  0: "Sun",
  1: "Mon",
  2: "Tue",
  3: "Wed",
  4: "Thu",
  5: "Fri",
  6: "Sat",
};

export function clampNumber(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

export function ceilDiv(numerator: number, denominator: number) {
  if (denominator <= 0) return Number.POSITIVE_INFINITY;
  return Math.ceil(numerator / denominator);
}

export function countSelectedDays(days: Weekday[]) {
  return new Set(days).size;
}

export function computeOjtDaysNeeded(totalRequiredHours: number, hoursPerDay: number) {
  return ceilDiv(totalRequiredHours, hoursPerDay);
}

export function computeWeeklyCapacityHours(hoursPerDay: number, selectedDays: Weekday[]) {
  return hoursPerDay * countSelectedDays(selectedDays);
}

export function computeEstimatedWeeks(totalRequiredHours: number, hoursPerDay: number, selectedDays: Weekday[]) {
  const cap = computeWeeklyCapacityHours(hoursPerDay, selectedDays);
  if (cap <= 0) return Number.POSITIVE_INFINITY;
  return totalRequiredHours / cap;
}

export function nextOjtDateOnOrAfter(startDate: Date, selectedDays: Weekday[], options?: { includeToday?: boolean }) {
  const set = new Set(selectedDays);
  const d = new Date(startDate);
  d.setHours(0, 0, 0, 0);
  if (options?.includeToday === false) {
    d.setDate(d.getDate() + 1);
  }
  for (let i = 0; i < 14; i++) {
    const wd = d.getDay() as Weekday;
    if (set.has(wd)) return d;
    d.setDate(d.getDate() + 1);
  }
  return null;
}

export function computePredictedEndDate(params: {
  startDate: Date;
  selectedDays: Weekday[];
  totalRequiredHours: number;
  hoursPerDay: number;
}) {
  const { startDate, selectedDays, totalRequiredHours, hoursPerDay } = params;
  const uniqueDays = Array.from(new Set(selectedDays));
  if (uniqueDays.length === 0 || hoursPerDay <= 0 || totalRequiredHours <= 0) return null;

  const daysNeeded = computeOjtDaysNeeded(totalRequiredHours, hoursPerDay);
  const set = new Set(uniqueDays);

  const d = new Date(startDate);
  d.setHours(0, 0, 0, 0);

  let counted = 0;
  // Count the start date if it's an OJT day.
  while (counted < daysNeeded) {
    const wd = d.getDay() as Weekday;
    if (set.has(wd)) {
      counted += 1;
      if (counted >= daysNeeded) break;
    }
    d.setDate(d.getDate() + 1);
  }

  return d;
}

export function formatISODate(d: Date) {
  const year = d.getFullYear();
  const month = `${d.getMonth() + 1}`.padStart(2, "0");
  const day = `${d.getDate()}`.padStart(2, "0");
  return `${year}-${month}-${day}`;
}

