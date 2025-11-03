import express from "express";
import rateLimit from "express-rate-limit";
import cors from "cors";
import helmet from "helmet";
import errorMiddleware from "./middlewares/error.middleware";
import loggingMiddleware from "./middlewares/logging.middleware";
import appRouter from "./routes";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { config } from "./utils/config";
import { logger } from "./utils/logger";
import { v2 as cloudinary } from "cloudinary";
import { createServer } from 'http';
import { Server } from "socket.io";
import { onConnectionHandler, onDisconnectHandler, onMessageHandler } from "./services/socket.service";


const app = express();
const client = postgres(config.DATABASE_URL as string, {
  max: 10,
  idle_timeout: 30000,
  connect_timeout: 10000
});
const database = drizzle(client);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(cors({
  origin: [
    'http://localhost:3000', // User Panel
    'http://localhost:3001', // Doctor Panel
    'http://localhost:3002', // Hospital Panel
    'http://localhost:3003', // Admin Panel
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
    origin: "http://localhost:3000", // Sockets only for User Panel
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

export { database as db, cloudinary, io };