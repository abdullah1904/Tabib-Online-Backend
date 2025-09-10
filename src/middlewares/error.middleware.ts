import { NextFunction, Request, Response } from "express";
import { logger } from "../utils/logger";
import { HttpStatusCode } from "../utils/constants";

const {
    HTTP_INTERNAL_SERVER_ERROR
} = HttpStatusCode;


const errorMiddleware = (err: Error, req: Request, res: Response, next: NextFunction): void => {
    let error = { ...err };
    error.message = err.message;
    logger.error(error.message);
    res.status(HTTP_INTERNAL_SERVER_ERROR.code).json({
        error: HTTP_INTERNAL_SERVER_ERROR.message,
    });
    return;
};

export default errorMiddleware;