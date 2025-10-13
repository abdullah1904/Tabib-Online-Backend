import { NextFunction, Request, Response } from "express";
import { AccountStatus, AdminPrivilege, HttpStatusCode } from "../utils/constants";
import jwt from "jsonwebtoken";
import { config } from "../utils/config";
import { AdminTable } from "../models/admin.model";
import { db } from "..";
import { eq } from "drizzle-orm";
import { UserTable } from "../models/user.model";
import { error } from "console";

const {
    HTTP_UNAUTHORIZED,
    HTTP_FORBIDDEN,
    HTTP_INTERNAL_SERVER_ERROR
} = HttpStatusCode;

const authenticateAdmin = async (req: Request, res: Response, next: NextFunction) => {
    try {
        let token;
        if (req.headers.authorization && req.headers.authorization.startsWith("Bearer")) {
            token = req.headers.authorization.split(" ")[1];
        }
        if (!token) {
            res.status(HTTP_UNAUTHORIZED.code).json({ message: "Authorization token missing or malformed." });
            return
        }
        const decoded = jwt.verify(token, config.ACCESS_TOKEN_SECRET!) as {id: number};

        const admin = await db.select().from(AdminTable).where(eq(AdminTable.id, decoded.id));
        if (admin.length === 0) {
            res.status(HTTP_UNAUTHORIZED.code).json({ message: "Admin associated with credentials not found." });
            return
        }
        if(admin[0].status === AccountStatus.PENDING){
            res.status(HTTP_UNAUTHORIZED.code).json({ error: "Admin account is pending activation. Please contact support." });
            return;
        }
        if(admin[0].status === AccountStatus.BANNED || admin[0].status === AccountStatus.SUSPENDED){
            res.status(HTTP_UNAUTHORIZED.code).json({ error: "Admin account is suspended or banned. Please contact support." });
            return;
        }
        req.admin = {
            ...admin[0],
            id: admin[0].id
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

const authenticateUser = async (req: Request, res: Response, next: NextFunction) => {
    try {
        let token;
        if (req.headers.authorization && req.headers.authorization.startsWith("Bearer")) {
            token = req.headers.authorization.split(" ")[1];
        }
        if (!token) {
            res.status(HTTP_UNAUTHORIZED.code).json({ message: "Authorization token missing or malformed." });
            return
        }
        const decoded = jwt.verify(token, config.ACCESS_TOKEN_SECRET!) as {id: number};

        const user = await db.select().from(UserTable).where(eq(UserTable.id, decoded.id));
        if (user.length === 0) {
            res.status(HTTP_UNAUTHORIZED.code).json({ message: "User associated with credentials not found." });
            return
        }
        if(user[0].status === AccountStatus.PENDING){
            res.status(HTTP_UNAUTHORIZED.code).json({ error: "User account is pending activation. Please contact support." });
            return;
        }
        if(user[0].status === AccountStatus.SUSPENDED || user[0].status === AccountStatus.BANNED){
            res.status(HTTP_UNAUTHORIZED.code).json({ error: "User account is suspended or banned. Please contact support." });
            return;
        }
        req.user = {
            ...user[0],
            id: user[0].id
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

const AuthorizeSuperOrReadAdmin = async (req: Request, res: Response, next: NextFunction) => {
    try {
        if (!req.admin) {
            res.status(HTTP_UNAUTHORIZED.code).json({ error: "Unauthorized access." });
            return;
        }
        if (req.admin.privilegeLevel !== AdminPrivilege.SUPER && req.admin.privilegeLevel !== AdminPrivilege.READ) {
            res.status(HTTP_FORBIDDEN.code).json({ error: "Forbidden: Insufficient privileges." });
            return;
        }
        next();
    }
    catch (err) {
        res.status(HTTP_INTERNAL_SERVER_ERROR.code).json({ error: HTTP_INTERNAL_SERVER_ERROR.message });
        return;
    }
}

export {
    authenticateAdmin,
    authenticateUser,
    AuthorizeSuperOrReadAdmin
}