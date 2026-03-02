import { NextFunction, Request, Response } from "express";
import { AccountStatus, HttpStatusCode, UserRole } from "../utils/constants.js";
import jwt from "jsonwebtoken";
import { config } from "../utils/config.js";
import prisma from "../lib/prisma.js";


const {
    HTTP_UNAUTHORIZED,
    HTTP_FORBIDDEN,
    HTTP_INTERNAL_SERVER_ERROR
} = HttpStatusCode;

const authenticate = async (req: Request, res: Response, next: NextFunction) => {
    try {
        let token;
        if (req.headers.authorization && req.headers.authorization.startsWith("Bearer")) {
            token = req.headers.authorization.split(" ")[1];
        }
        if (!token) {
            res.status(HTTP_UNAUTHORIZED.code).json({ message: "Authorization token missing or malformed." });
            return
        }
        const decoded = jwt.verify(token, config.ACCESS_TOKEN_SECRET!) as { id: string };

        const user = await prisma.users.findUnique({
            where: { id: decoded.id }
        });
        if (!user) {
            res.status(HTTP_UNAUTHORIZED.code).json({ message: "User associated with credentials not found." });
            return
        }
        if(user.status === AccountStatus.PENDING){
            res.status(HTTP_UNAUTHORIZED.code).json({ error: "User account is pending activation. Please contact support." });
            return;
        }
        if(user.status === AccountStatus.SUSPENDED || user.status === AccountStatus.BANNED){
            res.status(HTTP_UNAUTHORIZED.code).json({ error: "User account is suspended or banned. Please contact support." });
            return;
        }
        req.user = {
            ...user,
        }
        next();
    }
    catch (err) {
        if (err instanceof jwt.TokenExpiredError) {
            res.status(HTTP_UNAUTHORIZED.code).json({ message: "Session expired. Please login again." });
            return;
        }
        if (err instanceof jwt.JsonWebTokenError) {
            res.status(HTTP_UNAUTHORIZED.code).json({ message: "Invalid session. Please login again." });
            return;
        }
        res.status(HTTP_UNAUTHORIZED.code).json({ message: HTTP_UNAUTHORIZED.message, error: err });
        return;
    }
}

const authorize = (userRole: UserRole | UserRole[]) => {
    return async (req: Request, res: Response, next: NextFunction) => {
        try {
            if (!req.user) {
                res.status(HTTP_UNAUTHORIZED.code).json({ error: "Unauthorized access." });
            }
            if (Array.isArray(userRole)) {
                if (!userRole.includes(req.user.role)) {
                    res.status(HTTP_FORBIDDEN.code).json({ error: "Forbidden. You don't have enough privilege to perform this action."});
                    return;
                }
            } else {
                if (req.user.role !== userRole) {
                    res.status(HTTP_FORBIDDEN.code).json({ error: "Forbidden. You don't have enough privilege to perform this action."});
                    return;
                }
            }
            next();
        }
        catch (err) {
            res.status(HTTP_INTERNAL_SERVER_ERROR.code).json({ error: HTTP_INTERNAL_SERVER_ERROR.message });
            return;
        }
    }
}

export {
    authenticate,
    authorize,
}