import { isISODateString } from "./date.js";

export function isSkippedOnDate(subscription, dateStr) {
  if (!subscription?.skips?.length) return false;
  return subscription.skips.some((s) => s.date === dateStr);
}

export function isPausedOnDate(subscription, dateStr) {
  const pauses = subscription?.pauses || [];
  if (!pauses.length) return false;
  // Works because YYYY-MM-DD lexicographically orders by date.
  return pauses.some((p) => dateStr >= p.from && dateStr <= p.to);
}

export function canBillOnDate(subscription, { dateStr, now = Date.now() } = {}) {
  if (!isISODateString(dateStr)) throw new Error("Invalid dateStr");
  if (!subscription || subscription.status === "cancelled") return false;
  if (subscription.status === "paused" && isPausedOnDate(subscription, dateStr)) return false;
  // If status isn't paused but there's a pause window, we still stop billing.
  if (subscription.status !== "cancelled" && isPausedOnDate(subscription, dateStr)) return false;
  if (isSkippedOnDate(subscription, dateStr)) return false;

  // Note: cancellation lock does NOT stop billing; cancellation is finalized by job.
  // During 1hr lock, the subscription remains active until it flips to cancelled.
  return true;
}

export function getCancellationRemainingSeconds(subscription, { now = Date.now() } = {}) {
  const until = subscription?.cancellationLockedUntil ? new Date(subscription.cancellationLockedUntil) : null;
  if (!until) return 0;
  const diffMs = until.getTime() - now;
  if (diffMs <= 0) return 0;
  return Math.ceil(diffMs / 1000);
}

