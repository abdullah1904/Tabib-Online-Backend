import joi from "joi";
import { Gender, UserVerificationDocumentType, } from "./constants";

export const SignupValidator = joi.object({
    // Personal Information
    fullName: joi.string().max(100).required(),
    age: joi.number().integer().min(0).max(120).required(),
    gender: joi.number().valid(...Object.values(Gender)).required(),
    email: joi.string().email().max(100).required(),
    phoneNumber: joi.string().min(1).max(14).required(),
    address: joi.string().min(2).max(200).required(),
    emergencyContactNumber: joi.string().min(2).max(100).required(),
    emergencyContactName: joi.string().min(1).max(14).required(),
    // Medical and Health Information
    bloodType: joi.string().min(1).max(3).required(),
    height: joi.number().precision(2).min(0).required(),
    weight: joi.number().precision(2).min(0).required(),
    allergies: joi.string().min(5).max(500).required(),
    currentMedications: joi.string().min(5).max(500).required(),
    familyMedicalHistory: joi.string().min(5).max(500).required(),
    pastMedicalHistory: joi.string().min(5).max(500).required(),
    // Verification and Identification
    verificationDocumentType: joi.string().valid(...Object.values(UserVerificationDocumentType)).required(),
    verificationDocumentNumber: joi.string().max(25).required(),
    verificationDocumentURL: joi.string().uri().max(255).required(),
    // Security and Consent
    password: joi.string().min(8).max(255).required(),
    treatmentConsent: joi.boolean().required(),
    healthInfoDisclosureConsent: joi.boolean().required(),
    privacyPolicyConsent: joi.boolean().required(),
});