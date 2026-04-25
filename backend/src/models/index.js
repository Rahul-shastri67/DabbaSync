import mongoose from "mongoose";

// Minimal placeholders to keep the project runnable.
// Expand these schemas as you build features.

const vendorSchema = new mongoose.Schema(
  {
    ownerId: { type: mongoose.Schema.Types.ObjectId, ref: "User", index: true },
    name: { type: String, trim: true },
    kitchenAddress: { type: String, trim: true }
  },
  { timestamps: true }
);

const orderSchema = new mongoose.Schema(
  {
    subscriptionId: { type: mongoose.Schema.Types.ObjectId, ref: "Subscription", index: true },
    customerId: { type: mongoose.Schema.Types.ObjectId, ref: "User", index: true },
    vendorId: { type: mongoose.Schema.Types.ObjectId, ref: "User", index: true },
    date: { type: String, required: true }, // YYYY-MM-DD
    status: { type: String, enum: ["queued", "out_for_delivery", "delivered", "cancelled"], default: "queued" },
    delivery: {
      riderName: { type: String, trim: true },
      live: {
        lat: Number,
        lng: Number,
        updatedAt: Date
      }
    }
  },
  { timestamps: true }
);

const invoiceSchema = new mongoose.Schema(
  {
    customerId: { type: mongoose.Schema.Types.ObjectId, ref: "User", index: true },
    vendorId: { type: mongoose.Schema.Types.ObjectId, ref: "User", index: true },
    periodFrom: String,
    periodTo: String,
    amount: Number,
    status: { type: String, enum: ["draft", "paid", "failed"], default: "draft" }
  },
  { timestamps: true }
);

const couponSchema = new mongoose.Schema(
  {
    code: { type: String, trim: true, unique: true, index: true },
    type: { type: String, enum: ["flat", "percent"], default: "flat" },
    value: { type: Number, default: 0 },
    active: { type: Boolean, default: true }
  },
  { timestamps: true }
);

const menuSchema = new mongoose.Schema(
  {
    vendorId: { type: mongoose.Schema.Types.ObjectId, ref: "User", index: true },
    date: { type: String, index: true },
    items: [{ name: String, tags: [String] }]
  },
  { timestamps: true }
);

export const Vendor = mongoose.model("Vendor", vendorSchema);
export const Order = mongoose.model("Order", orderSchema);
export const Invoice = mongoose.model("Invoice", invoiceSchema);
export const Coupon = mongoose.model("Coupon", couponSchema);
export const Menu = mongoose.model("Menu", menuSchema);

