import { Router } from "express";
import { requireAuth } from "../middleware/auth.js";
import { cancel, listMySubscriptions, pause, skipDay } from "../controllers/subscriptionController.js";

export const subscriptionRoutes = Router();

subscriptionRoutes.get("/mine", requireAuth, listMySubscriptions);
subscriptionRoutes.post("/skip", requireAuth, skipDay);
subscriptionRoutes.post("/pause", requireAuth, pause);
subscriptionRoutes.post("/cancel", requireAuth, cancel);

