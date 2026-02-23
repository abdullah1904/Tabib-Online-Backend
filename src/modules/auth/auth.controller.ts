import { NextFunction, Request, Response } from "express";
import { changePasswordSchema, emailVerificationSchema, forgotPasswordSchema, loginSchema, registerSchema, resetPasswordSchema, sendOTPSchema } from "../../validators/auth.validator";
import { DoctorPrefix, HttpStatusCode, UserRole } from "../../utils/constants";
import { generateJWT } from "../../utils";
import { AuthService } from "./auth.service";

const {
    HTTP_CREATED,
    HTTP_BAD_REQUEST
} = HttpStatusCode;

export class AuthControllers {
    private authService: AuthService;
    constructor() {
        this.authService = new AuthService();
    }
    registerController = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const { error, value } = registerSchema.validate(req.body);
            if (error) {
                res.status(HTTP_BAD_REQUEST.code).json({ error: error.details[0].message });
                return;
            }
            const user = await this.authService.register({
                fullName: value.fullName,
                age: value.age,
                email: value.email,
                address: value.address,
                gender: value.gender,
                password: value.password,
                phoneNumber: value.phoneNumber,
                verificationDocumentType: value.verificationDocumentType,
                verificationDocumentNumber: value.verificationDocumentNumber,
                verificationDocumentURL: value.verificationDocumentURL,
                role: value.role ?? UserRole.USER,
                prefix: value.role == UserRole.DOCTOR ? DoctorPrefix.Dr : 0,
            });
            res.status(HTTP_CREATED.code).json({
                message: "User created successfully",

            });
            return;
        }
        catch (error) {
            const prismaError = error as { code?: string; meta?: { target?: string[] } };
            if (prismaError.code === 'P2002') {
                res.status(HTTP_BAD_REQUEST.code).json({ error: 'User with this email, phone, or verification document already exists' });
                return;
            }
            next(error);
        }
    }
    loginController = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const { error, value } = loginSchema.validate(req.body);
            if (error) {
                res.status(HTTP_BAD_REQUEST.code).json({ error: error.details[0].message });
                return;
            }
            const user = await this.authService.login(value.email, value.password);
            const accessToken = generateJWT(user.id, 'ACCESS');
            const refreshToken = generateJWT(user.id, 'REFRESH');
            res.json({
                message: "Login successful",
                user,
                accessToken,
                refreshToken
            });
            return;
        }
        catch (error) {
            next(error);
        }
    }
    sendOTPController = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const { error, value } = sendOTPSchema.validate(req.body);
            if (error) {
                res.status(HTTP_BAD_REQUEST.code).json({ error: error.details[0].message });
                return;
            }
            await this.authService.sendOTP(value.email, value.type);
            res.json({
                message: "OTP sent successfully"
            });
            return;
        }
        catch (error) {
            next(error);
        }
    }
    verifyEmailController = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const { error, value } = emailVerificationSchema.validate(req.body);
            if (error) {
                res.status(HTTP_BAD_REQUEST.code).json({ error: error.details[0].message });
                return;
            }
            await this.authService.verifyEmail(value.email, value.otp);
            res.json({
                message: "Email verified successfully"
            });
        }
        catch (error) {
            next(error);
        }
    }
    resetPasswordController = async (req: Request, res: Response, next: NextFunction) => {
        try{
            const { error, value } = resetPasswordSchema.validate(req.body);
            if (error) {
                res.status(HTTP_BAD_REQUEST.code).json({ error: error.details[0].message });
                return;
            }
            await this.authService.resetPassword(value.email, value.otp, value.newPassword);
            res.json({
                message: "Password reset successfully"
            });
        }
        catch(error) {
            next(error);
        }
    }
    changePasswordController = async (req: Request, res: Response, next: NextFunction) => {
        try{
            const {error,value} = changePasswordSchema.validate(req.body); 
            if(error) {
                res.status(HTTP_BAD_REQUEST.code).json({ error: error.details[0].message });
                return;
            }
            await this.authService.changePassword(req.user.id, value.currentPassword, value.newPassword);
            res.json({
                message: "Password changed successfully"
            });
        }
        catch(error) {
            next(error);
        }
    }
}