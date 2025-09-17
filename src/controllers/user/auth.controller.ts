import { NextFunction, Request, Response } from "express";
import { SignupValidator } from "../../utils/validators";
import { HttpStatusCode } from "../../utils/constants";
import { db } from "../..";
import { UserTable } from "../../models/user.model";
import { and, eq, or } from "drizzle-orm";
import bcrypt from "bcrypt";
import { generateJWT } from "../../utils";
import { MedicalRecordTable } from "../../models/medicalRecord.model";

const {
    HTTP_CREATED,
    HTTP_BAD_REQUEST,
} = HttpStatusCode;

const SignupUser = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { error, value } = SignupValidator.validate(req.body);
        if (error) {
            res.status(HTTP_BAD_REQUEST.code).json({ error: error.details[0].message });
            return
        }
        const alreadyUser = await db
            .select()
            .from(UserTable)
            .where(
                or(
                    eq(UserTable.email, value.email),
                    eq(UserTable.phoneNumber, value.phone),
                    and(
                        eq(UserTable.verificationDocumentType, value.verificationDocumentType),
                        eq(UserTable.verificationDocumentNumber, value.verificationDocumentNumber)
                    )
                )
            )
        if (alreadyUser.length > 0) {
            res.status(HTTP_BAD_REQUEST.code).json({ error: "User with provided email or phone number or verification document already exists" });
            return;
        }
        const hashedPassword = await bcrypt.hash(value.password, 10);
        const newUser = await db.insert(UserTable).values({
            fullName: value.fullName,
            age: value.age,
            gender: value.gender,
            email: value.email,
            address: value.address,
            phoneNumber: value.phone,
            emergencyContactNumber: value.emergencyContactNumber,
            emergencyContactName: value.emergencyContactName,
            verificationDocumentType: value.verificationDocumentType,
            verificationDocumentNumber: value.verificationDocumentNumber,
            verificationDocumentURL: value.verificationDocumentURL,
            password: hashedPassword,
            treatmentConsent: value.treatmentConsent,
            healthInfoDisclosureConsent: value.healthInfoDisclosureConsent,
            privacyPolicyConsent: value.privacyPolicyConsent
        }).returning();
        const newMedicalRecord = await db.insert(MedicalRecordTable).values({
            bloodType: value.bloodType,
            height: value.height,
            weight: value.weight,
            allergies: value.allergies,
            currentMedications: value.currentMedications,
            familyMedicalHistory: value.familyMedicalHistory,
            pastMedicalHistory: value.pastMedicalHistory,
            user: newUser[0].id
        });
        res.status(HTTP_CREATED.code).json({ 
            message: "User created successfully", 
            user: {
                ...newUser[0],
                accessToken: generateJWT(newUser[0].id, "ACCESS"),
                refreshToken: generateJWT(newUser[0].id, "REFRESH"),
            },
            medicalRecord: newMedicalRecord
        });
    }
    catch (error) {
        next();
    }
}

// Todo: User Signin

// Todo: User ForgetPassword

// Todo: Change Password


export {
    SignupUser
}