import joi from 'joi';
import { DoctorPrefix, Gender, MedicalDegree, PostGraduateDegree, Specialization } from '../utils/constants';

export const profileSchema = joi.object({
    imageURL: joi.string().uri().max(255).optional(),
    fullName: joi.string().max(100).required(),
    age: joi.number().integer().min(0).max(120).required(),
    gender: joi.number().valid(...Object.values(Gender)).required(),
    address: joi.string().min(2).max(200).required(),
});


export const medicalProfileSchema = joi.object({
    emergencyContactNumber: joi.string().min(2).max(100).required(),
    emergencyContactName: joi.string().min(1).max(100).required(),
    bloodType: joi.string().min(1).max(3).required(),
    height: joi.number().precision(2).min(0).required(),
    weight: joi.number().precision(2).min(0).required(),
    allergies: joi.string().min(5).max(500).required(),
    currentMedications: joi.string().min(5).max(500).required(),
    familyMedicalHistory: joi.string().min(5).max(500).required(),
    pastMedicalHistory: joi.string().min(5).max(500).required(),
});

export const professionalInfoSchema = joi.object({
    medicalDegree: joi.number().valid(...Object.values(MedicalDegree)).required(),
    postGraduateDegree: joi.number().valid(...Object.values(PostGraduateDegree)).required(),
    specialization: joi.number().valid(...Object.values(Specialization)).required(),
    yearsOfExperience: joi.number().integer().min(0).max(80).required(),
    prefix: joi.number().valid(...Object.values(DoctorPrefix)).required(),
});

export const pmdcInfoSchema = joi.object({
    pmdcRedgNo: joi.string()
        .max(25)
        .required()
        .custom((value, helpers) => {
            const fullLicenseRegex = /^\d{1,6}-\d{2}-.$/;
            const shortFormatRegex = /^\d{1,6}-.$/;
            
            if (fullLicenseRegex.test(value) || shortFormatRegex.test(value)) {
                return value;
            }
            return helpers.error('any.invalid');
        })
        .messages({
            'any.invalid': 'Invalid PMDC number format. Expected formats: XXXXXX-XX-X or XXXXX-X',
            'string.max': 'PMDC number must not exceed 25 characters',
            'any.required': 'PMDC registration number is required'
        }),
    pmdcRedgDate: joi.date().required(),
    pmdcLicenseDocumentURL: joi.string().uri().max(255).required(),
});

export const checkoutSchema = joi.object({
    amount: joi.number().min(500).required(),
});

export const payoutSchema = joi.object({
    amount: joi.number().min(500).required(),
    cardNumber: joi.string().creditCard().required(),
    expMonth: joi.number().integer().min(1).max(12).required(),
    expYear: joi.number().integer().min(new Date().getFullYear()).max(new Date().getFullYear() + 20).required(),
    cvc: joi.string().pattern(/^\d{3,4}$/).required(),
    name: joi.string().min(2).max(100).required(),
});