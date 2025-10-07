import { NextFunction, Request, Response } from "express";
import { AccountStatus, HttpStatusCode } from "../../utils/constants";
import { db } from "../..";
import { UserTable } from "../../models/user.model";
import { and, eq, or } from "drizzle-orm";
import bcrypt from "bcrypt";
import { generateJWT, sendEmail } from "../../utils";
import { MedicalRecordTable } from "../../models/medicalRecord.model";
import { SignupUserValidator } from "../../validators/user.validators";
import { LoginValidator } from "../../validators";

const {
    HTTP_OK,
    HTTP_CREATED,
    HTTP_BAD_REQUEST,
    HTTP_NOT_FOUND
} = HttpStatusCode;

const SignupUser = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { error, value } = SignupUserValidator.validate(req.body);
        if (error) {
            res.status(HTTP_BAD_REQUEST.code).json({ error: error.details[0].message });
            return;
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
            );
        if (alreadyUser.length > 0) {
            res.status(HTTP_BAD_REQUEST.code).json({
                error: "User with provided email or phone number or verification document already exists"
            });
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
        }).returning();
        res.status(HTTP_CREATED.code).json({
            message: "User created successfully",
            user: {
                ...newUser[0],
                accessToken: generateJWT(newUser[0].id, "ACCESS"),
                refreshToken: generateJWT(newUser[0].id, "REFRESH"),
            },
            medicalRecord: newMedicalRecord[0]
        });
    } catch (error) {
        next(error);
    }
};

const LoginUser = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { error, value } = LoginValidator.validate(req.body);
        if (error) {
            res.status(HTTP_BAD_REQUEST.code).json({ error: error.details[0].message });
            return;
        }
        const user = await db.
            select()
            .from(UserTable)
            .where(eq(UserTable.email, value.email));
        if (user.length === 0) {
            res.status(HTTP_NOT_FOUND.code).json({ error: "Invalid email! User not found" });
            return;
        }
        if (user[0].status === AccountStatus.PENDING) {
            res.status(HTTP_BAD_REQUEST.code).json({ error: "User account is pending activation. Please contact support." });
            return;
        }
        if (user[0].status === AccountStatus.DEACTIVATED || user[0].status === AccountStatus.SUSPENDED) {
            res.status(HTTP_BAD_REQUEST.code).json({ error: "User account is deactivated or suspended. Please contact support." });
            return;
        }
        const isPasswordValid = await bcrypt.compare(value.password, user[0].password);
        if (!isPasswordValid) {
            res.status(HTTP_BAD_REQUEST.code).json({ error: "Invalid password!" });
            return;
        }
        sendEmail(
            user[0].email,
            "New Login Alert - Tabib Online",
            `<p>Your account was just accessed. If this wasn't you, please contact support immediately.</p>`
        )
        res.status(HTTP_OK.code).json({
            message: "User logged in successfully",
            user: {
                ...user[0],
                accessToken: generateJWT(user[0].id, 'ACCESS'),
                refreshToken: generateJWT(user[0].id, 'REFRESH')
            }
        });
    }
    catch (error) {
        next(error);
    }
}

// Todo: Forgot Password

// Todo: Reset Password

// Todo: Change Password

export {
    SignupUser,
    LoginUser,
};