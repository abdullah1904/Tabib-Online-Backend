import { NextFunction, Request, Response } from "express";
import { updatePersonalProfileDoctorValidator, updateProfessionalProfileDoctorValidator } from "../../validators/doctor.validators";
import { HttpStatusCode } from "../../utils/constants";
import { db } from "../..";
import { eq } from "drizzle-orm";
import { DoctorTable } from "../../models/doctor.model";
import { deleteCloudinaryImage } from "../../utils";

const {
    HTTP_OK,
    HTTP_BAD_REQUEST,
} = HttpStatusCode;

const updatePersonalProfileDoctor = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { id: doctorId, imageURL: doctorImageURL } = req.doctor;
        const { error, value } = updatePersonalProfileDoctorValidator.validate(req.body);
        if (error) {
            res.status(HTTP_BAD_REQUEST.code).json({ error: error.details[0].message });
            return;
        }
        const updatedProfile = await db.update(DoctorTable).set({
            fullName: value.fullName,
            imageURL: value.imageURL || null,
            age: value.age,
            address: value.address,
            gender: value.gender
        }).where(eq(DoctorTable.id, doctorId)).returning();
        if (updatedProfile.length === 0) {
            res.status(HTTP_BAD_REQUEST.code).json({ error: "Profile update failed" });
            return;
        }

        if (req.body.imageURL && doctorImageURL){
            await deleteCloudinaryImage(doctorImageURL)
        }
        res.status(HTTP_OK.code).json({ message: "Profile updated successfully", profile: updatedProfile[0] });
    }
    catch (error) {
        next(error);
    }
}

const updateProfessionalProfileDoctor = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { id: doctorId } = req.doctor;
        const { error, value } = updateProfessionalProfileDoctorValidator.validate(req.body);
        if (error) {
            res.status(HTTP_BAD_REQUEST.code).json({ error: error.details[0].message });
            return;
        }
        const updatedProfile = await db.update(DoctorTable).set({
            doctorPrefix: value.doctorPrefix,
            medicalDegree: value.medicalDegree,
            postGraduateDegree: value.postGraduateDegree,
            specialization: value.specialization,
            yearsOfExperience: value.yearsOfExperience
        }).where(eq(DoctorTable.id, doctorId)).returning();
        if (updatedProfile.length === 0) {
            res.status(HTTP_BAD_REQUEST.code).json({ error: "Profile update failed" });
            return;
        }
        res.status(HTTP_OK.code).json({ message: "Profile updated successfully", profile: updatedProfile[0] });
    }
    catch (error) {
        next(error);
    }
}

export {
    updatePersonalProfileDoctor,
    updateProfessionalProfileDoctor
}