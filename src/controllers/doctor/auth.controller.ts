import { NextFunction, Request, Response } from "express";
import { AccountStatus, HttpStatusCode, UserType, VerificationType } from "../../utils/constants";
import { db } from "../..";
import { DoctorTable } from "../../models/doctor.model";
import { and, eq, or } from "drizzle-orm";
import bcrypt from "bcrypt";
import { VerificationTable } from "../../models/verification.model";
import { generate } from "otp-generator";
import { generateJWT, sendEmail } from "../../utils";
import { changePasswordValidator, forgotPasswordValidator, loginValidator, resetPasswordValidator, sendOTPValidator, verificationValidator } from "../../validators";
import { signupDoctorValidator } from "../../validators/doctor.validators";

const {
    HTTP_OK,
    HTTP_CREATED,
    HTTP_BAD_REQUEST,
    HTTP_NOT_FOUND
} = HttpStatusCode;

const SendOTPDoctor = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { error, value } = sendOTPValidator.validate(req.body);
        if (error) {
            res.status(HTTP_BAD_REQUEST.code).json({ error: error.details[0].message });
            return;
        }
        const doctor = await db.select().from(DoctorTable).where(eq(DoctorTable.email, value.email));
        if (doctor.length === 0) {
            res.status(HTTP_NOT_FOUND.code).json({ error: "Doctor with provided email does not exist" });
            return;
        }
        if (doctor[0].status !== AccountStatus.PENDING && value?.verificationType === VerificationType.EMAIL_VERIFICATION) {
            res.status(HTTP_BAD_REQUEST.code).json({ error: "Doctor account is already verified" });
            return;
        }
        const otp = generate(6, { upperCaseAlphabets: false, lowerCaseAlphabets: false, specialChars: false });
        await db.delete(VerificationTable).where(
            and(
                eq(VerificationTable.email, value.email),
                eq(VerificationTable.verificationType, value.verificationType || VerificationType.EMAIL_VERIFICATION),
                eq(VerificationTable.userType, UserType.DOCTOR)
            )
        );
        await db.insert(VerificationTable).values({
            email: value.email,
            otp: otp,
            userType: UserType.DOCTOR,
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

const SignupDoctor = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { error, value } = signupDoctorValidator.validate(req.body);
        if (error) {
            res.status(HTTP_BAD_REQUEST.code).json({ error: error.details[0].message });
            return;
        }
        const alreadyDoctor = await db
            .select()
            .from(DoctorTable)
            .where(
                or(
                    eq(DoctorTable.email, value.email),
                    eq(DoctorTable.phoneNumber, value.phone),
                    eq(DoctorTable.pmdcRedgNo, value.pmdcRedgNo),
                    and(
                        eq(DoctorTable.verificationDocumentType, value.verificationDocumentType),
                        eq(DoctorTable.verificationDocumentNumber, value.verificationDocumentNumber)
                    )
                )
            );
        if (alreadyDoctor.length > 0) {
            res.status(HTTP_BAD_REQUEST.code).json({
                error: "Doctor with provided email or phone number or PMDC registration number or verification document already exists"
            });
            return;
        }
        const hashedPassword = await bcrypt.hash(value.password, 10);
        const [newDoctor] = await Promise.all([
            db.insert(DoctorTable).values({
                fullName: value.fullName,
                age: value.age,
                gender: value.gender,
                email: value.email,
                address: value.address,
                phoneNumber: value.phone,
                pmdcRedgNo: value.pmdcRedgNo,
                pmdcRedgDate: value.pmdcRedgDate,
                medicalDegree: value.medicalDegree,
                postGraduateDegree: value.postGraduateDegree,
                specialization: value.specialization,
                yearsOfExperience: value.yearsOfExperience,
                pmdcLicenseDocumentURL: value.pmdcLicenseDocumentURL,
                verificationDocumentType: value.verificationDocumentType,
                verificationDocumentNumber: value.verificationDocumentNumber,
                verificationDocumentURL: value.verificationDocumentURL,
                password: hashedPassword,
                authenticInformationConsent: value.authenticInformationConsent,
                licenseVerificationConsent: value.licenseVerificationConsent,
                dataUsageConsentConsent: value.dataUsageConsentConsent,
                termsAgreementConsent: value.termsAgreementConsent
            }).returning(),
            db.delete(VerificationTable).where(
                and(
                    eq(VerificationTable.email, value.email),
                    eq(VerificationTable.verificationType, VerificationType.EMAIL_VERIFICATION),
                    eq(VerificationTable.userType, UserType.DOCTOR)
                )
            )
        ]);
        const otp = generate(6, { upperCaseAlphabets: false, lowerCaseAlphabets: false, specialChars: false });
        await db.insert(VerificationTable).values({
            email: value.email,
            otp: otp,
            userType: UserType.DOCTOR,
            verificationType: VerificationType.EMAIL_VERIFICATION
        })
        sendEmail(
            value.email,
            "Welcome to Tabib Online (Doctor) - Verify Your Email",
            `<p>Thank you for signing up with Tabib Online! Your OTP for email verification is: <b>${otp}</b></p><p>This OTP is valid for 5 minutes.</p>`
        )
        res.status(HTTP_CREATED.code).json({
            message: "Doctor registered successfully",
            doctor: {
                ...newDoctor[0],
            }
        });

    }
    catch (error) {
        next(error);
    }
}

const VerifyDoctor = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { error, value } = verificationValidator.validate(req.body);
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
                    eq(VerificationTable.userType, UserType.DOCTOR),
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
            db.update(DoctorTable).set({ status: AccountStatus.ACTIVE, verifiedAt: new Date() }).where(eq(DoctorTable.email, value.email)),
            db.delete(VerificationTable).where(
                and(
                    eq(VerificationTable.userType, UserType.DOCTOR),
                    eq(VerificationTable.email, value.email),
                    eq(VerificationTable.verificationType, VerificationType.EMAIL_VERIFICATION)
                )
            )
        ]);
        res.status(HTTP_OK.code).json({ message: "Doctor verified successfully" });
    }
    catch (error) {
        next(error);
    }
}

const LoginDoctor = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { error, value } = loginValidator.validate(req.body);
        if (error) {
            res.status(HTTP_BAD_REQUEST.code).json({ error: error.details[0].message });
            return;
        }
        const doctor = await db.
            select()
            .from(DoctorTable)
            .where(eq(DoctorTable.email, value.email));
        if (doctor.length === 0) {
            res.status(HTTP_NOT_FOUND.code).json({ error: "Invalid email! Doctor not found" });
            return;
        }
        if (doctor[0].status === AccountStatus.BANNED || doctor[0].status === AccountStatus.SUSPENDED) {
            res.status(HTTP_BAD_REQUEST.code).json({ error: "Doctor account is banned or suspended. Please contact support." });
            return;
        }
        if(doctor[0].suspendedTill && doctor[0].suspendedTill > new Date()) {
            res.status(HTTP_BAD_REQUEST.code).json({ error: "Doctor account is suspended until " + doctor[0].suspendedTill });
            return;
        }
        const isPasswordValid = await bcrypt.compare(value.password, doctor[0].password);
        if (!isPasswordValid) {
            res.status(HTTP_BAD_REQUEST.code).json({ error: "Invalid password!" });
            return;
        }
        sendEmail(
            doctor[0].email,
            "New Login Alert - Tabib Online Doctor",
            `<p>Your account was just accessed. If this wasn't you, please contact support immediately.</p>`
        )
        res.status(HTTP_OK.code).json({
            message: "Doctor logged in successfully",
            doctor: {
                ...doctor[0],
                accessToken: generateJWT(doctor[0].id, 'ACCESS'),
                refreshToken: generateJWT(doctor[0].id, 'REFRESH')
            }
        });
    }
    catch (error) {
        next(error);
    }
}


const ForgotPasswordDoctor = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { error, value } = forgotPasswordValidator.validate(req.body);
        if (error) {
            res.status(HTTP_BAD_REQUEST.code).json({ error: error.details[0].message });
            return;
        }
        const doctor = await db.select().from(DoctorTable).where(eq(DoctorTable.email, value.email));
        if (doctor.length === 0) {
            res.status(HTTP_BAD_REQUEST.code).json({ error: "Doctor with provided email does not exist" });
            return;
        }
        const otp = generate(6, { upperCaseAlphabets: false, lowerCaseAlphabets: false, specialChars: false });
        await db.delete(VerificationTable).where(
            and(
                eq(VerificationTable.email, value.email),
                eq(VerificationTable.verificationType, VerificationType.PASSWORD_RESET),
                eq(VerificationTable.userType, UserType.DOCTOR)
            )
        );
        await db.insert(VerificationTable).values({
            email: value.email,
            otp: otp,
            userType: UserType.DOCTOR,
            verificationType: VerificationType.PASSWORD_RESET
        });
        sendEmail(
            doctor[0].email,
            "Password Reset OTP - Tabib Online Doctor",
            `<p>Your OTP for password reset is: <b>${otp}</b></p><p>This OTP is valid for 5 minutes.</p>`)
        res.status(HTTP_OK.code).json({
            message: "Password reset OTP sent to doctor email",
        });
    }
    catch (err) {
        next(err);
    }
}

const ResetPasswordDoctor = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { error, value } = resetPasswordValidator.validate(req.body);
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
                    eq(VerificationTable.userType, UserType.DOCTOR),
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
            db.update(DoctorTable).set({ password: hashedPassword }).where(eq(DoctorTable.email, value.email)),
            db.delete(VerificationTable).where(
                and(
                    eq(VerificationTable.userType, UserType.DOCTOR),
                    eq(VerificationTable.email, value.email),
                    eq(VerificationTable.verificationType, VerificationType.PASSWORD_RESET)
                )
            )
        ]);
        sendEmail(
            value.email,
            "Password Reset Successful - Tabib Online Doctor",
            `<p>Your password has been reset successfully. If you did not perform this action, please contact support immediately.</p>`)
        res.status(HTTP_OK.code).json({ message: "Password reset successfully" });
    }
    catch (error) {
        next(error);
    }
}

const ChangePasswordDoctor = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { id: userId } = req.doctor;
        const { error, value } = changePasswordValidator.validate(req.body);
        if (error) {
            res.status(HTTP_BAD_REQUEST.code).json({ error: error.details[0].message });
            return;
        }
        const doctor = await db.select().from(DoctorTable).where(eq(DoctorTable.id, userId));
        if (doctor.length === 0) {
            res.status(HTTP_NOT_FOUND.code).json({ error: "Doctor not found" });
            return;
        }
        const isPasswordValid = await bcrypt.compare(value.currentPassword, doctor[0].password);
        if (!isPasswordValid) {
            res.status(HTTP_BAD_REQUEST.code).json({ error: "Current password is incorrect" });
            return;
        }
        const hashedPassword = await bcrypt.hash(value.newPassword, 10);
        await db.update(DoctorTable).set({ password: hashedPassword }).where(eq(DoctorTable.id, userId));
        res.status(HTTP_OK.code).json({ message: "Password changed successfully" });
    }
    catch (err) {
        next(err);
    }
}

export {
    SendOTPDoctor,
    SignupDoctor,
    VerifyDoctor,
    LoginDoctor,
    ForgotPasswordDoctor,
    ResetPasswordDoctor,
    ChangePasswordDoctor
}