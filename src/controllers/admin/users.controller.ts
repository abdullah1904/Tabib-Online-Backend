import { NextFunction, Request, Response } from "express";
import { db } from "../..";
import { UserTable } from "../../models/user.model";
import { HttpStatusCode } from "../../utils/constants";
import { getTableColumns } from "drizzle-orm";
import { eq } from "drizzle-orm";

const {
    HTTP_OK,
    HTTP_NOT_FOUND,
} = HttpStatusCode;

const ListUsers = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { password, ...rest } = getTableColumns(UserTable);
        const users = await db.select({ ...rest }).from(UserTable);
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

export {
    ListUsers,
    GetUser
}