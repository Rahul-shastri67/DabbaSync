import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const LoyaltyTier = ["Bronze", "Silver", "Gold", "Platinum"];

const userSchema = new mongoose.Schema(
  {
    role: { type: String, enum: ["customer", "vendor", "admin"], default: "customer", index: true },
    name: { type: String, trim: true },
    phone: { type: String, trim: true, unique: true, sparse: true, index: true },
    email: { type: String, trim: true, lowercase: true, unique: true, sparse: true, index: true },

    passwordHash: { type: String, select: false },

    otp: {
      codeHash: { type: String, select: false },
      expiresAt: { type: Date }
    },
    isPhoneVerified: { type: Boolean, default: false },

    walletBalance: { type: Number, default: 0 },
    referralCode: { type: String, unique: true, sparse: true, index: true },
    referredBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    loyalty: {
      tier: { type: String, enum: LoyaltyTier, default: "Bronze" },
      points: { type: Number, default: 0 }
    }
  },
  { timestamps: true }
);

userSchema.methods.setPassword = async function setPassword(password) {
  const salt = await bcrypt.genSalt(10);
  this.passwordHash = await bcrypt.hash(password, salt);
};

userSchema.methods.verifyPassword = async function verifyPassword(password) {
  if (!this.passwordHash) return false;
  return bcrypt.compare(password, this.passwordHash);
};

export const User = mongoose.model("User", userSchema);

