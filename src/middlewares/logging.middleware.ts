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
        logger.info(
            `[${new Date().toISOString()}] ${req.method} ${req.originalUrl} - ${res.statusCode} (${duration}ms)`
        );
    });
    next();
};

export default loggingMiddleware;
