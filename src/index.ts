import express from "express";
import rateLimit from "express-rate-limit";
import cors from "cors";
import helmet from "helmet";
import errorMiddleware from "./middlewares/error.middleware";
import loggingMiddleware from "./middlewares/logging.middleware";
import { config } from "./utils/config";
import { logger } from "./utils/logger";
import { v2 as cloudinary } from "cloudinary";
import { createServer } from 'http';
import { Server } from "socket.io";
import Stripe from "stripe";
import appRouter from "./routes";
import { onConnectionHandler, onDisconnectHandler, onMessageHandler } from "./socketHandlers";
import { StripeWebHook } from "./webhooks";



const app = express();

app.post("/api/v1/stripe-webhook",
  express.raw({ type: 'application/json' }),
  StripeWebHook
);

app.set('trust proxy', 1);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(cors({
  origin: [
    'http://localhost:3000', // User Panel
    // 'http://localhost:3001', // Doctor Panel
    // 'http://localhost:3002', // Hospital Panel
    // 'http://localhost:3003', // Admin Panel
    // 'https://tabibonline.app', // User Panel Production
    // 'https://doctor.tabibonline.app', // Doctor Panel Production
    // 'https://hospital.tabibonline.app', // Hospital Panel Production
    // 'https://admin.tabibonline.app', // Admin Panel Production
  ],
  credentials: true,
}));
app.use(helmet());
app.use(rateLimit({
  windowMs: 1 * 60 * 1000,
  max: 50,
}));

app.use(loggingMiddleware);
app.use("/api/v1", appRouter);
app.use(errorMiddleware);

const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin: ["http://localhost:3000", "https://tabibonline.app"], // User Panel + Production
    methods: ["GET", "POST"],
    credentials: true
  }
});

io.on("connection", (socket) => {
  const userId = socket.handshake.query.userId as string;
  onConnectionHandler(socket, userId);

  // Handle incoming messages from clients
  socket.on("message", async ({ query }) => {
    await onMessageHandler(socket, userId, query);
  });
  // Handle client disconnection
  socket.on("disconnect", () => {
    onDisconnectHandler(socket, userId);
  });
});

server.listen(config.PORT, () => {
  logger.info(`Server is running on port ${config.PORT}`);
});

cloudinary.config({
  secure: true,
  api_key: config.CLOUDINARY_API_KEY!,
  api_secret: config.CLOUDINARY_API_SECRET!,
  cloud_name: config.CLOUDINARY_CLOUD_NAME!,
});

const stripe = new Stripe(config.STRIPE_PRIVATE_KEY!)

export { cloudinary, io, stripe };