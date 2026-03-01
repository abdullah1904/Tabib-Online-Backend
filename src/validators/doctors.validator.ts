import joi from "joi";

export const reviewValidator = joi.object({
    comment: joi.string().max(500).required(),
});