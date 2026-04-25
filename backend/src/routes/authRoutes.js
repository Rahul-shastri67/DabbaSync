import { Router } from "express";
import { me, requestOtp, verifyOtp } from "../controllers/authController.js";
import { requireAuth } from "../middleware/auth.js";

export const authRoutes = Router();

authRoutes.post("/otp/request", requestOtp);
authRoutes.post("/otp/verify", verifyOtp);
authRoutes.get("/me", requireAuth, me);

