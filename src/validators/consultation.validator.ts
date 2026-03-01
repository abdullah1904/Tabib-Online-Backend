import joi from "joi";
import { ConsultationDuration, ConsultationType, DayOfWeek,  } from "../utils/constants";

export const consultationValidator = joi.object({
    title: joi.string().max(100).required(),
    type: joi.number().valid(...Object.values(ConsultationType)).required(),
    duration: joi.number().valid(...Object.values(ConsultationDuration)).required(),
    price: joi.number().integer().min(0).required(),
    time: joi.string().pattern(/^([01]\d|2[0-3]):[0-5]\d$/).required(),
    availableDays: joi.array().items(joi.number().valid(...Object.values(DayOfWeek))).required(),
    location: joi.string().max(200).when('type', {
        is: ConsultationType.IN_PERSON,
        then: joi.required(),
        otherwise: joi.optional().allow(null, '')
    }),
    allowCustom: joi.boolean().required(),
});