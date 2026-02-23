import joi from "joi";
import { Gender, UserRole, VerificationDocumentType, OTPType } from "../utils/constants";

export const registerSchema = joi.object({
    fullName: joi.string().max(100).required(),
    age: joi.number().integer().min(0).max(120).required(),
    gender: joi.number().valid(...Object.values(Gender)).required(),
    email: joi.string().email().max(100).required(),
    phoneNumber: joi.string().min(1).max(14).required(),
    address: joi.string().min(2).max(200).required(),
    verificationDocumentType: joi.number().valid(...Object.values(VerificationDocumentType)).required(),
    verificationDocumentNumber: joi.string().max(50).required(),
    verificationDocumentURL: joi.string().uri().max(255).required(),
    password: joi.string()
        .min(8)
        .pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]).+$/)
        .required()
        .messages({
            'string.pattern.base':
                'Password must contain at least 1 uppercase letter, 1 lowercase letter, 1 number, and 1 special character.',
        }),
    role: joi.number().valid(...Object.values([UserRole.USER, UserRole.DOCTOR, UserRole.HOSPITAL])).default(UserRole.USER).optional(),
});

export const loginSchema = joi.object({
    email: joi.string().email().max(100).required(),
    password: joi.string()
        .min(8)
        .pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]).+$/)
        .required()
        .messages({
            'string.pattern.base':
                'Password must contain at least 1 uppercase letter, 1 lowercase letter, 1 number, and 1 special character.',
        }),
});

export const sendOTPSchema = joi.object({
    email: joi.string().email().max(100).required(),
    type: joi.number().valid(...Object.values(OTPType)).required(),
});

export const emailVerificationSchema = joi.object({
    email: joi.string().email().max(100).required(),
    otp: joi.string()
        .pattern(/^\d{6}$/)
        .required()
        .messages({
            "string.pattern.base": "OTP must be a 6 digit code",
            "string.empty": "\"otp\" is required",
            "any.required": "\"otp\" is required"
        }),
});

export const forgotPasswordSchema = joi.object({
    email: joi.string().email().max(100).required(),
});

export const resetPasswordSchema = joi.object({
    email: joi.string().email().max(100).required(),
    otp: joi.string()
        .pattern(/^\d{6}$/)
        .required()
        .messages({
            "string.pattern.base": "OTP must be a 6 digit code",
            "string.empty": "\"otp\" is required",
            "any.required": "\"otp\" is required"
        }),
    newPassword: joi.string()
        .min(8)
        .pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]).+$/)
        .required()
        .messages({
            'string.pattern.base':
                'Password must contain at least 1 uppercase letter, 1 lowercase letter, 1 number, and 1 special character.',
        }),
});

export const changePasswordSchema = joi.object({
    currentPassword: joi.string()
        .min(8)
        .pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]).+$/)
        .required()
        .messages({
            'string.pattern.base':
                'Password must contain at least 1 uppercase letter, 1 lowercase letter, 1 number, and 1 special character.',
        }),
    newPassword: joi.string()
        .min(8)
        .pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]).+$/)
        .required()
        .messages({
            'string.pattern.base':
                'Password must contain at least 1 uppercase letter, 1 lowercase letter, 1 number, and 1 special character.',
        }),
});