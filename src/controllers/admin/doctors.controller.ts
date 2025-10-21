import { and, eq, getTableColumns, ilike, ne, or } from "drizzle-orm";
import { NextFunction, Request, Response } from "express";
import { DoctorTable } from "../../models/doctor.model";
import { db } from "../..";
import { AccountStatus, HttpStatusCode } from "../../utils/constants";
import { sendEmail } from "../../utils";

const {
    HTTP_OK,
    HTTP_NOT_FOUND
} = HttpStatusCode;

const ListDoctorsAdmin = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { query } = req.query;
        const { password, ...rest } = getTableColumns(DoctorTable);
        let doctors;
        if (query) {
            doctors = await db
                .select({ ...rest })
                .from(DoctorTable)
                .where(or(
                    ilike(DoctorTable.fullName, `%${query}%`),
                    ilike(DoctorTable.email, `%${query}%`),
                    ilike(DoctorTable.phoneNumber, `%${query}%`)
                ))
                .orderBy(DoctorTable.id);
        }
        else {
            doctors = await db.select({ ...rest }).from(DoctorTable).orderBy(DoctorTable.id);
        }
        res.status(HTTP_OK.code).json({
            message: "Doctors retrieved successfully",
            doctors
        });
    }
    catch (error) {
        next(error);
    }
}

const GetDoctorAdmin = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { id: doctorId } = req.params;
        const { password, ...rest } = getTableColumns(DoctorTable);
        const doctor = await db.select({ ...rest }).from(DoctorTable).where(eq(DoctorTable.id, Number(doctorId)));
        if (doctor.length === 0) {
            res.status(HTTP_NOT_FOUND.code).json({ error: "Doctor not found" });
        }
        res.status(HTTP_OK.code).json({
            message: "Doctor retrieved successfully",
            doctor: doctor[0]
        });
    }
    catch (error) {
        next(error);
    }
}

const ActivateDoctorAdmin = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { id: userId } = req.params;
        const updatedUser = await db
            .update(DoctorTable)
            .set({ status: AccountStatus.ACTIVE })
            .where(
                and(
                    eq(DoctorTable.id, Number(userId)),
                    ne(DoctorTable.status, AccountStatus.BANNED)
                )
            )
            .returning();
        if (updatedUser.length === 0) {
            res.status(HTTP_NOT_FOUND.code).json({ error: "Doctor not found" });
            return;
        }
        sendEmail(
            updatedUser[0].email,
            "Account Activated",
            `Dear ${updatedUser[0].fullName},\n\nWe are pleased to inform you that your account has been activated. You can now log in and start using our services.\n\nBest regards,\nTabib Online Team`
        )
        res.status(HTTP_OK.code).json({ message: "Doctor activated successfully" });
    }
    catch (error) {
        next(error);
    }
}

const SuspendDoctorAdmin = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { id: doctorId } = req.params;
        const updatedDoctor = await db
            .update(DoctorTable)
            .set({ status: AccountStatus.SUSPENDED })
            .where(eq(DoctorTable.id, Number(doctorId)))
            .returning();
        if (updatedDoctor.length === 0) {
            res.status(HTTP_NOT_FOUND.code).json({ error: "Doctor not found" });
            return;
        }
        sendEmail(
            updatedDoctor[0].email,
            "Account Suspended",
            `Dear ${updatedDoctor[0].fullName},\n\nWe regret to inform you that your account has been suspended due to violations of our terms of service. If you believe this is a mistake or have any questions, please contact our support team.\n\nBest regards,\nTabib Online Team`
        );
        res.status(HTTP_OK.code).json({ message: "Doctor suspended successfully" });
    }
    catch (error) {
        next(error);
    }
}

const BannedDoctorAdmin = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { id: doctorId } = req.params;
        const updatedDoctor = await db
            .update(DoctorTable)
            .set({ status: AccountStatus.BANNED })
            .where(eq(DoctorTable.id, Number(doctorId)))
            .returning();
        if (updatedDoctor.length === 0) {
            res.status(HTTP_NOT_FOUND.code).json({ error: "Doctor not found" });
            return;
        }
        sendEmail(
            updatedDoctor[0].email,
            "Account Banned",
            `Dear ${updatedDoctor[0].fullName},\n\nWe regret to inform you that your account has been permanently banned due to serious violations of our terms of service.\n\nThis is a permanent action under our zero-tolerance policy. You will no longer be able to access our platform, and any attempts to create new accounts will result in immediate termination.\n\nThis decision is final and cannot be appealed.\n\nBest regards,\nTabib Online Team`
        );
        res.status(HTTP_OK.code).json({ message: "Doctor banned successfully" });
    }
    catch (error) {
        next(error);
    }
}

export {
    ListDoctorsAdmin,
    GetDoctorAdmin,
    ActivateDoctorAdmin,
    SuspendDoctorAdmin,
    BannedDoctorAdmin
}