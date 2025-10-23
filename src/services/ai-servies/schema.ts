import { z } from "zod";

export const matchingResponseSchema = z.object({
    primary: z.number().describe("Primary doctor specialization ID based on medical history"),
    primaryReasons: z.string().describe("Reasons for recommending the primary doctor specialization"),
    secondary: z.number().describe("Secondary doctor specialization ID for additional care"),
    secondaryReasons: z.string().describe("Reasons for recommending the secondary doctor specialization")
});

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