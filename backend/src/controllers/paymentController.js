import { z } from "zod";
import { User } from "../models/User.js";

export async function walletMe(req, res) {
  const user = await User.findById(req.user.sub).select("walletBalance loyalty referralCode");
  if (!user) return res.status(404).json({ message: "User not found" });
  res.json({ data: user });
}

export async function walletTopupIntent(req, res) {
  const body = z.object({ amount: z.number().positive() }).parse(req.body);
  // Razorpay integration placeholder: create order + return orderId
  res.json({
    data: {
      provider: "razorpay",
      amount: body.amount,
      currency: "INR",
      razorpayOrderId: "rzp_order_placeholder"
    }
  });
}

