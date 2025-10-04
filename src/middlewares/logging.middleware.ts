import { Request, Response, NextFunction } from "express";
import { logger } from "../utils/logger";
import { HttpStatusCode } from "../utils/constants";

const {
    HTTP_INTERNAL_SERVER_ERROR
} = HttpStatusCode;

const loggingMiddleware = (req: Request, res: Response, next: NextFunction) => {
    if (res.statusCode === HTTP_INTERNAL_SERVER_ERROR.code) return;
    const start = Date.now();
    res.on("finish", () => {
        const duration = Date.now() - start;
        const logMessage = `${req.method} ${req.originalUrl} - ${res.statusCode} (${duration}ms)`;
        if (res.statusCode < 300) {
            logger.info(logMessage);
        } else if (res.statusCode < 400) {
            logger.warn(logMessage);
        } else if (res.statusCode < 500) {
            logger.warn(logMessage);
        } else {
            logger.error(logMessage);
        }
    });
    next();
};

export default loggingMiddleware;