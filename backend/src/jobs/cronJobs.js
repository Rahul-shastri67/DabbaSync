import cron from "node-cron";
import { logger } from "../utils/logger.js";
import { finalizeExpiredCancellations, runDailyAutoBilling } from "./billingEngine.js";
import { runMealReminders } from "./mealReminders.js";

export function startCronJobs({ io } = {}) {
  const billingCron = process.env.BILLING_CRON || "0 3 * * *";
  const reminderCron = process.env.MEAL_REMINDER_CRON || "0 8 * * *";
  const lockCheckCron = process.env.CANCELLATION_LOCK_CHECK_CRON || "*/5 * * * *";

  // Auto-billing: invoices + wallet debit.
  cron.schedule(billingCron, async () => {
    try {
      const result = await runDailyAutoBilling();
      logger.info({ job: "daily-auto-billing", result }, "Auto-billing complete");
    } catch (err) {
      logger.error({ err }, "Auto-billing failed");
    }
  });

  // Finalize cancellation locks (1hr rule) after lock expires.
  cron.schedule(lockCheckCron, async () => {
    try {
      const result = await finalizeExpiredCancellations();
      if (result.finalized > 0) logger.info({ job: "cancellation-lock", result }, "Cancelled subscriptions finalized");
    } catch (err) {
      logger.error({ err }, "Cancellation lock finalization failed");
    }
  });

  // Meal reminders via Socket.io.
  cron.schedule(reminderCron, async () => {
    try {
      const result = await runMealReminders({ io });
      logger.info({ job: "meal-reminders", result }, "Reminders complete");
    } catch (err) {
      logger.error({ err }, "Meal reminders failed");
    }
  });
}

