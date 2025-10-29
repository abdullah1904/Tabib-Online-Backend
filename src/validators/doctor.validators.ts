// All doctor related input validations

import joi from "joi";
import { DayOfWeek, DoctorPrefix, DoctorServiceDuration, DoctorServiceType, Gender, MedicalDegree, PostGraduateDegree, Specialization, VerificationDocumentType } from "../utils/constants";

export const SignupDoctorValidator = joi.object({
    // Personal Information
    fullName: joi.string().max(100).required(),
    age: joi.number().integer().min(0).max(120).required(),
    gender: joi.number().valid(...Object.values(Gender)).required(),
    email: joi.string().email().max(100).required(),
    phone: joi.string().min(1).max(14).required(),
    address: joi.string().min(2).max(200).required(),
    // Professional Information
    pmdcRedgNo: joi.string()
        .max(25)
        .required()
        .custom((value, helpers) => {
            const fullLicenseRegex = /^\d{1,6}-\d{2}-[MDP]$/;
            const studentRegex = /^\d{1,6}-S$/;
            const temporaryRegex = /^\d{1,6}-T$/;
            if (fullLicenseRegex.test(value) || studentRegex.test(value) || temporaryRegex.test(value)) {
                return value;
            }
            return helpers.error('any.invalid');
        })
        .messages({
            'any.invalid': 'Invalid PMDC number format. Expected formats: XXXXXX-XX-M/D/P, XXXXX-S, or XXXXX-T',
            'string.max': 'PMDC number must not exceed 25 characters',
            'any.required': 'PMDC registration number is required'
        }),
    pmdcRedgDate: joi.date().required(),
    medicalDegree: joi.number().valid(...Object.values(MedicalDegree)).required(),
    postGraduateDegree: joi.number().valid(...Object.values(PostGraduateDegree)).required(),
    specialization: joi.number().valid(...Object.values(Specialization)).required(),
    yearsOfExperience: joi.number().integer().min(0).max(80).required(),
    // Professional Verification and Identification
    pmdcLicenseDocumentURL: joi.string().uri().max(255).required(),
    // Verification and Identification
    verificationDocumentType: joi.number().valid(...Object.values(VerificationDocumentType)).required(),
    verificationDocumentNumber: joi.string().max(25).required(),
    verificationDocumentURL: joi.string().uri().max(255).required(),
    // Security and Consent
    password: joi.string()
        .min(8)
        .pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]).+$/)
        .required()
        .messages({
            'string.pattern.base':
                'Password must contain at least 1 uppercase letter, 1 lowercase letter, 1 number, and 1 special character.',
        }),
    authenticInformationConsent: joi.boolean().required(),
    licenseVerificationConsent: joi.boolean().required(),
    termsAgreementConsent: joi.boolean().required(),
    dataUsageConsentConsent: joi.boolean().required(),
});

export const updatePersonalProfileDoctorValidator = joi.object({
    fullName: joi.string().max(100).required(),
    imageURL: joi.string().uri().max(255).optional(),
    age: joi.number().integer().min(0).max(120).required(),
    gender: joi.number().valid(...Object.values(Gender)).required(),
    address: joi.string().min(2).max(200).required(),
});

export const updateProfessionalProfileDoctorValidator = joi.object({
    doctorPrefix: joi.number().valid(...Object.values(DoctorPrefix)).required(),
    medicalDegree: joi.number().valid(...Object.values(MedicalDegree)).required(),
    postGraduateDegree: joi.number().valid(...Object.values(PostGraduateDegree)).required(),
    specialization: joi.number().valid(...Object.values(Specialization)).required(),
    yearsOfExperience: joi.number().integer().min(0).max(80).required(),
});

export const doctorServiceValidator = joi.object({
    title: joi.string().max(100).required(),
    type: joi.number().valid(...Object.values(DoctorServiceType)).required(),
    duration: joi.number().valid(...Object.values(DoctorServiceDuration)).required(),
    price: joi.number().integer().min(0).required(),
    time: joi.string().pattern(/^([01]\d|2[0-3]):[0-5]\d$/).required(),
    availableDays: joi.array().items(joi.number().valid(...Object.values(DayOfWeek))).required(),
    location: joi.string().max(200).when('type', {
        is: DoctorServiceType.IN_PERSON,
        then: joi.required(),
        otherwise: joi.optional().allow(null, '')
    }),
    allowCustom: joi.boolean().required(),
});