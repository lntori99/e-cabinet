const MS_PER_HOUR = 3_600_000;

/** Hours from `now` to `at` — negative once `at` is in the past. */
export function hoursUntil(at: string, now: string): number {
  return (new Date(at).getTime() - new Date(now).getTime()) / MS_PER_HOUR;
}

/**
 * "in 3 days" / "4 hours ago". A deadline reads better as distance than as a
 * date: the reader wants to know whether to act now, not to do the arithmetic.
 */
export function distance(hours: number): string {
  const abs = Math.abs(hours);
  const value =
    abs < 1
      ? `${Math.max(1, Math.round(abs * 60))} min`
      : abs < 48
        ? `${Math.round(abs)} hour${Math.round(abs) === 1 ? "" : "s"}`
        : `${Math.round(abs / 24)} days`;
  return hours >= 0 ? `in ${value}` : `${value} ago`;
}

/** "2026-08-14T13:41" → "2026-08-14 13:41". */
export function stamp(iso: string): string {
  return iso.replace("T", " ").slice(0, 16);
}
