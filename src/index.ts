import express from "express";
import { config } from "./utils/config";
import { logger } from "./utils/logger";
import rateLimit from "express-rate-limit";
import cors from "cors";
import helmet from "helmet";
import errorMiddleware from "./middlewares/error.middleware";
import loggingMiddleware from "./middlewares/logging.middleware";
import appRouter from "./routes";

const app = express();

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

app.listen(config.PORT, () => {
  logger.info(`Server is running on PORT ${config.PORT}`);
});
