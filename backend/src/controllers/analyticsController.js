import { Order } from "../models/index.js";
import { Subscription } from "../models/Subscription.js";

export async function vendorOverview(req, res) {
  const vendorId = req.user.sub;
  const [activeSubs, ordersToday] = await Promise.all([
    Subscription.countDocuments({ vendorId, status: "active" }),
    Order.countDocuments({ vendorId, date: new Date().toISOString().slice(0, 10) })
  ]);
  res.json({ data: { activeSubs, ordersToday } });
}

export async function adminOverview(req, res) {
  // Placeholder: in real system compute GMV/commission/user growth.
  const totalOrders = await Order.countDocuments({});
  res.json({ data: { totalOrders, gmv: 0, commission: 0 } });
}

