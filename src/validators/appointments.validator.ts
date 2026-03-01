import joi from 'joi';

export const appointmentValidator = joi.object({
    consultationId: joi.string().uuid().required(),
    doctorId: joi.string().uuid().required(),
    appointmentDate: joi.string()
        .min(1)
        .pattern(/^\d{4}-\d{2}-\d{2}$/)
        .required()
        .messages({
            "string.base": "Appointment date is required",
            "string.empty": "Appointment date is required",
            "any.required": "Appointment date is required",
            "string.pattern.base": "Invalid date format. Expected YYYY-MM-DD"
        }),

    appointmentTime: joi.string()
        .min(1)
        .pattern(/^([01]\d|2[0-3]):([0-5]\d)(:[0-5]\d)?$/)
        .required()
        .messages({
            "string.base": "Appointment time is required",
            "string.empty": "Appointment time is required",
            "any.required": "Appointment time is required",
            "string.pattern.base": "Invalid time format. Expected HH:MM or HH:MM:SS"
        }),

    additionalNotes: joi.string()
        .max(500)
        .messages({
            "string.max": "Additional notes must be less than or equal to 500 characters long"
        }).empty(''),

    healthInfoSharingConsent: joi.boolean()
        .valid(true)
        .messages({
            "any.only": "Health sharing consent is required"
        }),
});