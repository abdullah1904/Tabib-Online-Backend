// All general and reusable input validations
import joi from 'joi';
import { VerificationType } from '../utils/constants';

export const loginValidator = joi.object({
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

export const forgotPasswordValidator = joi.object({
    email: joi.string().email().max(100).required(),
});

export const sendOTPValidator = joi.object({
    email: joi.string().email().max(100).required(),
    verificationType: joi.number().valid(...Object.values(VerificationType)).optional().default(VerificationType.EMAIL_VERIFICATION),
});

export const verificationValidator = joi.object({
    email: joi.string().email().max(100).required(),
    otp: joi.string()
        .pattern(/^\d{6}$/)
        .required()
        .messages({
            "string.pattern.base": "OTP must be a 6 digit code",
            "string.empty": "\"otp\" is required",
            "any.required": "\"otp\" is required"
        })
});

export const resetPasswordValidator = joi.object({
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

export const changePasswordValidator = joi.object({
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

export const commentValidator = joi.object({
    comment: joi.string().max(500).required(),
});