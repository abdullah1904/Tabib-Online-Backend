import { eq, getTableColumns, ilike, or, sql } from "drizzle-orm";
import { NextFunction, Request, Response } from "express";
import { DoctorTable } from "../../models/doctor.model";
import { db } from "../..";
import { HttpStatusCode } from "../../utils/constants";
import { recommendDoctorMatches } from "../../services/matching.service";
import { logger } from "../../utils/logger";

const {
    HTTP_OK,
    HTTP_NOT_FOUND
} = HttpStatusCode;

const ListDoctorsUser = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { id: userId, allergies, pastMedicalHistory, currentMedications, familyMedicalHistory } = req.user;
        const { query } = req.query;
        const { password, ...rest } = getTableColumns(DoctorTable);
        const matches = await recommendDoctorMatches({
            pastMedicalHistory,
            allergies,
            currentMedications,
            familyMedicalHistory
        });
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
                .orderBy(
                    sql`CASE 
                        WHEN ${DoctorTable.specialization} = ${matches.primary} THEN 1
                        WHEN ${DoctorTable.specialization} = ${matches.secondary} THEN 2
                        ELSE 3
                    END`,
                    DoctorTable.id
                );
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

const GetDoctorUser = async (req: Request, res: Response, next: NextFunction) => {
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

export {
    ListDoctorsUser,
    GetDoctorUser
}