import { Order } from "../models/index.js";

export function registerSocketHandlers(io, socket) {
  socket.on("join", ({ room }) => {
    if (room) socket.join(room);
  });

  // Customer: subscribe to meal reminders and order updates.
  socket.on("customer:subscribe", ({ customerId }) => {
    if (customerId) socket.join(`customer:${customerId}`);
  });

  // Customer: listen to delivery tracking updates for an order.
  socket.on("delivery:subscribe", ({ orderId }) => {
    if (orderId) socket.join(`order:${orderId}`);
  });

  // Vendor: subscribe to vendor-scoped feeds (skip feed placeholder).
  socket.on("vendor:subscribe", ({ vendorId }) => {
    if (vendorId) socket.join(`vendor:${vendorId}`);
  });

  // Backwards-compatible placeholder event name.
  socket.on("vendor:skipfeed:subscribe", ({ vendorId }) => {
    if (vendorId) socket.join(`vendor:${vendorId}`);
  });

  // Rider/device: send live location update.
  socket.on("delivery:location", async ({ orderId, lat, lng }) => {
    if (!orderId) return;
    await Order.findByIdAndUpdate(orderId, {
      $set: { "delivery.live": { lat, lng, updatedAt: new Date() } }
    });
    io.to(`order:${orderId}`).emit("delivery:location", {
      orderId,
      lat,
      lng,
      updatedAt: new Date().toISOString()
    });
  });

  // Rider/device: update delivery status and rider identity.
  socket.on("delivery:updateStatus", async ({ orderId, status, riderName }) => {
    if (!orderId || !status) return;
    const updated = await Order.findByIdAndUpdate(
      orderId,
      {
        $set: {
          status,
          "delivery.riderName": riderName || undefined
        }
      },
      { new: true }
    );

    if (!updated) return;

    io.to(`order:${orderId}`).emit("delivery:status", {
      orderId: updated._id,
      status: updated.status,
      riderName: updated.delivery?.riderName || riderName || null,
      updatedAt: new Date().toISOString()
    });
  });
}

