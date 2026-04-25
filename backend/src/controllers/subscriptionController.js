import { z } from "zod";
import { Subscription } from "../models/Subscription.js";
import { User } from "../models/User.js";
import { toISODateLocal } from "../utils/date.js";
import { getCancellationRemainingSeconds } from "../utils/subscriptionRules.js";
import { isISODateString } from "../utils/date.js";

const dateSchema = z.string().refine((v) => isISODateString(v), "Invalid date (YYYY-MM-DD)");

export async function listMySubscriptions(req, res) {
  const subs = await Subscription.find({ customerId: req.user.sub }).sort({ createdAt: -1 });
  res.json({ data: subs });
}

export async function skipDay(req, res) {
  const body = z
    .object({ subscriptionId: z.string(), date: dateSchema, reason: z.string().optional() })
    .parse(req.body);
  const sub = await Subscription.findOne({ _id: body.subscriptionId, customerId: req.user.sub });
  if (!sub) return res.status(404).json({ message: "Subscription not found" });

  const today = toISODateLocal();
  if (body.date < today) {
    return res.status(400).json({ message: "Cannot skip a past date" });
  }

  const exists = sub.skips.some((s) => s.date === body.date);
  if (!exists) {
    sub.skips.push({ date: body.date, reason: body.reason });
    await sub.save();

    // Smart skip credit: add the daily plan amount to wallet immediately.
    const credit = Math.max(0, Number(sub.planPricePerDay || 0));
    if (credit > 0) {
      await User.findByIdAndUpdate(req.user.sub, { $inc: { walletBalance: credit } });
    }
  }

  const refreshedUser = await User.findById(req.user.sub).select("walletBalance loyalty referralCode");

  res.json({
    data: {
      subscription: sub,
      wallet: refreshedUser
    }
  });
}

export async function pause(req, res) {
  const body = z.object({ subscriptionId: z.string(), from: dateSchema, to: dateSchema }).parse(req.body);
  const sub = await Subscription.findOne({ _id: body.subscriptionId, customerId: req.user.sub });
  if (!sub) return res.status(404).json({ message: "Subscription not found" });

  sub.status = "paused";
  sub.pauses.push({ from: body.from, to: body.to });
  await sub.save();
  res.json({ data: sub });
}

export async function cancel(req, res) {
  const body = z.object({ subscriptionId: z.string() }).parse(req.body);
  const sub = await Subscription.findOne({ _id: body.subscriptionId, customerId: req.user.sub });
  if (!sub) return res.status(404).json({ message: "Subscription not found" });

  const remainingSeconds = getCancellationRemainingSeconds(sub);
  if (remainingSeconds > 0) {
    return res.status(409).json({
      message: "Cancellation locked (1hr rule)",
      cancellationRemainingSeconds: remainingSeconds
    });
  }

  // First call => create lock; second call after lock expires => cancel.
  // If no lock exists, set it now and return countdown info.
  if (!sub.cancellationLockedUntil) {
    const lockMs = 60 * 60 * 1000;
    sub.cancellationLockedUntil = new Date(Date.now() + lockMs);
    await sub.save();
    return res.json({
      data: {
        subscription: sub,
        cancellationLocked: true,
        cancellationRemainingSeconds: 60 * 60
      }
    });
  }

  // If lock existed but has expired, finalize cancellation.
  sub.status = "cancelled";
  sub.cancellationLockedUntil = null;
  await sub.save();

  res.json({
    data: {
      subscription: sub,
      cancelled: true
    }
  });
}

