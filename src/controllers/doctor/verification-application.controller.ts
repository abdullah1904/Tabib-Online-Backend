import { NextFunction, Request, Response } from "express";
import { db } from "../..";
import { DoctorVerificationApplications } from "../../models/doctor.model";
import { eq } from "drizzle-orm";
import { HttpStatusCode } from "../../utils/constants";
import { DoctorVerificationQueue } from "../../services/doctorVerification.service";

const {
    HTTP_OK,
    HTTP_CREATED,
    HTTP_BAD_REQUEST,
} = HttpStatusCode;

const CreateVerificationApplicationDoctor = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { id: doctorId, pmdcVerifiedAt } = req.doctor;
        if(pmdcVerifiedAt){
            res.status(HTTP_BAD_REQUEST.code).json({ message: "Your PMDC verification is already completed." });
            return;
        }
        const existingApplications = await db.select().from(DoctorVerificationApplications).where(eq(DoctorVerificationApplications.doctor, doctorId));
        if (existingApplications.length >= 3){
            res.status(HTTP_BAD_REQUEST.code).json({ message: "You have reached the maximum number of verification attempts. Please contact support for further assistance." });
            return;
        }
        const newApplication = await db.insert(DoctorVerificationApplications).values({
            doctor: doctorId,
        }).returning();
        await DoctorVerificationQueue.add("process-verification", {
            applicationId: newApplication[0].id,
            doctorId: doctorId
        });
        res.status(HTTP_CREATED.code).json({ message: "Verification application created successfully.", application: newApplication[0] });
    }
    catch (error) {
        next(error);
    }
}

const ListVerificationApplicationsDoctor = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { id: doctorId } = req.doctor;
        const applications = await db.select().from(DoctorVerificationApplications).where(eq(DoctorVerificationApplications.doctor, doctorId));
        res.status(HTTP_OK.code).json({ 
            message: "Verification applications retrieved successfully.",
            verificationApplications: applications
        });
    }
    catch (error) {
        next(error);
    }
}

export {
    CreateVerificationApplicationDoctor,
    ListVerificationApplicationsDoctor
}