import { NextFunction, Request, Response, text } from "express";
import { db } from "../..";
import { UserTable } from "../../models/user.model";
import { AccountStatus, HttpStatusCode } from "../../utils/constants";
import { and, getTableColumns, ne, ilike, or, eq } from "drizzle-orm";
import { sendEmail } from "../../utils";

const {
    HTTP_OK,
    HTTP_NOT_FOUND,
} = HttpStatusCode;

const ListUsers = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { query } = req.query;
        const { password, ...rest } = getTableColumns(UserTable);
        let users;
        if (query) {
            users = await db
                .select({ ...rest })
                .from(UserTable)
                .where(or(
                    ilike(UserTable.fullName, `%${query}%`),
                    ilike(UserTable.email, `%${query}%`),
                    ilike(UserTable.phoneNumber, `%${query}%`)
                ))
                .orderBy(UserTable.id);
        }
        else {
            users = await db.select({ ...rest }).from(UserTable).orderBy(UserTable.id);
        }
        res.status(HTTP_OK.code).json({
            message: "Users retrieved successfully",
            users
        });
    }
    catch (error) {
        next(error);
    }
}

const GetUser = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { id: userId } = req.params;
        const { password, ...rest } = getTableColumns(UserTable);
        const user = await db.select({ ...rest }).from(UserTable).where(eq(UserTable.id, Number(userId)));
        if (user.length === 0) {
            res.status(HTTP_NOT_FOUND.code).json({ error: "User not found" });
        }
        res.status(HTTP_OK.code).json({
            message: "User retrieved successfully",
            user: user[0]
        });
    }
    catch (error) {
        next(error);
    }
}

const ActivateUser = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { id: userId } = req.params;
        const updatedUser = await db
            .update(UserTable)
            .set({ status: AccountStatus.ACTIVE })
            .where(
                and(
                    eq(UserTable.id, Number(userId)),
                    ne(UserTable.status, AccountStatus.BANNED)
                )
            )
            .returning();
        if (updatedUser.length === 0) {
            res.status(HTTP_NOT_FOUND.code).json({ error: "User not found" });
            return;
        }
        sendEmail(
            updatedUser[0].email,
            "Account Activated",
            `Dear ${updatedUser[0].fullName},\n\nWe are pleased to inform you that your account has been activated. You can now log in and start using our services.\n\nBest regards,\nTabib Online Team`
        )
        res.status(HTTP_OK.code).json({ message: "User activated successfully" });
    }
    catch (error) {
        next(error);
    }
}

const SuspendUser = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { id: userId } = req.params;
        const updatedUser = await db
            .update(UserTable)
            .set({ status: AccountStatus.SUSPENDED })
            .where(eq(UserTable.id, Number(userId)))
            .returning();
        if (updatedUser.length === 0) {
            res.status(HTTP_NOT_FOUND.code).json({ error: "User not found" });
            return;
        }
        sendEmail(
            updatedUser[0].email,
            "Account Suspended",
            `Dear ${updatedUser[0].fullName},\n\nWe regret to inform you that your account has been suspended due to violations of our terms of service. If you believe this is a mistake or have any questions, please contact our support team.\n\nBest regards,\nTabib Online Team`
        );
        res.status(HTTP_OK.code).json({ message: "User suspended successfully" });
    }
    catch (error) {
        next(error);
    }
}

const BannedUser = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { id: userId } = req.params;
        const updatedUser = await db
            .update(UserTable)
            .set({ status: AccountStatus.BANNED })
            .where(eq(UserTable.id, Number(userId)))
            .returning();
        if (updatedUser.length === 0) {
            res.status(HTTP_NOT_FOUND.code).json({ error: "User not found" });
            return;
        }
        sendEmail(
            updatedUser[0].email,
            "Account Banned",
            `Dear ${updatedUser[0].fullName},\n\nWe regret to inform you that your account has been permanently banned due to serious violations of our terms of service.\n\nThis is a permanent action under our zero-tolerance policy. You will no longer be able to access our platform, and any attempts to create new accounts will result in immediate termination.\n\nThis decision is final and cannot be appealed.\n\nBest regards,\nTabib Online Team`
        );
        res.status(HTTP_OK.code).json({ message: "User suspended successfully" });
    }
    catch (error) {
        next(error);
    }
}

export {
    ListUsers,
    GetUser,
    ActivateUser,
    SuspendUser,
    BannedUser
}