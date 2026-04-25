import { Router } from "express";
import { requireAuth, requireRole } from "../middleware/auth.js";
import { adminOverview, vendorOverview } from "../controllers/analyticsController.js";

export const analyticsRoutes = Router();

analyticsRoutes.get("/vendor/overview", requireAuth, requireRole("vendor"), vendorOverview);
analyticsRoutes.get("/admin/overview", requireAuth, requireRole("admin"), adminOverview);

