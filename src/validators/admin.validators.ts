// All user related input validations

import joi from "joi";

export const updateProfileAdminValidator = joi.object({
    fullName: joi.string().max(100).required(),
    recoveryEmail: joi.string().email().max(100).required(),
    imageURL: joi.string().uri().max(255).optional(),
});