import { NextFunction, Request, Response } from "express";
import { AccountStatus, HttpStatusCode, UserType, VerificationType } from "../../utils/constants";
import { db } from "../..";
import { UserTable } from "../../models/user.model";
import { and, eq, or } from "drizzle-orm";
import bcrypt from "bcrypt";
import { generateJWT, sendEmail } from "../../utils";
import { MedicalRecordTable } from "../../models/medicalRecord.model";
import { SignupUserValidator } from "../../validators/user.validators";
import { ChangePasswordValidator, ForgotPasswordValidator, LoginValidator, ResetPasswordValidator, SendOTPValidator, VerificationValidator } from "../../validators";
import { generate } from "otp-generator";
import { VerificationTable } from "../../models/verification.model";

const {
    HTTP_OK,
    HTTP_CREATED,
    HTTP_BAD_REQUEST,
    HTTP_NOT_FOUND
} = HttpStatusCode;

const SendOTPUser = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { error, value } = SendOTPValidator.validate(req.body);
        if (error) {
            res.status(HTTP_BAD_REQUEST.code).json({ error: error.details[0].message });
            return;
        }
        const user = await db.select().from(UserTable).where(eq(UserTable.email, value.email));
        if (user.length === 0) {
            res.status(HTTP_NOT_FOUND.code).json({ error: "User with provided email does not exist" });
            return;
        }
        if (user[0].status !== AccountStatus.PENDING && value?.verificationType === VerificationType.EMAIL_VERIFICATION) {
            res.status(HTTP_BAD_REQUEST.code).json({ error: "User account is already verified" });
            return;
        }
        const otp = generate(6, { upperCaseAlphabets: false, lowerCaseAlphabets: false, specialChars: false });
        await db.delete(VerificationTable).where(
            and(
                eq(VerificationTable.email, value.email),
                eq(VerificationTable.verificationType, value.verificationType || VerificationType.EMAIL_VERIFICATION),
                eq(VerificationTable.userType, UserType.USER)
            )
        );
        await db.insert(VerificationTable).values({
            email: value.email,
            otp: otp,
            userType: UserType.USER,
            verificationType: value.verificationType || VerificationType.EMAIL_VERIFICATION
        });
        sendEmail(
            value.email,
            "OTP - Tabib Online",
            `<p>Your OTP is: <b>${otp}</b></p><p>This OTP is valid for 5 minutes.</p>`
        );
        res.status(HTTP_OK.code).json({ message: "OTP sent successfully" });
    }
    catch (error) {
        next(error);
    }
}

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
        const [newUser] = await Promise.all([
            db.insert(UserTable).values({
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
            }).returning(),
            db.delete(VerificationTable).where(
                and(
                    eq(VerificationTable.email, value.email),
                    eq(VerificationTable.verificationType, VerificationType.EMAIL_VERIFICATION),
                    eq(VerificationTable.userType, UserType.USER)
                )
            )
        ]);
        const otp = generate(6, { upperCaseAlphabets: false, lowerCaseAlphabets: false, specialChars: false });
        const [newMedicalRecord] = await Promise.all([
            db.insert(MedicalRecordTable).values({
                bloodType: value.bloodType,
                height: value.height,
                weight: value.weight,
                allergies: value.allergies,
                currentMedications: value.currentMedications,
                familyMedicalHistory: value.familyMedicalHistory,
                pastMedicalHistory: value.pastMedicalHistory,
                user: newUser[0].id
            }).returning(),
            db.insert(VerificationTable).values({
                email: value.email,
                otp: otp,
                userType: UserType.USER,
                verificationType: VerificationType.EMAIL_VERIFICATION
            })
        ]);
        sendEmail(
            value.email,
            "Welcome to Tabib Online - Verify Your Email",
            `<p>Thank you for signing up with Tabib Online! Your OTP for email verification is: <b>${otp}</b></p><p>This OTP is valid for 5 minutes.</p>`
        )
        res.status(HTTP_CREATED.code).json({
            message: "User created successfully",
            user: {
                ...newUser[0],
            },
            medicalRecord: newMedicalRecord[0]
        });
    } catch (error) {
        next(error);
    }
};

const VerifyUser = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { error, value } = VerificationValidator.validate(req.body);
        if (error) {
            res.status(HTTP_BAD_REQUEST.code).json({ error: error.details[0].message });
            return;
        }
        const verification = await db
            .select()
            .from(VerificationTable)
            .where(
                and(
                    eq(VerificationTable.email, value.email),
                    eq(VerificationTable.userType, UserType.USER),
                    eq(VerificationTable.verificationType, VerificationType.EMAIL_VERIFICATION)
                )
            );
        if (verification.length === 0) {
            res.status(HTTP_NOT_FOUND.code).json({ error: "No OTP request found for this email" });
            return;
        }
        const now = new Date();
        const createdAt = new Date(verification[0].createdAt);
        const diffInMs = now.getTime() - createdAt.getTime();
        const diffInMinutes = diffInMs / (1000 * 60);
        if (diffInMinutes > 5) {
            res.status(HTTP_BAD_REQUEST.code).json({ error: "OTP has expired. Please request a new one." });
            return;
        }
        if (verification[0].otp !== value.otp) {
            res.status(HTTP_BAD_REQUEST.code).json({ error: "Invalid OTP" });
            return;
        }
        await Promise.all([
            db.update(UserTable).set({ status: AccountStatus.ACTIVE, verifiedAt: new Date() }).where(eq(UserTable.email, value.email)),
            db.delete(VerificationTable).where(
                and(
                    eq(VerificationTable.userType, UserType.USER),
                    eq(VerificationTable.email, value.email),
                    eq(VerificationTable.verificationType, VerificationType.EMAIL_VERIFICATION)
                )
            )
        ]);
        res.status(HTTP_OK.code).json({ message: "User verified successfully" });
    }
    catch (error) {
        next(error);
    }
}

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
        if (user[0].status === AccountStatus.BANNED || user[0].status === AccountStatus.SUSPENDED) {
            res.status(HTTP_BAD_REQUEST.code).json({ error: "User account is banned or suspended. Please contact support." });
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


const ForgotPasswordUser = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { error, value } = ForgotPasswordValidator.validate(req.body);
        if (error) {
            res.status(HTTP_BAD_REQUEST.code).json({ error: error.details[0].message });
            return;
        }
        const user = await db.select().from(UserTable).where(eq(UserTable.email, value.email));
        if (user.length === 0) {
            res.status(HTTP_BAD_REQUEST.code).json({ error: "Admin with provided email does not exist" });
            return;
        }
        const otp = generate(6, { upperCaseAlphabets: false, lowerCaseAlphabets: false, specialChars: false });
        await db.delete(VerificationTable).where(
            and(
                eq(VerificationTable.email, value.email),
                eq(VerificationTable.verificationType, VerificationType.PASSWORD_RESET),
                eq(VerificationTable.userType, UserType.USER)
            )
        );
        await db.insert(VerificationTable).values({
            email: value.email,
            otp: otp,
            userType: UserType.USER,
            verificationType: VerificationType.PASSWORD_RESET
        });
        sendEmail(
            user[0].email,
            "Password Reset OTP - Tabib Online",
            `<p>Your OTP for password reset is: <b>${otp}</b></p><p>This OTP is valid for 5 minutes.</p>`)
        res.status(HTTP_OK.code).json({
            message: "Password reset OTP sent to user email",
        });
    }
    catch (err) {
        next(err);
    }
}

const ResetPasswordUser = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { error, value } = ResetPasswordValidator.validate(req.body);
        if (error) {
            res.status(HTTP_BAD_REQUEST.code).json({ error: error.details[0].message });
            return;
        }
        const verification = await db
            .select()
            .from(VerificationTable)
            .where(
                and(
                    eq(VerificationTable.email, value.email),
                    eq(VerificationTable.userType, UserType.USER),
                    eq(VerificationTable.verificationType, VerificationType.PASSWORD_RESET)
                )
            );
        if (verification.length === 0) {
            res.status(HTTP_NOT_FOUND.code).json({ error: "No OTP request found for this email" });
            return;
        }
        const now = new Date();
        const createdAt = new Date(verification[0].createdAt);
        const diffInMs = now.getTime() - createdAt.getTime();
        const diffInMinutes = diffInMs / (1000 * 60);
        if (diffInMinutes > 5) {
            res.status(HTTP_BAD_REQUEST.code).json({ error: "OTP has expired. Please request a new one." });
            return;
        }
        if (verification[0].otp !== value.otp) {
            res.status(HTTP_BAD_REQUEST.code).json({ error: "Invalid OTP" });
            return;
        }
        const hashedPassword = await bcrypt.hash(value.newPassword, 10);
        await Promise.all([
            db.update(UserTable).set({ password: hashedPassword }).where(eq(UserTable.email, value.email)),
            db.delete(VerificationTable).where(
                and(
                    eq(VerificationTable.userType, UserType.USER),
                    eq(VerificationTable.email, value.email),
                    eq(VerificationTable.verificationType, VerificationType.PASSWORD_RESET)
                )
            )
        ]);
        sendEmail(
            value.email,
            "Password Reset Successful - Tabib Online",
            `<p>Your password has been reset successfully. If you did not perform this action, please contact support immediately.</p>`)
        res.status(HTTP_OK.code).json({ message: "Password reset successfully" });
    }
    catch (error) {
        next(error);
    }
}

const ChangePasswordUser = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { id: userId } = req.user;
        const { error, value } = ChangePasswordValidator.validate(req.body);
        if (error) {
            res.status(HTTP_BAD_REQUEST.code).json({ error: error.details[0].message });
            return;
        }
        const user = await db.select().from(UserTable).where(eq(UserTable.id, userId));
        if (user.length === 0) {
            res.status(HTTP_NOT_FOUND.code).json({ error: "User not found" });
            return;
        }
        const isPasswordValid = await bcrypt.compare(value.currentPassword, user[0].password);
        if (!isPasswordValid) {
            res.status(HTTP_BAD_REQUEST.code).json({ error: "Current password is incorrect" });
            return;
        }
        const hashedPassword = await bcrypt.hash(value.newPassword, 10);
        await db.update(UserTable).set({ password: hashedPassword }).where(eq(UserTable.id, userId));
        res.status(HTTP_OK.code).json({ message: "Password changed successfully" });
    }
    catch (err) {
        next(err);
    }
}

export {
    SignupUser,
    LoginUser,
    SendOTPUser,
    VerifyUser,
    ForgotPasswordUser,
    ResetPasswordUser,
    ChangePasswordUser,
};