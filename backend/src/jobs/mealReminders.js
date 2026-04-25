import { Subscription } from "../models/Subscription.js";
import { logger } from "../utils/logger.js";
import { toISODateLocal } from "../utils/date.js";
import { canBillOnDate } from "../utils/subscriptionRules.js";

export async function runMealReminders({ io, dateStr } = {}) {
  if (!io) throw new Error("runMealReminders requires io");

  const reminderDate = dateStr || toISODateLocal();

  const subs = await Subscription.find({
    status: { $in: ["active", "paused"] }
  });

  const eligible = [];
  for (const sub of subs) {
    if (!canBillOnDate(sub, { dateStr: reminderDate })) continue;
    eligible.push(sub);
  }

  for (const sub of eligible) {
    io.to(`customer:${sub.customerId}`).emit("meal:reminder", {
      date: reminderDate,
      vendorId: sub.vendorId,
      subscriptionId: sub._id
    });
  }

  logger.info(
    { job: "meal-reminders", date: reminderDate, remindersSent: eligible.length },
    "Meal reminders emitted"
  );

  return { date: reminderDate, remindersSent: eligible.length };
}

