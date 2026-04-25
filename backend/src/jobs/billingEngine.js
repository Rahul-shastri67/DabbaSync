import { Subscription } from "../models/Subscription.js";
import { Invoice, User } from "../models/index.js";
import { logger } from "../utils/logger.js";
import { toISODateLocal } from "../utils/date.js";
import { isISODateString } from "../utils/date.js";
import { canBillOnDate } from "../utils/subscriptionRules.js";
import { applyWalletCredit } from "../utils/billing.js";

async function getOrCreateInvoice({ customerId, vendorId, dateStr, amountDue }) {
  const existing = await Invoice.findOne({
    customerId,
    vendorId,
    periodFrom: dateStr,
    periodTo: dateStr
  });
  if (existing) return { invoice: existing, isNew: false };

  const invoice = await Invoice.create({
    customerId,
    vendorId,
    periodFrom: dateStr,
    periodTo: dateStr,
    amount: amountDue,
    status: amountDue === 0 ? "paid" : "draft"
  });
  return { invoice, isNew: true };
}

export async function finalizeExpiredCancellations({ now = Date.now() } = {}) {
  const subs = await Subscription.find({
    status: { $in: ["active", "paused"] },
    cancellationLockedUntil: { $exists: true, $ne: null }
  });

  const due = subs.filter((s) => s.cancellationLockedUntil && new Date(s.cancellationLockedUntil).getTime() <= now);
  if (!due.length) return { finalized: 0 };

  for (const sub of due) {
    sub.status = "cancelled";
    sub.cancellationLockedUntil = null;
    await sub.save();
  }

  return { finalized: due.length };
}

export async function runDailyAutoBilling({ dateStr } = {}) {
  const billingDate = dateStr || toISODateLocal();
  if (!isISODateString(billingDate)) throw new Error("Invalid billing date");

  const subs = await Subscription.find({
    status: { $in: ["active", "paused"] }
  });

  let createdInvoices = 0;
  let paidInvoices = 0;
  let totalCharged = 0;

  for (const sub of subs) {
    if (!canBillOnDate(sub, { dateStr: billingDate })) continue;

    const amountDue = Math.max(0, Number(sub.planPricePerDay || 0));
    if (amountDue <= 0) continue;

    const invoice = await getOrCreateInvoice({
      customerId: sub.customerId,
      vendorId: sub.vendorId,
      dateStr: billingDate,
      amountDue
    });

    const { invoice: createdInvoice, isNew } = invoice;
    if (!isNew) continue;

    const customer = await User.findById(sub.customerId);
    if (!customer) continue;

    const { used, remainingDue } = applyWalletCredit({
      walletBalance: customer.walletBalance,
      amountDue
    });

    if (used > 0) {
      customer.walletBalance = Math.max(0, Number(customer.walletBalance) - used);
      await customer.save();
    }

    createdInvoice.amount = remainingDue;
    createdInvoice.status = remainingDue === 0 ? "paid" : "draft";
    await createdInvoice.save();

    createdInvoices += 1;
    totalCharged += amountDue;
    if (createdInvoice.status === "paid") paidInvoices += 1;
  }

  logger.info(
    { job: "daily-auto-billing", billingDate, createdInvoices, paidInvoices, totalCharged },
    "Daily billing completed"
  );

  return { billingDate, createdInvoices, paidInvoices, totalCharged };
}

