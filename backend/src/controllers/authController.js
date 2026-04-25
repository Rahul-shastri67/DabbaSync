import { z } from "zod";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { User } from "../models/User.js";

function signToken(user) {
  return jwt.sign(
    { sub: String(user._id), role: user.role, phone: user.phone, email: user.email },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || "7d" }
  );
}

function generateOtp() {
  return String(Math.floor(100000 + Math.random() * 900000));
}

export async function requestOtp(req, res) {
  const body = z.object({ phone: z.string().min(8) }).parse(req.body);
  const otp = generateOtp();
  const codeHash = await bcrypt.hash(otp, 10);

  const user = await User.findOneAndUpdate(
    { phone: body.phone },
    { $setOnInsert: { phone: body.phone, role: "customer" }, $set: { "otp.codeHash": codeHash, "otp.expiresAt": new Date(Date.now() + 5 * 60 * 1000) } },
    { new: true, upsert: true }
  );

  // In production: send via WhatsApp/SMS provider. For dev we return OTP.
  res.json({ data: { userId: user._id, devOtp: otp, expiresInSeconds: 300 } });
}

export async function verifyOtp(req, res) {
  const body = z.object({ phone: z.string().min(8), otp: z.string().length(6) }).parse(req.body);
  const user = await User.findOne({ phone: body.phone }).select("+otp.codeHash");
  if (!user) return res.status(404).json({ message: "User not found" });
  if (!user.otp?.expiresAt || user.otp.expiresAt.getTime() < Date.now()) {
    return res.status(400).json({ message: "OTP expired" });
  }
  const ok = await bcrypt.compare(body.otp, user.otp.codeHash || "");
  if (!ok) return res.status(400).json({ message: "Invalid OTP" });

  user.isPhoneVerified = true;
  user.otp = { codeHash: undefined, expiresAt: undefined };
  await user.save();

  const token = signToken(user);
  res.json({ data: { token } });
}

export async function me(req, res) {
  const user = await User.findById(req.user.sub);
  if (!user) return res.status(404).json({ message: "User not found" });
  res.json({ data: user });
}

