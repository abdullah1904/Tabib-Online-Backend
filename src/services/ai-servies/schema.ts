import { z } from "zod"

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

export const verificationStateSchema = z.object({
  doctorName: z.string().describe("Full name of the doctor as per PMDC records."),
  registrationNumber: z.string().describe("PMDC registration number of the doctor."),
  registrationDate: z.string().describe("Date when the doctor was registered with PMDC in YYYY-MM-DD format."),
  specialization: z.string().describe("Medical specialization of the doctor."),
  medicalDegree: z.string().describe("Medical degree obtained by the doctor."),
  postGraduateDegree: z.string().describe("Postgraduate degree obtained by the doctor."),
});

export const verificationResponseSchema = z.object({
  status: z.enum([
    "VALID_INFORMATION",
    "INVALID_INFORMATION",
    "INCOMPLETE_INFORMATION",
    "NOT_FOUND",
    "ERROR"
  ]).describe("Verification status of the doctor"),
  reason: z.string().describe("Detailed reason for the verification status assigned to the doctor."),
});