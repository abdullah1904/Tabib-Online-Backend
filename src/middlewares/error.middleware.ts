import { NextFunction, Request, Response } from "express";
import { HttpStatusCode } from "../utils/constants.js";
import { HTTPError } from "../types/index.js";

const {
    HTTP_INTERNAL_SERVER_ERROR
} = HttpStatusCode;


const errorMiddleware = (err: Error, req: Request, res: Response, next: NextFunction): void => {
    if (err instanceof HTTPError) {
        res.status(err.statusCode).json({ error: err.message });
        return;
    }
    let error = { ...err };
    error.message = err.message;
    res.status(HTTP_INTERNAL_SERVER_ERROR.code).json({
        error: error.message ?? HTTP_INTERNAL_SERVER_ERROR.message,
    });
    return;
};

export default errorMiddleware;