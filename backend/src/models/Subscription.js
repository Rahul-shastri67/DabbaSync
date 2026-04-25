import mongoose from "mongoose";

const skipSchema = new mongoose.Schema(
  {
    date: { type: String, required: true }, // YYYY-MM-DD in local timezone
    reason: { type: String, trim: true }
  },
  { _id: false }
);

const pauseSchema = new mongoose.Schema(
  {
    from: { type: String, required: true },
    to: { type: String, required: true }
  },
  { _id: false }
);

const subscriptionSchema = new mongoose.Schema(
  {
    customerId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    vendorId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },

    planName: { type: String, required: true, trim: true },
    planPricePerDay: { type: Number, required: true },

    deliveryAddress: {
      label: { type: String, trim: true },
      line1: { type: String, trim: true },
      lat: { type: Number },
      lng: { type: Number }
    },

    status: { type: String, enum: ["active", "paused", "cancelled"], default: "active", index: true },
    cancellationLockedUntil: { type: Date }, // 1hr rule anchor

    skips: { type: [skipSchema], default: [] },
    pauses: { type: [pauseSchema], default: [] }
  },
  { timestamps: true }
);

export const Subscription = mongoose.model("Subscription", subscriptionSchema);

