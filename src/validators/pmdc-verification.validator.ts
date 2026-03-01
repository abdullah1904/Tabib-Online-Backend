import joi from "joi";

export const pmdcVerificationValidator = joi.object({
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