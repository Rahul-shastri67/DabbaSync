import { Router } from "express";
import { requireAuth } from "../middleware/auth.js";
import { walletMe, walletTopupIntent } from "../controllers/paymentController.js";

export const paymentRoutes = Router();

paymentRoutes.get("/wallet/me", requireAuth, walletMe);
paymentRoutes.post("/wallet/topup-intent", requireAuth, walletTopupIntent);

