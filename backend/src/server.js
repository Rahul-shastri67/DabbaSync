import "dotenv/config";
import http from "http";
import express from "express";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import mongoSanitize from "express-mongo-sanitize";
import xss from "xss-clean";
import cookieParser from "cookie-parser";
import mongoose from "mongoose";
import { Server as SocketIOServer } from "socket.io";
import pinoHttp from "pino-http";

import { logger } from "./utils/logger.js";
import { apiRoutes } from "./routes/index.js";
import { notFound, errorHandler } from "./middleware/errorHandler.js";
import { registerSocketHandlers } from "./socket/handlers.js";
import { startCronJobs } from "./jobs/cronJobs.js";

const app = express();

app.set("trust proxy", 1);

app.use(pinoHttp({ logger }));
app.use(helmet());
app.use(
  cors({
    origin: process.env.CLIENT_ORIGIN || "http://localhost:5173",
    credentials: true
  })
);
app.use(
  rateLimit({
    windowMs: 60 * 1000,
    limit: 120,
    standardHeaders: true,
    legacyHeaders: false
  })
);
app.use(express.json({ limit: "1mb" }));
app.use(cookieParser());
app.use(mongoSanitize());
app.use(xss());

app.use("/api", apiRoutes);
app.use(notFound);
app.use(errorHandler);

const server = http.createServer(app);

const io = new SocketIOServer(server, {
  cors: {
    origin: process.env.CLIENT_ORIGIN || "http://localhost:5173",
    credentials: true
  }
});

io.on("connection", (socket) => {
  logger.info({ socketId: socket.id }, "socket connected");
  registerSocketHandlers(io, socket);
  socket.on("disconnect", () => logger.info({ socketId: socket.id }, "socket disconnected"));
});

async function start() {
  const port = Number(process.env.PORT || 4000);
  const mongoUri = process.env.MONGODB_URI;
  if (!mongoUri) throw new Error("Missing MONGODB_URI");

  await mongoose.connect(mongoUri);
  logger.info("Connected to MongoDB");

  startCronJobs({ io });

  server.listen(port, () => {
    logger.info(`API listening on http://localhost:${port}`);
  });
}

start().catch((err) => {
  logger.error({ err }, "Failed to start server");
  process.exit(1);
});

