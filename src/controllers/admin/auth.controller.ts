import { NextFunction, Request, Response } from "express";
import { AccountStatus, HttpStatusCode, UserType, VerificationType } from "../../utils/constants";
import { db } from "../..";
import { AdminTable } from "../../models/admin.model";
import { and, eq } from "drizzle-orm";
import bcrypt from "bcrypt";
import { generateJWT, sendEmail } from "../../utils";
import { VerificationTable } from "../../models/verification.model";
import { generate } from 'otp-generator';
import path from "path";
import ejs from "ejs";
import { ChangePasswordValidator, ForgotPasswordValidator, LoginValidator, ResetPasswordValidator } from "../../validators";

const {
    HTTP_OK,
    HTTP_BAD_REQUEST,
    HTTP_NOT_FOUND
} = HttpStatusCode;

const LoginAdmin = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { error, value } = LoginValidator.validate(req.body);
        if (error) {
            res.status(HTTP_BAD_REQUEST.code).json({ error: error.details[0].message });
            return;
        }
        const admin = await db.
            select()
            .from(AdminTable)
            .where(eq(AdminTable.email, value.email));
        if (admin.length === 0) {
            res.status(HTTP_NOT_FOUND.code).json({ error: "Invalid email! Admin not found" });
            return;
        }
        if (admin[0].status === AccountStatus.PENDING) {
            res.status(HTTP_BAD_REQUEST.code).json({ error: "Admin account is pending activation. Please contact support." });
            return;
        }
        if (admin[0].status === AccountStatus.BANNED || admin[0].status === AccountStatus.SUSPENDED) {
            res.status(HTTP_BAD_REQUEST.code).json({ error: "Admin account is banned or suspended. Please contact support." });
            return;
        }
        const isPasswordValid = await bcrypt.compare(value.password, admin[0].password);
        if (!isPasswordValid) {
            res.status(HTTP_BAD_REQUEST.code).json({ error: "Invalid password!" });
            return;
        }
        const templateData = {
            name: admin[0].fullName,
            loginType: 'Admin',
        }
        const templatePath = path.join(process.cwd(), 'templates', `LoginAlertTemplate.ejs`);
        console.log(process.cwd())
        const mailContent = await ejs.renderFile(templatePath, templateData);
        sendEmail(
            admin[0].email,
            "New Login Alert - Tabib Online Admin",
            mailContent
        )
        res.status(HTTP_OK.code).json({
            message: "Admin logged in successfully",
            admin: {
                ...admin[0],
                accessToken: generateJWT(admin[0].id, 'ACCESS'),
                refreshToken: generateJWT(admin[0].id, 'REFRESH')
            }
        });
    }
    catch (err) {
        next(err);
    }
}

const ForgotPasswordAdmin = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { error, value } = ForgotPasswordValidator.validate(req.body);
        if (error) {
            res.status(HTTP_BAD_REQUEST.code).json({ error: error.details[0].message });
            return;
        }
        const admin = await db.select().from(AdminTable).where(eq(AdminTable.email, value.email));
        if (admin.length === 0) {
            res.status(HTTP_NOT_FOUND.code).json({ error: "Admin with provided email does not exist" });
            return;
        }
        const otp = generate(6, { upperCaseAlphabets: false, lowerCaseAlphabets: false, specialChars: false });
        await db.delete(VerificationTable).where(
            and(
                eq(VerificationTable.email, value.email),
                eq(VerificationTable.userType, UserType.ADMIN),
                eq(VerificationTable.verificationType, VerificationType.PASSWORD_RESET),
            )
        );
        await db.insert(VerificationTable).values({
            email: value.email,
            otp: otp,
            userType: UserType.ADMIN,
            verificationType: VerificationType.PASSWORD_RESET,
        });
        sendEmail(
            admin[0].recoveryEmail ?? admin[0].email,
            "Password Reset OTP - Tabib Online Admin",
            `<p>Your OTP for password reset is: <b>${otp}</b></p><p>This OTP is valid for 5 minutes.</p>`)
        res.status(HTTP_OK.code).json({
            message: "Password reset OTP sent to admin email",
        });
    }
    catch (err) {
        next(err);
    }
}

const ResetPasswordAdmin = async (req: Request, res: Response, next: NextFunction) => {
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
                    eq(VerificationTable.userType, UserType.ADMIN),
                    eq(VerificationTable.verificationType, VerificationType.PASSWORD_RESET)
                )
            );
        if (verification.length === 0) {
            res.status(HTTP_NOT_FOUND.code).json({ error: "No OTP request found for this email" });
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
            db.update(AdminTable).set({ password: hashedPassword }).where(eq(AdminTable.email, value.email)),
            db.delete(VerificationTable).where(
                and(
                    eq(VerificationTable.email, value.email),
                    eq(VerificationTable.verificationType, VerificationType.PASSWORD_RESET),
                    eq(VerificationTable.userType, UserType.ADMIN)
                )
            )
        ]);
        sendEmail(
            value.email,
            "Password Reset Successful - Tabib Online Admin",
            `<p>Your password has been reset successfully. If you did not perform this action, please contact support immediately.</p>`)
        res.status(HTTP_OK.code).json({ message: "Password reset successfully" });
    }
    catch (err) {
        next(err);
    }
}

const ChangePasswordAdmin = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { id: adminId } = req.admin;
        const { error, value } = ChangePasswordValidator.validate(req.body);
        if (error) {
            res.status(HTTP_BAD_REQUEST.code).json({ error: error.details[0].message });
            return;
        }
        const admin = await db.select().from(AdminTable).where(eq(AdminTable.id, adminId));
        if (admin.length === 0) {
            res.status(HTTP_NOT_FOUND.code).json({ error: "Admin not found" });
            return;
        }
        const isPasswordValid = await bcrypt.compare(value.currentPassword, admin[0].password);
        if (!isPasswordValid) {
            res.status(HTTP_BAD_REQUEST.code).json({ error: "Current password is incorrect" });
            return;
        }
        const hashedPassword = await bcrypt.hash(value.newPassword, 10);
        await db.update(AdminTable).set({ password: hashedPassword }).where(eq(AdminTable.id, adminId));
        res.status(HTTP_OK.code).json({ message: "Password changed successfully" });
    }
    catch (err) {
        next(err);
    }
}

export {
    LoginAdmin,
    ForgotPasswordAdmin,
    ResetPasswordAdmin,
    ChangePasswordAdmin
}
