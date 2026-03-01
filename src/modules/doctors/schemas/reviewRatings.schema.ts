import z from "zod";

export const reviewResponseSchema = z.object({
  ratings: z
    .number()
    .min(1)
    .max(5)
    .refine(
      (val) => Number.isInteger(val) || val % 0.5 === 0,
      "Rating must be a whole number or half (e.g. 3, 3.5, 4, 4.5)"
    )
    .describe("Rating given to the doctor"),
});