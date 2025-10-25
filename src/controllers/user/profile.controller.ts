import { Request, Response, NextFunction } from "express";
import { HttpStatusCode } from "../../utils/constants";
import { updateMedicalRecordUserValidator, updatePersonalProfileUserValidator } from "../../validators/user.validators";
import { db } from "../..";
import { UserTable } from "../../models/user.model";
import { eq } from "drizzle-orm";
import { deleteCloudinaryImage } from "../../utils";
import { MedicalRecordTable } from "../../models/medicalRecord.model";

const { HTTP_OK, HTTP_BAD_REQUEST } = HttpStatusCode;

const UpdatePersonalProfileUser = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { id: userId, imageURL: userImageURL } = req.user;
        const { error, value } = updatePersonalProfileUserValidator.validate(req.body);
        if (error) {
            res.status(HTTP_BAD_REQUEST.code).json({ error: error.details[0].message });
            return;
        }
        const updatedProfile = await db.update(UserTable).set({
            fullName: value.fullName,
            imageURL: value.imageURL || userImageURL || null,
            age: value.age,
            address: value.address,
            gender: value.gender,
            emergencyContactName: value.emergencyContactName,
            emergencyContactNumber: value.emergencyContactNumber
        }).where(eq(UserTable.id, userId)).returning();
        if (updatedProfile.length === 0) {
            res.status(HTTP_BAD_REQUEST.code).json({ error: "Profile update failed" });
            return;
        }

        if (req.body.imageURL && userImageURL) {
            await deleteCloudinaryImage(userImageURL)
        }
        res.status(HTTP_OK.code).json({ message: "Profile updated successfully", profile: updatedProfile[0] });
    }
    catch (error) {
        next(error);
    }
}

const GetMedicalRecordUser = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { id: userId } = req.user;
        const medicalRecord = await db.select().from(MedicalRecordTable).where(eq(MedicalRecordTable.user, userId));
        if (medicalRecord.length === 0) {
            res.status(HTTP_BAD_REQUEST.code).json({ error: "Medical record not found" });
            return;
        }
        res.status(HTTP_OK.code).json({
            message: "Medical record fetched successfully",
            medicalRecord: {
                ...medicalRecord[0],
                height: parseFloat(medicalRecord[0].height.toString()),
                weight: parseFloat(medicalRecord[0].weight.toString())
            },
        });
    }
    catch (error) {
        next(error);
    }
}

const UpdateMedicalRecordUser = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { id: userId } = req.user;
        const { error, value } = updateMedicalRecordUserValidator.validate(req.body);
        if (error) {
            res.status(HTTP_BAD_REQUEST.code).json({ error: error.details[0].message });
            return;
        }
        const updatedMedicalRecord = await db.update(MedicalRecordTable).set({
            bloodType: value.bloodType,
            allergies: value.allergies,
            currentMedications: value.currentMedications,
            familyMedicalHistory: value.familyMedicalHistory,
            pastMedicalHistory: value.pastMedicalHistory,
            weight: value.weight,
            height: value.height
        }).where(eq(MedicalRecordTable.user, userId)).returning();
        if (updatedMedicalRecord.length === 0) {
            res.status(HTTP_BAD_REQUEST.code).json({ error: "Profile update failed" });
            return;
        }
        res.status(HTTP_OK.code).json({ message: "Profile updated successfully", medicalRecord: updatedMedicalRecord[0] });
    }
    catch (error) {
        next(error);
    }
}

export {
    UpdatePersonalProfileUser,
    GetMedicalRecordUser,
    UpdateMedicalRecordUser
}