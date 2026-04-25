export function calculateDailyCharge({ planPrice, isSkipped, isPaused }) {
  if (isPaused) return 0;
  if (isSkipped) return 0;
  return Math.max(0, Number(planPrice || 0));
}

export function applyWalletCredit({ walletBalance, amountDue }) {
  const wallet = Math.max(0, Number(walletBalance || 0));
  const due = Math.max(0, Number(amountDue || 0));
  const used = Math.min(wallet, due);
  return { used, remainingDue: due - used, remainingWallet: wallet - used };
}

