import { Router } from "express";
import { authRoutes } from "./authRoutes.js";
import { subscriptionRoutes } from "./subscriptionRoutes.js";
import { paymentRoutes } from "./paymentRoutes.js";
import { analyticsRoutes } from "./analyticsRoutes.js";

export const apiRoutes = Router();

apiRoutes.get("/health", (req, res) => res.json({ ok: true, service: "dabbasync-backend" }));
apiRoutes.use("/auth", authRoutes);
apiRoutes.use("/subscriptions", subscriptionRoutes);
apiRoutes.use("/payments", paymentRoutes);
apiRoutes.use("/analytics", analyticsRoutes);

